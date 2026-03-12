export default function decorate(block) {
 
  const container = block.children[0];
  if (!container) return;
 
  /* main class */
  container.classList.add("nav-head-1");
 
  /* create track */
  const track = document.createElement("div");
  track.className = "nav-head-3";
 
}
