/* eslint-disable no-fallthrough */
import { loadBlocks } from '../../scripts/scripts.js';

/**
 * @param {HTMLDivElement} block
 */
export default async function decorateComplexSection(block) {
  const childCount = block.childElementCount;
  const children = [...block.children];

  switch (true) {
    case childCount > 0:
      children[0].className = 'default-content-wrapper';
    case childCount > 1:
      children[1].className = 'default-content-wrapper';
    case childCount > 2:
      children[2].className = 'references block';
      children[2].dataset.blockName = 'references';
    case childCount > 3:
      children[2].className = 'modal-triggers block';
      children[2].dataset.blockName = 'modal-triggers';
      children[3].className = 'references block';
      children[3].dataset.blockName = 'references';
    default:
      break;
  }

  if (childCount > 2) {
    await loadBlocks(document.querySelector('main'));
  }
}
