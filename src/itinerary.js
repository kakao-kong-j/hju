import { placeById } from './data/places.js';

export function requiresDayRemovalConfirmation(day) {
  return day.placeIds.length>0 || day.date!=='' || day.note!=='';
}

export function createExamplePlan() {
  return {
    version: 1, isExample: true,
    days: [
      {id:'day-1',date:'',note:'시후와 도심을 천천히. 보고 싶은 구역을 골라 일정을 조정해보세요.',placeIds:['atour','hubin','west-lake','guyongjin','qinghefang','wulin-night']},
      {id:'day-2',date:'',note:'링인 권역의 사찰 산책. 현지 운영시간과 체력에 맞춰 방문할 사찰을 골라보세요.',placeIds:['lingyin','yongfu','taoguang','faxi']},
      {id:'day-3',date:'',note:'운하 주변을 둘러보는 날. 선착장과 거리의 정확한 입구는 현지 지도에서 확인하세요.',placeIds:['wulin-pier','xiaohe','gongchen','wulin-square']},
    ],
  };
}

function validDate(value) {
  if (value === '') return true;
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
}

export function validatePlan(value, validPlaceIds) {
  if (!value || value.version !== 1 || typeof value.isExample !== 'boolean'
    || !Array.isArray(value.days) || !value.days.length) return null;
  const dayIds = new Set();
  for(const day of value.days) {
    if(!day || typeof day.id !== 'string' || !day.id.trim() || dayIds.has(day.id)
      || !validDate(day.date) || typeof day.note !== 'string' || !Array.isArray(day.placeIds)
      || new Set(day.placeIds).size !== day.placeIds.length
      || !day.placeIds.every(id => typeof id === 'string' && validPlaceIds.has(id))) return null;
    dayIds.add(day.id);
  }
  return {version:1,isExample:value.isExample,days:value.days.map(d=>({id:d.id,date:d.date,note:d.note,placeIds:[...d.placeIds]}))};
}

export function updatePlan(plan, action) {
  const reject = reason => ({plan,changed:false,reason});
  if(!action || typeof action !== 'object') return reject('invalid');
  if(action.type === 'add-day') {
    if(typeof action.newDayId !== 'string' || !action.newDayId.trim() || plan.days.some(d=>d.id===action.newDayId)) return reject('invalid');
    return {plan:{...plan,isExample:false,days:[...plan.days,{id:action.newDayId,date:'',note:'',placeIds:[]}]},changed:true,reason:null};
  }
  const index = plan.days.findIndex(d=>d.id===action.dayId);
  if(index < 0) return reject('invalid');
  const day = plan.days[index];
  let nextDay;
  switch(action.type) {
    case 'remove-day': {
      if(plan.days.length===1) return reject('last-day');
      return {plan:{...plan,isExample:false,days:plan.days.filter(d=>d.id!==day.id)},changed:true,reason:null};
    }
    case 'set-date':
      if(!validDate(action.value)) return reject('invalid');
      if(day.date===action.value) return reject(null);
      nextDay={...day,date:action.value}; break;
    case 'set-note':
      if(typeof action.value !== 'string') return reject('invalid');
      if(day.note===action.value) return reject(null);
      nextDay={...day,note:action.value}; break;
    case 'add-place':
      if(!placeById.has(action.placeId)) return reject('invalid');
      if(day.placeIds.includes(action.placeId)) return reject('duplicate');
      nextDay={...day,placeIds:[...day.placeIds,action.placeId]}; break;
    case 'remove-place':
      if(!day.placeIds.includes(action.placeId)) return reject('invalid');
      nextDay={...day,placeIds:day.placeIds.filter(id=>id!==action.placeId)}; break;
    case 'move-place': {
      const from=day.placeIds.indexOf(action.placeId);
      if(from<0 || ![-1,1].includes(action.direction)) return reject('invalid');
      const to=from+action.direction;
      if(to<0 || to>=day.placeIds.length) return reject('boundary');
      const placeIds=[...day.placeIds];
      [placeIds[from],placeIds[to]]=[placeIds[to],placeIds[from]];
      nextDay={...day,placeIds}; break;
    }
    default: return reject('invalid');
  }
  return {plan:{...plan,isExample:false,days:plan.days.map((d,i)=>i===index?nextDay:d)},changed:true,reason:null};
}
