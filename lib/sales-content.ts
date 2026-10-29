// Oferta confirmada pelo responsável em 18/10/2026. Valores em centavos.
export const salesOffer = { discountPercent: 90, originalCents: 9900, finalCents: 990, paymentLabel: 'à vista' } as const;
export const salesContact = {
  label: '(88) 92193-1397',
  url: 'https://wa.me/5588921931397?text=Ol%C3%A1!%20Quero%20conhecer%20a%20oferta%20da%20Paychinxa.',
};
export type Testimonial = { name: string; quote: string; image: string; initials: string };
// Relatos e prints enviados pelo responsável para publicação em 29/10/2026.
export const testimonials: Testimonial[] = [
  {
    name: 'Achadinhos da Dany', initials: 'AD',
    quote: 'Minha experiência tem sido muito boa, um suporte muito bom, uma excelente equipe. Já indiquei para várias amigas minhas 🤩🤩🤩',
    image: '/assets/feedback-achadinhos-da-dany.jpeg',
  },
  {
    name: 'Bolos da Lia', initials: 'BL',
    quote: 'Uma maquininha que merece ser muito conhecida, excelentes profissionais, as taxas nem se comparam 🤩. Vou indicar para todas as minhas amigas confeiteiras aqui da cidade 🎂',
    image: '/assets/feedback-bolos-da-lia.jpeg',
  },
  {
    name: 'CTATTOS', initials: 'CT',
    quote: 'Que máquina extraordinária, meus clientes estão elogiando muito a facilidade e as taxas, as melhores, nunca mais sofri com isso 👏🏻👏🏻',
    image: '/assets/feedback-ctattos.jpeg',
  },
];
export function money(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
