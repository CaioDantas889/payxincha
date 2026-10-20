import { salesContact, testimonials } from '@/lib/sales-content';

export function SalesTestimonials() {
  if (!testimonials.length) return <section id="depoimentos" className="sales-feedback" aria-labelledby="feedback-title"><div className="sale-container feedback-grid"><div><p className="sale-kicker">QUEM VENDE TEM MUITO A CONTAR.</p><h2 id="feedback-title">Seu negócio tem voz.<br /><span>A gente quer ouvir.</span></h2><p>Já vende com a Paychinxa? Conte como está sendo a sua experiência. Sua opinião ajuda a melhorar nosso atendimento.</p><a className="sale-button light" href={`${salesContact.url.split('?')[0]}?text=${encodeURIComponent('Olá! Sou cliente da Paychinxa e gostaria de enviar meu feedback sobre a minha experiência.')}`} target="_blank" rel="noopener noreferrer">Enviar meu feedback <span aria-hidden="true">↗</span></a><small>Você escreve o relato pelo WhatsApp. A publicação só acontece com sua autorização.</small></div><div className="feedback-prompts"><p>CONTE DO SEU JEITO.</p><div><span>01</span><h3>Como foi o atendimento?</h3></div><div><span>02</span><h3>Como a maquininha entrou<br />na sua rotina?</h3></div><div><span>03</span><h3>O que podemos melhorar?</h3></div><a href="/checkout">Ainda não é cliente? Comprar maquininha ↗</a></div></div></section>;
  return <section id="depoimentos" className="sale-container sales-testimonials" aria-labelledby="testimonials-title">
    <p className="sale-kicker">QUEM VENDE CONTA.</p><h2 id="testimonials-title">A experiência de quem<br />escolheu a Paychinxa.</h2>
    <div className="testimonial-grid">{testimonials.map((item, index) => <figure key={`${item.name}-${index}`}><blockquote>“{item.quote}”</blockquote><figcaption><strong>{item.name}</strong><span>{item.business}</span></figcaption></figure>)}</div>
    <a href="/checkout" className="sale-button dark">Comprar maquininha <span aria-hidden="true">↗</span></a>
  </section>;
}
