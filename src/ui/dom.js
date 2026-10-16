export function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if(className) node.className = className;
  if(text) node.textContent = text;
  return node;
}

const paths = {
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  leaf:'<path d="M20 4C10 2 3 7 5 14s14 7 15-10Z"/><path d="m4 21 12-12M10 15v-5M10 15h5"/>',
  camera:'<path d="M3 7h4l2-3h6l2 3h4v13H3Z"/><circle cx="12" cy="13" r="4"/>',
  temple:'<path d="m3 9 9-5 9 5M4 9h16M5 9v10m5-10v10m4-10v10m5-10v10M3 20h18M9 3h6"/>',
  cup:'<path d="M4 9h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM16 10h2a3 3 0 0 1 0 6h-2M7 3v3m5-3v3M2 21h18"/>',
  bag:'<path d="M4 7h16l-1 14H5ZM8 8V6a4 4 0 0 1 8 0v2"/>',
  bed:'<path d="M3 19V7m18 12V9H3m0 6h18M6 9V5h5v4m2 0V5h5v4"/>',
  plane:'<path d="m3 10 7 2 7-8c2-2 5 0 3 2l-7 8 2 7-3-1-3-5-5-2Z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  external:'<path d="M14 3h7v7M21 3l-11 11m0-11H4v17h17v-6"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-5 4 3 4-6 4 5"/>',
  up:'<path d="m6 14 6-6 6 6"/>', down:'<path d="m6 10 6 6 6-6"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  save:'<path d="M5 3h12l4 4v14H3V3ZM7 3v6h10V3M7 21v-7h10v7"/>',
  route:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v4a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3M18 3v7m-3-3 3 3 3-3"/>',
};

export function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.pin}</svg>`;
}

export function button(label, className, onClick, iconName) {
  const node = el('button', className);
  node.type = 'button';
  if(iconName) node.innerHTML = icon(iconName,18);
  if(label) node.append(document.createTextNode(label));
  node.addEventListener('click',onClick);
  return node;
}

export function iconButton(label, name, onClick, className = '') {
  const node = button('',`icon-button ${className}`,onClick,name);
  node.setAttribute('aria-label',label);
  node.title = label;
  return node;
}

export function externalLink(label, url, className = 'text-link') {
  const a=el('a',className,label); a.href=url; a.target='_blank'; a.rel='noopener noreferrer';
  a.insertAdjacentHTML('beforeend',icon('external',14));
  return a;
}
