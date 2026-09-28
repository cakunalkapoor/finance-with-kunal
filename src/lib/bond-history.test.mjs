import test from 'node:test';
import assert from 'node:assert/strict';
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
