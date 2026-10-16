import { categoryById } from '../data/places.js';
import { createPhoto } from './photos.js';
import { requiresDayRemovalConfirmation } from '../itinerary.js';
import { el, button, iconButton, icon } from './dom.js';

export function confirmAction(title, message) {
  return new Promise(resolve=>{
    const dialog=el('dialog','confirm-dialog');
    dialog.setAttribute('aria-labelledby','confirm-title');
    const heading=el('h2','',title);heading.id='confirm-title';
    const actions=el('div','confirm-actions');
    let confirmed=false;
    const cancel=button('취소','secondary-button',()=>dialog.close());cancel.autofocus=true;
    actions.append(cancel,button('확인','primary-button',()=>{confirmed=true;dialog.close();}));
    dialog.append(heading,el('p','',message),actions);document.body.append(dialog);
    dialog.addEventListener('close',()=>{dialog.remove();resolve(confirmed);},{once:true});
    dialog.showModal();
  });
}

export function renderPlan(container, {plan,selectedDayId,places,onAction,onSelectDay,onSelectPlace,onReset}) {
  const byId=new Map(places.map(p=>[p.id,p]));
  const day=plan.days.find(d=>d.id===selectedDayId)||plan.days[0];
  const dayIndex=plan.days.indexOf(day);
  const fragment=document.createDocumentFragment();
  const top=el('div','plan-intro');
  const topLine=el('div','plan-title-line');
  topLine.append(el('h2','','나의 여행 계획'));
  const kind=el('span','example-badge',plan.isExample?'예시 일정':'나의 일정');kind.id='plan-kind';
  topLine.append(kind);
  top.append(topLine,el('p','muted','가고 싶은 곳을 연결해, 나만의 하루로.'));
  const tabs=el('div','day-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','여행 일차');
  plan.days.forEach((d,i)=>{
    const tab=button(`Day ${i+1}`,'day-tab'+(d.id===day.id?' active':''),()=>onSelectDay(d.id));
    tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(d.id===day.id));tab.tabIndex=d.id===day.id?0:-1;
    tab.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight'].includes(event.key)) {
        event.preventDefault();const next=(i+(event.key==='ArrowRight'?1:-1)+plan.days.length)%plan.days.length;
        onSelectDay(plan.days[next].id);container.querySelector('.day-tab.active')?.focus();
      }
    });tabs.append(tab);
  });
  tabs.append(iconButton('일차 추가','plus',()=>onAction({type:'add-day',newDayId:`day-${crypto.randomUUID()}`}),'add-day'));
  top.append(tabs);fragment.append(top);
  const content=el('div','plan-scroll');
  const heading=el('div','day-heading');
  heading.append(el('span','day-eyebrow',`DAY ${String(dayIndex+1).padStart(2,'0')}`),el('span','visit-count',`${day.placeIds.length}개의 장소`));
  const dateField=el('div','date-field');const dateLabel=el('label','','여행 날짜');dateLabel.htmlFor='plan-date';
  const date=el('input');date.type='date';date.id='plan-date';date.value=day.date;date.max='9999-12-31';
  date.addEventListener('change',()=>onAction({type:'set-date',dayId:day.id,value:date.value}));
  dateField.append(dateLabel,date);content.append(heading,dateField);
  if(!day.placeIds.length) {
    const empty=el('div','empty-plan');empty.innerHTML=icon('route',32);
    empty.append(el('h3','','비워둔 하루, 새로운 가능성'),el('p','','장소를 탐색하고 이 날에 가고 싶은 곳을 추가해보세요.'));content.append(empty);
  }
  const visits=el('ol','visit-list');
  day.placeIds.forEach((id,i)=>{
    const place=byId.get(id),category=categoryById.get(place.category);
    const row=el('li','visit');row.append(el('span','visit-number',String(i+1)));
    const card=el('div','visit-card');const open=button('','visit-open',()=>onSelectPlace(id));
    open.setAttribute('aria-label',`${place.nameKo} 상세 보기`);
    const copy=el('div','visit-copy');copy.append(el('strong','',place.nameKo),el('span','',`${category.label} · ${place.neighborhood}`));
    open.append(createPhoto(place),copy);
    const controls=el('div','visit-controls');
    const up=iconButton(`${place.nameKo} 방문 순서 올리기`,'up',()=>onAction({type:'move-place',dayId:day.id,placeId:id,direction:-1}));up.disabled=i===0;
    const down=iconButton(`${place.nameKo} 방문 순서 내리기`,'down',()=>onAction({type:'move-place',dayId:day.id,placeId:id,direction:1}));down.disabled=i===day.placeIds.length-1;
    controls.append(up,down,iconButton(`${place.nameKo} 일정에서 삭제`,'trash',()=>onAction({type:'remove-place',dayId:day.id,placeId:id}),'delete-visit'));
    card.append(open,controls);row.append(card);visits.append(row);
  });
  content.append(visits,button('가고 싶은 장소 추가','add-place-button',()=>onSelectPlace(null),'plus'));
  const noteLabel=el('label','note-label','오늘의 메모');noteLabel.htmlFor='plan-note';
  const note=el('textarea','day-note');note.id='plan-note';note.rows=3;note.placeholder='꼭 먹고 싶은 것, 잊지 말아야 할 것…';note.value=day.note;
  note.addEventListener('input',()=>onAction({type:'set-note',dayId:day.id,value:note.value}));content.append(noteLabel,note);
  const bottom=el('div','plan-bottom');
  const remove=button('이 일차 삭제','text-button danger',async()=>{
    // Text edits preserve the input DOM, so the render-time day object can be stale.
    const currentDay={...day,date:date.value,note:note.value};
    if(!requiresDayRemovalConfirmation(currentDay) || await confirmAction('이 일차를 삭제할까요?','이 날에 담은 날짜, 장소와 메모가 함께 삭제됩니다.')) onAction({type:'remove-day',dayId:day.id});
  },'trash');
  remove.disabled=plan.days.length===1;if(remove.disabled) remove.title='마지막 일차는 삭제할 수 없어요';
  bottom.append(remove,button('예시로 초기화','text-button',async()=>{
    if(await confirmAction('예시 일정으로 되돌릴까요?','작성한 여행 계획을 지우고 처음의 3일 예시 일정으로 되돌립니다.')) onReset();
  },'reset'));
  content.append(bottom,el('p','plan-footnote','일정은 이 브라우저에 저장돼요. 예시 순서는 현지 운영시간과 체력에 맞춰 조정하세요.'));
  fragment.append(content);container.replaceChildren(fragment);
}
