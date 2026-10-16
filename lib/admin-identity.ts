// Server-side membership rule. Identity headers are verified by Sites dispatch.
const adminEmail = 'caioalves0807@gmail.com';
export function isAdminIdentity(user: { userId: string; email: string } | null) { return !!user?.userId && user.email.trim().toLowerCase() === adminEmail; }
