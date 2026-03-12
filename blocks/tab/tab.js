export default function decorate(block) {
 
  const container = block.children[0];
  if (!container) return;
 
  /* main class */
  container.classList.add("tab-head-1");
 
  /* create track */
  const track = document.createElement("div");
  track.className = "tab-head-3";
 
  const items = [...container.children];
 
  items.forEach((item) => {
    track.appendChild(item);
  });
 
  /* clone items for infinite loop */
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });
 
  container.appendChild(track);
 
}
