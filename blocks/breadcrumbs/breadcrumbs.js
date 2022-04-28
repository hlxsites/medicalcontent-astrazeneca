function getTitle(doc) {
  const shortTitle = doc.head.querySelector('meta[name="short-title"]');
  if (shortTitle && shortTitle.content) {
    return shortTitle.content;
  }
  const title = doc.body.querySelector('h1')
    || doc.head.querySelector('meta[name="title"]');
  return title && (title.textContent || title.content);
}

export default async function decorate(block) {
  const pathSegments = window.location.pathname.split('/');

  // home
  const crumbs = [['/', 'Medical Content Hub']];

  // hub
  const hub = pathSegments[1];
  let hubTitle = 'Hub';
  if (hub === 'breast-cancer') {
    hubTitle = 'Breast Cancer Hub';
  } else if (hub === 'haematology') {
    hubTitle = 'Haematology Hub';
  }
  crumbs.push([`/${hub}`, hubTitle]);

  // study
  const studyTitle = getTitle(document) || document.title;
  crumbs.push([pathSegments.slice(0, 3).join('/'), studyTitle]);

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
