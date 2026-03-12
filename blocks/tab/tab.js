export default function decorate(block) {
 
  const first = block.children[0];
  if (!first) return;
  first.classList.add('tab-head');
 
  const second = block.children[1];
  if (second) second.classList.add('tab-head-2');
