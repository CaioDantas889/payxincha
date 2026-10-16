let csrf = '';
export function setCsrf(value: string) { csrf = value; }
export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers); headers.set('X-Payxincha-Request','1');
  if (options.body) headers.set('Content-Type','application/json');
  if (csrf) headers.set('X-CSRF-Token',csrf);
  const response = await fetch(path,{...options,headers,credentials:'same-origin',cache:'no-store'});
  if (response.status === 401 && !path.includes('/auth/login')) window.dispatchEvent(new Event('session-expired'));
  return response;
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path,options); const value = await response.json().catch(()=>({error:'Não foi possível conectar ao painel.'}));
  if (!response.ok) throw new Error(value && typeof value === 'object' && 'error' in value && typeof value.error === 'string' ? value.error : 'Não foi possível concluir.');
  return value as T;
}
