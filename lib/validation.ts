import { z } from 'zod';
export const businesses = ['Loja ou comércio', 'Alimentação', 'Serviços', 'Outro negócio'] as const;
export const revenues = ['Estou começando', 'Até R$ 5 mil', 'De R$ 5 mil a R$ 15 mil', 'De R$ 15 mil a R$ 30 mil', 'Acima de R$ 30 mil'] as const;
export const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const;
export const statuses = ['pending', 'approved', 'rejected'] as const;
export type Status = typeof statuses[number];
export const trackingTokenSchema = z.string().regex(/^[a-f0-9]{64}$/, 'Link de acompanhamento inválido.');
const digits = (value: string) => value.replace(/\D/g, '');
export function validCpf(value: string) {
  if (!/^\d{11}$/.test(value) || /^(\d)\1{10}$/.test(value)) return false;
  return [9, 10].every(length => { const sum = [...value.slice(0, length)].reduce((total, digit, i) => total + Number(digit) * (length + 1 - i), 0); const check = (sum * 10) % 11 % 10; return check === Number(value[length]); });
}
export const applicationSchema = z.object({
  personType: z.enum(['PF', 'PJ']),
  cpf: z.string().transform(digits).refine(validCpf, 'Confira o CPF do responsável.'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data de nascimento.').refine(value => { const date = new Date(value + 'T12:00:00Z'); return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= '1900-01-01' && value <= new Date().toISOString().slice(0, 10); }, 'Confira a data de nascimento.'),
  motherName: z.string().trim().min(3, 'Informe o nome da mãe.').max(120),
  cnpj: z.string().trim().transform(value => value.replace(/[.\s/\-]/g, '').toUpperCase()).default(''),
  legalName: z.string().trim().max(180).default(''), tradeName: z.string().trim().max(180).default(''),
  postalCode: z.string().transform(digits).refine(value => /^\d{8}$/.test(value), 'Informe um CEP com 8 dígitos.'),
  street: z.string().trim().min(2, 'Informe a rua.').max(180), addressNumber: z.string().trim().min(1, 'Informe o número ou S/N.').max(20),
  complement: z.string().trim().max(150).default(''), neighborhood: z.string().trim().min(2, 'Informe o bairro.').max(100), landmark: z.string().trim().max(180).default(''),
  name: z.string().trim().min(3, 'Informe seu nome completo.').max(120),
  email: z.string().trim().email('Informe um e-mail válido.').max(180).transform(value => value.toLowerCase()),
  phone: z.string().transform(value => value.replace(/\D/g, '').replace(/^55(?=\d{11}$)/, '')).refine(value => /^[1-9]{2}9\d{8}$/.test(value), 'Informe um celular com DDD que receba SMS.'),
  city: z.string().trim().min(2, 'Informe sua cidade.').max(100),
  state: z.enum(states, { errorMap: () => ({ message: 'Selecione seu estado.' }) }),
  business: z.string().trim().min(2, 'Informe o ramo de atividade.').max(120),
  consent: z.literal(true, { errorMap: () => ({ message: 'Confirme a leitura do aviso de privacidade.' }) }),
  website: z.string().max(0, 'Não foi possível enviar a solicitação.').default(''), trackingToken: trackingTokenSchema,
}).strict().superRefine((value, ctx) => {
  if (value.personType === 'PJ') {
    if (!/^[A-Z0-9]{12}\d{2}$/.test(value.cnpj)) ctx.addIssue({ code: 'custom', path: ['cnpj'], message: 'Informe um CNPJ com 14 caracteres.' });
    if (value.legalName.length < 2) ctx.addIssue({ code: 'custom', path: ['legalName'], message: 'Informe a razão social.' });
    if (value.tradeName.length < 2) ctx.addIssue({ code: 'custom', path: ['tradeName'], message: 'Informe o nome fantasia.' });
  } else if (value.cnpj || value.legalName || value.tradeName) ctx.addIssue({ code: 'custom', path: ['personType'], message: 'Selecione Pessoa Jurídica para cadastrar uma empresa.' });
});
export const reviewSchema = z.object({ status: z.enum(statuses), publicMessage: z.string().trim().max(700), internalNotes: z.string().trim().max(2000), revision: z.number().int().min(0) }).strict().refine(value => value.status !== 'rejected' || value.publicMessage.length >= 5, { path: ['publicMessage'], message: 'Explique ao cliente o motivo da não aprovação.' });
export const statusLabels: Record<Status, string> = { pending: 'Em análise', approved: 'Apto', rejected: 'Não apto' };
