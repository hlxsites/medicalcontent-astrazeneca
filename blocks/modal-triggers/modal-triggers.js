import { loadBlocks, stringToHTML } from '../../scripts/scripts.js';

async function loadModalBlock() {
  if (document.querySelector('.modal-content-container') !== null) {
    return;
  }

  const section = stringToHTML(
    `<div class="section modal-content-container">
        <div class="modal-content-wrapper">
          <div class="modal-content block" data-block-name="modal-content"></div>
        </div>
      </div>`,
  );
  const main = document.querySelector('main');
  main.append(section.querySelector('.section'));
  await loadBlocks(main);
}

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
  return loadModalBlock();
}
