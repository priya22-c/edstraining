// logos-carousel.js
export default function decorate(block) {
  // --- Keep your original class additions ---
  const first = block.children[0];
  if (!first) return;
  first.classList.add('nav-head');

  const second = block.children[1];
  if (second) second.classList.add('nav-head-2');

  // --- Collect ALL <img> inside the block (flatten), else fallback to children ---
  let itemsSrc = Array.from(block.querySelectorAll('img'));
  if (!itemsSrc.length) {
    // if no <img>, treat each direct child as an item
    itemsSrc = Array.from(block.children);
  }

  // Deduplicate by src if they appear twice
  const seen = new Set();
  const itemsEls = itemsSrc.filter((n) => {
    if (n.tagName === 'IMG') {
      const src = n.currentSrc || n.src;
      if (seen.has(src)) return false;
      seen.add(src);
    }
    return true;
  });

  if (!itemsEls.length) return;

  // --- Build structure: carousel -> prev + viewport(track(items)) + next ---
  const carousel = document.createElement('div');
  carousel.className = 'lc-carousel';
  carousel.tabIndex = 0; // keyboard arrows

  const viewport = document.createElement('div');
  viewport.className = 'lc-viewport';

  const track = document.createElement('ul');
  track.className = 'lc-track';

  itemsEls.forEach((el) => {
    const li = document.createElement('li');
    li.className = 'lc-item';

    // Move existing content into the slot (no cloning to avoid duplicates)
    if (el.tagName === 'IMG') {
      li.appendChild(el);
    } else {
      li.appendChild(el);
    }

    track.appendChild(li);
  });

  viewport.appendChild(track);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'lc-arrow lc-prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'lc-arrow lc-next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '›';

  // Replace original block content with our carousel
  block.replaceChildren(carousel);
  carousel.append(prev, viewport, next);

  // -------- Carousel logic (page-by-page sliding) --------
  const items = Array.from(track.children);
  const total = items.length;

  // Read --perView from CSS (how many visible per page)
  const perView = () => {
    const raw = getComputedStyle(carousel).getPropertyValue('--perView').trim();
    const n = Number(raw || 5);
    return Number.isFinite(n) && n > 0 ? n : 5;
  };

  let index = 0;      // left-most visible item index
  let stepPx = 0;     // pixels to move for ONE item (width + gap)
  let maxIndex = 0;   // last valid left-most index (for page step we jump perView)

  function compute() {
    // Measure one slot after layout
    const firstSlot = items[0];
    const rect = firstSlot.getBoundingClientRect();
    if (rect.width === 0) {
      requestAnimationFrame(compute);
      return;
    }
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.gap || cs.columnGap || '0') || 0;
    stepPx = rect.width + gap;

    const pv = perView();
    maxIndex = Math.max(0, Math.ceil(total / pv) - 1); // page count - 1

    // Keep current page in bounds
    index = Math.max(0, Math.min(index, maxIndex));
    apply();
  }

  function apply() {
    // Translate by full "pages": pageIndex * pageWidth
    const pv = perView();
    const distance = (track.children[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0)) * pv;
    track.style.transform = `translateX(${-index * distance}px)`;

    // Enable/disable arrows at edges
    prev.disabled = index === 0;
    next.disabled = index === maxIndex;
  }

  // Click handlers: move one PAGE (the visible set)
  prev.addEventListener('click', () => { index = Math.max(0, index - 1); apply(); });
  next.addEventListener('click', () => { index = Math.min(maxIndex, index + 1); apply(); });

  // Keyboard support when the carousel has focus
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev.click(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
  });

  // Recompute on resize (keeps page width aligned)
  window.addEventListener('resize', compute, { passive: true });

  // Init: compute first, then enable smooth transition
  compute();
  requestAnimationFrame(() => track.classList.add('lc-animated'));
}
