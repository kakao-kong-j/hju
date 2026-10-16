import test from 'node:test';
import assert from 'node:assert/strict';
import { bindActivation } from '../src/ui/accessibility.js';

test('custom map buttons activate on Enter and Space and prevent map scrolling',()=>{
  const target=new EventTarget();let count=0;
  bindActivation(target,()=>count++);
  for(const key of ['Enter',' ']) {
    const event=new Event('keydown',{cancelable:true});Object.defineProperty(event,'key',{value:key});
    target.dispatchEvent(event);assert.equal(event.defaultPrevented,true);
  }
  assert.equal(count,2);
  const arrow=new Event('keydown',{cancelable:true});Object.defineProperty(arrow,'key',{value:'ArrowRight'});
  target.dispatchEvent(arrow);assert.equal(count,2);assert.equal(arrow.defaultPrevented,false);
});
