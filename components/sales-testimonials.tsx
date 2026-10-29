import { checkoutUrl } from '@/lib/checkout';
import { salesContact, testimonials } from '@/lib/sales-content';

export function SalesTestimonials() {
  const feedbackUrl = salesContact.url.split('?')[0] + '?text=' + encodeURIComponent('Olá! Sou cliente da Paychinxa e gostaria de enviar meu feedback sobre a minha experiência.');
  return <section id="depoimentos" className="sales-testimonials" aria-labelledby="testimonials-title">
    <div className="sale-container">
      <div className="testimonials-heading">
        <div><p className="sale-kicker">04 / FEEDBACKS DE CLIENTES</p><h2 id="testimonials-title">Quem usa, conta.<br />Quem gosta, indica.</h2></div>
        <p>Suporte, facilidade e taxas que fazem a diferença. Veja o que nossos clientes compartilharam pelo WhatsApp.</p>
      </div>
      <div className="testimonial-grid">{testimonials.map(item => <figure key={item.name}>
        <figcaption><span className="testimonial-avatar" aria-hidden="true">{item.initials}</span><div><strong>{item.name}</strong><span>Cliente Paychinxa</span></div></figcaption>
        <blockquote>“{item.quote}”</blockquote>
        <a className="testimonial-source" href={item.image} target="_blank" rel="noopener noreferrer" aria-label={`Ver conversa de ${item.name} (abre em nova aba)`}>Ver conversa original <span aria-hidden="true">↗</span></a>
      </figure>)}</div>
      <div className="testimonials-actions"><a href={checkoutUrl} className="sale-button dark">Comprar minha maquininha <span aria-hidden="true">↗</span></a><a className="feedback-send" href={feedbackUrl} target="_blank" rel="noopener noreferrer">Já é cliente? Envie seu feedback <span aria-hidden="true">↗</span></a></div>
    </div>
  </section>;
}
