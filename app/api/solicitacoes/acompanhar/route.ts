import { trackingTokenSchema } from '@/lib/validation';
import { db, hash, json, readJson, sameOrigin, safeError, takeRateLimit } from '@/lib/api';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origem não permitida.' }, 403);
  try {
    const body = await readJson(request); const token = trackingTokenSchema.safeParse(body?.token);
    if (!token.success) return json({ error: 'Use o código ou o link completo recebido ao enviar sua solicitação.' }, 422);
    if (!await takeRateLimit(request, 'tracking', 120)) return json({ error: 'Aguarde uma hora antes de consultar novamente.' }, 429, { 'Retry-After': '3600' });
    const item = await db().prepare('SELECT reference, status, public_message AS publicMessage, created_at AS createdAt, updated_at AS updatedAt FROM applications WHERE tracking_hash = ?').bind(await hash(token.data)).first();
    if (!item) return json({ error: 'Pedido não encontrado. Confira o código ou link. Pedidos excluídos pela equipe não ficam disponíveis para consulta.' }, 404);
    return json(item);
  } catch (error) { return safeError(error); }
}
