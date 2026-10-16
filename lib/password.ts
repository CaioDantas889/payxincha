import { scryptAsync } from '@noble/hashes/scrypt.js';
export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function randomToken(bytes = 32) { return hex(crypto.getRandomValues(new Uint8Array(bytes))); }
function hex(bytes: Uint8Array) { return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(''); }
export async function digest(value: string) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))); }
export function constantEqual(a: string, b: string) { if (a.length !== b.length) return false; let difference = 0; for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i); return difference === 0; }
let hashing = false;
async function derive(password: string, salt: string) {
  // One memory-hard operation per isolate keeps the worker within its memory limit.
  if (hashing) throw new AuthError(429, 'O acesso está ocupado por um instante. Tente novamente.');
  hashing = true;
  try { return hex(await scryptAsync(password, Uint8Array.from(salt.match(/../g)!, value => parseInt(value,16)), { N: 32768, r: 8, p: 3, dkLen: 32, maxmem: 40 * 1024 * 1024 })); }
  finally { hashing = false; }
}
export async function passwordHash(password: string) { const salt = randomToken(16); return `scrypt:32768:8:3:${salt}:${await derive(password,salt)}`; }
export async function verifyPassword(password: string, encoded?: string | null) {
  const parts = encoded?.match(/^scrypt:32768:8:3:([a-f0-9]{32}):([a-f0-9]{64})$/);
  const candidate = await derive(password, parts?.[1] || '0'.repeat(32));
  return !!parts && constantEqual(candidate, parts[2]);
}
