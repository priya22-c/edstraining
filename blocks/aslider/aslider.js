export default function decorate(block) {
 
  const row = block.children[0];
  if (!row) return;
 
  row.classList.add("nav-head");
 
  const items = [...row.children];
 
  /* wrapper */
  const track = document.createElement("div");
  track.className = "nav-track";
 
  items.forEach((el) => {
    track.appendChild(el);
  });
 
  row.appendChild(track);
 
  /* create arrows */
  const prev = document.createElement("button");
  prev.className = "nav-arrow prev";
  prev.innerHTML = "‹";
 
  const next = document.createElement("button");
  next.className = "nav-arrow next";
  next.innerHTML = "›";
 
  block.append(prev, next);
 
  let scrollAmount = 0;
 
  next.addEventListener("click", () => {
    scrollAmount += 200;
    track.style.transform = `translateX(-${scrollAmount}px)`;
  });
 
  prev.addEventListener("click", () => {
    scrollAmount -= 200;
    if (scrollAmount < 0) scrollAmount = 0;
    track.style.transform = `translateX(-${scrollAmount}px)`;
  });
 
  /* auto carousel */
  setInterval(() => {
    scrollAmount += 200;
    if (scrollAmount > track.scrollWidth / 2) {
      scrollAmount = 0;
    }
    track.style.transform = `translateX(-${scrollAmount}px)`;
  }, 3000);
 
}
