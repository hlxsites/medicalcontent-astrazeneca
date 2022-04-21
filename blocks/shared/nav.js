import { getMetadata } from '../../scripts/scripts.js';

async function fetchHTML(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) {
    return null;
  }
  return resp.text();
}

export default async function fetchNav() {
  // fetch nav content
  let html = window.azmc && window.azmc.nav;
  if (!html) {
    let navPath = getMetadata('local-nav');
    if (!navPath) {
      const pathSegments = window.location.pathname.split('/');
      while (!html && pathSegments.length > 1) {
        pathSegments.pop();
        navPath = `${pathSegments.join('/')}/nav`;
        // eslint-disable-next-line no-await-in-loop
        html = await fetchHTML(navPath);
      }
    } else {
      html = await fetchHTML(navPath);
    }
    window.azmc = window.azmc || {};
    window.azmc.nav = html;
  }
  return html;
}
