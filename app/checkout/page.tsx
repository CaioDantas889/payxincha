import { redirect } from 'next/navigation';
import { checkoutUrl } from '@/lib/checkout';

// Mantém os links antigos funcionais sem exibir o cadastro descontinuado.
export default function CheckoutPage() {
  redirect(checkoutUrl);
}