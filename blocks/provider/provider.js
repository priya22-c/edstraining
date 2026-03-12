export default function decorate(block) {
 
  const wrapper = block.children[0];
  if (!wrapper) return;
 
  wrapper.classList.add('provider-head');
 
  const firstDiv = wrapper.children[0];
  const secondDiv = wrapper.children[1];
 
  if (firstDiv) {
    firstDiv.classList.add('provider-title');
  }
 
  if (secondDiv) {
    secondDiv.classList.add('provider-description');
  }
 
}
