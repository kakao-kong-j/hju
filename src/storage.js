import { createExamplePlan, validatePlan } from './itinerary.js';
const KEY='hju-hangzhou-plan-v1';

export function loadPlan(getStorage, validPlaceIds) {
  let raw;
  try { raw=getStorage().getItem(KEY); }
  catch { return {plan:createExamplePlan(),status:'unavailable'}; }
  if(raw===null) return {plan:createExamplePlan(),status:'empty'};
  try {
    const plan=validatePlan(JSON.parse(raw),validPlaceIds);
    return plan ? {plan,status:'restored'} : {plan:createExamplePlan(),status:'invalid'};
  } catch { return {plan:createExamplePlan(),status:'invalid'}; }
}

export function savePlan(getStorage, plan) {
  try { getStorage().setItem(KEY,JSON.stringify(plan)); return {ok:true,error:null}; }
  catch { return {ok:false,error:'브라우저에 저장하지 못했어요. 현재 화면의 편집 내용은 유지됩니다.'}; }
}
