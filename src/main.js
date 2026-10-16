import './styles.css';
import { places, placeById, categories } from './data/places.js';
import { filterPlaces } from './search.js';
import { createExamplePlan, updatePlan } from './itinerary.js';
import { loadPlan, savePlan } from './storage.js';
import { createTravelMap } from './map.js';
import { createPhoto } from './ui/photos.js';
import { renderPlaceList, openPlaceDetails, closePlaceDetails } from './ui/places.js';
import { renderPlan } from './ui/plan.js';
import { el, icon, button, iconButton } from './ui/dom.js';

const loaded=loadPlan(()=>window.localStorage,new Set(places.map(p=>p.id)));
let plan=loaded.plan;
let view='explore', mobileTab='map', selectedDayId=plan.days[0].id, selectedId=null, query='', categoryId='all';
let toastTimeout;
const app=document.querySelector('#app');
app.innerHTML=`
  <header class="site-header">
    <a class="brand" href="./" aria-label="만유 항저우 여행 노트 홈"><span class="brand-symbol">${icon('compass',32)}</span><span class="brand-name">만유<span class="brand-chinese">漫游</span></span><span class="brand-divider"></span><span class="brand-caption">당신만의 여행을 그리다</span></a>
    <nav class="main-nav" aria-label="주요 메뉴"><button type="button" data-view="explore" class="nav-button active">${icon('map',18)}장소 탐색</button><button type="button" data-view="plan" class="nav-button">${icon('calendar',18)}여행 계획<span id="nav-day-count" class="nav-count">${plan.days.length}</span></button></nav>
    <button type="button" id="about" class="about-button">${icon('info',18)}<span>이 여행 노트</span></button>
  </header>
  <main class="page-shell">
    <section class="page-intro" aria-labelledby="page-title">
      <div class="intro-copy"><p class="eyebrow"><span></span> A LITTLE JOURNEY TO HANGZHOU</p><h1 id="page-title">물길 따라, <span>항저우.</span><small>杭州</small></h1><p class="intro-description">차곡차곡 모아둔 장소들, 나만의 여행이 되는 순간.<br class="mobile-only"> 지도를 펼치고 다음 장면을 만나보세요.</p></div>
      <div class="intro-right"><div class="postcards" aria-hidden="true"></div><div class="trip-stats"><div><strong>27<span>곳</span></strong><span>발견할 장소</span></div><span class="stats-divider"></span><div><strong id="stat-days">${String(plan.days.length).padStart(2,'0')}<span>일</span></strong><span>나만의 여행</span></div></div></div>
    </section>
    <section class="workspace" data-view="explore" data-mobile-tab="map" aria-label="항저우 여행 지도와 장소">
      <aside class="side-panel">
        <div class="panel-tabs"><button type="button" class="panel-tab active" data-view="explore">${icon('pin',16)}저장한 장소<span>27</span></button><button type="button" class="panel-tab" data-view="plan">${icon('route',16)}여행 계획</button></div>
        <section id="explore-panel" class="explore-panel" aria-label="저장한 장소 탐색">
          <div class="explore-controls"><label class="search-field">${icon('search',18)}<input type="search" id="place-search" placeholder="어디로 떠나볼까요?" aria-label="한국어 또는 중국어 장소 검색"><kbd>⌕</kbd></label><div id="filters" class="filters" aria-label="장소 분류"></div></div>
          <div class="list-heading"><h2>항저우의 발견 <span id="result-count">27</span></h2><span>나의 저장 목록</span></div>
          <div id="place-list" class="place-list" aria-label="장소 목록"></div>
          <div id="empty-results" class="empty-results" hidden><span>${icon('search',30)}</span><h3>아직 발견하지 못한 장소예요</h3><p>다른 이름으로 검색하거나 분류를 바꿔보세요.</p><button type="button" id="clear-filters" class="secondary-button">전체 장소 보기</button></div>
          <div class="list-footnote">${icon('image',13)}직접 저장한 이미지에서 가져온 27개의 장소</div>
        </section>
        <section id="plan-panel" class="plan-panel" hidden aria-label="여행 계획 편집"></section>
      </aside>
      <section class="map-card" aria-label="인터랙티브 지도">
        <div id="map" tabindex="0" aria-label="항저우 장소 지도. 방향키로 이동하고 더하기와 빼기로 확대 및 축소할 수 있어요."></div>
        <div class="map-location"><span class="map-location-icon">${icon('compass',23)}</span><div><strong>Hangzhou, China</strong><span>중국 · 저장성 · 항저우</span></div></div>
        <button type="button" id="fit-map" class="map-fit">${icon('map',17)}<span>전체 보기</span></button>
        <div id="tile-error" class="tile-error" role="status" hidden>지도 배경을 불러오지 못했어요. 인터넷 연결을 확인하세요. 장소와 일정은 계속 이용할 수 있어요.</div>
        <div class="map-north" aria-hidden="true"><span>N</span><svg viewBox="0 0 24 32" width="20" height="28"><path d="M12 1 21 29 12 23Z" fill="#315c4e"/><path d="M12 1 3 29 12 23Z" fill="#d9e3d6"/></svg></div>
        <div class="map-bottom"><div id="map-hint" class="map-hint">${icon('pin',15)}<span>마커에 올려보고, 클릭해서 더 알아보세요</span></div><div id="map-legend" class="map-legend"></div></div>
      </section>
    </section>
    <footer class="page-footer"><span><span class="tiny-dot"></span> 나의 작은 항저우 여행 노트</span><span id="save-status">${icon('save',13)}일정은 이 브라우저에 자동 저장돼요</span></footer>
    <p id="storage-warning" class="storage-warning" role="status" hidden></p>
  </main>
  <nav class="mobile-nav" aria-label="모바일 화면 전환"><button type="button" data-mobile="map" class="active">${icon('map',21)}지도</button><button type="button" data-mobile="list">${icon('pin',21)}장소</button><button type="button" data-mobile="plan">${icon('calendar',21)}여행 계획</button></nav>
  <div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true"></div>
`;

for(const id of ['west-lake','faxi','xiaohe']) {
  const card=el('div','postcard');card.append(createPhoto(placeById.get(id)));
  card.append(el('span','',placeById.get(id).nameKo));document.querySelector('.postcards').append(card);
}
const legend=document.querySelector('#map-legend');
for(const c of categories.slice(1)) {
  const entry=el('span');const dot=el('i');dot.style.backgroundColor=c.color;
  entry.append(dot,document.createTextNode(c.label));legend.append(entry);
}
const filterContainer=document.querySelector('#filters');
for(const c of categories) {
  const node=button(c.label,'filter'+(c.id==='all'?' active':''),()=>{categoryId=c.id;refreshPlaces();},c.icon);
  node.dataset.category=c.id;node.setAttribute('aria-pressed',String(c.id==='all'));filterContainer.append(node);
}
const workspace=document.querySelector('.workspace'),list=document.querySelector('#place-list'),planPanel=document.querySelector('#plan-panel');
const travelMap=createTravelMap(document.querySelector('#map'),{onSelect:selectPlace,onTileError:()=>{document.querySelector('#tile-error').hidden=false;}});

function announce(message,{error=false}={}) {
  const toast=document.querySelector('#toast');clearTimeout(toastTimeout);
  toast.textContent=message;toast.classList.toggle('error',error);toast.classList.add('visible');
  toastTimeout=setTimeout(()=>toast.classList.remove('visible'),4500);
}
function persist() {
  const result=savePlan(()=>window.localStorage,plan),warning=document.querySelector('#storage-warning');
  warning.hidden=result.ok;document.querySelector('#save-status').innerHTML=icon(result.ok?'check':'info',13);
  document.querySelector('#save-status').append(document.createTextNode(result.ok?'이 브라우저에 저장했어요':'현재 화면에서 편집 중 · 저장되지 않음'));
  if(!result.ok) {warning.textContent=result.error;announce(result.error,{error:true});}
}
function refreshPlaces() {
  const filtered=filterPlaces(places,query,categoryId);
  renderPlaceList(list,filtered,{selectedId,onSelect:selectPlace});
  document.querySelector('#result-count').textContent=filtered.length;document.querySelector('#empty-results').hidden=filtered.length>0;
  for(const node of filterContainer.children) {const active=node.dataset.category===categoryId;node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));}
  if(view==='explore')travelMap.setPlaces(filtered);
}
function refreshPlan() {
  renderPlan(planPanel,{plan,selectedDayId,places,onAction:applyAction,onSelectDay:id=>{selectedDayId=id;refreshPlan();syncMap(true);},onSelectPlace:id=>id?selectPlace(id):changeView('explore','list'),onReset:()=>{
    plan=createExamplePlan();selectedDayId=plan.days[0].id;persist();refreshPlan();updateStats();syncMap(true);announce('3일 예시 일정으로 되돌렸어요.');
  }});
}
function updateStats() {
  document.querySelector('#nav-day-count').textContent=plan.days.length;
  document.querySelector('#stat-days').replaceChildren(document.createTextNode(String(plan.days.length).padStart(2,'0')),el('span','','일'));
  const kind=document.querySelector('#plan-kind');if(kind)kind.textContent=plan.isExample?'예시 일정':'나의 일정';
}
function syncMap(fit=false) {
  if(view==='plan') {
    const day=plan.days.find(d=>d.id===selectedDayId);travelMap.setRoute(day.placeIds.map(id=>placeById.get(id)));
    document.querySelector('#map-hint').innerHTML=icon('route',16)+'<span>방문 순서 · 실제 이동 경로가 아닙니다</span>';
  } else {
    travelMap.setPlaces(filterPlaces(places,query,categoryId));
    document.querySelector('#map-hint').innerHTML=icon('pin',15)+'<span>마커에 올려보고, 클릭해서 더 알아보세요</span>';
  }
  if(fit)requestAnimationFrame(()=>{travelMap.resize();travelMap.fitPlaces();});
}
function changeView(nextView,nextMobile) {
  view=nextView;mobileTab=nextMobile||(view==='plan'?'plan':'map');workspace.dataset.view=view;workspace.dataset.mobileTab=mobileTab;
  document.querySelector('#explore-panel').hidden=view!=='explore';planPanel.hidden=view!=='plan';
  document.querySelectorAll('button[data-view]').forEach(node=>{const active=node.dataset.view===view;node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll('[data-mobile]').forEach(node=>{const active=node.dataset.mobile===mobileTab;node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));});
  if(view==='plan')refreshPlan();else refreshPlaces();syncMap(true);
}
function selectPlace(id) {
  const place=placeById.get(id);if(!place)return;
  const opener=document.activeElement,fromMap=document.querySelector('#map').contains(opener);
  selectedId=id;travelMap.selectPlace(id);
  list.querySelectorAll('.place-card').forEach(node=>node.classList.toggle('is-selected',node.dataset.placeId===id));
  openPlaceDetails(place,{days:plan.days,selectedDayId,onClose:()=>{
    if(opener?.isConnected&&opener.getClientRects().length)opener.focus();
    else if(view==='plan')planPanel.querySelector('.day-tab.active')?.focus();
    else if(fromMap)travelMap.focusPlace(id);
    else document.querySelector('#place-search').focus();
  },onAdd:({placeId,dayId})=>{
    const result=updatePlan(plan,{type:'add-place',dayId,placeId});
    if(result.reason==='duplicate')announce(`이미 Day ${plan.days.findIndex(d=>d.id===dayId)+1}에 담아둔 장소예요.`);
    else if(result.changed){plan=result.plan;persist();announce('여행 일정에 장소를 추가했어요.');}
    else return;
    closePlaceDetails();selectedDayId=dayId;changeView('plan');updateStats();
  }});
}
function applyAction(action) {
  const focusedLabel=document.activeElement?.getAttribute('aria-label'),oldDayIndex=plan.days.findIndex(d=>d.id===selectedDayId);
  const result=updatePlan(plan,action);
  if(!result.changed){if(result.reason==='last-day')announce('마지막 일차는 남겨두세요.');if(result.reason==='invalid')announce('입력한 내용을 확인해주세요.',{error:true});return;}
  plan=result.plan;if(action.type==='add-day')selectedDayId=action.newDayId;
  if(!plan.days.some(d=>d.id===selectedDayId))selectedDayId=plan.days[Math.min(oldDayIndex,plan.days.length-1)].id;
  persist();updateStats();if(['set-date','set-note'].includes(action.type))return;
  refreshPlan();syncMap(action.type==='add-day'||action.type==='remove-day');
  const nextFocus=[...planPanel.querySelectorAll('button')].find(n=>n.getAttribute('aria-label')===focusedLabel&&!n.disabled);
  (nextFocus||planPanel.querySelector('.day-tab.active'))?.focus();
  if(action.type==='remove-place')announce('이 날의 일정에서 장소를 뺐어요.');if(action.type==='add-day')announce(`Day ${plan.days.length}를 추가했어요.`);
}
document.querySelectorAll('button[data-view]').forEach(node=>node.addEventListener('click',()=>changeView(node.dataset.view)));
document.querySelectorAll('[data-mobile]').forEach(node=>node.addEventListener('click',()=>{
  const target=node.dataset.mobile;
  changeView(target==='map'?view:target==='plan'?'plan':'explore',target);
}));
document.querySelector('#place-search').addEventListener('input',event=>{query=event.target.value;refreshPlaces();});
document.querySelector('#clear-filters').addEventListener('click',()=>{query='';categoryId='all';document.querySelector('#place-search').value='';refreshPlaces();travelMap.fitPlaces();});
document.querySelector('#fit-map').addEventListener('click',()=>travelMap.fitPlaces());
document.querySelector('#about').addEventListener('click',()=>{
  const dialog=el('dialog','about-dialog');dialog.setAttribute('aria-labelledby','about-title');
  const head=el('div','about-head'),h=el('h2','','차곡차곡, 여행이 되다.');h.id='about-title';head.append(h,iconButton('여행 노트 안내 닫기','close',()=>dialog.close()));
  dialog.append(head,el('p','','이미지 7장에 저장된 항저우의 27개 장소를 한 장의 여행 노트에 담았어요.'),el('p','','지도에 마우스를 올리면 장소를 살짝 볼 수 있고, 클릭하면 사진과 자세한 정보를 확인할 수 있어요. 일정에 담고 방문 순서를 바꿔보세요.'),el('p','','평점과 가격은 원본 이미지 기준이에요. 일부 지도 마커는 인근 지역의 대략 위치이며 상세 화면에 구분해두었어요. 방문 전 정확한 입구와 현재 영업정보를 확인하세요.'),el('p','','3일 일정은 자유롭게 바꿀 수 있는 예시예요. 일정은 현재 브라우저에 저장되며 다른 기기로 자동 동기화되지 않아요. 지도 배경은 인터넷 연결이 필요해요.'));
  document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
});
new ResizeObserver(()=>travelMap.resize()).observe(document.querySelector('.map-card'));
refreshPlaces();refreshPlan();travelMap.fitPlaces();
if(loaded.status==='invalid')announce('저장된 일정 형식을 읽을 수 없어 예시 일정으로 열었어요.',{error:true});
if(loaded.status==='unavailable'){const warning=document.querySelector('#storage-warning');warning.hidden=false;warning.textContent='브라우저 저장소를 사용할 수 없어요. 현재 화면에서 일정 편집은 가능해요.';}
