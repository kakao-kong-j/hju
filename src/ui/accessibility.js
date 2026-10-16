export function bindActivation(node, onActivate) {
  node.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' ') {
      event.preventDefault();event.stopPropagation();onActivate();
    }
  });
}
