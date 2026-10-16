'use client';
import { useEffect, useRef, useState } from 'react';
import { AppBrand } from '@/components/app-brand';
import { statusLabels, type Status } from '@/lib/validation';
import { trackingCode } from '@/lib/tracking-code';
type Result = { reference: string; status: Status; publicMessage: string; createdAt: string; updatedAt: string };
const titles = { pending: 'Sua solicitação está em análise.', approved: 'Você está apto a receber sua maquininha.', rejected: 'Sua solicitação não foi aprovada neste momento.' };
export default function Tracking() {
  const [token, setToken] = useState(''); const [input, setInput] = useState(''); const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const attempt = useRef(0); const field = useRef<HTMLTextAreaElement>(null);
  async function load(value: string) {
    const current = ++attempt.current; const key = trackingCode(value);
    setResult(null); setError('');
    if (!key) { setLoading(false); setError('Cole o código de 64 caracteres ou o link completo recebido no cadastro. O protocolo PX não é o código de acesso.'); return; }
    setLoading(true); setToken(key);
    try {
      const response = await fetch('/api/solicitacoes/acompanhar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Payxincha-Request': '1' }, body: JSON.stringify({ token: key }) });
      const data = await response.json() as Result & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Não foi possível consultar agora.');
      if (current === attempt.current) { setResult(data); window.history.replaceState(null, '', `#${key}`); }
    } catch (err) { if (current === attempt.current) setError(err instanceof TypeError ? 'Não foi possível conectar. Tente novamente.' : err instanceof Error ? err.message : 'Não foi possível consultar.'); }
    finally { if (current === attempt.current) setLoading(false); }
  }
  useEffect(() => { const key = window.location.hash.slice(1); if (key) { setInput(key); void load(key); } return () => { attempt.current++; }; }, []);
  function another() { attempt.current++; setResult(null); setToken(''); setInput(''); setError(''); setLoading(false); window.history.replaceState(null, '', window.location.pathname); requestAnimationFrame(() => field.current?.focus()); }
  return <div className="tracking-page"><header className="app-topbar"><AppBrand /><a href="/" className="text-link">Voltar ao site ↗</a></header><main className="tracking-main"><p className="eyebrow">CADA PASSO, BEM PERTO</p><h1>Acompanhe<br />seu pedido.</h1><p className="tracking-description">Cole seu código e veja a resposta da nossa equipe.</p>
    <section className="tracking-card" aria-busy={loading}>
      {result ? <div aria-live="polite"><div className="tracking-card-head"><span className={`status-badge status-${result.status}`}>{statusLabels[result.status]}</span><span className="reference">{result.reference}</span></div><h2>{titles[result.status]}</h2><p>{result.status === 'pending' ? 'Recebemos seus dados. A equipe da Payxincha vai avaliar o seu cadastro e registrar o resultado aqui.' : 'Confira abaixo as orientações registradas pela equipe da Payxincha.'}</p>{result.publicMessage && <div className="public-response"><span className="small-label">MENSAGEM DA EQUIPE</span><p>{result.publicMessage}</p></div>}<div className="tracking-dates"><span>Enviado em {new Date(result.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}</span><span>Atualizado em {new Date(result.updatedAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}</span></div><div className="tracking-actions"><button className="secondary-button" disabled={loading} onClick={() => load(token)}>Atualizar status ↻</button><button className="secondary-button" onClick={another}>Consultar outro pedido</button></div></div> : <form onSubmit={event => { event.preventDefault(); if (!loading) void load(input); }}><h2>Qual é o seu código?</h2><p>Use o código ou o link individual exibido ao concluir o cadastro.</p><label className="form-field"><span>Código ou link de acompanhamento</span><textarea ref={field} className="tracking-code-input" rows={3} value={input} onChange={event => setInput(event.target.value)} placeholder="Cole seu código ou link aqui" required maxLength={2048} autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={loading} aria-describedby="tracking-help" /></label><p id="tracking-help" className="tracking-description">O código tem 64 caracteres. Ele é diferente do protocolo que começa com PX.</p><button className="button" disabled={loading}>{loading ? 'Consultando…' : 'Acompanhar meu pedido →'}</button>{loading && <p role="status">Buscando a atualização do seu pedido…</p>}</form>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </section><p className="tracking-footnote">Guarde seu código ou link em um lugar seguro.<br />Ele dá acesso ao resultado do seu pedido.</p><a href="/#cadastro" className="text-link">Ainda não se cadastrou? Solicite sua Payxincha →</a></main><footer className="app-simple-footer">Payxincha. Venda mais, lucre de verdade.</footer></div>;
}
