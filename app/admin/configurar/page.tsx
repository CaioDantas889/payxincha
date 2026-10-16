import type { Metadata } from 'next';
import AdminAccess from '../access';
export const metadata: Metadata = {title:'Ativar conta principal — Payxincha',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function SetupPage(){return <AdminAccess mode="setup"/>;}
