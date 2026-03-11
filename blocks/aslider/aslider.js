// logos-animated-carousel-stable.js
export default function decorate(block) {
  // 1) Collect all <img> (flatten the block)
  const imgs = Array.from(block.querySelectorAll('img'));
  if (!imgs.length) return;

  // 2) Deduplicate by src
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
    li.appendChild(img); // MOVE existing img
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

  // Replace old content
  block.replaceChildren(carousel);
  carousel.append(prev, viewport, next);

  // ---------- Sliding logic (translateX with transition) ----------
  const items = Array.from(track.children);
  const total = items.length;

  // Read how many items per view from CSS custom property (fallback 5)
  const getPerView = () => {
    const raw = getComputedStyle(carousel).getPropertyValue('--perView').trim();
    const n = Number(raw || 5);
    return Number.isFinite(n) && n > 0 ? n : 5;
  };

  let index = 0;      // left-most visible item (0-based)
  let step = 0;       // px to move per ONE item (item width + gap)
  let maxIndex = 0;   // last valid left-most index

  function computeSizes() {
    // Wait for layout — if width is 0, try again on next frame
    const firstItem = items[0];
    const rect = firstItem.getBoundingClientRect();
    if (rect.width === 0) {
      requestAnimationFrame(computeSizes);
      return;
    }

    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.gap || cs.columnGap || '0') || 0;

    step = rect.width + gap;

    const perView = getPerView();
    maxIndex = Math.max(0, total - perView);

    // Clamp index after recompute
    index = Math.max(0, Math.min(index, maxIndex));

    applyTransform();
  }

  function applyTransform() {
    track.style.transform = `translateX(${-index * step}px)`;
    // Disable only if there is nowhere to go
    prev.disabled = (index === 0);
    next.disabled = (index === maxIndex);
  }

  // Click handlers
  prev.addEventListener('click', () => {
    // Move ONE item per click (change to perView for page-by-page)
    index = Math.max(0, index - 1);
    applyTransform();
  });

  next.addEventListener('click', () => {
    index = Math.min(maxIndex, index + 1);
    applyTransform();
  });

  // Keyboard
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev.click(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
  });

  // Recompute on resize
  window.addEventListener('resize', computeSizes, { passive: true });

  // Initialize: first paint without animation, then enable animation
  computeSizes();
  requestAnimationFrame(() => track.classList.add('animated'));
}
``
