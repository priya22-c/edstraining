export default function decorate(block) {
  // Mark first two (as you previously needed)
  const first = block.children[0];
  if (!first) return;
  first.classList.add('nav-head');
  const second = block.children[1];
  if (second) second.classList.add('nav-head-2');

  // 1) Build structure: wrapper -> viewport -> track -> slides
  const wrapper = document.createElement('div');
  wrapper.className = 'logos-carousel';

  const viewport = document.createElement('div');
  viewport.className = 'logos-viewport';

  const track = document.createElement('div');
  track.className = 'logos-track';

  // Move all current children into the track as slides
  const slides = Array.from(block.children);
  slides.forEach((el) => {
    const slide = document.createElement('div');
    slide.className = 'logo-slide';
    // move original child into slide
    slide.appendChild(el);
    track.appendChild(slide);
  });

  viewport.appendChild(track);
  wrapper.appendChild(viewport);

  // 2) Arrows
  const prev = document.createElement('button');
  prev.className = 'logos-arrow logos-prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '‹';

  const next = document.createElement('button');
  next.className = 'logos-arrow logos-next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '›';

  wrapper.appendChild(prev);
  wrapper.appendChild(next);

  // Put wrapper back into the block
  block.innerHTML = '';
  block.appendChild(wrapper);

  // 3) Logic: scroll by one slide width on click
  const getSlideWidth = () => {
    const anySlide = track.querySelector('.logo-slide');
    return anySlide ? anySlide.getBoundingClientRect().width : 0;
  };

  // Keep scroll snapping nice even if resized
  let slideW = getSlideWidth();
  window.addEventListener('resize', () => { slideW = getSlideWidth(); });

  prev.addEventListener('click', () => {
    viewport.scrollBy({ left: -slideW, behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    viewport.scrollBy({ left: slideW, behavior: 'smooth' });
  });

  // Optional: drag/trackpad friendly (no extra code needed; native scroll)
}
