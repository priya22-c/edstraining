export default function decorate(block) {
 
  const container = block.children[0];
  if (!container) return;
 
  /* main class */
  container.classList.add("tab-head");
 
  /* create track */
  const track = document.createElement("div");
  track.className = "tab-head-1";
 
  const items = [...container.children];
 
  items.forEach((item) => {
    track.appendChild(item);
  });
 
}
