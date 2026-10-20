// Snapshot público em 19/10/2026. Visa/Mastercard, após as promoções indicadas.
// Basis points: 309 = 3,09%. Prazos e condições comerciais não são equivalentes.
export const comparisonSource = 'https://pagbank.com.br/para-seu-negocio/maquininhas';
export const comparisonPlans = [
  { name: 'Paychinxa', debit: 112, credit: 309, installments12: 1225 },
  { name: 'PagBank Super Max', debit: 144, credit: 349, installments12: 1378 },
  { name: 'PagBank Essencial', debit: 239, credit: 499, installments12: 2259 },
] as const;

export function feeInCents(volumeCents: number, basisPoints: number) {
  if (!Number.isSafeInteger(volumeCents) || volumeCents < 0 || !Number.isSafeInteger(basisPoints) || basisPoints < 0 || basisPoints > 10000) throw new RangeError('Valores inválidos para simulação.');
  return Math.round(volumeCents * basisPoints / 10000);
}

export function ratePercent(basisPoints: number) {
  return `${(basisPoints / 100).toFixed(2).replace('.', ',')}%`;
}
