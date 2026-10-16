export function filterPlaces(places, query = '', categoryId = 'all') {
  const needle = query.trim().toLocaleLowerCase();
  return places.filter(p => (categoryId === 'all' || p.category === categoryId)
    && `${p.nameKo} ${p.nameZh}`.toLocaleLowerCase().includes(needle));
}
