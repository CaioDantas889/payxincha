// The random access code is distinct from the public PX protocol.
export function trackingCode(value: string): string | null {
  let code = value.trim();
  if (/^https?:\/\//i.test(code)) {
    try { code = new URL(code).hash.slice(1); } catch { return null; }
  }
  code = code.replace(/^#/, '').toLowerCase();
  return /^[a-f0-9]{64}$/.test(code) ? code : null;
}
