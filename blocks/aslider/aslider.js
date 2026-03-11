export default function decorate(block) {
 
  const first = block.children[0];
  if (!first) return;
  first.classList.add('nav-head');
 
  const second = block.children[1];
  if (second) second.classList.add('nav-head-2');
 
  /* create arrows */
  const prev = document.createElement('button');
  prev.className = 'nav-arrow prev';
  prev.innerHTML = '❮';
 
  const next = document.createElement('button');
  next.className = 'nav-arrow next';
  next.innerHTML = '❯';
 
  block.append(prev);
  block.append(next);
 
  const slider = first;
 
  next.addEventListener('click', () => {
    slider.scrollBy({ left: 200, behavior: 'smooth' });
  });
 
  prev.addEventListener('click', () => {
    slider.scrollBy({ left: -200, behavior: 'smooth' });
  });
 
  /* auto scroll loop */
  setInterval(() => {
    slider.scrollBy({ left: 150, behavior: 'smooth' });
  }, 2000);
}
