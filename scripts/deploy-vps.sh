#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

EXPECTED_REVISION=${1:-}
[[ "$EXPECTED_REVISION" =~ ^[a-f0-9]{40}$ ]] || { echo 'Informe o commit validado localmente.'; exit 1; }
cd /opt/payxincha
exec 9>/opt/payxincha-deploy.lock
flock -n 9 || { echo 'Outro deploy Paychinxa esta em andamento.'; exit 1; }
test -f .dev.vars
test -z "$(git status --porcelain --untracked-files=no)" || { echo 'Ha alteracoes rastreadas na VPS. Nada foi sobrescrito.'; exit 1; }
docker volume inspect payxincha_data >/dev/null

STAMP=$(date -u +%Y%m%d-%H%M%S)
BACKUP="/opt/backups/payxincha/$STAMP"
install -d -m 0700 "$BACKUP"
git rev-parse HEAD > "$BACKUP/previous-revision.txt"
docker inspect payxincha --format '{{.Image}}' > "$BACKUP/previous-image.txt"
tar -czf "$BACKUP/source-before.tar.gz" -C /opt payxincha
tar -tzf "$BACKUP/source-before.tar.gz" >/dev/null
cp -p .dev.vars "$BACKUP/.dev.vars"

stopped=0
on_failure() {
  code=$?
  trap - ERR
  if [ "$stopped" = 1 ]; then docker start payxincha >/dev/null || true; fi
  echo "Deploy interrompido. Backup preservado em: $BACKUP"
  echo 'Confira o erro antes de tentar novamente. O banco nao e restaurado automaticamente.'
  exit "$code"
}
trap on_failure ERR

git pull --ff-only origin main
test "$(git rev-parse HEAD)" = "$EXPECTED_REVISION" || { echo 'O GitHub recebeu outra versao. Execute o iniciador novamente para valida-la.'; false; }
docker compose config --quiet
docker compose build app

DATA_PATH=$(docker volume inspect payxincha_data --format '{{.Mountpoint}}')
test "$(realpath "$DATA_PATH")" = /var/lib/docker/volumes/payxincha_data/_data
docker stop payxincha >/dev/null
stopped=1
tar -czf "$BACKUP/data.tar.gz" -C "$DATA_PATH" .
tar -tzf "$BACKUP/data.tar.gz" >/dev/null
sha256sum "$BACKUP/source-before.tar.gz" "$BACKUP/data.tar.gz" > "$BACKUP/SHA256SUMS"
docker compose up -d --no-build --no-deps app
stopped=0

for _ in $(seq 1 45); do
  health=$(docker inspect payxincha --format '{{.State.Health.Status}}')
  [ "$health" = healthy ] && break
  [ "$health" != unhealthy ] || break
  sleep 2
done
test "$(docker inspect payxincha --format '{{.State.Health.Status}}')" = healthy

docker exec -i payxincha node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
const origin = 'https://paychinxa.com.br';
for (const path of ['/', '/acompanhar', '/admin']) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, path);
  await response.arrayBuffer();
}
const checkoutUrl = 'https://payment.ticto.app/OA0F493FD';
const checkout = await fetch(origin + '/checkout', { redirect: 'manual', signal: AbortSignal.timeout(20000) });
assert.equal(checkout.status, 307, 'checkout antigo redireciona');
assert.equal(checkout.headers.get('location'), checkoutUrl, 'destino Ticto');
const landing = await (await fetch(origin, { signal: AbortSignal.timeout(20000) })).text();
assert.ok(landing.includes('href="' + checkoutUrl + '"'), 'compra direta na Ticto');
assert.ok(!/href="\/(checkout|admin|acompanhar)"/.test(landing), 'landing sem fluxo interno');
assert.ok(!/<input[\s>]/i.test(landing), 'landing sem coleta de dados');
const retired = await fetch(origin + '/api/solicitacoes', { method: 'POST', body: '{}', signal: AbortSignal.timeout(20000) });
assert.equal(retired.status, 410, 'cadastro interno encerrado');
assert.equal((await retired.json()).checkoutUrl, checkoutUrl);
for (const path of ['/api/solicitacoes/acompanhar', '/api/auth/login']) {
  for (const requestOrigin of [origin, 'https://invalid.example']) {
    const response = await fetch(origin + path, {
      method: 'POST', signal: AbortSignal.timeout(20000),
      headers: { Origin: requestOrigin, 'Content-Type': 'application/json', 'X-Payxincha-Request': '1' }, body: '{}',
    });
    assert.equal(response.status, requestOrigin === origin ? 422 : 403, path + ' origin=' + requestOrigin);
    await response.arrayBuffer();
  }
}
assert.equal((await fetch(origin + '/api/auth/me', { signal: AbortSignal.timeout(20000) })).status, 401);
console.log('HTTPS, paginas, APIs e protecao do painel: OK');
NODE

printf '%s\n' "$EXPECTED_REVISION" > /opt/payxincha-deployed-revision
trap - ERR
echo "DEPLOY CONCLUIDO: $EXPECTED_REVISION"
echo "Backup: $BACKUP"
echo 'Site: https://paychinxa.com.br'
