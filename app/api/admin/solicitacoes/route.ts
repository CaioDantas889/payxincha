import { adminUser, applicationColumns, db, json, safeError } from '@/lib/api';
import { statuses } from '@/lib/validation';
export async function GET(request: Request) {
  if (!await adminUser(request)) return json({ error: 'Entre no painel para continuar.' }, 401);
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.min(100000, Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1));
    const search = (params.get('q') || '').trim().slice(0, 100); const status = params.get('status');
    if (status && !(statuses as readonly string[]).includes(status)) return json({ error: 'Filtro inválido.' }, 400);
    const clauses: string[] = []; const bindings: string[] = [];
    if (status) { clauses.push('status = ?'); bindings.push(status); }
    if (search) { clauses.push("(name LIKE ? ESCAPE '\\' OR reference LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\')"); const term = `%${search.replace(/[\\%_]/g, char => `\\${char}`)}%`; bindings.push(term, term, term); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await db().batch([
      db().prepare(`SELECT ${applicationColumns} FROM applications ${where} ORDER BY created_at DESC, id DESC LIMIT 25 OFFSET ?`).bind(...bindings, (page - 1) * 25),
      db().prepare(`SELECT COUNT(*) AS count FROM applications ${where}`).bind(...bindings),
      db().prepare('SELECT status, COUNT(*) AS count FROM applications GROUP BY status'),
    ]);
    const counts: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
    for (const row of result[2].results as { status: string; count: number }[]) counts[row.status] = row.count;
    return json({ items: result[0].results, total: (result[1].results[0] as { count: number }).count, page, pageSize: 25, counts });
  } catch (error) { return safeError(error); }
}
