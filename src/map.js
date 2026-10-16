import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { categoryById } from './data/places.js';
import { groupPlaces } from './map-groups.js';
import { createPhoto } from './ui/photos.js';
import { el, icon, button } from './ui/dom.js';
import { bindActivation } from './ui/accessibility.js';

export function createTravelMap(container, {onSelect, onTileError}) {
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const map=L.map(container,{zoomControl:false,scrollWheelZoom:true,minZoom:9,maxZoom:18}).setView([30.27,120.18],11);
  L.control.zoom({position:'bottomright',zoomInTitle:'확대',zoomOutTitle:'축소'}).addTo(map);
  L.control.scale({position:'bottomleft',imperial:false}).addTo(map);
  const tile=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);
  tile.on('tileerror',onTileError);
  const markers=L.layerGroup().addTo(map);
  const routeLayer=L.layerGroup().addTo(map);
  let visible=[], selectedId=null, routeMode=false;

  function tooltip(place) {
    const wrap=el('div','map-tooltip-content');
    const copy=el('div');
    copy.append(el('strong','',place.nameKo),el('span','',`${categoryById.get(place.category).label} · ${place.neighborhood}`));
    if(place.locationAccuracy==='area') copy.append(el('small','','인근 지역의 대략 위치'));
    wrap.append(createPhoto(place),copy);
    return wrap;
  }

  function openGroup(group) {
    const hasDistinctPoints=group.some(p=>p.coordinates.toString()!==group[0].coordinates.toString());
    if(map.getZoom()<16 && hasDistinctPoints) {
      map.setView(group[0].coordinates,Math.min(16,map.getZoom()+2),{animate:!reducedMotion});
      return;
    }
    const list=el('div','cluster-list');
    list.append(el('p','cluster-title',`이 주변의 장소 ${group.length}곳`));
    for(const place of group) {
      const item=button('','cluster-item',()=>{map.closePopup();onSelect(place.id);});
      item.append(createPhoto(place),el('span','',place.nameKo));
      list.append(item);
    }
    L.popup({className:'group-popup',maxWidth:300}).setLatLng(group[0].coordinates).setContent(list).openOn(map);
  }

  function renderMarkers() {
    markers.clearLayers();
    const groups=groupPlaces(visible,c=>map.latLngToLayerPoint(c));
    for(const group of groups) {
      const p=group[0], category=categoryById.get(p.category);
      const isGroup=group.length>1;
      const routeIndex=visible.findIndex(v=>v.id===p.id)+1;
      const selected=group.some(v=>v.id===selectedId);
      const html=isGroup
        ? `<span class="pin-bubble pin-group${selected?' selected':''}">${routeMode?`${routeIndex}+`:group.length}</span>`
        : `<span class="pin-bubble${selected?' selected':''}${p.locationAccuracy==='area'?' pin-area':''}" style="--pin-color:${category.color}">${routeMode?routeIndex:icon(category.icon,18)}</span>`;
      const label=isGroup?`주변 장소 ${group.length}곳 보기`:p.nameKo;
      const marker=L.marker(p.coordinates,{
        keyboard:true,title:label,alt:label,riseOnHover:true,
        icon:L.divIcon({className:'travel-marker',html,iconSize:[38,44],iconAnchor:[19,40],tooltipAnchor:[0,-37]}),
      }).addTo(markers);
      marker.bindTooltip(isGroup?`${group.length}곳의 장소 · 클릭해서 보기`:tooltip(p),{direction:'top',className:'travel-tooltip',opacity:1});
      marker.on('click',()=>isGroup?openGroup(group):onSelect(p.id));
      marker.on('add',()=>{
        const node=marker.getElement();
        node?.setAttribute('role','button');
        node?.setAttribute('aria-label',label);
      });
      const node=marker.getElement();
      if(node) {
        node.setAttribute('role','button');node.setAttribute('aria-label',label);
        node.dataset.placeIds=group.map(place=>place.id).join(' ');
        bindActivation(node,()=>isGroup?openGroup(group):onSelect(p.id));
        node.addEventListener('focus',()=>marker.openTooltip());
        node.addEventListener('blur',()=>marker.closeTooltip());
      }
    }
  }
  map.on('zoomend',renderMarkers);

  return {
    setPlaces(places) { visible=places;routeMode=false;routeLayer.clearLayers();renderMarkers(); },
    selectPlace(id) {
      selectedId=id;
      const place=visible.find(p=>p.id===id);
      if(place) map.setView(place.coordinates,Math.max(map.getZoom(),14),{animate:false});
      renderMarkers();
    },
    focusPlace(id) {
      [...container.querySelectorAll('.travel-marker')].find(node=>node.dataset.placeIds?.split(' ').includes(id))?.focus();
    },
    setRoute(places) {
      visible=places;routeMode=true;routeLayer.clearLayers();
      if(places.length>1) L.polyline(places.map(p=>p.coordinates),{color:'#315c4e',weight:3,opacity:.7,dashArray:'7 9',interactive:false}).addTo(routeLayer);
      renderMarkers();
    },
    fitPlaces() {
      const padding=container.clientWidth<500?24:65;
      if(visible.length) map.fitBounds(L.latLngBounds(visible.map(p=>p.coordinates)),{padding:[padding,padding],maxZoom:14,animate:!reducedMotion});
    },
    resize() { map.invalidateSize({pan:false}); },
  };
}
