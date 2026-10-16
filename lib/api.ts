import { env } from 'cloudflare:workers';
import { authenticate } from './admin-auth';
import { AuthError } from './password';
export function db() { if (!env.DB) throw new Error('Database unavailable'); return env.DB; }
export function json(value: unknown, status = 200, extraHeaders: Record<string, string> = {}) { return Response.json(value, { status, headers: { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', ...extraHeaders } }); }
export function sameOrigin(request: Request) { return request.headers.get('Origin') === new URL(request.url).origin && request.headers.get('X-Payxincha-Request') === '1'; }
export async function readJson(request: Request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw new Error('CONTENT_TYPE');
  const reader = request.body?.getReader(); if (!reader) throw new Error('BODY');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 16000) { await reader.cancel(); throw new Error('BODY_SIZE'); } chunks.push(value); }
  const buffer = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(buffer));
}
export async function hash(value: string) { const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join(''); }
export async function adminUser(request: Request) { try { return await authenticate(db(),request); } catch(error) { if(error instanceof AuthError)return null; throw error; } }
export async function takeRateLimit(request: Request, scope: string, limit: number) {
  const now = Date.now(); const bucket = Math.floor(now / 3600000); const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = await hash(`payxincha|${scope}|${bucket}|${ip}`);
  const results = await db().batch([
    db().prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now),
    db().prepare('INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1').bind(key, now + 7200000),
    db().prepare('SELECT count FROM rate_limits WHERE key = ?').bind(key),
  ]);
  return Number((results[2].results[0] as { count?: number })?.count || 0) <= limit;
}
export const applicationColumns = `id, reference, name, email, phone, city, state, business, revenue, person_type AS personType, customer_note AS customerNote, status, public_message AS publicMessage, internal_notes AS internalNotes, created_at AS createdAt, updated_at AS updatedAt, revision`;
export const detailColumns = `${applicationColumns}, cpf, birth_date AS birthDate, mother_name AS motherName, cnpj, legal_name AS legalName, trade_name AS tradeName, postal_code AS postalCode, street, address_number AS addressNumber, complement, neighborhood, landmark`;
export function safeError(error: unknown) {
  if (error instanceof Error && ['CONTENT_TYPE','BODY','BODY_SIZE'].includes(error.message)) return json({ error: 'Formato de solicitação inválido.' }, 400);
  if (error instanceof SyntaxError) return json({ error: 'Não foi possível ler a solicitação.' }, 400);
  console.error('Payxincha: falha ao processar a operação.');
  return json({ error: 'Não foi possível concluir agora. Tente novamente em instantes.' }, 503);
}
