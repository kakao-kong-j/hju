import test from 'node:test';
import assert from 'node:assert/strict';
import { groupPlaces } from '../src/map-groups.js';
const project = p => ({ x:p[1], y:p[0] });
test('nearby and identical marker positions remain in selectable groups',()=>{
  const a={id:'a',coordinates:[0,0]},b={id:'b',coordinates:[2,2]},c={id:'c',coordinates:[80,80]},d={id:'d',coordinates:[0,0]};
  const groups=groupPlaces([a,b,c,d],project,30);
  assert.deepEqual(groups.map(g=>g.map(p=>p.id)),[['a','b','d'],['c']]);
  assert.deepEqual(groupPlaces([],project,30),[]);
});
test('zooming changes screen distance so individual places separate',()=>{
  const p=[{id:'a',coordinates:[0,0]},{id:'b',coordinates:[2,2]}];
  assert.equal(groupPlaces(p,project,30).length,1);
  assert.equal(groupPlaces(p,c=>({x:c[1]*100,y:c[0]*100}),30).length,2);
});
