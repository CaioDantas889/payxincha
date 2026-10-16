import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { handleAuth, authenticate } from '../lib/admin-auth.ts';
import { digest, passwordHash, verifyPassword } from '../lib/password.ts';
const origin='https://painel.example.test';const password='Senha longa apenas de teste 42!';const ownerId='1'.repeat(32);
let encoded:string;before(async()=>{encoded=await passwordHash(password);});
function database(){
  const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');
  for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(value=>value.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
  class Statement {
    sql:string;values:(string|number|null)[]=[];
    constructor(sql:string){this.sql=sql;}
    bind(...values:(string|number|null)[]){const next=new Statement(this.sql);next.values=values;return next;}
    execute(){const statement=sqlite.prepare(this.sql);const returning=/^\s*SELECT\b/i.test(this.sql);return returning?{results:statement.all(...this.values),meta:{changes:0}}:{results:[],meta:{changes:Number(statement.run(...this.values).changes)}};}
    async first(){return this.execute().results[0]||null;}
    async all(){return this.execute();}
    async run(){return this.execute();}
  }
  const adapter={prepare:(sql:string)=>new Statement(sql),batch:async(statements:Statement[])=>{sqlite.exec('BEGIN');try{const results=statements.map(value=>value.execute());sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
  return {db:adapter as unknown as D1Database,sqlite};
}
function fixture(t:{after:(fn:()=>void)=>void},seed=true){
  const {db,sqlite}=database();t.after(()=>sqlite.close());const now=new Date().toISOString();
  if(seed)sqlite.prepare("INSERT INTO admin_users (id,email,name,role,password_hash,created_at,updated_at) VALUES (?,'owner@example.test','Principal','owner',?,?,?)").run(ownerId,encoded,now,now);
  const config={origin,ownerEmail:'owner@example.test',setupHash:'',setupExpires:Date.now()+86400000};
  function request(path:string,body?:unknown,auth:Record<string,string>={},method=body===undefined?'GET':'POST',extra:Record<string,string>={}){return new Request(origin+path,{method,headers:{origin,'Content-Type':'application/json','X-Payxincha-Request':'1','CF-Connecting-IP':'192.0.2.1',...auth,...extra},body:body===undefined?undefined:JSON.stringify(body)});}
  async function send(path:string,body?:unknown,auth:Record<string,string>={},method=body===undefined?'GET':'POST',extra:Record<string,string>={}){return handleAuth(db,config,request(path,body,auth,method,extra));}
  async function login(email='owner@example.test',value=password){const response=await send('/api/auth/login',{email,password:value});assert.equal(response.status,200,await response.clone().text());const result=await response.json() as {csrf:string};return {Cookie:response.headers.get('Set-Cookie')!.split(';')[0],'X-CSRF-Token':result.csrf};}
  return {db,sqlite,send,login,config,request};
}
test('password hashing verifies against scrypt and does not use plaintext',async()=>{
  assert.match(encoded,/^scrypt:32768:8:3:/);assert.ok(!encoded.includes(password));assert.equal(await verifyPassword(password,encoded),true);assert.equal(await verifyPassword('errada',encoded),false);assert.notEqual(encoded,await passwordHash(password));
});
test('owner activation requires the private expiring token and can happen only once',async t=>{
  const {send,config,sqlite}=fixture(t,false);const token='a'.repeat(64);config.setupHash=await digest(token);
  assert.equal((await send('/api/auth/setup',{token:'b'.repeat(64),password})).status,400);
  config.setupExpires=0;assert.equal((await send('/api/auth/setup',{token,password})).status,400);config.setupExpires=Date.now()+86400000;
  assert.equal((await send('/api/auth/setup',{token,password,email:'intruder@example.test'})).status,422);
  assert.equal((await send('/api/auth/setup',{token,password})).status,200);
  assert.equal((await send('/api/auth/setup',{token,password})).status,409);
  assert.equal(sqlite.prepare('SELECT email FROM admin_users').get()?.email,'owner@example.test');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM admin_users').get()?.n,1);
});
test('ChatGPT headers never authenticate; login uses protected cookies and generic errors',async t=>{
  const {send,sqlite,db,request}=fixture(t);
  assert.equal((await send('/api/auth/me',undefined,{'oai-authenticated-user-id':'fake','oai-authenticated-user-email':'caioalves0807@gmail.com'})).status,401);
  for(const email of ['owner@example.test','missing@example.test']){const response=await send('/api/auth/login',{email,password:'wrong'});assert.equal(response.status,401);assert.equal((await response.json() as {error:string}).error,'E-mail ou senha inválidos.');}
  const response=await send('/api/auth/login',{email:'OWNER@example.test',password});assert.equal(response.status,200);const cookie=response.headers.get('Set-Cookie')!;for(const flag of ['__Host-','HttpOnly','Secure','SameSite=Strict','Path=/'])assert.ok(cookie.includes(flag));
  const raw=cookie.split(';')[0];assert.ok(!JSON.stringify(sqlite.prepare('SELECT * FROM admin_sessions').get()).includes(raw.split('=')[1]));
  const data=await response.json() as {csrf:string;user:Record<string,unknown>};assert.equal(data.user.password_hash,undefined);
  await assert.rejects(()=>authenticate(db,request('/api/admin/solicitacoes/test',{}, {Cookie:raw},'PATCH')));
  assert.equal((await send('/api/auth/logout',{}, {Cookie:raw})).status,403);
  assert.equal((await send('/api/auth/logout',{}, {Cookie:raw,'X-CSRF-Token':data.csrf},'POST',{origin:'https://evil.test'})).status,403);
  assert.equal((await send('/api/auth/logout',{}, {Cookie:raw,'X-CSRF-Token':data.csrf})).status,200);
  assert.equal((await send('/api/auth/me',undefined,{Cookie:raw})).status,401);
});
test('only the owner can invite; invitation is single-use and creates an ordinary admin',async t=>{
  const {send,login,sqlite}=fixture(t);const owner=await login();
  assert.equal((await send('/api/admins',{name:'Equipe',email:'member@example.test',currentPassword:'wrong'},owner)).status,403);
  assert.equal((await send('/api/admins',{name:'Equipe',email:'member@example.test',currentPassword:password,role:'owner'},owner)).status,422);
  const invited=await send('/api/admins',{name:'Equipe',email:'MEMBER@example.test',currentPassword:password},owner);assert.equal(invited.status,201);const token=(await invited.json() as {activationUrl:string}).activationUrl.split('#')[1];
  assert.equal(sqlite.prepare("SELECT password_hash FROM admin_users WHERE email='member@example.test'").get()?.password_hash,null);
  assert.ok(!JSON.stringify(sqlite.prepare('SELECT * FROM admin_invitations').get()).includes(token));
  assert.equal((await send('/api/auth/activate',{token,password})).status,200);
  assert.equal((await send('/api/auth/activate',{token,password})).status,400);
  const member=await login('member@example.test');for(const path of ['/api/admins','/api/audit'])assert.equal((await send(path,undefined,member)).status,403);
  assert.equal((await send('/api/admins',{name:'Outra',email:'other@example.test',currentPassword:password},member)).status,403);
  assert.equal((await send(`/api/admins/${ownerId}`,{enabled:false,currentPassword:password},owner,'PATCH')).status,403);
});
test('disable, re-enable and reset revoke sessions and old activation links',async t=>{
  const {send,login,sqlite}=fixture(t);const owner=await login();
  const invited=await send('/api/admins',{name:'Equipe',email:'member@example.test',currentPassword:password},owner);const token=(await invited.json() as {activationUrl:string}).activationUrl.split('#')[1];
  await send('/api/auth/activate',{token,password});const member=await login('member@example.test');const id=sqlite.prepare("SELECT id FROM admin_users WHERE email='member@example.test'").get()!.id;
  assert.equal((await send(`/api/admins/${id}`,{enabled:false,currentPassword:password},owner,'PATCH')).status,200);
  assert.equal((await send('/api/auth/me',undefined,member)).status,401);
  assert.equal((await send('/api/auth/login',{email:'member@example.test',password})).status,401);
  assert.equal((await send(`/api/admins/${id}`,{enabled:true,currentPassword:password},owner,'PATCH')).status,200);
  const active=await login('member@example.test');const reset=await send(`/api/admins/${id}/reset`,{currentPassword:password},owner);assert.equal(reset.status,200);
  assert.equal((await send('/api/auth/me',undefined,active)).status,401);
  assert.equal((await send('/api/auth/login',{email:'member@example.test',password})).status,401);
  assert.equal((await send('/api/auth/activate',{token,password})).status,400);
  assert.equal((await send('/api/auth/activate',{token:(await reset.json() as {activationUrl:string}).activationUrl.split('#')[1],password})).status,200);
});
test('password change verifies the current password and revokes all sessions atomically',async t=>{
  const {send,login,sqlite}=fixture(t);const first=await login();const second=await login();
  const newPassword='Outra senha longa apenas de teste 42!';
  assert.equal((await send('/api/auth/password',{currentPassword:'wrong',newPassword},first)).status,403);
  sqlite.exec("CREATE TRIGGER audit_failure BEFORE INSERT ON admin_audit BEGIN SELECT RAISE(ABORT,'test failure'); END");
  assert.equal((await send('/api/auth/password',{currentPassword:password,newPassword},first)).status,503);
  assert.equal(sqlite.prepare('SELECT password_hash FROM admin_users').get()?.password_hash,encoded);
  assert.equal((await send('/api/auth/me',undefined,second)).status,200);sqlite.exec('DROP TRIGGER audit_failure');
  assert.equal((await send('/api/auth/password',{currentPassword:password,newPassword},first)).status,200);
  for(const auth of [first,second])assert.equal((await send('/api/auth/me',undefined,auth)).status,401);
  await login('owner@example.test',newPassword);
});
test('expired sessions and invitations are rejected; login attempts are rate limited',async t=>{
  const {send,login,sqlite}=fixture(t);const owner=await login();sqlite.exec('UPDATE admin_sessions SET last_seen=0');assert.equal((await send('/api/auth/me',undefined,owner)).status,401);
  const next=await login();sqlite.exec('UPDATE admin_sessions SET expires_at=0');assert.equal((await send('/api/auth/me',undefined,next)).status,401);
  const active=await login();const invite=await send('/api/admins',{name:'Equipe',email:'member@example.test',currentPassword:password},active);sqlite.exec('UPDATE admin_invitations SET expires_at=0');
  assert.equal((await send('/api/auth/activate',{token:(await invite.json() as {activationUrl:string}).activationUrl.split('#')[1],password})).status,400);
  for(let i=0;i<8;i++)assert.equal((await send('/api/auth/login',{email:'missing@example.test',password:'wrong'})).status,401);
  assert.equal((await send('/api/auth/login',{email:'MISSING@example.test',password:'wrong'})).status,429);
});
