import test from 'node:test';
import assert from 'node:assert/strict';
import { createExamplePlan, validatePlan, updatePlan, requiresDayRemovalConfirmation } from '../src/itinerary.js';
import { places } from '../src/data/places.js';
const ids = new Set(places.map(p => p.id));

test('day deletion requires confirmation for visits, a date, or a note',()=>{
  assert.equal(requiresDayRemovalConfirmation({date:'',note:'',placeIds:[]}),false);
  assert.equal(requiresDayRemovalConfirmation({date:'',note:'메모만 있는 하루',placeIds:[]}),true);
  assert.equal(requiresDayRemovalConfirmation({date:'2026-10-20',note:'',placeIds:[]}),true);
  assert.equal(requiresDayRemovalConfirmation({date:'',note:'',placeIds:['atour']}),true);
});

test('example route follows the approved days', () => {
  assert.deepEqual(createExamplePlan().days.map(d => d.placeIds), [
    ['atour','hubin','west-lake','guyongjin','qinghefang','wulin-night'],
    ['lingyin','yongfu','taoguang','faxi'],
    ['wulin-pier','xiaohe','gongchen','wulin-square'],
  ]);
  assert.equal(createExamplePlan().isExample, true);
});

test('duplicate addition preserves the plan but another day accepts the place', () => {
  const plan = createExamplePlan();
  const old = structuredClone(plan);
  const duplicate = updatePlan(plan, { type:'add-place', dayId:'day-1', placeId:'atour' });
  assert.equal(duplicate.reason, 'duplicate');
  assert.equal(duplicate.changed, false);
  assert.deepEqual(duplicate.plan, old);
  const added = updatePlan(plan, { type:'add-place', dayId:'day-2', placeId:'atour' });
  assert.equal(added.changed, true);
  assert.deepEqual(added.plan.days[1].placeIds, ['lingyin','yongfu','taoguang','faxi','atour']);
  assert.equal(added.plan.isExample, false);
  assert.deepEqual(plan, old);
});

test('moving a visit updates only the selected day and preserves the input', () => {
  const plan = createExamplePlan();
  const result = updatePlan(plan, {type:'move-place',dayId:'day-1',placeId:'hubin',direction:-1});
  assert.deepEqual(result.plan.days[0].placeIds, ['hubin','atour','west-lake','guyongjin','qinghefang','wulin-night']);
  assert.equal(plan.days[0].placeIds[0], 'atour');
  assert.deepEqual(result.plan.days[1], plan.days[1]);
});

test('last day cannot be removed and boundary moves change nothing', () => {
  const plan = createExamplePlan();
  plan.days = [plan.days[0]];
  assert.equal(updatePlan(plan,{type:'remove-day',dayId:'day-1'}).reason, 'last-day');
  assert.equal(updatePlan(plan,{type:'move-place',dayId:'day-1',placeId:'atour',direction:-1}).reason, 'boundary');
  assert.equal(updatePlan(plan,{type:'move-place',dayId:'day-1',placeId:'atour',direction:2}).reason, 'invalid');
});

test('day editing and removing visits compose into a restorable plan', () => {
  let plan = createExamplePlan();
  for (const action of [
    {type:'add-day',newDayId:'custom-day'},
    {type:'set-date',dayId:'custom-day',value:'2026-10-20'},
    {type:'set-note',dayId:'custom-day',value:'<img src=x onerror=alert(1)>'},
    {type:'add-place',dayId:'custom-day',placeId:'airport'},
    {type:'remove-place',dayId:'day-1',placeId:'atour'},
    {type:'remove-day',dayId:'day-2'},
  ]) {
    const result = updatePlan(plan,action);
    assert.equal(result.changed,true,JSON.stringify(action));
    plan = result.plan;
  }
  assert.equal(plan.days.length,3);
  assert.equal(plan.days[2].date,'2026-10-20');
  assert.equal(plan.days[2].note,'<img src=x onerror=alert(1)>');
  assert.deepEqual(plan.days[2].placeIds,['airport']);
  assert.equal(plan.days[0].placeIds.includes('atour'),false);
  assert.deepEqual(validatePlan(plan,ids),plan);
});

test('invalid calendar dates are not restored but leap days and blank dates are', () => {
  for(const date of ['2026-02-30','2025-02-29','2026-13-01','2026-1-01','no date',null]) {
    const p=createExamplePlan(); p.days[0].date=date;
    assert.equal(validatePlan(p,ids),null,String(date));
  }
  for(const date of ['2028-02-29','']) {
    const p=createExamplePlan(); p.days[0].date=date;
    assert.deepEqual(validatePlan(p,ids),p);
  }
  assert.equal(updatePlan(createExamplePlan(),{type:'set-date',dayId:'day-1',value:'2026-02-30'}).reason,'invalid');
});

test('malformed saved structure never restores partially or invents place IDs', () => {
  const changes = [
    p=>p.version=2, p=>p.isExample='yes', p=>p.days=[],
    p=>p.days.push(structuredClone(p.days[0])),
    p=>p.days[0].id='', p=>p.days[0].note=42,
    p=>p.days[0].placeIds=['not-a-place'],
    p=>p.days[0].placeIds.push(p.days[0].placeIds[0]),
    p=>p.days[0].placeIds='airport',
  ];
  for(const change of changes) {
    const p=createExamplePlan(); change(p);
    assert.equal(validatePlan(p,ids),null);
  }
  for (const value of [null,0,[],{},'hello']) assert.equal(validatePlan(value,ids),null);
});

test('unknown day/place/actions and duplicate day IDs are rejected', () => {
  const plan=createExamplePlan();
  for (const action of [
    null,{type:'unknown'}, {type:'add-day',newDayId:'day-1'},
    {type:'add-place',dayId:'day-1',placeId:'missing'},
    {type:'remove-place',dayId:'missing',placeId:'atour'},
    {type:'set-note',dayId:'day-1',value:42},
  ]) assert.equal(updatePlan(plan,action).reason,'invalid');
});
