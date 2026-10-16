import { z } from 'zod';
import { AuthError, constantEqual, digest, passwordHash, randomToken, verifyPassword } from './password.ts';

export type AuthConfig = { origin: string; setupHash?: string; setupExpires?: number; ownerEmail: string };
export type Admin = { id: string; userId: string; email: string; name: string; role: 'owner'|'admin'; password_hash: string|null; auth_version: number; session_hash: string; csrf_hash: string };
const email = z.string().trim().email().max(180).transform(value => value.toLowerCase());
const password = z.string().min(15, 'Use uma senha com pelo menos 15 caracteres.').max(128);
const accessToken = z.string().regex(/^[a-f0-9]{64}$/);
const cookieName = '__Host-payxincha_admin';
const cookieSettings = 'Path=/; HttpOnly; Secure; SameSite=Strict';
const identity = (user: Admin) => ({id:user.id,email:user.email,name:user.name,role:user.role});
export function authJson(value: unknown, status = 200, extra: Record<string,string> = {}) {
  return Response.json(value,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...extra}});
}
export function authFailure(error: unknown) {
  if(error instanceof AuthError)return authJson({error:error.message},error.status,error.status===429?{'Retry-After':'60'}:{});
  if(error instanceof z.ZodError)return authJson({error:error.issues[0].message},422);
  if(error instanceof SyntaxError)return authJson({error:'Não foi possível ler os dados.'},400);
  return authJson({error:'Não foi possível concluir agora. Tente novamente.'},503);
}
export function mutationOrigin(request: Request, origin: string) {
  if(request.headers.get('origin')!==origin || request.headers.get('X-Payxincha-Request')!=='1')throw new AuthError(403,'Origem não permitida.');
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new AuthError(415,'Envie os dados no formato correto.');
}
async function body(request: Request) {
  const reader=request.body?.getReader(); if(!reader)throw new AuthError(400,'Informe os dados.');
  const chunks: Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();throw new AuthError(413,'Solicitação muito grande.');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return JSON.parse(new TextDecoder().decode(bytes));
}
export async function authLimit(db: D1Database, request: Request, scope: string, max: number, key = request.headers.get('CF-Connecting-IP') || 'unknown') {
  const now=Date.now();const identifier=await digest(`admin|${scope}|${Math.floor(now/900000)}|${key}`);
  const result=await db.batch([
    db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now),
    db.prepare('INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').bind(identifier,now+1800000),
    db.prepare('SELECT count FROM rate_limits WHERE key=?').bind(identifier),
  ]);
  if(Number((result[2].results[0] as {count:number})?.count)>max)throw new AuthError(429,'Muitas tentativas. Aguarde alguns minutos e tente novamente.');
}
function rawSession(request: Request) {
  const entries=(request.headers.get('cookie')||'').split(';').map(value=>value.trim()).filter(value=>value.startsWith(cookieName+'='));
  const raw=entries.length===1?entries[0].slice(cookieName.length+1):'';
  return /^[a-f0-9]{64}$/.test(raw)?raw:'';
}
export async function authenticate(db: D1Database, request: Request, owner = false): Promise<Admin> {
  const raw=rawSession(request);if(!raw)throw new AuthError(401,'Entre no painel para continuar.');
  const now=Date.now();
  const user=await db.prepare('SELECT u.*,u.id AS userId,s.hash AS session_hash,s.csrf_hash FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.hash=? AND s.auth_version=u.auth_version AND u.enabled=1 AND s.expires_at>? AND s.last_seen>?').bind(await digest(raw),now,now-1800000).first<Admin>();
  if(!user)throw new AuthError(401,'Sua sessão terminou. Entre novamente.');
  if(owner&&user.role!=='owner')throw new AuthError(403,'Somente o administrador principal pode gerenciar a equipe.');
  if(!['GET','HEAD'].includes(request.method)&&!constantEqual(await digest(request.headers.get('X-CSRF-Token')||''),user.csrf_hash))throw new AuthError(403,'Sessão inválida. Atualize a página.');
  await db.prepare('UPDATE admin_sessions SET last_seen=? WHERE hash=?').bind(now,user.session_hash).run();return user;
}
export async function recordAudit(db: D1Database, user: Pick<Admin,'id'|'email'>, action: string, target: string) {
  await db.prepare('INSERT INTO admin_audit VALUES (?,?,?,?,?,?)').bind(randomToken(16),user.id,user.email,action,target,new Date().toISOString()).run();
}
const activeActor = 'EXISTS (SELECT 1 FROM admin_users actor WHERE actor.id=? AND actor.auth_version=? AND actor.enabled=1)';
function changed(db: D1Database, id: string, marker: string, sql: string, ...values: (string|number|null)[]) {
  return db.prepare(`${sql} AND EXISTS (SELECT 1 FROM admin_users WHERE id=? AND last_change=?)`).bind(...values,id,marker);
}
function auditChange(db: D1Database, user: Admin, action: string, target: string, marker: string) {
  return db.prepare('INSERT INTO admin_audit SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM admin_users WHERE id=? AND last_change=?)').bind(randomToken(16),user.id,user.email,action,target,new Date().toISOString(),target,marker);
}
async function reauthenticate(db: D1Database, request: Request, user: Admin, value: string) {
  await authLimit(db,request,'confirm-password',5,user.id);
  if(!await verifyPassword(value,user.password_hash))throw new AuthError(403,'Senha atual incorreta.');
}
export async function handleAuth(db: D1Database, config: AuthConfig, request: Request): Promise<Response> {
  try {
    const url=new URL(request.url);const path=url.pathname;const method=request.method;
    if(!['GET','HEAD'].includes(method))mutationOrigin(request,config.origin);
    if(path==='/api/auth/login'&&method==='POST') {
      await authLimit(db,request,'login-ip',20);
      const input=z.object({email,password:z.string().min(1).max(128)}).strict().parse(await body(request));
      await authLimit(db,request,'login-email',8,input.email);
      const user=await db.prepare('SELECT * FROM admin_users WHERE email=?').bind(input.email).first<Admin&{enabled:number}>();
      const valid=await verifyPassword(input.password,user?.password_hash);
      if(!valid||!user?.enabled)throw new AuthError(401,'E-mail ou senha inválidos.');
      const raw=randomToken();const key=await digest(raw);const csrf=await digest('csrf:'+raw);const now=Date.now();
      const results=await db.batch([
        db.prepare('DELETE FROM admin_sessions WHERE expires_at<? OR last_seen<?').bind(now,now-1800000),
        db.prepare('INSERT INTO admin_sessions SELECT ?,id,auth_version,?,?,? FROM admin_users WHERE id=? AND auth_version=? AND enabled=1').bind(key,await digest(csrf),now+28800000,now,user.id,user.auth_version),
        db.prepare('INSERT INTO admin_audit SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM admin_sessions WHERE hash=?)').bind(randomToken(16),user.id,user.email,'login',user.id,new Date().toISOString(),key),
      ]);
      if(!results[1].meta.changes)throw new AuthError(401,'E-mail ou senha inválidos.');
      return authJson({user:identity(user),csrf},200,{'Set-Cookie':`${cookieName}=${raw}; ${cookieSettings}; Max-Age=28800`});
    }
    if(path==='/api/auth/setup'&&method==='POST') {
      await authLimit(db,request,'setup',8);
      const input=z.object({token:accessToken,password}).strict().parse(await body(request));
      if(!config.setupHash || !config.setupExpires || Date.now()>config.setupExpires || !constantEqual(await digest(input.token),config.setupHash))throw new AuthError(400,'Link de ativação inválido ou expirado.');
      if(await db.prepare("SELECT id FROM admin_users WHERE role='owner'").first())throw new AuthError(409,'A conta principal já foi ativada. Entre com sua senha.');
      const encoded=await passwordHash(input.password);const now=new Date().toISOString();const id=randomToken(16);
      const results=await db.batch([
        db.prepare("INSERT INTO admin_users (id,email,name,role,password_hash,created_at,updated_at) SELECT ?,?,'Administrador principal','owner',?,?,? WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE role='owner')").bind(id,config.ownerEmail,encoded,now,now),
        db.prepare('INSERT INTO admin_audit SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM admin_users WHERE id=?)').bind(randomToken(16),id,config.ownerEmail,'owner_created',id,now,id),
      ]);
      if(!results[0].meta.changes)throw new AuthError(409,'A conta principal já foi ativada.');return authJson({ok:true});
    }
    if(path==='/api/auth/activate'&&method==='POST') {
      await authLimit(db,request,'activate',8);
      const input=z.object({token:accessToken,password}).strict().parse(await body(request));const key=await digest(input.token);
      const invite=await db.prepare('SELECT i.user_id,u.email,u.auth_version FROM admin_invitations i JOIN admin_users u ON u.id=i.user_id WHERE i.hash=? AND i.used_at IS NULL AND i.expires_at>? AND u.enabled=1').bind(key,Date.now()).first<{user_id:string;email:string;auth_version:number}>();
      if(!invite)throw new AuthError(400,'Convite inválido ou expirado. Peça um novo link ao administrador principal.');
      const encoded=await passwordHash(input.password);const marker=randomToken(16);const now=Date.now();
      const results=await db.batch([
        db.prepare('UPDATE admin_users SET password_hash=?,auth_version=auth_version+1,last_change=?,updated_at=? WHERE id=? AND enabled=1 AND auth_version=? AND EXISTS (SELECT 1 FROM admin_invitations WHERE hash=? AND user_id=admin_users.id AND used_at IS NULL AND expires_at>?)').bind(encoded,marker,new Date(now).toISOString(),invite.user_id,invite.auth_version,key,now),
        changed(db,invite.user_id,marker,'DELETE FROM admin_invitations WHERE user_id=?',invite.user_id),
        changed(db,invite.user_id,marker,'DELETE FROM admin_sessions WHERE user_id=?',invite.user_id),
        db.prepare('INSERT INTO admin_audit SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM admin_users WHERE id=? AND last_change=?)').bind(randomToken(16),invite.user_id,invite.email,'account_activated',invite.user_id,new Date(now).toISOString(),invite.user_id,marker),
      ]);
      if(!results[0].meta.changes)throw new AuthError(400,'Convite inválido ou expirado.');return authJson({ok:true});
    }
    if(path==='/api/auth/me'&&method==='GET') {
      const user=await authenticate(db,request);return authJson({user:identity(user),csrf:await digest('csrf:'+rawSession(request))});
    }
    if(path==='/api/auth/logout'&&method==='POST') {
      const user=await authenticate(db,request);await db.prepare('DELETE FROM admin_sessions WHERE hash=?').bind(user.session_hash).run();
      return authJson({ok:true},200,{'Set-Cookie':`${cookieName}=; ${cookieSettings}; Max-Age=0`});
    }
    if(path==='/api/auth/password'&&method==='POST') {
      const user=await authenticate(db,request);const input=z.object({currentPassword:z.string().max(128),newPassword:password}).strict().parse(await body(request));
      await reauthenticate(db,request,user,input.currentPassword);const encoded=await passwordHash(input.newPassword);const marker=randomToken(16);
      const results=await db.batch([
        db.prepare('UPDATE admin_users SET password_hash=?,auth_version=auth_version+1,last_change=?,updated_at=? WHERE id=? AND enabled=1 AND auth_version=?').bind(encoded,marker,new Date().toISOString(),user.id,user.auth_version),
        changed(db,user.id,marker,'DELETE FROM admin_sessions WHERE user_id=?',user.id),
        changed(db,user.id,marker,'DELETE FROM admin_invitations WHERE user_id=?',user.id),
        auditChange(db,user,'password_changed',user.id,marker),
      ]);
      if(!results[0].meta.changes)throw new AuthError(409,'A conta mudou. Entre novamente.');
      return authJson({ok:true},200,{'Set-Cookie':`${cookieName}=; ${cookieSettings}; Max-Age=0`});
    }
    if(path==='/api/admins'&&method==='GET') {
      await authenticate(db,request,true);
      const result=await db.prepare('SELECT id,email,name,role,enabled,(password_hash IS NULL) AS pending,created_at AS createdAt FROM admin_users ORDER BY role DESC,created_at').all();return authJson({items:result.results});
    }
    if(path==='/api/audit'&&method==='GET') {
      await authenticate(db,request,true);const result=await db.prepare('SELECT id,actor_email AS actorEmail,action,target_id AS targetId,created_at AS createdAt FROM admin_audit ORDER BY created_at DESC LIMIT 100').all();return authJson({items:result.results});
    }
    if(path==='/api/admins'&&method==='POST') {
      const user=await authenticate(db,request,true);const input=z.object({name:z.string().trim().min(2).max(120),email,currentPassword:z.string().max(128)}).strict().parse(await body(request));
      await reauthenticate(db,request,user,input.currentPassword);
      if(await db.prepare('SELECT id FROM admin_users WHERE email=?').bind(input.email).first())throw new AuthError(409,'Este e-mail já está cadastrado. Use a conta existente.');
      const id=randomToken(16);const marker=randomToken(16);const raw=randomToken();const now=new Date().toISOString();
      const results=await db.batch([
        db.prepare(`INSERT INTO admin_users (id,email,name,role,last_change,created_at,updated_at) SELECT ?,?,?,'admin',?,?,? WHERE ${activeActor} ON CONFLICT(email) DO NOTHING`).bind(id,input.email,input.name,marker,now,now,user.id,user.auth_version),
        db.prepare('INSERT INTO admin_invitations SELECT ?,id,?,NULL,? FROM admin_users WHERE id=? AND last_change=?').bind(await digest(raw),Date.now()+86400000,user.id,id,marker),
        auditChange(db,user,'admin_invited',id,marker),
      ]);
      if(!results[0].meta.changes)throw new AuthError(409,'A conta já existe ou seu acesso mudou. Atualize a página.');
      return authJson({activationUrl:`${config.origin}/admin/ativar#${raw}`},201);
    }
    const member=path.match(/^\/api\/admins\/([a-f0-9]{32})(\/reset)?$/);
    if(member&&((method==='PATCH'&&!member[2])||(method==='POST'&&member[2]))) {
      const user=await authenticate(db,request,true);const isReset=!!member[2];
      const input=(isReset?z.object({currentPassword:z.string().max(128)}):z.object({enabled:z.boolean(),currentPassword:z.string().max(128)})).strict().parse(await body(request));
      await reauthenticate(db,request,user,input.currentPassword);
      const target=await db.prepare('SELECT id,role,enabled,auth_version FROM admin_users WHERE id=?').bind(member[1]).first<{id:string;role:string;enabled:number;auth_version:number}>();
      if(!target)throw new AuthError(404,'Administrador não encontrado.');if(target.role==='owner')throw new AuthError(403,'A conta principal não pode ser alterada por esta ação.');
      if(isReset&&!target.enabled)throw new AuthError(409,'Reative o administrador antes de gerar um novo acesso.');
      const enabled='enabled' in input?Number(input.enabled):target.enabled;const marker=randomToken(16);const raw=randomToken();
      const results=await db.batch([
        db.prepare(`UPDATE admin_users SET enabled=?,password_hash=CASE WHEN ?=1 THEN NULL ELSE password_hash END,auth_version=auth_version+1,last_change=?,updated_at=? WHERE id=? AND role='admin' AND auth_version=? AND ${activeActor}`).bind(enabled,Number(isReset),marker,new Date().toISOString(),target.id,target.auth_version,user.id,user.auth_version),
        changed(db,target.id,marker,'DELETE FROM admin_sessions WHERE user_id=?',target.id),
        changed(db,target.id,marker,'DELETE FROM admin_invitations WHERE user_id=?',target.id),
        ...(isReset?[db.prepare('INSERT INTO admin_invitations SELECT ?,id,?,NULL,? FROM admin_users WHERE id=? AND last_change=?').bind(await digest(raw),Date.now()+86400000,user.id,target.id,marker)]:[]),
        auditChange(db,user,isReset?'admin_reset':enabled?'admin_enabled':'admin_disabled',target.id,marker),
      ]);
      if(!results[0].meta.changes)throw new AuthError(409,'Esta conta foi alterada. Atualize a lista.');
      return authJson(isReset?{activationUrl:`${config.origin}/admin/ativar#${raw}`}:{ok:true});
    }
    return authJson({error:'Rota não encontrada.'},404);
  } catch(error) { return authFailure(error); }
}
