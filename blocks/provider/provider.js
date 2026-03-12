export default function decorate(block) {
  const container = block.children[0];
  const provider-wrapper = block.children[1];
  if (!container || !providerwrapper) return;
  /* main container */
  container.classList.add("provider-container");
  /* wrapper for members */
  providerwrapper.classList.add("provider-wrapper");
  const members = providerwrapper.children;
  [...members].forEach((member) => {
    member.classList.add("expert-card");
    const img = member.querySelector("picture");
    const name = member.querySelector("h3");
    if (img) {
      img.classList.add("expert-image");
    }
    if (name) {
      name.classList.add("expert-name");
    }
  });
}
