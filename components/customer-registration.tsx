'use client';
import { useRef, useState } from 'react';
import { applicationSchema, states } from '@/lib/validation';
const groups = [ ['personType','name','cpf','birthDate','phone','email','motherName'], ['business','cnpj','legalName','tradeName'], ['postalCode','street','addressNumber','complement','neighborhood','landmark','city','state','consent'] ];
type Mask = 'cpf' | 'cnpj' | 'phone' | 'cep';
type Field = { name: string; label: string; type?: string; autoComplete?: string; optional?: boolean; max?: number; placeholder?: string; inputMode?: 'numeric' | 'tel'; mask?: Mask };
const masks: Record<Mask, (value: string) => string> = {
  cpf: value => format(value.replace(/\D/g, '').slice(0, 11), [3, 6, 9], ['.', '.', '-']),
  cnpj: value => format(value.replace(/[^0-9A-Za-z]/g, '').toUpperCase().slice(0, 14), [2, 5, 8, 12], ['.', '.', '/', '-']),
  phone: value => { const d = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11); if (!d) return ''; if (d.length <= 2) return `(${d}`; const head = `(${d.slice(0, 2)}) `; if (d.length <= 6) return head + d.slice(2); return d.length <= 10 ? `${head}${d.slice(2, 6)}-${d.slice(6)}` : `${head}${d.slice(2, 7)}-${d.slice(7)}`; },
  cep: value => format(value.replace(/\D/g, '').slice(0, 8), [5], ['-']),
};
function format(raw: string, cuts: number[], separators: string[]) { let out = ''; for (let i = 0; i < raw.length; i++) { const cut = cuts.indexOf(i); if (cut >= 0) out += separators[cut]; out += raw[i]; } return out; }
function applyMask(event: React.FormEvent<HTMLInputElement>, mask: Mask) { const input = event.currentTarget; input.value = masks[mask](input.value); }
export function CustomerRegistration() {
  const [step, setStep] = useState(0); const [personType, setPersonType] = useState('PF'); const [error, setError] = useState(''); const [sending, setSending] = useState(false); const [reference, setReference] = useState(''); const [copied, setCopied] = useState(false);
  const form = useRef<HTMLFormElement>(null); const token = useRef(''); const title = useRef<HTMLHeadingElement>(null); const success = useRef<HTMLDivElement>(null);
  function move(next: number) { setStep(next); setError(''); requestAnimationFrame(() => title.current?.focus()); }
  function field({ name, label, type = 'text', autoComplete, optional, max = 120, placeholder, inputMode, mask }: Field) {
    return <label className="sale-field" key={name}><span>{label}{optional && <small> (opcional)</small>}</span><input name={name} type={type} autoComplete={autoComplete || 'off'} required={!optional} maxLength={max} placeholder={placeholder} inputMode={inputMode} onInput={mask ? event => applyMask(event, mask) : undefined} /></label>;
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (sending || !form.current) return;
    const active = Array.from(form.current.querySelectorAll(`[data-step="${step}"] input, [data-step="${step}"] select`)) as unknown as Array<{ reportValidity(): boolean }>;
    for (const control of active) if (!control.reportValidity()) return;
    if (step < 2) { move(step + 1); return; }
    if (!token.current) token.current = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    const values = new FormData(form.current); const payload = { ...Object.fromEntries(values), consent: values.get('consent') === 'on', trackingToken: token.current };
    const checked = applicationSchema.safeParse(payload);
    if (!checked.success) { const issue = checked.error.issues[0]; const target = groups.findIndex(group => group.includes(String(issue.path[0]))); if (target >= 0) move(target); setError(issue.message); return; }
    setSending(true); setError('');
    try {
      const response = await fetch('/api/solicitacoes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Payxincha-Request': '1' }, body: JSON.stringify(checked.data) });
      const data = await response.json().catch(() => { throw new Error('O serviço está reiniciando. Seus dados continuam aqui; tente enviar novamente.'); }) as { reference?: string; error?: string };
      if (!response.ok || !data.reference) throw new Error(data.error || 'Não foi possível confirmar o envio. Tente novamente.');
      setReference(data.reference); requestAnimationFrame(() => success.current?.focus());
    } catch (err) { setError(err instanceof TypeError ? 'Sem conexão. Seus dados continuam aqui; tente novamente.' : err instanceof Error ? err.message : 'Não foi possível enviar.'); }
    finally { setSending(false); }
  }
  if (reference) return <div className="registration-success" ref={success} tabIndex={-1}><span className="success-check">✓</span><h3>Cadastro enviado!</h3><p>Nossa equipe dará andamento ao cadastro e retornará com as próximas etapas.</p><p>Seu protocolo: <strong>{reference}</strong></p><label className="registration-code"><span>Seu código de acompanhamento</span><textarea readOnly rows={3} value={token.current} onFocus={event => event.target.select()} /></label><button className="sale-link" onClick={async () => { try { await navigator.clipboard.writeText(token.current); setCopied(true); } catch { setError('Selecione e copie o código no campo acima.'); } }}>Copiar código de acompanhamento</button><a className="sale-button dark" href={`/acompanhar#${token.current}`}>Acompanhar meu pedido ↗</a><button className="sale-link" onClick={async () => { try { await navigator.clipboard.writeText(`${location.origin}/acompanhar#${token.current}`); setCopied(true); } catch { setError('Abra o acompanhamento e copie o endereço do navegador.'); } }}>Copiar link de acompanhamento</button><p role="status">{copied ? 'Copiado! Guarde para consultar sua análise.' : error || 'Guarde seu código ou link individual. O protocolo sozinho não permite consultar o pedido.'}</p></div>;
  return <form ref={form} onSubmit={submit} noValidate className="sale-form" aria-busy={sending}>
    <div className="form-progress" aria-label={`Etapa ${step + 1} de 3`}>{['Você','Seu negócio','Endereço'].map((label, index) => <span key={label} className={index <= step ? 'active' : ''} aria-current={index === step ? 'step' : undefined}><b>{index < step ? '✓' : index + 1}</b>{label}</span>)}</div>
    <h3 ref={title} tabIndex={-1}>{['Vamos começar por você.','Conte sobre seu negócio.','Onde você está?'][step]}</h3><p className="form-help">{['Preencha os dados do responsável.','Selecione como deseja fazer seu cadastro.','Informe o endereço completo para continuar.'][step]}</p>
    <fieldset data-step="0" hidden={step !== 0} disabled={sending}><legend className="sr-only">Dados do responsável</legend>
      <div className="person-options"><label><input type="radio" name="personType" value="PF" checked={personType === 'PF'} onChange={() => setPersonType('PF')} /><span>Pessoa Física <small>CPF</small></span></label><label><input type="radio" name="personType" value="PJ" checked={personType === 'PJ'} onChange={() => setPersonType('PJ')} /><span>Pessoa Jurídica <small>CNPJ</small></span></label></div>
      <div className="sale-fields">{field({name:'name',label:'Nome completo',autoComplete:'name'})}{field({name:'cpf',label:'CPF do responsável',inputMode:'numeric',max:14,placeholder:'000.000.000-00',mask:'cpf'})}{field({name:'birthDate',label:'Data de nascimento',type:'date',autoComplete:'bday'})}{field({name:'phone',label:'Celular que recebe SMS',type:'tel',autoComplete:'tel',max:16,placeholder:'(88) 99999-9999',mask:'phone'})}{field({name:'email',label:'E-mail',type:'email',autoComplete:'email',max:180})}{field({name:'motherName',label:'Nome completo da mãe'})}</div>
    </fieldset>
    <fieldset data-step="1" hidden={step !== 1} disabled={sending}><legend className="sr-only">Empresa e atividade</legend><div className="sale-fields">{field({name:'business',label:'Ramo de atividade / segmento',placeholder:'Ex.: salão de beleza, comércio, alimentação'})}{personType === 'PJ' && <>{field({name:'cnpj',label:'CNPJ',max:18,placeholder:'00.000.000/0000-00',mask:'cnpj'})}{field({name:'legalName',label:'Razão social',autoComplete:'organization',max:180})}{field({name:'tradeName',label:'Nome fantasia',max:180})}</>}</div><p className="form-help">{personType === 'PF' ? 'Você está se cadastrando com CPF. Não precisa ter CNPJ.' : 'Os dados da empresa serão analisados junto aos dados do responsável.'}</p></fieldset>
    <fieldset data-step="2" hidden={step !== 2} disabled={sending}><legend className="sr-only">Endereço completo</legend><div className="sale-fields">{field({name:'postalCode',label:'CEP',autoComplete:'postal-code',inputMode:'numeric',max:9,placeholder:'00000-000',mask:'cep'})}{field({name:'street',label:'Rua',autoComplete:'address-line1',max:180})}{field({name:'addressNumber',label:'Número',max:20,placeholder:'Número ou S/N'})}{field({name:'complement',label:'Complemento',optional:true,max:150})}{field({name:'neighborhood',label:'Bairro',max:100})}{field({name:'landmark',label:'Ponto de referência',optional:true,max:180})}{field({name:'city',label:'Cidade',autoComplete:'address-level2',max:100})}<label className="sale-field"><span>Estado</span><select name="state" required defaultValue="" autoComplete="address-level1"><option value="" disabled>Selecione</option>{states.map(state => <option key={state}>{state}</option>)}</select></label></div>
      <label className="sale-consent"><input name="consent" type="checkbox" required /><span>Li o <a href="#privacidade">aviso de privacidade</a> e autorizo o uso dos meus dados para análise e contato sobre esta solicitação.</span></label>
    </fieldset>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="sale-form-actions">{step > 0 && <button type="button" className="sale-back" disabled={sending} onClick={() => move(step - 1)}>← Voltar</button>}<button className="sale-button dark" type="submit" disabled={sending}>{sending ? 'Enviando…' : step < 2 ? 'Continuar →' : 'Enviar meu cadastro →'}</button></div>
    <p className="form-footnote">Cadastro sujeito à análise. O envio não confirma aprovação nem gera cobrança.</p>
  </form>;
}
