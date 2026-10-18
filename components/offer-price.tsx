import { money, salesOffer } from '@/lib/sales-content';

export function OfferPrice({ compact = false }: { compact?: boolean }) {
  return <div className={`offer-price${compact ? ' compact' : ''}`}>
    <span className="offer-discount">{salesOffer.discountPercent}% OFF NA MAQUININHA</span>
    <p className="offer-was">De <s>{money(salesOffer.originalCents)}</s> por</p><strong className="offer-amount">{money(salesOffer.finalCents)}</strong><p className="offer-payment">{salesOffer.paymentLabel} · Economia de {money(salesOffer.originalCents - salesOffer.finalCents)}</p>
  </div>;
}
