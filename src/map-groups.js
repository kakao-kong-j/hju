export function groupPlaces(places, project, threshold = 42) {
  const groups=[];
  for(const place of places) {
    const p=project(place.coordinates);
    const group=groups.find(g=>{
      const anchor=project(g[0].coordinates);
      return Math.hypot(p.x-anchor.x,p.y-anchor.y)<threshold;
    });
    if(group) group.push(place); else groups.push([place]);
  }
  return groups;
}
