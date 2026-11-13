import type { Metadata } from 'next';
import './globals.css';
const traficaiScript = `(function(){if(!window.fbq){window.fbq=function(){window.fbq.callMethod?window.fbq.callMethod.apply(window.fbq,arguments):window.fbq.queue.push(arguments)};window.fbq.push=window.fbq;window.fbq.loaded=!0;window.fbq.version='2.0';window.fbq.queue=[];window._fbq=window.fbq}var s=document.createElement('script');s.src='https://api.alfamaxdigital.com.br/api/v1/track/pixel/d4900623427ab657f9bc9242f633b08e4577d20c.js';s.async=true;s.defer=true;(document.head||document.documentElement).appendChild(s)})();`;
export const metadata: Metadata = {
  metadataBase: new URL('https://paychinxa.com.br'),
  title: 'Paychinxa — Maquininha com 90% de desconto',
  description: 'Maquininha Paychinxa com 90% de desconto. Débito Visa e Mastercard a 0,79%, crédito à vista a 3,09%. Conheça a oferta e peça sua maquininha. Sujeito à análise.',
  icons: { icon: '/assets/brand-mark.svg' }, referrer: 'same-origin',
  openGraph: { title: 'Paychinxa — Maquininha com 90% de desconto', description: 'Não é pegadinha. Peça sua Paychinxa e consulte as condições.', images: ['/assets/comerciante-paychinxa.png'], locale: 'pt_BR', type: 'website' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><head><link rel="stylesheet" href="/styles.css" /><link rel="stylesheet" href="/application.css" /><link rel="stylesheet" href="/sales.css" /><link rel="stylesheet" href="/sales-harmony.css" /><link rel="preload" href="/assets/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><script id="traficai-pixel" dangerouslySetInnerHTML={{ __html: traficaiScript }} /></head><body>{children}</body></html>;
}
