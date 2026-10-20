import test from 'node:test';
import assert from 'node:assert/strict';
import { feeInCents } from '../lib/rate-comparison.ts';

test('simulação de crédito à vista preserva centavos e diferenças nos três volumes', () => {
  for (const [volume, pay, essential, difference] of [[500000,15450,24950,9500],[1000000,30900,49900,19000],[2000000,61800,99800,38000]]) {
    assert.equal(feeInCents(volume,309),pay);
    assert.equal(feeInCents(volume,499),essential);
    assert.equal(feeInCents(volume,499)-feeInCents(volume,309),difference);
  }
});
test('arredonda valores monetários e rejeita entradas inválidas', () => {
  assert.equal(feeInCents(999,309),31);
  assert.equal(feeInCents(0,309),0);
  assert.throws(()=>feeInCents(-1,309),RangeError);
  assert.throws(()=>feeInCents(100,10001),RangeError);
});
