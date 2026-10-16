import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://payxincha.paleridge2.chatgpt.site'),
  title: 'Payxincha — Maquininha com 99% de desconto',
  description: 'Maquininha Payxincha com 99% de desconto. Cadastre-se com CPF ou CNPJ e consulte as condições com nossa equipe. Oferta sujeita à análise.',
  icons: { icon: '/assets/brand-mark.svg' }, referrer: 'same-origin',
  openGraph: { title: 'Payxincha — Maquininha com 99% de desconto', description: 'Não é pegadinha. Peça sua Payxincha e consulte as condições.', images: ['/assets/comerciante-payxincha.png'], locale: 'pt_BR', type: 'website' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><head><link rel="stylesheet" href="/styles.css" /><link rel="stylesheet" href="/application.css" /><link rel="stylesheet" href="/sales.css" /><link rel="preload" href="/assets/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /></head><body>{children}</body></html>;
}
