export function matchesRequestOrigin(request: Request, publicOrigin?: string) {
  const expectedOrigin = publicOrigin || new URL(request.url).origin;
  return request.headers.get('Origin') === expectedOrigin
    && request.headers.get('X-Payxincha-Request') === '1';
}
