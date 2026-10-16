export function createPhoto(place, { large = false } = {}) {
  const holder = document.createElement('div');
  holder.className = `place-photo${large ? ' place-photo-large' : ''}`;
  holder.setAttribute('role', 'img');
  holder.setAttribute('aria-label', `${place.nameKo} · 원본 이미지의 사진`);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const p = place.photo;
  svg.setAttribute('viewBox', `${p.x} ${p.y} ${p.width} ${p.height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');
  const img = document.createElementNS(ns, 'image');
  img.setAttribute('href', p.src);
  img.setAttribute('width', p.sourceWidth);
  img.setAttribute('height', p.sourceHeight);
  img.addEventListener('error', () => { holder.textContent = '사진을 불러오지 못했어요'; }, { once: true });
  svg.append(img);
  holder.append(svg);
  return holder;
}
