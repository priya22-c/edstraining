export default function decorate(block) {
 
  const first = block.children[0];
  if (!first) return;
 
  /* main container */
  first.classList.add("nav-head");
 
  /* create track */
  const track = document.createElement("div");
  track.className = "nav-head-2";
 
  const items = [...first.children];
 
  items.forEach((item) => {
    track.appendChild(item);
  });
 
  /* duplicate items for infinite loop */
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });
 
  first.appendChild(track);
 
  /* arrows */
  const prev = document.createElement("button");
  prev.className = "nav-arrow prev";
  prev.innerHTML = "‹";
 
  const next = document.createElement("button");
  next.className = "nav-arrow next";
  next.innerHTML = "›";
 
  block.append(prev, next);
 
  let position = 0;
 
  next.addEventListener("click", () => {
    position += 200;
    track.style.transform = `translateX(-${position}px)`;
  });
 
  prev.addEventListener("click", () => {
    position -= 200;
    if (position < 0) position = 0;
    track.style.transform = `translateX(-${position}px)`;
  });
 
  /* auto loop */
  setInterval(() => {
    position += 200;
    if (position > track.scrollWidth / 2) {
      position = 0;
    }
    track.style.transform = `translateX(-${position}px)`;
  }, 2500);
 
}
 
