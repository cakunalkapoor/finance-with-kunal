import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseOpecPrices, opecSnapshot } from '../src/lib/opec-history.mjs';

test('OPEC XML fragments parse dates and prices, deduplicate and respect the cutoff', () => {
  const rows = parseOpecPrices('<BasketList val="115.09" data="2026-10-22"/><BasketList data="2026-10-21" val="111.29"/><BasketList data="2026-10-21" val="111.29"/></Basket>', '2026-10-21');
  assert.deepEqual(rows, [{date:'2026-10-21',value:111.29}]);
});

test('invalid dates, invalid prices and conflicting duplicates cannot enter OPEC history', () => {
  for (const text of ['<BasketList data="2026-02-30" val="80"/>', '<BasketList data="2026-10-22" val="-1"/>', '<BasketList data="2026-10-22" val="bad"/>', '<BasketList data="2026-10-22" val="80"/><BasketList data="2026-10-22" val="81"/>']) {
    assert.throws(()=>parseOpecPrices(text,'2026-10-24'));
  }
});

test('legacy Date.UTC data remains compatible without evaluating feed JavaScript', () => {
  assert.deepEqual(parseOpecPrices('[[Date.UTC(2026,9,21),111.29],[Date.UTC(2026,9,22),115.09]]','2026-10-24'), [{date:'2026-10-21',value:111.29},{date:'2026-10-22',value:115.09}]);
});

test('the supplied OPEC daily history establishes the complete range and dated returns', () => {
  const data=JSON.parse(readFileSync(new URL('../src/lib/opec-data.json',import.meta.url),'utf8'));
  // Keep the supplied vintage stable when a later weekly import adds sessions.
  const history=data.dailyObservations.filter(point=>point.date<='2026-10-22');
  const snapshot=opecSnapshot(history);
  assert.equal(history.length,990);
  assert.equal(snapshot.asOf,'2026-10-22');
  assert.equal(snapshot.value,115.09);
  assert.equal(snapshot.low52w,58.39);
  assert.equal(snapshot.high52w,146.05);
  assert.ok(Math.abs(snapshot.dailyChange-3.4145026507)<1e-8);
  assert.ok(Math.abs(snapshot.weekChange-4.6938961157)<1e-8);
  assert.ok(Math.abs(snapshot.monthChange-5.4034252221)<1e-8);
  assert.ok(Math.abs(snapshot.ytdChange-88.7959317585)<1e-8);
  const months=new Map(data.dailyObservations.map(point=>[point.date.slice(0,7),point]));
  assert.deepEqual(data.timeSeries,[...months.values()]);
});

test('monthly snapshots cannot masquerade as a complete daily OPEC range', () => {
  const data=JSON.parse(readFileSync(new URL('../src/lib/opec-data.json',import.meta.url),'utf8'));
  assert.throws(()=>opecSnapshot(data.timeSeries),/full 52-week range/);
  assert.throws(()=>opecSnapshot(data.dailyObservations.slice(-100)),/full 52-week range/);
});
