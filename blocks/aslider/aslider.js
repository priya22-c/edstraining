// logos-carousel.js
export default function decorate(block) {
  // 1) Collect *all* images from inside the block (flatten any nested rows/cols)
  const imgs = Array.from(block.querySelectorAll('img'));
  if (!imgs.length) return;

  // 2) Deduplicate by src (prevents the same stack appearing twice)
  const seen = new Set();
  const uniqueImgs = imgs.filter((img) => {
    const src = img.currentSrc || img.src;
    if (seen.has(src)) return false;
    seen.add(src);
    return true;
  });

  // 3) Build structure: carousel -> (prev)(viewport->track->items)(next)
  const carousel = document.createElement('div');
  carousel.className = 'logos-carousel';

  const viewport = document.createElement('div');
  viewport.className = 'logos-viewport';

  const track = document.createElement('ul');
  track.className = 'logos-track';

  uniqueImgs.forEach((img) => {
    const li = document.createElement('li');
    li.className = 'logo-item';
    li.appendChild(img);                // MOVE existing img (no clone)
    track.appendChild(li);
  });

  viewport.appendChild(track);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'logos-arrow prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'logos-arrow next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '›';

  // Replace the original block with our carousel
  block.replaceChildren(carousel);
  carousel.append(prev, viewport, next);

  // 4) Behavior — page-by-page movement based on visible width
  const getPerView = () => {
    // Read from CSS custom property --perView
    const val = getComputedStyle(carousel).getPropertyValue('--perView').trim();
    const n = Number(val || 5);
    return Number.isFinite(n) && n > 0 ? n : 5;
  };

  const totalItems = uniqueImgs.length;
  let page = 0;

  function totalPages() {
    const perView = getPerView();
    return Math.max(0, Math.ceil(totalItems / perView) - 1);
  }

  function goTo(p) {
    const max = totalPages();
    page = Math.max(0, Math.min(p, max));
    // Scroll the viewport by full viewport width, so it behaves like a carousel “page”
    viewport.scrollTo({ left: page * viewport.clientWidth, behavior: 'smooth' });
    prev.disabled = page === 0;
    next.disabled = page === max;
  }

  // Keep page alignment on resize
  window.addEventListener('resize', () => goTo(page), { passive: true });

  prev.addEventListener('click', () => goTo(page - 1));
  next.addEventListener('click', () => goTo(page + 1));

  // Keyboard support
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(page - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(page + 1); }
  });

  // Init
  goTo(0);
}
