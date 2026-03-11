// logos-animated-carousel.js
export default function decorate(block) {
  // 1) Collect all <img> inside the block (flatten any nested structures)
  const imgs = Array.from(block.querySelectorAll('img'));
  if (!imgs.length) return;

  // 2) De-duplicate by src (in case the same set appears twice)
  const seen = new Set();
  const uniqueImgs = imgs.filter((img) => {
    const src = img.currentSrc || img.src;
    if (seen.has(src)) return false;
    seen.add(src);
    return true;
  });

  // 3) Build structure: carousel -> prev + viewport(track(items)) + next
  const carousel = document.createElement('div');
  carousel.className = 'logos-carousel';

  const viewport = document.createElement('div');
  viewport.className = 'logos-viewport';

  const track = document.createElement('ul');
  track.className = 'logos-track';

  uniqueImgs.forEach((img) => {
    const li = document.createElement('li');
    li.className = 'logo-item';
    li.appendChild(img); // MOVE the existing <img> (no cloning)
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

  // Replace the block content
  block.replaceChildren(carousel);
  carousel.append(prev, viewport, next);

  // ---------- Sliding logic (translateX with transition) ----------
  const items = Array.from(track.children);
  const total = items.length;

  // Read how many items per view from CSS custom property (fallback 5)
  const getPerView = () => {
    const val = getComputedStyle(carousel).getPropertyValue('--perView').trim();
    const n = Number(val || 5);
    return Number.isFinite(n) && n > 0 ? n : 5;
  };

  // Compute px step = itemWidth + gap so translateX is accurate
  let index = 0; // left-most visible item
  let step = 0;  // how many pixels to move for 1 item
  let maxIndex = 0;

  function computeSizes() {
    // width of one item
    const firstItem = items[0];
    const rect = firstItem.getBoundingClientRect();
    const itemW = rect.width;

    // gap in px
    const cs = getComputedStyle(track);
    // 'gap' is standard; for safety also try columnGap
    const gap = parseFloat(cs.gap || cs.columnGap || '0') || 0;

    step = itemW + gap;
    const perView = getPerView();
    maxIndex = Math.max(0, total - perView);
  }

  function applyTransform() {
    track.style.transform = `translateX(${-index * step}px)`;
    prev.disabled = index === 0;
    next.disabled = index === maxIndex;
  }

  // Buttons
  prev.addEventListener('click', () => {
    index = Math.max(0, index - 1);   // move by ONE item
    applyTransform();
  });

  next.addEventListener('click', () => {
    index = Math.min(maxIndex, index + 1); // move by ONE item
    applyTransform();
  });

  // Keyboard support when carousel has focus
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev.click(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
  });

  // Recompute on resize (responsive)
  window.addEventListener('resize', () => {
    const oldStep = step;
    const oldIndex = index;
    computeSizes();
    // Keep the left-most item aligned after resize
    // recompute translate based on the same index with new step
    if (step !== oldStep || index !== oldIndex) applyTransform();
  }, { passive: true });

  // Initialize
  computeSizes();
  // Enable smooth transition AFTER first paint so we don't animate the initial set
  requestAnimationFrame(() => {
    track.classList.add('animated');   // CSS adds transition when this class exists
    applyTransform();
  });
}
