import { reviewSchema } from '@/lib/validation';
import { z } from 'zod';
import { recordAudit } from '@/lib/admin-auth';
import { adminUser, applicationColumns, detailColumns, db, json, readJson, sameOrigin, safeError } from '@/lib/api';
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await adminUser(request); if (!user) return json({ error: 'Entre no painel para continuar.' }, 401);
  try {
    const { id } = await context.params;
    if (!/^[a-f0-9-]{36}$/.test(id)) return json({ error: 'Solicitação inválida.' }, 400);
    const item = await db().prepare(`SELECT ${detailColumns} FROM applications WHERE id = ?`).bind(id).first();
    if(item) await recordAudit(db(),user,'application_viewed',id);
    return item ? json(item) : json({ error: 'Solicitação não encontrada.' }, 404);
  } catch (error) { return safeError(error); }
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await adminUser(request); if (!user) return json({ error: 'Entre no painel para continuar.' }, 401);
  if (!sameOrigin(request)) return json({ error: 'Origem não permitida.' }, 403);
  try {
    const { id } = await context.params; if (!/^[a-f0-9-]{36}$/.test(id)) return json({ error: 'Solicitação inválida.' }, 400);
    const parsed = reviewSchema.safeParse(await readJson(request)); if (!parsed.success) return json({ error: parsed.error.issues[0].message }, 422);
    const value = parsed.data; const now = new Date().toISOString(); const eventId = crypto.randomUUID();
    const results = await db().batch([
      db().prepare('UPDATE applications SET status = ?, public_message = ?, internal_notes = ?, updated_at = ?, reviewed_by = ?, last_review_id = ?, revision = revision + 1 WHERE id = ? AND revision = ?').bind(value.status, value.publicMessage, value.internalNotes, now, user.userId, eventId, id, value.revision),
      db().prepare('INSERT INTO review_events (id, application_id, actor_id, status, public_message, created_at) SELECT ?, id, ?, status, public_message, ? FROM applications WHERE id = ? AND last_review_id = ?').bind(eventId, user.userId, now, id, eventId),
      db().prepare('INSERT INTO admin_audit SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM applications WHERE id=? AND last_review_id=?)').bind(crypto.randomUUID(),user.id,user.email,`application_${value.status}`,id,now,id,eventId),
    ]);
    if (!results[0].meta.changes) return json({ error: 'Esta solicitação foi atualizada em outra janela. Atualize a lista e abra novamente antes de salvar.' }, 409);
    return json(await db().prepare(`SELECT ${applicationColumns} FROM applications WHERE id = ?`).bind(id).first());
  } catch (error) { return safeError(error); }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await adminUser(request); if (!user) return json({ error: 'Entre no painel para continuar.' }, 401);
  if (!sameOrigin(request)) return json({ error: 'Origem não permitida.' }, 403);
  try {
    const { id } = await context.params;
    if (!/^[a-f0-9-]{36}$/.test(id)) return json({ error: 'Solicitação inválida.' }, 400);
    const parsed = z.object({ revision: z.number().int().nonnegative(), confirmation: z.string().trim().min(1).max(40) }).strict().safeParse(await readJson(request));
    if (!parsed.success) return json({ error: 'Informe o protocolo completo para confirmar a exclusão.' }, 422);
    const eventId = crypto.randomUUID();
    const results = await db().batch([
      db().prepare('INSERT INTO deletion_events (id, application_id, actor_id, created_at) SELECT ?, id, ?, ? FROM applications WHERE id = ? AND revision = ? AND reference = ?').bind(eventId, user.userId, new Date().toISOString(), id, parsed.data.revision, parsed.data.confirmation),
      db().prepare('DELETE FROM review_events WHERE application_id = ? AND EXISTS (SELECT 1 FROM deletion_events WHERE id = ?)').bind(id, eventId),
      db().prepare('DELETE FROM applications WHERE id = ? AND EXISTS (SELECT 1 FROM deletion_events WHERE id = ?)').bind(id, eventId),
      db().prepare('INSERT INTO admin_audit SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM deletion_events WHERE id=?)').bind(crypto.randomUUID(),user.id,user.email,'application_deleted',id,new Date().toISOString(),eventId),
    ]);
    if (!results[2].meta.changes) return json({ error: 'Confira o protocolo. Se o cadastro foi atualizado ou excluído, atualize a lista antes de continuar.' }, 409);
    return json({ ok: true });
  } catch (error) { return safeError(error); }
}
