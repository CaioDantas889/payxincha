import type { Metadata } from 'next';
import AdminAccess from './access';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Entrar no painel — Paychinxa', robots: {index:false,follow:false}, referrer:'no-referrer' };
export default function AdminPage(){return <AdminAccess/>;}
