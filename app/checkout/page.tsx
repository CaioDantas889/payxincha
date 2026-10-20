import type { Metadata } from 'next';
import { AppBrand } from '@/components/app-brand';
import { CustomerRegistration } from '@/components/customer-registration';
import { OfferPrice } from '@/components/offer-price';
import { salesContact } from '@/lib/sales-content';

export const metadata: Metadata = { title: 'Peça sua maquininha | Paychinxa', robots: { index: false, follow: true } };

export default function CheckoutPage() {
  return <div className="sales-page checkout-page">
    <a href="#dados-pedido" className="skip-link">Pular para o cadastro</a>
    <header className="checkout-header sale-container"><AppBrand /><a href="/#oferta">← Voltar à oferta</a></header>
    <main className="sale-container checkout-layout">
      <aside className="checkout-summary" aria-labelledby="order-summary-title"><p className="sale-kicker">SUA PRÓXIMA CONQUISTA COMEÇA AQUI.</p><h1 id="order-summary-title">Sua maquininha<br />Paychinxa.</h1><div className="checkout-product"><img src="/assets/terminal-paychinxa.png" alt="Maquininha amarela Paychinxa" width="1149" height="1369" /><div><strong>Maquininha Paychinxa</strong><span>Quantidade: 1</span><span>Oferta sujeita à análise</span></div></div><OfferPrice compact /><dl className="checkout-costs"><div><dt>Envio e frete</dt><dd>A confirmar com a equipe</dd></div><div><dt>Pagamento</dt><dd>Após análise e sua confirmação</dd></div></dl><p className="checkout-explanation">Este cadastro inicia seu pedido. Nossa equipe confirma o valor final, as condições e o prazo antes da contratação. Nenhuma cobrança é feita nesta etapa.</p><a className="checkout-support" href={salesContact.url} target="_blank" rel="noopener noreferrer">Tire suas dúvidas no WhatsApp ↗<small>{salesContact.label}</small></a></aside>
      <section className="checkout-details" id="dados-pedido" aria-labelledby="checkout-title"><p className="sale-kicker">CADASTRO DO PEDIDO</p><h2 id="checkout-title">Vamos preparar seu pedido.</h2><p className="checkout-intro">Agora, precisamos dos seus dados para analisar o cadastro. Ao enviar, você recebe um código para acompanhar a solicitação.</p><CustomerRegistration /><details className="checkout-privacy" id="privacidade"><summary>Aviso de privacidade</summary><p>Os dados de identificação, contato, atividade, empresa e endereço são usados pela Paychinxa para analisar sua solicitação, entrar em contato e dar continuidade ao pedido. O cadastro é acessado apenas por administradores autorizados. O acompanhamento mostra protocolo, status e resposta da equipe. Guarde o código em segurança. Para solicitar correção ou exclusão dos dados, fale pelo {salesContact.label}. Não pedimos senha, código de SMS nem dados de cartão.</p></details></section>
    </main>
    <footer className="sale-container checkout-footer"><span>© {new Date().getFullYear()} Paychinxa.</span><a href="/acompanhar">Já enviou? Acompanhar pedido ↗</a></footer>
  </div>;
}
