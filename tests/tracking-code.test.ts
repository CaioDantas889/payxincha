import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackingCode } from '../lib/tracking-code.ts';
test('accepts copied tracking code and existing links, without accepting a public protocol', () => {
  const code = 'ab12'.repeat(16);
  assert.equal(trackingCode(` ${code.toUpperCase()} `), code);
  assert.equal(trackingCode(`https://payxincha.paleridge2.chatgpt.site/acompanhar#${code}`), code);
  assert.equal(trackingCode(`#${code}`), code);
  for (const invalid of ['', 'PX-1234567890', 'g'.repeat(64), code.slice(1), 'https://example.test/acompanhar', 'javascript:alert(1)']) assert.equal(trackingCode(invalid), null);
});
