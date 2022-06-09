/**
 * @param {HTMLDivElement} block
 */
export default async function decorateModalTriggers(block) {
  const modalTriggers = block.querySelectorAll('a[href^="bookmark://modals"]');
  block.childNodes.forEach((node) => node.remove());
  modalTriggers.forEach((link) => {
    link.classList.add('modal-trigger-link');
    block.append(link);
  });
}
