import { getMetadata, toClassName } from '../../scripts/scripts.js';

export default function decorate(block) {
  // todo: populate based on index
  const crumbs = [['/', 'Medical Content Hub']];
  const docTitle = getMetadata('short-title') || document.title;
  if (!crumbs.find((crumb) => crumb[1] === docTitle)) {
    crumbs.push([`/${toClassName(docTitle)}`, docTitle]);
  }
  block.querySelector(':scope > div > div').innerHTML = crumbs
    .map((crumb, num) => {
      const [url, title] = crumb;
      if (num === 0 && crumbs.length === 1) {
        // homepage, no breadcrumb
        return '';
      }
      if (num === crumbs.length - 1) {
        // last crumb
        return title;
      }
      return `<a href="${url}" title="${title}">${title}</a>
        <span class="breadcrumbs-separator"></span>`;
    })
    .join('');
}
