// two-rows-logos-carousel.js
export default function decorate(block) {
  // --- Keep your original class additions ---
  const first = block.children[0];
  if (!first) return;
  first.classList.add('nav-head');

  const second = block.children[1];
  if (second) second.classList.add('nav-head-2');

  // --- Collect ALL <img> (flatten the block). If no <img>, fall back to direct children ---
  let nodes = Array.from(block.querySelectorAll('img'));
  if (!nodes.length) nodes = Array.from(block.children);

  // De-dupe images by src (optional but helpful)
  const seen = new Set();
  const items = nodes.filter((n) => {
    if (n.tagName === 'IMG') {
      const src = n.currentSrc || n.src;
      if (seen.has(src)) return false;
      seen.add(src);
    }
    return true;
  });
  if (!items.length) return;

  // --- Build structure: carousel -> prev + viewport(grid(items)) + next ---
  const carousel = document.createElement('div');
  carousel.className = 'lc2-carousel';
  carousel.tabIndex = 0; // allow keyboard arrows

  const viewport = document.createElement('div');
  viewport.className = 'lc2-viewport';

  const grid = document.createElement('ul');
  grid.className = 'lc2-grid';

  items.forEach((el) => {
    const li = document.createElement('li');
    li.className = 'lc2-cell';

    // MOVE existing content (avoid cloning duplicates)
    li.appendChild(el);
    grid.appendChild(li);
  });

  viewport.appendChild(grid);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'lc2-arrow lc2-prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'lc2-arrow lc2-next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '›';

  // Replace original content
  block.replaceChildren(carousel);
  carousel.append(prev, viewport, next);

  // ---------- Paging logic (2 rows, N columns per page) ----------
  const totalItems = items.length;

  // Read CSS variables
  const getVars = () => {
    const cs = getComputedStyle(carousel);
    const rows = Number(cs.getPropertyValue('--rows').trim() || 2) || 2;
    const perView = Number(cs.getPropertyValue('--perView').trim() || 5) || 5; // columns per page
    return { rows, perView };
  };

  let page = 0; // 0-based page index

  function totalPages() {
    const { rows, perView } = getVars();
    const itemsPerPage = rows * perView;
    const pages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    return pages;
  }

  function goTo(p) {
    const pages = totalPages();
    page = Math.max(0, Math.min(p, pages - 1));
    // Slide by full viewport width per page
    const x = page * viewport.clientWidth;
    grid.style.transform = `translateX(${-x}px)`;

    // Enable/disable arrows
    prev.disabled = page === 0;
    next.disabled = page === pages - 1;
  }

  // Recompute on resize to keep pages aligned
  const onResize = () => goTo(page);
  window.addEventListener('resize', onResize, { passive: true });

  // Clicks
  prev.addEventListener('click', () => goTo(page - 1));
  next.addEventListener('click', () => goTo(page + 1));

  // Keyboard
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(page - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(page + 1); }
  });

  // Init (enable animation after first paint)
  goTo(0);
  requestAnimationFrame(() => grid.classList.add('lc2-animated'));
}
``
