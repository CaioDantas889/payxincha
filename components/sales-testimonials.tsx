'use client';
import { useRef, useState } from 'react';
import { CheckoutButton } from '@/components/checkout-button';
import { testimonials } from '@/lib/sales-content';

export function SalesTestimonials() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<(typeof testimonials)[number] | null>(null);
  function openFeedback(item: (typeof testimonials)[number]) { setSelected(item); dialogRef.current?.showModal(); }
  return <section id="depoimentos" className="sales-testimonials" aria-labelledby="testimonials-title">
    <div className="sale-container">
      <div className="testimonials-heading">
        <div><p className="sale-kicker">03 / QUEM JÁ ESCOLHEU PAYCHINXA</p><h2 id="testimonials-title">Negócios reais.<br />Experiências compartilhadas.</h2></div>
        <p>Suporte, facilidade e taxas que fazem a diferença. Veja o que nossos clientes compartilharam pelo WhatsApp.</p>
      </div>
      <div className="feedback-carousel-controls"><p>Deslize para ver as conversas <span aria-hidden="true">↔</span> · Toque no print para ampliar</p><div><button type="button" aria-label="Feedback anterior" onClick={() => carouselRef.current?.scrollBy({ left: -(carouselRef.current.clientWidth * .9), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>←</button><button type="button" aria-label="Próximo feedback" onClick={() => carouselRef.current?.scrollBy({ left: carouselRef.current.clientWidth * .9, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>→</button></div></div><div ref={carouselRef} className="testimonial-grid" role="region" aria-label="Feedbacks de clientes, deslize para navegar" tabIndex={0}>{testimonials.map(item => <figure key={item.name}>
        <figcaption><span className="testimonial-avatar" aria-hidden="true">{item.initials}</span><div><strong>{item.name}</strong><span>Cliente Paychinxa</span></div></figcaption>
        <blockquote>“{item.quote}”</blockquote><button type="button" className="testimonial-preview" onClick={() => openFeedback(item)} aria-label={`Ampliar print do relato de ${item.name}`} aria-haspopup="dialog"><img src={item.image} alt={`Print do feedback de ${item.name} enviado pelo WhatsApp`} loading="eager" decoding="async" width="400" height="600" /></button>
      </figure>)}</div>
      <div className="testimonials-actions"><CheckoutButton>Comprar minha maquininha <span aria-hidden="true">↗</span></CheckoutButton></div>
    </div>
    <dialog ref={dialogRef} className="feedback-dialog" aria-labelledby="feedback-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }} onClose={() => setSelected(null)}>
      <div className="feedback-dialog-header"><h3 id="feedback-dialog-title">{selected?.name ?? 'Relato de cliente'}</h3><button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar relato">Fechar <span aria-hidden="true">×</span></button></div>
      {selected && <div className="feedback-dialog-content"><img src={selected.image} alt={`Conversa original de ${selected.name}`} /><a href={selected.image} target="_blank" rel="noopener noreferrer">Abrir imagem em tamanho original ↗</a></div>}
    </dialog>
  </section>;
}
