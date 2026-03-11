// logos-carousel.js
export default function decorate(block) {
  // Mark first two as you originally needed
  const first = block.children[0];
  if (!first) return;
  first.classList.add('nav-head');

  const second = block.children[1];
  if (second) second.classList.add('nav-head-2');

  // Collect the *direct children* of the block as slides (no duplication)
  const originals = Array.from(block.children);

  // Build structure: wrapper -> viewport -> track -> slide(s)
  const wrapper = document.createElement('div');
  wrapper.className = 'logos-carousel';

  const viewport = document.createElement('div');
  viewport.className = 'logos-viewport';

  const track = document.createElement('div');
  track.className = 'logos-track';

  // Move original children into horizontal slides
  originals.forEach((node) => {
    // Wrap each existing child once
    const slide = document.createElement('div');
    slide.className = 'logo-slide';
    slide.appendChild(node);      // MOVE (not clone) to avoid duplicates
    track.appendChild(slide);
  });

  viewport.appendChild(track);
  wrapper.appendChild(viewport);

  // Arrows
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'logos-arrow logos-prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'logos-arrow logos-next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '›';

  wrapper.append(prev, next);

  // Replace block content with our carousel
  block.innerHTML = '';
  block.appendChild(wrapper);

  // ---- Behavior: slide “page” by page ----
  const slides = Array.from(track.children);
  if (slides.length === 0) return;

  // Compute sizes
  const getSizes = () => {
    const vpRect = viewport.getBoundingClientRect();
    const slideRect = slides[0].getBoundingClientRect();
    const slideW = slideRect.width || 1; // avoid divide by zero
    const perView = Math.max(1, Math.floor(vpRect.width / slideW)); // items visible
    const maxPage = Math.max(0, Math.ceil(slides.length / perView) - 1);
    return { slideW, perView, maxPage, vpW: vpRect.width };
  };

  let page = 0;
  let sizes = getSizes();

  const goToPage = (p) => {
    page = Math.max(0, Math.min(p, sizes.maxPage));
    const offset = page * sizes.vpW; // page-wise scroll by viewport width
    viewport.scrollTo({ left: offset, behavior: 'smooth' });
  };

  // Update sizes on resize
  const onResize = () => { sizes = getSizes(); goToPage(page); };
  window.addEventListener('resize', onResize, { passive: true });

  // Arrow actions
  prev.addEventListener('click', () => goToPage(page - 1));
  next.addEventListener('click', () => goToPage(page + 1));

  // Keyboard (optional)
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToPage(page - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goToPage(page + 1); }
  });

  // Initialize (ensure starting at page 0)
  goToPage(0);
}
