import { categoryById } from '../data/places.js';
import { createPhoto } from './photos.js';
import { el, icon, button, iconButton, externalLink } from './dom.js';

let detailDialog;
export function renderPlaceList(container, places, {selectedId,onSelect}) {
  const fragment=document.createDocumentFragment();
  for(const place of places) {
    const category=categoryById.get(place.category);
    const item=button('','place-card'+(place.id===selectedId?' is-selected':''),()=>onSelect(place.id));
    item.dataset.placeId=place.id;
    item.setAttribute('aria-label',`${place.nameKo} 상세 보기`);
    const copy=el('div','place-copy');
    const line=el('div','place-card-top');
    const tag=el('span','category-tag',category.label);tag.style.setProperty('--category-color',category.color);
    line.append(tag);
    if(place.rating) line.append(el('span','rating',`★ ${place.rating.toFixed(1)}`));
    copy.append(line,el('h3','',place.nameKo),el('p','place-name-zh',place.nameZh));
    const area=el('span','neighborhood');area.innerHTML=icon('pin',12);area.append(document.createTextNode(place.neighborhood));
    copy.append(area);
    const arrow=el('span','card-arrow');arrow.innerHTML=icon('arrow',16);
    item.append(createPhoto(place),copy,arrow);
    fragment.append(item);
  }
  container.replaceChildren(fragment);
}

export function closePlaceDetails() { detailDialog?.close(); }

function showOriginal(place) {
  const dialog=el('dialog','source-dialog');
  dialog.setAttribute('aria-label',`${place.nameKo}의 원본 스크린샷`);
  const head=el('div','source-head');
  head.append(el('strong','','저장한 원본 이미지'),iconButton('원본 이미지 닫기','close',()=>dialog.close()));
  const img=el('img');img.src=place.photo.src;img.alt=`${place.nameKo}가 포함된 원본 저장 목록`;
  dialog.append(head,img);
  document.body.append(dialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog) dialog.close();});
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});
  dialog.showModal();
}

export function openPlaceDetails(place, {days,selectedDayId,onAdd,onClose}) {
  if(detailDialog) { detailDialog.close();detailDialog.remove(); }
  const dialog=el('dialog','detail-dialog');detailDialog=dialog;
  dialog.setAttribute('aria-labelledby','detail-title');
  const hero=el('div','detail-hero');
  hero.append(createPhoto(place,{large:true}),iconButton('상세 정보 닫기','close',()=>dialog.close(),'detail-close'));
  const body=el('div','detail-body');
  const category=categoryById.get(place.category);
  const meta=el('div','detail-meta');
  const tag=el('span','category-tag',category.label);tag.style.setProperty('--category-color',category.color);
  meta.append(tag,el('span','muted',place.neighborhood));
  const title=el('h2','',place.nameKo);title.id='detail-title';
  body.append(meta,title,el('p','detail-zh',place.nameZh));
  if(place.rating||place.price) {
    const facts=el('div','detail-facts');
    if(place.rating) facts.append(el('span','',`★ ${place.rating.toFixed(1)} / 5`));
    if(place.price) facts.append(el('span','',`¥${place.price} / 인`));
    body.append(facts,el('p','source-note','평점·가격은 저장한 이미지 기준이에요.'));
  }
  body.append(el('p','detail-description',place.description));
  const location=el('div','location-note');
  location.innerHTML=icon('pin',18);
  const locationText=el('div');
  locationText.append(el('strong','',place.locationAccuracy==='area'?'인근 지역의 대략 위치':'지도 자료의 장소 위치'),el('p','',place.locationSource.label));
  location.append(locationText);body.append(location);
  const links=el('div','detail-links');
  const searchUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.nameZh+' 杭州')}`;
  links.append(externalLink('외부 지도에서 찾기',searchUrl),externalLink('위치 자료',place.locationSource.url));
  body.append(links,button('원본 이미지 보기','source-button',()=>showOriginal(place),'image'));
  const add=el('div','detail-add');
  const label=el('label','','어느 날에 갈까요?');label.htmlFor='detail-day';
  const select=el('select');select.id='detail-day';
  days.forEach((day,i)=>{
    const option=el('option','',`Day ${i+1}${day.date?' · '+day.date:''}`);option.value=day.id;select.append(option);
  });
  select.value=selectedDayId;
  const addButton=button('여행 일정에 추가','primary-button',()=>onAdd({placeId:place.id,dayId:select.value}),'plus');
  add.append(label,select,addButton);body.append(add);
  dialog.append(hero,body);document.body.append(dialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog) dialog.close();});
  dialog.addEventListener('close',()=>{onClose?.();dialog.remove();if(detailDialog===dialog)detailDialog=null;},{once:true});
  dialog.showModal();
}
