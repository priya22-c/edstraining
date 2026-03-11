export default function decorate(block) {
  // 1) Grab *all* images inside the block (flatten nested rows/columns)
  const imgs = Array.from(block.querySelectorAll('img'));
  if (!imgs.length) return;

  // 2) Deduplicate by src in case the same stack appears twice
  const seen = new Set();
  const uniqueImgs = imgs.filter((img) => {
    const src = img.currentSrc || img.src;
    if (seen.has(src)) return false;
    seen.add(src);
    return true;
  });

  // 3) Build a single horizontal row
  const row = document.createElement('div');
  row.className = 'logos-row';

  uniqueImgs.forEach((img) => {
    const item = document.createElement('div');
    item.className = 'logo-item';

    // Move the existing <img> (not cloning, to avoid duplicates)
    item.appendChild(img);
    row.appendChild(item);
  });

  // 4) Replace the original block content with the new row
  block.textContent = '';
  block.appendChild(row);
}
