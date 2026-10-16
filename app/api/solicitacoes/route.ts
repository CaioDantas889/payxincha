import { applicationSchema } from '@/lib/validation';
import { db, hash, json, readJson, sameOrigin, safeError, takeRateLimit } from '@/lib/api';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origem não permitida.' }, 403);
  try {
    const parsed = applicationSchema.safeParse(await readJson(request));
    if (!parsed.success) return json({ error: parsed.error.issues[0].message, fields: parsed.error.flatten().fieldErrors }, 422);
    const value = parsed.data; const trackingHash = await hash(value.trackingToken);
    const existing = await db().prepare('SELECT reference, created_at AS createdAt FROM applications WHERE tracking_hash = ?').bind(trackingHash).first();
    if (existing) return json(existing);
    if (!await takeRateLimit(request, 'submit', 8)) return json({ error: 'Muitas tentativas. Aguarde uma hora antes de enviar uma nova solicitação.' }, 429, { 'Retry-After': '3600' });
    const id = crypto.randomUUID(); const reference = `PX-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`; const now = new Date().toISOString();
    const fields = ['id','reference','tracking_hash','name','email','phone','city','state','business','revenue','created_at','updated_at','consent_version','person_type','cpf','birth_date','mother_name','cnpj','legal_name','trade_name','postal_code','street','address_number','complement','neighborhood','landmark'];
    const values = [id, reference, trackingHash, value.name, value.email, value.phone, value.city, value.state, value.business, '', now, now, '2026-10-14-full', value.personType, value.cpf, value.birthDate, value.motherName, value.cnpj, value.legalName, value.tradeName, value.postalCode, value.street, value.addressNumber, value.complement, value.neighborhood, value.landmark];
    await db().prepare(`INSERT INTO applications (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')}) ON CONFLICT(tracking_hash) DO NOTHING`).bind(...values).run();
    return json(await db().prepare('SELECT reference, created_at AS createdAt FROM applications WHERE tracking_hash = ?').bind(trackingHash).first(), 201);
  } catch (error) { return safeError(error); }
}
