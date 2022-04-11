import { getMetadata, readBlockConfig, toClassName } from '../../scripts/scripts.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */
function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-section').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function createNavSection(list, navSections) {
  const navSection = document.createElement('div');
  navSection.classList.add('nav-section');
  navSection.append(list);
  list.querySelectorAll(':scope > li').forEach((item, i) => {
    const title = item.firstChild.textContent.trim();
    const safeTitle = toClassName(title);
    const link = document.createElement('a');
    link.classList.add('nav-item', `nav-item-${safeTitle}`);
    if (window.location.pathname.split('/').pop() === safeTitle) {
      link.classList.add('nav-item-active');
    }
    link.href = `./${safeTitle}`;
    if (i === 0) {
      // home link
      link.href = '/';
    } else if (i === 1) {
      // hub link
      link.href = `/${window.location.pathname.split('/')[1]}`;
    }
    link.title = title;
    link.textContent = title;
    item.append(link);

    const subNavSection = item.querySelector(':scope > ul')
      && createNavSection(item.querySelector(':scope > ul'), navSections);
    if (subNavSection) {
      subNavSection.setAttribute('aria-expanded', 'false');
      item.append(subNavSection);
      link.href = window.location.hash || '#';
    }

    link.addEventListener('click', (evt) => {
      const section = subNavSection || navSection;
      const expanded = section.getAttribute('aria-expanded') === 'true';
      if (!subNavSection) {
        collapseAllNavSections(navSections);
      } else {
        evt.preventDefault();
      }
      section.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    }, true);
    item.firstChild.remove();
  });
  return navSection;
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  const theme = getMetadata('theme');
  if (theme !== 'study') {
    return;
  }
  // fetch nav content
  const navPath = cfg.nav || `/${window.location.pathname.split('/')[1]}/nav`;
  const resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) {
    return;
  }
  const html = await resp.text();
  block.innerHTML = html;
  const nav = block.querySelector(':scope > div');
  // decorate nav DOM
  nav.classList.add('nav');
  nav.setAttribute('aria-role', 'navigation');
  const list = nav.querySelector(':scope > ul');
  if (!list) {
    return;
  }
  const navSections = document.createElement('div');
  navSections.classList.add('nav-sections');
  navSections.append(createNavSection(list, navSections));
  nav.append(navSections);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = '<div class="nav-hamburger-icon" title="Toggle navigation"></div>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    if (window.innerWidth <= 600) {
      document.body.style.overflowY = expanded ? '' : 'hidden';
    } else if (expanded) {
      document.body.classList.remove('nav-expanded');
    } else {
      document.body.classList.add('nav-expanded');
    }
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
}
