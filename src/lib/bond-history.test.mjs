import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { monthlyHistory, mergeMonthlyHistory, periodMoves } from './bond-history.mjs';

test('a September headline does not shift July history into August', () => {
  const result = mergeMonthlyHistory('2026-09-25', monthlyHistory([6.8, 6.7], '2026-07-01'), [{date:'2026-09-25',value:7.12}]);
  assert.deepEqual(result.slice(-4), [6.8, 6.7, null, 7.12]);
});
test('overlapping histories merge once and retain the newer source', () => {
  const result = mergeMonthlyHistory('2026-09-25', monthlyHistory([1,2,3], '2026-08-01'), monthlyHistory([4,5], '2026-09-25'));
  assert.deepEqual(result.slice(-4), [1,2,4,5]);
});
test('period comparisons use calendar dates and never clamp to short history', () => {
  assert.deepEqual(periodMoves([{date:'2026-09-25',value:5},{date:'2026-09-24',value:4.9},{date:'2026-08-25',value:4.5}]), {dailyMove:0.1,oneMonthMove:0.5,oneYearMove:null});
  assert.equal(periodMoves([{date:'2026-09-25',value:5},{date:'2026-08-26',value:4.5}]).oneMonthMove,null);
});
test('weekends use the preceding close, while monthly averages never become daily moves', () => {
  const rows = [{date:'2026-09-23',value:4.409},{date:'2026-09-22',value:4.464},{date:'2026-08-21',value:4}];
  assert.deepEqual(periodMoves(rows), {dailyMove:-0.055,oneMonthMove:0.409,oneYearMove:null});
  assert.deepEqual(periodMoves(rows, 'monthly'), {dailyMove:null,oneMonthMove:null,oneYearMove:null});
});

test('verified manual bond histories retain dated closes and a prior session', () => {
  const { bonds } = JSON.parse(readFileSync(new URL('./bonds-manual.json', import.meta.url), 'utf8'));
  for (const bond of Object.values(bonds)) {
    if (!bond.source.startsWith('Investing.com')) continue;
    const moves = periodMoves([...bond.observations, { date: bond.asOf, value: bond.value }]);
    assert.notEqual(moves.dailyMove, null, `${bond.country}: missing previous-session close`);
    assert.ok(bond.sourceUrl.startsWith('https://'), `${bond.country}: missing source URL`);
    assert.ok(bond.observations.every(point => point.date <= bond.asOf), `${bond.country}: future close`);
    assert.equal(new Set(bond.observations.map(point => point.date)).size, bond.observations.length,
      `${bond.country}: duplicate observation dates`);
  }
  // Keep this regression at its original vintage. A rolling refresh can lack
  // anniversary anchors; periodMoves deliberately returns null in that case.
  const indiaOctober12 = bonds.in10y.observations.filter(point => point.date <= '2026-10-12');
  assert.deepEqual(periodMoves(indiaOctober12), {
    dailyMove: 0.08, oneMonthMove: 0.361, oneYearMove: 0.851,
  });
});

test('Taiwan weekly history fills the chart without replacing the verified headline', () => {
  const { observations } = JSON.parse(readFileSync(new URL('./taiwan-bond-history.json', import.meta.url), 'utf8'));
  const headline = { date: '2026-10-02', value: 1.94 };
  const trend = mergeMonthlyHistory(headline.date, observations, [headline]);
  assert.equal(trend.length, 36);
  assert.ok(trend.every(Number.isFinite));
  assert.equal(trend.at(-1), headline.value);
  const september = observations.filter(p => p.date.startsWith('2026-09')).at(-1);
  assert.equal(trend.at(-2), september.value);
  assert.notEqual(trend.at(-1), observations.at(-1).value);
});

test('imported weekly histories fill all four country charts with dated monthly values', () => {
  const histories = JSON.parse(readFileSync(new URL('./bond-chart-histories.json', import.meta.url), 'utf8'));
  const { bonds } = JSON.parse(readFileSync(new URL('./bonds-manual.json', import.meta.url), 'utf8'));
  for (const country of ['China', 'France', 'Hong Kong', 'Indonesia']) {
    const history = histories[country];
    const bond = Object.values(bonds).find(b => b.country === country);
    assert.equal(history.cadence, 'weekly');
    assert.equal(new Set(history.observations.map(p => p.date)).size, history.observations.length);
    const headline = { date: bond.asOf, value: bond.value };
    const trend = mergeMonthlyHistory(bond.asOf, history.observations, bond.observations, [headline]);
    assert.equal(trend.length, 36, country);
    assert.ok(trend.every(Number.isFinite), `${country}: gaps remain`);
    assert.equal(trend.at(-1), bond.value, `${country}: headline changed`);
    const monthly = monthlyHistory(trend, bond.asOf);
    const julyClose = history.observations.filter(p => p.date.startsWith('2026-07')).at(-1);
    const july = monthly.find(p => p.date.startsWith('2026-07'));
    assert.equal(july.value, julyClose.value, `${country}: weekly history shifted months`);
    const augustClose = bond.observations.filter(p => p.date.startsWith('2026-08')).at(-1);
    assert.equal(monthly.find(p => p.date.startsWith('2026-08')).value, augustClose.value,
      `${country}: verified daily close must take precedence over weekly history`);
    // A newer automated headline must retain the supplemental history too.
    assert.ok(mergeMonthlyHistory('2026-10-14', history.observations, [{date:'2026-10-14',value:bond.value}]).every(Number.isFinite));
  }
});
