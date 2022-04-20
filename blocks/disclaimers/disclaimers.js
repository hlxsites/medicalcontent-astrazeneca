export default function decorate(block) {
  if (block.children.length > 1) {
    const content = block.children[1].firstChild;
    content.classList.add('disclaimers-content');
    const toggle = block.children[0].firstChild;
    toggle.classList.add('disclaimers-toggle');
    toggle.addEventListener('click', () => {
      block.classList.toggle('disclaimers-open');
      content.classList.toggle('appear');
    });
  }
}
