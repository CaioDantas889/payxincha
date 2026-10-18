import { AcceptedBrands } from '@/components/accepted-brands';
// Transcrição da tabela Newblack — Máquina (P4.jpeg) fornecida pelo cliente.
// Colunas compartilhadas na fonte: Visa/Mastercard e Hiper/Demais.
const rates = [
  ['Débito', '1,12', '2,09', '3,50'],
  ['1x', '3,09', '4,59', '6,49'],
  ['2x', '5,01', '7,22', '9,31'],
  ['3x', '5,77', '7,98', '10,07'],
  ['4x', '6,52', '8,73', '10,82'],
  ['5x', '7,26', '9,47', '11,56'],
  ['6x', '8,00', '10,21', '12,30'],
  ['7x', '8,72', '11,32', '13,02'],
  ['8x', '9,44', '12,04', '13,74'],
  ['9x', '10,15', '12,75', '14,45'],
  ['10x', '10,86', '13,46', '15,16'],
  ['11x', '11,56', '14,16', '15,86'],
  ['12x', '12,25', '14,85', '16,55'],
  ['13x', '13,13', '15,74', '19,02'],
  ['14x', '13,80', '16,41', '19,69'],
  ['15x', '14,47', '17,08', '20,36'],
  ['16x', '15,14', '17,75', '21,03'],
  ['17x', '15,79', '18,40', '21,68'],
  ['18x', '16,44', '19,05', '22,33'],
] as const;

export function SalesRates() {
  const highlights = [
    { title: 'Débito', rate: rates[0][1], note: 'Para suas vendas do dia a dia.' },
    { title: 'Crédito à vista', rate: rates[1][1], note: 'Crédito em 1x, sem antecipação.' },
    { title: 'Crédito em 12x', rate: rates[12][1], note: 'Taxa final, com antecipação incluída.' },
  ];
  return <section id="taxas" className="sale-rates" aria-labelledby="rates-title"><div className="sale-container">
    <div className="rates-heading"><div><p className="sale-kicker">02 / CADA TAXA CONTA NO SEU LUCRO</p><h2 id="rates-title">Menos custo na venda.<br />Mais espaço para lucrar.</h2></div><p>Taxas às claras. Recebimento em 1 dia.<br />Compare as condições para seu negócio.</p></div>
    <div className="rate-grid">{highlights.map((rate, i) => <article key={rate.title}><span className="rate-number">0{i + 1}</span><h3>{rate.title}</h3><strong className="rate-value">{rate.rate}<span>%</span></strong><span className="rate-brand">Visa e Mastercard</span><p>{rate.note}</p><a href="/checkout">Comprar maquininha <span aria-hidden="true">↗</span></a></article>)}</div>
    <div className="rate-example"><div><span>NA PRÁTICA, EM UMA VENDA DE R$ 1.000</span><strong>R$ 988,80 para o seu negócio.</strong><p>Exemplo no débito Visa ou Mastercard, descontando somente a taxa de 1,12% (R$ 11,20). Não representa lucro líquido.</p></div><a className="sale-button dark" href="/checkout">Comprar maquininha <span aria-hidden="true">↗</span></a></div>
    <div className="brands-section"><div><h3>Aceite as bandeiras do dia a dia.</h3><p>Débito e crédito, com taxas por bandeira.</p></div><AcceptedBrands /></div>
    <p className="rates-conditions">Taxas finais do parcelamento já incluem antecipação de <strong>1,58% ao mês</strong>. Crédito em 1x sem antecipação.</p>
    <details className="rates-disclosure"><summary><span><strong>Ver tabela completa de taxas</strong><small>Débito e crédito de 1x a 18x · Todas as bandeiras</small></span><span className="rates-expand" aria-hidden="true">+</span></summary>
      <div className="rates-table-content"><p className="rates-scroll-hint" id="rates-scroll-hint">No celular, deslize a tabela para ver todas as bandeiras →</p><div className="rates-table-scroll" role="region" aria-label="Tabela de taxas por bandeira" aria-describedby="rates-scroll-hint" tabIndex={0}>
        <table className="full-rates-table"><caption>Tabela Newblack — Máquina</caption><thead><tr><th scope="col">Modalidade</th><th scope="col">Visa</th><th scope="col">Mastercard</th><th scope="col">Elo</th><th scope="col">Hiper</th><th scope="col">Demais</th></tr></thead><tbody>{rates.map(([installments, visaMaster, elo, hiperOther]) => <tr key={installments}><th scope="row">{installments === '1x' ? 'Crédito 1x' : installments}</th><td>{visaMaster}%</td><td>{visaMaster}%</td><td>{elo}%</td><td>{hiperOther}%</td><td>{hiperOther}%</td></tr>)}</tbody></table>
      </div><p className="rates-table-note">Recebimento em 1 dia. Taxas finais por quantidade de parcelas, com antecipação de 1,58% a.m. já incluída no parcelamento. Crédito 1x sem antecipação.</p></div>
    </details>
    <div className="rates-pix"><div><strong>E o Pix na maquininha?</strong><p>Recebimento no mesmo dia (D0). Taxa final ainda não definida.</p></div><a href="https://wa.me/558882231738?text=Ol%C3%A1!%20Quero%20consultar%20a%20taxa%20final%20do%20Pix%20na%20maquininha." target="_blank" rel="noopener noreferrer">Consultar taxa do Pix <span aria-hidden="true">↗</span></a></div>
  </div></section>;
}
