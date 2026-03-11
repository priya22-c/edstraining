export default function decorate(block) {
  // --- Mark first two children as requested
  const first = block.children[0];
  if (!first) return;
  first.classList.add('nav-head');

  const second = block.children[1];
  if (second) second.classList.add('nav-head-2');

  // --- Collect slides (use all direct children of the block)
  const slides = Array.from(block.children).filter((el) => el.nodeType === 1);

  if (slides.length <= 1) return; // nothing to carousel

  // --- Carousel state
  let index = 0;

  // --- Create a viewport wrapper to keep arrows & slides together
  // (no CSS required; we’ll toggle hidden and aria attributes)
  const viewport = document.createElement('div');
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-roledescription', 'carousel');
  viewport.setAttribute('aria-label', 'Navigation carousel');
  viewport.style.position = 'relative';

  // Move existing slides into viewport
  slides.forEach((s) => viewport.appendChild(s));
  block.appendChild(viewport);

  // --- Create arrows
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.textContent = '◀';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'carousel-next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.textContent = '▶';

  // Place arrows at the end so they’re in DOM and focusable
  block.append(prevBtn, nextBtn);

  // --- Helper to show a slide by index
  function show(i) {
    index = (i + slides.length) % slides.length;

    slides.forEach((el, n) => {
      const active = n === index;
      el.hidden = !active; // hide others
      el.setAttribute('aria-hidden', String(!active));
      el.tabIndex = active ? 0 : -1;
    });

    // Update buttons’ disabled state if you want finite edges.
    // Here we keep it infinite (wrap-around), so no disable.
  }

  // --- Wire up arrows
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));

  // --- Keyboard support (Left/Right when focus is on a slide or button)
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  // --- Initialize
  show(0);
}
