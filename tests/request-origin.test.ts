import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesRequestOrigin } from '../lib/request-origin.ts';

const publicOrigin = 'https://paychinxa.com.br';
function proxiedRequest(origin: string, marker = '1') {
  return new Request('http://paychinxa.com.br/api/solicitacoes', {
    method: 'POST',
    headers: { Origin: origin, 'X-Payxincha-Request': marker, 'X-Forwarded-Host': 'invalid.example', 'X-Forwarded-Proto': 'https' },
  });
}

test('accepts the configured HTTPS origin behind the HTTP reverse proxy', () => {
  assert.equal(matchesRequestOrigin(proxiedRequest(publicOrigin), publicOrigin), true);
});

test('rejects foreign origins, HTTP origin, and missing request marker behind the proxy', () => {
  for (const origin of ['https://invalid.example', 'http://paychinxa.com.br', 'null', '']) {
    assert.equal(matchesRequestOrigin(proxiedRequest(origin), publicOrigin), false);
  }
  assert.equal(matchesRequestOrigin(proxiedRequest(publicOrigin, ''), publicOrigin), false);
});

test('keeps direct-host origin validation when no public origin is configured', () => {
  const request = new Request('https://site.example/api/solicitacoes', {
    headers: { Origin: 'https://site.example', 'X-Payxincha-Request': '1' },
  });
  assert.equal(matchesRequestOrigin(request), true);
  assert.equal(matchesRequestOrigin(proxiedRequest(publicOrigin)), false);
});
