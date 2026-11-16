import { checkoutUrl } from '@/lib/checkout';
import type { ReactNode } from 'react';

export function CheckoutButton({ children = <>Comprar minha Paychinxa <span aria-hidden="true">↗</span></>, className = 'sale-button dark' }: { children?: ReactNode; className?: string }) {
  return <a className={className} href={checkoutUrl}>{children}</a>;
}
