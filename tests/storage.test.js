import test from 'node:test';
import assert from 'node:assert/strict';
import { createExamplePlan } from '../src/itinerary.js';
import { loadPlan, savePlan } from '../src/storage.js';
import { places } from '../src/data/places.js';
const ids = new Set(places.map(p=>p.id));
const unavailable=()=>{throw new Error('blocked');};

test('storage getter and read failures return a usable example',()=>{
  for(const getter of [unavailable,()=>({getItem:unavailable})]) {
    const result=loadPlan(getter,ids);
    assert.equal(result.status,'unavailable');
    assert.equal(result.plan.days.length,3);
  }
});
test('missing storage returns an example and malformed JSON is reported',()=>{
  assert.equal(loadPlan(()=>({getItem:()=>null}),ids).status,'empty');
  for(const data of ['{invalid','null','{"version":2,"days":[]}']) {
    const result=loadPlan(()=>({getItem:()=>data}),ids);
    assert.equal(result.status,'invalid');
    assert.equal(result.plan.days.length,3);
  }
});
test('write failure is reported without mutating the plan',()=>{
  const p=createExamplePlan(); const before=structuredClone(p);
  assert.equal(savePlan(unavailable,p).ok,false);
  assert.equal(savePlan(()=>({setItem:unavailable}),p).ok,false);
  assert.deepEqual(p,before);
});
test('successful save and restore preserves user data with the versioned key',()=>{
  const backing=new Map();
  const storage={getItem:k=>backing.get(k)??null,setItem:(k,v)=>backing.set(k,v)};
  const p=createExamplePlan(); p.isExample=false; p.days[1].note='오후에는 쉬기';
  assert.equal(savePlan(()=>storage,p).ok,true);
  assert.ok(backing.has('hju-hangzhou-plan-v1'));
  const loaded=loadPlan(()=>storage,ids);
  assert.equal(loaded.status,'restored');
  assert.deepEqual(loaded.plan,p);
});
