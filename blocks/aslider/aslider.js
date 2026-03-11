// logos-carousel-paged.js
export default function decorate(block) {
  // Keep your original class additions
  const first = block.children[0];
  if (!first) return;
  first.classList.add('nav-head');

  const second = block.children[1];
  if (second) second.classList.add('nav-head-2');

  // 1) Collect logo items. Prefer <img>; if none, use direct children.
  let sourceNodes = Array.from(block.querySelectorAll('img'));
  if (!sourceNodes.length) sourceNodes = Array.from(block.children);

  // Optional: de‑dupe images by src
  const seen = new Set();
  const items = sourceNodes.filter((n) => {
    if (n.tagName === 'IMG') {
      const src = n.currentSrc || n.src;
      if (seen.has(src)) return false;
      seen.add(src);
    }
    return true;
  });
  if (!items.length) return;

  // 2) Build shell
  const shell = document.createElement('div');
  shell.className = 'lc-shell';
  shell.tabIndex = 0; // keyboard arrows

  const viewport = document.createElement('div');
  viewport.className = 'lc-viewport';

  const track = document.createElement('div');
  track.className = 'lc-track';

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

  // Replace original content
  block.replaceChildren(shell);
  shell.append(prev, viewport, next);

  // 3) Pagination: group items into pages (rows × perView per page)
  const getConfig = () => {
    const cs = getComputedStyle(shell);
    const rows = Number(cs.getPropertyValue('--rows').trim() || 1) || 1;      // default 1 row
    const perView = Number(cs.getPropertyValue('--perView').trim() || 5) || 5; // default 5 per row
    const gapX = cs.getPropertyValue('--gapX').trim();
    const gapY = cs.getPropertyValue('--gapY').trim();
    return { rows, perView, gapX, gapY };
  };

  function buildPages() {
    track.innerHTML = '';
    const { rows, perView } = getConfig();
    const pageSize = rows * perView;
    const total = items.length;
    const pagesCount = Math.max(1, Math.ceil(total / pageSize));

    let idx = 0;
    for (let p = 0; p < pagesCount; p += 1) {
      const page = document.createElement('ul');
      page.className = 'lc-page';
      // Fill this page with up to pageSize items
      for (let i = 0; i < pageSize && idx < total; i += 1, idx += 1) {
        const li = document.createElement('li');
        li.className = 'lc-cell';
        // MOVE the existing node (no clone) to avoid duplicates
        li.appendChild(items[idx]);
        page.appendChild(li);
      }
      track.appendChild(page);
    }
  }

  buildPages();

  // 4) Sliding logic — page-by-page
  let page = 0;

  function pagesTotal() {
    return track.children.length || 1;
  }

  function goTo(p) {
    const max = pagesTotal() - 1;
    page = Math.max(0, Math.min(p, max));
    track.style.transform = `translateX(${-page * 100}%)`;
    prev.disabled = page === 0;
    next.disabled = page === max;
  }

  prev.addEventListener('click', () => goTo(page - 1));
  next.addEventListener('click', () => goTo(page + 1));

  shell.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(page - 1); }
