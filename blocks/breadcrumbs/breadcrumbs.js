import { getMetadata } from '../../scripts/scripts.js';

export default function decorate(block) {
  // todo: populate based on index
  block.querySelector(':scope > div > div').innerHTML = `
  <a href="/" title="Medical Content Hub">Medical Content Hub</a>
  <span class="breadcrumbs-separator"></span>
  ${getMetadata('short-title') || document.title}`;
}
