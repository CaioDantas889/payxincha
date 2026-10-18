// Oferta confirmada pelo responsável em 18/10/2026. Valores em centavos.
export const salesOffer = {
  discountPercent: 90,
  originalCents: 9900,
  finalCents: 990,
  paymentLabel: 'à vista',
} as const;

export const salesContact = {
  label: '(88) 8223-1738',
  url: 'https://wa.me/558882231738?text=Ol%C3%A1!%20Quero%20conhecer%20a%20oferta%20da%20Payxincha.',
};

export type Testimonial = { name: string; business: string; quote: string };
// Adicionar apenas relatos reais com autorização. Vazio = seção não publicada.
export const testimonials: Testimonial[] = [];

export function money(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
