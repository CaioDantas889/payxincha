import { testimonials } from '@/lib/sales-content';

export function SalesTestimonials() {
  if (!testimonials.length) return null;
  return <section id="depoimentos" className="sale-container sales-testimonials" aria-labelledby="testimonials-title">
    <p className="sale-kicker">QUEM VENDE CONTA.</p><h2 id="testimonials-title">A experiência de quem<br />escolheu a Payxincha.</h2>
    <div className="testimonial-grid">{testimonials.map((item, index) => <figure key={`${item.name}-${index}`}><blockquote>“{item.quote}”</blockquote><figcaption><strong>{item.name}</strong><span>{item.business}</span></figcaption></figure>)}</div>
    <a href="/checkout" className="sale-button dark">Comprar maquininha <span aria-hidden="true">↗</span></a>
  </section>;
}
