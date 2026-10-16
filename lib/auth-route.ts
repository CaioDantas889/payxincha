import { env } from 'cloudflare:workers';
import { handleAuth, authJson } from './admin-auth';
export async function authRoute(request: Request) {
  if(!env.DB)return authJson({error:'Serviço temporariamente indisponível.'},503);
  const runtime = env as unknown as Record<string, string | undefined>;
  return handleAuth(env.DB, {
    origin: 'https://payxincha.paleridge2.chatgpt.site',
    ownerEmail: 'caioalves0807@gmail.com',
    setupHash: runtime.ADMIN_SETUP_HASH,
    setupExpires: Number(runtime.ADMIN_SETUP_EXPIRES || 0),
  }, request);
}
