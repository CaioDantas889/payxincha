import type { Metadata } from 'next';
import AdminAccess from '../access';
export const metadata: Metadata = {title:'Ativar acesso — Payxincha',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function ActivationPage(){return <AdminAccess mode="activate"/>;}
