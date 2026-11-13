import { CheckoutButton } from '@/components/checkout-button';
import { AcceptedBrands } from '@/components/accepted-brands';
// Tabela fornecida para vendas com CPF.
const rates = [
  ['Débito', '0,79', '1,79'],
  ['1x', '3,09', '3,57'],
  ['2x', '4,37', '5,00'],
  ['3x', '5,12', '5,75'],
  ['4x', '5,84', '6,50'],
  ['5x', '6,60', '7,23'],
  ['6x', '7,34', '7,97'],
  ['7x', '8,23', '8,99'],
  ['8x', '8,94', '9,70'],
  ['9x', '9,65', '10,41'],
  ['10x', '10,35', '11,11'],
  ['11x', '11,04', '11,80'],
  ['12x', '11,73', '12,49'],
  ['13x', '12,63', '13,48'],
  ['14x', '13,30', '14,15'],
  ['15x', '13,97', '14,82'],
  ['16x', '14,62', '15,47'],
  ['17x', '15,28', '16,13'],
  ['18x', '15,92', '16,77'],
] as const;

export function SalesRates() {
  const highlights = [
    { title: 'Débito', rate: rates[0][1], note: 'Para suas vendas do dia a dia.' },
    { title: 'Crédito à vista', rate: rates[1][1], note: 'Para vendas em uma parcela.' },
    { title: 'Crédito em 12x', rate: rates[12][1], note: 'Para vendas em 12 parcelas.' },
  ];
  return <section id="taxas" className="sale-rates" aria-labelledby="rates-title"><div className="sale-container">
    <div className="rates-heading"><div><p className="sale-kicker">02 / CADA TAXA CONTA</p><h2 id="rates-title">Menos custo na venda.<br />Mais espaço para lucrar.</h2></div><p>Exclusivo para CPF. Recebimento na mesma hora.<br />Compare as condições para seu negócio.</p></div>
    <div className="rate-grid">{highlights.map((rate, i) => <article key={rate.title}><span className="rate-number">0{i + 1}</span><h3>{rate.title}</h3><strong className="rate-value">{rate.rate}<span>%</span></strong><span className="rate-brand">Visa e Mastercard</span><p>{rate.note}</p></article>)}</div>
    <div className="rate-example"><div><span>NA PRÁTICA, EM UMA VENDA DE R$ 1.000</span><strong>R$ 992,10 para o seu negócio.</strong><p>Exemplo no débito Visa ou Mastercard, descontando somente a taxa de 0,79% (R$ 7,90). Não representa lucro líquido.</p></div><CheckoutButton>Comprar maquininha <span aria-hidden="true">↗</span></CheckoutButton></div>
    <div className="brands-section"><div><h3>Aceite as bandeiras do dia a dia.</h3><p>Débito e crédito, com taxas por bandeira.</p></div><AcceptedBrands /></div>
    <p className="rates-conditions">Condições exclusivas para CPF.</p>
    <details className="rates-disclosure"><summary><span><strong>Ver tabela completa de taxas</strong><small>Débito e crédito de 1x a 18x · Todas as bandeiras</small></span><span className="rates-expand" aria-hidden="true">+</span></summary>
      <div className="rates-table-content"><p className="rates-scroll-hint" id="rates-scroll-hint">No celular, deslize a tabela para ver todas as bandeiras →</p><div className="rates-table-scroll" role="region" aria-label="Tabela de taxas por bandeira" aria-describedby="rates-scroll-hint" tabIndex={0}>
        <table className="full-rates-table"><caption>Tabela de taxas para CPF</caption><thead><tr><th scope="col">Modalidade</th><th scope="col">Visa</th><th scope="col">Mastercard</th><th scope="col">Elo e outros</th></tr></thead><tbody>{rates.map(([installments, visaMaster, eloOther]) => <tr key={installments}><th scope="row">{installments === '1x' ? 'Crédito 1x' : installments}</th><td>{visaMaster}%</td><td>{visaMaster}%</td><td>{eloOther}%</td></tr>)}</tbody></table>
      </div><p className="rates-table-note">Recebimento na mesma hora. Parcelamento em até 18x.</p></div>
    </details>
    <div className="rates-pix"><div><strong>E o Pix na maquininha?</strong><p>Taxa de 0,60%. Recebimento na mesma hora.</p></div><a href="https://wa.me/5588921931397?text=Ol%C3%A1!%20Quero%20consultar%20a%20taxa%20final%20do%20Pix%20na%20maquininha." target="_blank" rel="noopener noreferrer">Tirar dúvidas sobre Pix <span aria-hidden="true">↗</span></a></div>
  </div></section>;
}
