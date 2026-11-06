import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/lib/expansion-models.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
const {modelDebt,modelVehicles,validateExpansion,vehicleMaintenancePresets}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const close=(a,b)=>assert.ok(Math.abs(a-b)<0.01,`${a} != ${b}`);
const debt={years:2,balance:1200,rate:0,payment:100,extra:100,return:0};
test('equal-budget debt paths reconcile when interest and return are zero',()=>{const r=modelDebt(debt);close(r.points.at(-1).values[0],3600);close(r.points.at(-1).values[1],3600);assert.deepEqual(r.payoff,[6,12]);});
test('payoff releases full budget and debt interest favours early repayment at zero returns',()=>{const r=modelDebt({...debt,rate:12});assert.ok(r.points.at(-1).values[0]>r.points.at(-1).values[1]);assert.ok(r.interest[0]<r.interest[1]);close(r.points.at(-1).debts[0],0);});
test('invest path receives month-end surplus and compounds existing assets',()=>{const r=modelDebt({...debt,years:1,return:10,payment:100,extra:0});close(r.points.at(-1).values[0],0);close(r.points.at(-1).values[1],0);const q=modelDebt({...debt,return:10});assert.ok(q.points.at(-1).values[1]>q.points.at(-1).values[0]);});
test('invalid and non-amortizing debt inputs are rejected',()=>{assert.ok(validateExpansion({...debt,payment:1,rate:12},'debt'));assert.throws(()=>modelDebt({...debt,return:NaN}));});
const v={years:2,km:10000,fuel:2,homeElectricity:0.1,publicElectricity:0.5,homeShare:50,gasEfficiency:10,hybridEfficiency:5,evBattery:80,evRange:400,chargingEfficiency:100,hybridBatteryCost:0,evBatteryCost:0,hybridReserveYears:15,evReserveYears:15,gasPrice:10000,hybridPrice:10000,evPrice:10000,gasResale:8000,hybridResale:8000,evResale:8000,gasRebate:0,hybridRebate:0,evRebate:0,charger:0,gasMaintenance:0,hybridMaintenance:0,evMaintenance:0,gasInsurance:0,hybridInsurance:0,evInsurance:0};
test('vehicle energy units and weighted charging price are correct',()=>{const r=modelVehicles(v);assert.deepEqual(r.points.at(-1).values,[6000,4000,3200]);});
test('rebates and charger costs occur once; annual costs scale by duration',()=>{const r=modelVehicles({...v,evRebate:1000,charger:500,evMaintenance:100,evInsurance:200});close(r.points.at(-1).values[2],3300);});
test('zero kilometres and full resale leave only optional running and setup costs',()=>{const r=modelVehicles({...v,km:0,gasResale:10000,hybridResale:10000,evResale:10000});assert.deepEqual(r.points.at(-1).values,[0,0,0]);assert.ok(validateExpansion({...v,homeShare:101},'vehicle'));});

test('battery size, range and charging losses determine wall electricity',()=>{
 const r=modelVehicles({...v,evBattery:60,evRange:300,chargingEfficiency:80});
 close(r.energy[2],750); close(r.points.at(-1).values[2],3500);
 assert.ok(validateExpansion({...v,evRange:0},'vehicle'));
 assert.ok(validateExpansion({...v,chargingEfficiency:0},'vehicle'));
});
test('battery reserve and insurance count once per year and are shown separately',()=>{
 const r=modelVehicles({...v,hybridBatteryCost:6000,hybridReserveYears:15,evBatteryCost:15000,evReserveYears:15,hybridInsurance:1000,evInsurance:1500});
 close(r.reserves[1],400); close(r.reserves[2],1000);
 close(r.points.at(-1).values[1],6800); close(r.points.at(-1).values[2],8200);
 assert.ok(validateExpansion({...v,evReserveYears:0},'vehicle'));
});
test('historical maintenance presets convert miles to km and use explicit currency multiplier',()=>{
 const p=vehicleMaintenancePresets(16093.44,1.35);
 close(p.gasMaintenance,1363.5); close(p.hybridMaintenance,1269); close(p.evMaintenance,823.5);
 close(vehicleMaintenancePresets(0,1.35).evMaintenance,0);
});
test('ownership breakdown reconciles to existing planning totals for the default comparison',()=>{
 const r=modelVehicles({...v,years:8,km:15000,fuel:1.6,homeElectricity:0.15,homeShare:100,
  gasEfficiency:8,evBattery:64,chargingEfficiency:90,gasPrice:35000,hybridPrice:40000,evPrice:45000,
  gasResale:10000,hybridResale:12000,evResale:14000,hybridBatteryCost:4725,evBatteryCost:14175,
  ...vehicleMaintenancePresets(15000,1.35)});
 assert.deepEqual(r.vehicleCosts.map(row=>row.key),['gas','hybrid','ev']);
 assert.deepEqual(r.vehicleCosts.map(row=>row.label),r.labels);
 const ownership=[50526.88,47062.24,40340.40];
 const planning=[50526.88,49582.24,47900.40];
 const reserves=[0,2520,7560];
 r.vehicleCosts.forEach((row,i)=>{
  close(row.ownershipCost,ownership[i]);
  close(row.ownershipCost,row.netCapitalCost+row.energyTotal+row.maintenanceTotal+row.insuranceTotal);
  close(row.batteryReserveTotal,reserves[i]);
  close(row.planningCost,planning[i]);
  close(row.planningCost,row.ownershipCost+row.batteryReserveTotal);
  close(row.planningCost,r.points.at(-1).values[i]);
  close(row.monthlyCost,row.ownershipCost/96);
 });
});
test('optional battery savings change planning costs without changing ownership spending',()=>{
 const assumptions={...v,hybridBatteryCost:6000,evBatteryCost:15000,
  hybridMaintenance:100,evMaintenance:200,hybridInsurance:1000,evInsurance:1500};
 const withReserve=modelVehicles(assumptions);
 const withoutReserve=modelVehicles({...assumptions,hybridBatteryCost:0,evBatteryCost:0});
 withReserve.vehicleCosts.forEach((row,i)=>{
  const other=withoutReserve.vehicleCosts[i];
  close(row.ownershipCost,other.ownershipCost);
  close(row.maintenanceTotal,other.maintenanceTotal);
  close(row.monthlyCost,other.monthlyCost);
  close(row.planningCost-other.planningCost,row.batteryReserveTotal);
  close(withReserve.points.at(-1).values[i]-withoutReserve.points.at(-1).values[i],row.batteryReserveTotal);
  close(other.batteryReserveTotal,0);
 });
 close(withReserve.vehicleCosts[1].maintenanceTotal,200);
 close(withReserve.vehicleCosts[2].maintenanceTotal,400);
 close(withReserve.vehicleCosts[2].insuranceTotal,3000);
});
test('breakdown charges rebates and charging setup once while annual costs stay constant',()=>{
 const assumptions={...v,gasRebate:200,hybridRebate:300,evRebate:1000,charger:500,
  gasMaintenance:100,hybridMaintenance:200,evMaintenance:300,
  gasInsurance:400,hybridInsurance:500,evInsurance:600,
  hybridBatteryCost:6000,evBatteryCost:15000};
 const two=modelVehicles(assumptions);
 const four=modelVehicles({...assumptions,years:4});
 assert.deepEqual(two.vehicleCosts.map(row=>row.netCapitalCost),[1800,1700,1500]);
 two.vehicleCosts.forEach((row,i)=>{
  const longer=four.vehicleCosts[i];
  close(longer.netCapitalCost,row.netCapitalCost);
  for(const component of ['energyTotal','maintenanceTotal','insuranceTotal','batteryReserveTotal']) {
   close(longer[component],row[component]*2);
  }
  close(longer.planningCost,four.points.at(-1).values[i]);
 });
 assert.deepEqual(two.energy,four.energy);
 assert.deepEqual(two.maintenance,four.maintenance);
});

test('one annual extra EMI pays principal and keeps equal cash budgets',()=>{
 const x={...debt,balance:2400,extraMode:1,extraEmis:1,extraMonth:12};
 const r=modelDebt(x);
 assert.deepEqual(r.payoff,[23,24]);
 close(r.points[0].debts[0],1100); close(r.points[0].debts[1],1200);
 close(r.points[0].investments[1],100);
 close(r.points[1].values[0],200); close(r.points[1].values[1],200);
});
test('extra EMI timing affects investment growth without monthly spreading',()=>{
 const x={...debt,years:1,balance:12000,extraMode:1,extraEmis:1,extraMonth:12,return:12};
 close(modelDebt(x).points[0].investments[1],100);
 close(modelDebt({...x,extraMonth:1}).points[0].investments[1],100*1.12**(11/12));
});
test('annual budget continues after early payoff and final overpayment is invested',()=>{
 const r=modelDebt({...debt,balance:150,extraMode:1,extraEmis:1,extraMonth:1});
 assert.deepEqual(r.payoff,[1,2]); close(r.points[0].investments[0],1150);
 close(r.points[1].values[0],2450); close(r.points[1].values[1],2450);
});
test('annual prepayment reduces interest and validates schedule',()=>{
 const x={...debt,balance:2400,rate:12,years:4,extraMode:1,extraEmis:1,extraMonth:12};
 const r=modelDebt(x); assert.ok(r.interest[0]<r.interest[1]); assert.ok(r.payoff[0]<r.payoff[1]);
 for (const change of [{extraMonth:0},{extraMonth:13},{extraMonth:1.5},{extraEmis:13},{extraMode:2}]) assert.ok(validateExpansion({...x,...change},'debt'));
});
