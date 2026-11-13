'use client';

import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { checkoutUrl } from '@/lib/checkout';

const teamPhone = '5588921931397';

export function CheckoutButton({ children = <>Comprar minha Paychinxa <span aria-hidden="true">↗</span></>, className = 'sale-button dark' }: { children?: ReactNode; className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function continueToCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = `Olá! Estou finalizando a compra da minha Paychinxa.\n\nNome: ${name.trim()}\nTelefone: ${phone.trim()}\n\nApós a compra, gostaria que a equipe me ajudasse com a confirmação dos dados e o envio da maquininha.`;
    const whatsappUrl = `https://wa.me/${teamPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    dialogRef.current?.close();
    window.location.assign(checkoutUrl);
  }

  return <>
    <button type="button" className={className} onClick={() => dialogRef.current?.showModal()}>{children}</button>
    <dialog ref={dialogRef} className="checkout-interest-dialog" aria-labelledby={`${id}-title`} onClose={() => { setName(''); setPhone(''); }} onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className="checkout-interest-header"><span className="checkout-interest-mark" aria-hidden="true">P</span><button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar formulário">×</button></div>
      <p className="sale-kicker">SUA PRÓXIMA VENDA COMEÇA AQUI</p>
      <h2 id={`${id}-title`}>Falta pouco para garantir sua maquininha.</h2>
      <p className="checkout-interest-copy">Preencha seus dados para falar com nossa equipe pelo WhatsApp. Após a compra, ajudaremos a confirmar as informações e organizar o envio da Paychinxa.</p>
      <form onSubmit={continueToCheckout}>
        <label htmlFor={`${id}-name`}>Seu nome</label>
        <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="Como podemos chamar você?" />
        <label htmlFor={`${id}-phone`}>Seu telefone com DDD</label>
        <input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={10} maxLength={20} pattern="[0-9+() .-]{10,20}" title="Digite um telefone válido com DDD." value={phone} onChange={event => setPhone(event.target.value)} placeholder="(00) 00000-0000" />
        <p className="checkout-interest-privacy">Seu nome e telefone serão incluídos em uma mensagem para o WhatsApp da equipe. Você poderá conferir e enviar a mensagem no WhatsApp; em seguida, continuará para o checkout seguro da Cakto.</p>
        <button type="submit" className="sale-button dark">Abrir WhatsApp e continuar <span aria-hidden="true">↗</span></button>
      </form>
    </dialog>
  </>;
}
