import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://paychinxa.com.br'),
  title: 'Paychinxa — Maquininha com 90% de desconto',
  description: 'Maquininha Paychinxa com 90% de desconto. Débito Visa e Mastercard a 1,12%, crédito à vista a 3,09%. Conheça a oferta e peça sua maquininha. Sujeito à análise.',
  icons: { icon: '/assets/brand-mark.svg' }, referrer: 'same-origin',
  openGraph: { title: 'Paychinxa — Maquininha com 90% de desconto', description: 'Não é pegadinha. Peça sua Paychinxa e consulte as condições.', images: ['/assets/comerciante-paychinxa.png'], locale: 'pt_BR', type: 'website' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><head><link rel="stylesheet" href="/styles.css" /><link rel="stylesheet" href="/application.css" /><link rel="stylesheet" href="/sales.css" /><link rel="preload" href="/assets/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>{children}</body></html>;
}
