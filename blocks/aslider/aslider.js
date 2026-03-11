export default function decorate(block) {
  const first = block.children[0];
  if (!first) return;

  first.classList.add('nav-head');

  // Create wrapper for carousel
  const items = Array.from(block.children);
  let index = 0;

  // Hide all except first
  items.forEach((item, i) => {
    item.style.display = i === 0 ? 'block' : 'none';
  });

  // Create arrows
  const leftArrow = document.createElement('button');
  const rightArrow = document.createElement('button');

  leftArrow.className = 'carousel-arrow left';
  rightArrow.className = 'carousel-arrow right';

  leftArrow.innerHTML = '◀';
  rightArrow.innerHTML = '▶';

  block.append(leftArrow, rightArrow);

  // Function to show slide
  function showSlide(i) {
    items.forEach((item, idx) => {
      item.style.display = idx === i ? 'block' : 'none';
    });
  }

  // Arrow controls
  leftArrow.addEventListener('click', () => {
    index = (index - 1 + items.length) % items.length;
    showSlide(index);
  });

  rightArrow.addEventListener('click', () => {
    index = (index + 1) % items.length;
    showSlide(index);
  });

  // Auto‑rotate every 10 seconds
  setInterval(() => {
    index = (index + 1) % items.length;
    showSlide(index);
  }, 10000);
}
