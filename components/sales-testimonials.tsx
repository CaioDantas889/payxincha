import { checkoutUrl } from '@/lib/checkout';
import { salesContact, testimonials } from '@/lib/sales-content';

export function SalesTestimonials() {
  if (!testimonials.length) return <section id="depoimentos" className="feedback-invite" aria-labelledby="feedback-title"><div className="sale-container"><div><h2 id="feedback-title">Já vende com a Paychinxa?</h2><p>Conte sua experiência pelo WhatsApp. Seu relato só será publicado com sua autorização.</p></div><a href={salesContact.url.split('?')[0] + '?text=' + encodeURIComponent('Olá! Sou cliente da Paychinxa e gostaria de enviar meu feedback sobre a minha experiência.')} target="_blank" rel="noopener noreferrer">Enviar meu feedback <span aria-hidden="true">↗</span></a></div></section>;
  return <section id="depoimentos" className="sale-container sales-testimonials" aria-labelledby="testimonials-title">
    <p className="sale-kicker">QUEM VENDE CONTA.</p><h2 id="testimonials-title">A experiência de quem<br />escolheu a Paychinxa.</h2>
    <div className="testimonial-grid">{testimonials.map((item, index) => <figure key={`${item.name}-${index}`}><blockquote>“{item.quote}”</blockquote><figcaption><strong>{item.name}</strong><span>{item.business}</span></figcaption></figure>)}</div>
    <a href={checkoutUrl} className="sale-button dark">Comprar maquininha <span aria-hidden="true">↗</span></a>
  </section>;
}
