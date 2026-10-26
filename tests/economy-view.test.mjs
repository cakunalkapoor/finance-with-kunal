import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const code=ts.transpileModule(readFileSync(new URL('../src/lib/economy-view.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const view=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const indicator=(fields={})=>({id:'us-gdp',name:'US GDP Growth',country:'United States',category:'growth',value:2.2,previousValue:2.5,change:-0.3,unit:'% QoQ',period:'Apr 2026',direction:'down',timeSeries:[{date:'2026-04',value:2.2}],...fields});

test('monthly and daily observations retain their UTC dates',()=>{
  assert.equal(new Date(view.economicTimestamp('2026-09')).toISOString(),'2026-09-01T00:00:00.000Z');
  assert.equal(new Date(view.economicTimestamp('2026-10-17')).toISOString(),'2026-10-17T00:00:00.000Z');
  assert.ok(Number.isNaN(view.economicTimestamp('unavailable')));
});
test('quarter labels use reporting quarters while monthly GDP retains its month',()=>{
  assert.equal(view.economicPeriod(indicator()),'Q2 2026');
  assert.equal(view.economicPeriod(indicator({id:'ca-gdp-monthly',period:'Jul 2026',timeSeries:[{date:'2026-07',value:0}]})),'Jul 2026');
  assert.equal(view.economicObservationLabel(indicator({id:'india-gdp'}),'2026-06'),'Q1 FY2026–27');
  assert.equal(view.economicObservationLabel(indicator({id:'india-gdp'}),'2026-03'),'Q4 FY2025–26');
});
test('rate deltas are percentage points and US GDP remains explicitly annualized',()=>{
  assert.equal(view.economicDeltaUnit(indicator()),'pp');
  assert.equal(view.economicUnit(indicator()),'% QoQ annualized');
  assert.equal(view.economicUnit(indicator({id:'ca-gdp'})),'% QoQ');
  assert.equal(view.economicUnit(indicator({id:'us-tax-receipts',unit:'USD B'})),'USD B annualized');
  assert.equal(view.economicPeriod(indicator({id:'ca-tax-receipts'})),'Q2 2026');
  assert.equal(view.economicDeltaUnit(indicator({id:'china-mfg-pmi',category:'pmi',unit:'Index'})),'pts');
  assert.equal(view.economicDeltaUnit(indicator({id:'us-jobless-claims',unit:'K'})),'K');
});
test('PMI status depends on its level, not just its direction',()=>{
  assert.equal(view.economicStatus(indicator({category:'pmi',value:54.9,direction:'down'})),'Above 50');
  assert.equal(view.economicStatus(indicator({category:'pmi',value:49.9,direction:'up'})),'Below 50');
  assert.equal(view.economicStatus(indicator({category:'pmi',value:50})),'At 50');
});
test('country views preserve their scope while global retains its existing US headline series',()=>{
  const rows=[indicator(),indicator({id:'us-payrolls',category:'employment'}),indicator({id:'natural-gas',category:'energy'}),indicator({id:'ca-gdp',country:'Canada'}),indicator({id:'china-mfg-pmi',country:'China',category:'pmi'})];
  assert.deepEqual(view.economyIndicators(rows,'global').map(i=>i.id),['us-gdp','natural-gas','china-mfg-pmi']);
  assert.deepEqual(view.economyIndicators(rows,'us').map(i=>i.id),['us-gdp','us-payrolls']);
  assert.deepEqual(view.economyIndicators(rows,'canada').map(i=>i.id),['ca-gdp']);
});
