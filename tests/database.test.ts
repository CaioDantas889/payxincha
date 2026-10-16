import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
const root = new URL('../', import.meta.url);
function database() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('drizzle/0000_large_bill_hollister.sql', root), 'utf8'));
  db.exec("INSERT INTO applications (id,reference,tracking_hash,name,email,phone,city,state,business,revenue,created_at,updated_at,consent_version) VALUES ('test-id','TEST-ONLY','hash-test','Teste','test@example.com','88999999999','Teste','CE','Teste','','2026-01-01','2026-01-01','test')");
  db.exec(readFileSync(new URL('drizzle/0001_amusing_zuras.sql', root), 'utf8'));
  db.exec(readFileSync(new URL('drizzle/0002_safe_stingray.sql', root), 'utf8'));
  return db;
}
test('migration preserves prior applications and accepts the complete new registration', () => {
  const db = database();
  assert.equal(db.prepare('SELECT name FROM applications').get()?.name, 'Teste');
  db.prepare('UPDATE applications SET person_type=?, cpf=?, birth_date=?, mother_name=?, postal_code=?, street=?, address_number=?, neighborhood=? WHERE id=?').run('PF','52998224725','1990-05-20','Teste','60000000','Rua teste','S/N','Centro','test-id');
  assert.equal(db.prepare('SELECT cpf FROM applications').get()?.cpf, '52998224725');
  assert.throws(() => db.prepare('INSERT INTO applications SELECT * FROM applications').run());
  db.close();
});

test('deletion is atomic, revision-checked and removes private reviews but retains a minimal audit record', () => {
  const db = database();
  const source = readFileSync(new URL('app/api/admin/solicitacoes/[id]/route.ts', root), 'utf8');
  const audit = source.match(/prepare\('(INSERT INTO deletion_events[^']+)'\)/)?.[1];
  const reviews = source.match(/prepare\('(DELETE FROM review_events[^']+)'\)/)?.[1];
  const remove = source.match(/prepare\('(DELETE FROM applications[^']+)'\)/)?.[1];
  assert.ok(audit); assert.ok(reviews); assert.ok(remove);
  db.prepare('INSERT INTO review_events VALUES (?,?,?,?,?,?)').run('r1','test-id','admin','pending','Private test content','2026-10-15');
  function deletion(revision: number, confirmation: string, event: string, fail = false) {
    db.exec('BEGIN');
    try {
      db.prepare(audit!).run(event,'test-admin','2026-10-15','test-id',revision,confirmation);
      db.prepare(reviews!).run('test-id',event);
      if (fail) throw new Error('simulated failure');
      const result = db.prepare(remove!).run('test-id',event); db.exec('COMMIT'); return result.changes;
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  assert.equal(deletion(1,'TEST-ONLY','stale'),0);
  assert.equal(deletion(0,'wrong','typo'),0);
  assert.throws(() => deletion(0,'TEST-ONLY','rollback',true));
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM review_events').get()?.n,1);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM deletion_events').get()?.n,0);
  assert.equal(deletion(0,'TEST-ONLY','success'),1);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM applications').get()?.n,0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM review_events').get()?.n,0);
  assert.equal(db.prepare('SELECT actor_id FROM deletion_events').get()?.actor_id,'test-admin');
  assert.equal(deletion(0,'TEST-ONLY','repeated'),0);
  db.close();
});
test('the actual review queries prevent stale decisions and keep one matching audit event', () => {
  const db = database();
  const source = readFileSync(new URL('app/api/admin/solicitacoes/[id]/route.ts', root), 'utf8');
  const update = source.match(/prepare\('(UPDATE applications[^']+)'\)/)?.[1];
  const audit = source.match(/prepare\('(INSERT INTO review_events[^']+)'\)/)?.[1];
  assert.ok(update); assert.ok(audit);
  function review(revision: number, event: string) {
    db.exec('BEGIN');
    const result = db.prepare(update!).run('approved','Teste de resposta','','2026-10-14','test-admin',event,'test-id',revision);
    db.prepare(audit!).run(event,'test-admin','2026-10-14','test-id',event);
    db.exec('COMMIT'); return result;
  }
  assert.equal(review(0, 'event-1').changes, 1);
  assert.equal(review(0, 'event-2').changes, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM review_events').get()?.n, 1);
  assert.equal(db.prepare('SELECT revision FROM applications').get()?.revision, 1);
  db.close();
});
