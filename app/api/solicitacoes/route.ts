import { checkoutUrl } from '@/lib/checkout';

// O cadastro interno foi encerrado. Não lê o corpo nem grava novos dados pessoais.
export async function POST() {
  return Response.json({ error: 'O cadastro neste site foi encerrado. Continue sua compra no checkout da Ticto.', checkoutUrl }, { status: 410, headers: { 'Cache-Control': 'no-store' } });
}