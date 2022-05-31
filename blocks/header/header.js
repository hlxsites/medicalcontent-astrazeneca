import { getMetadata, toClassName } from '../../scripts/scripts.js';
import fetchNav from '../shared/nav.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */
function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-section').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function createNavSection(list, navSections, parent = '') {
  const navSection = document.createElement('div');
  navSection.classList.add('nav-section');
  navSection.append(list);
  list.querySelectorAll(':scope > li').forEach((item, i) => {
    const title = item.firstChild.textContent.trim();
    const safeTitle = toClassName(title.replace('&', 'and'));
    const link = document.createElement('a');
    link.classList.add('nav-item', `nav-item-${safeTitle}`);
    const linkPrefix = window.location.pathname.split('/').filter((_, c) => c < 3).join('/');
    link.href = `${linkPrefix}${parent || ''}/${safeTitle}`;
    if (!parent && i === 0) {
      // home link
      link.href = '/';
    } else if (!parent && i === 1) {
      // hub link
      link.href = `/${window.location.pathname.split('/')[1]}`;
    }
    link.title = title;
    link.textContent = title;
    item.append(link);

    if (window.location.pathname === link.getAttribute('href')) {
      link.classList.add('nav-item-active');
      if (parent) {
        link.closest('.nav-section').setAttribute('aria-expanded', 'true');
      }
    }

    const subNavSection = item.querySelector(':scope > ul')
      && createNavSection(item.querySelector(':scope > ul'), navSections, `${parent}/${safeTitle}`);
    if (subNavSection) {
      if (!subNavSection.hasAttribute('aria-expanded')) {
        subNavSection.setAttribute('aria-expanded', 'false');
      }
      item.append(subNavSection);
      link.classList.add('has-subnav');
      link.addEventListener('click', () => link.classList.toggle('expanded'));
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
  const theme = getMetadata('theme');
  if (theme !== 'study') {
    return;
  }
  // fetch nav content
  const html = await fetchNav();
  if (!html) {
    return;
  }
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
    if (window.innerWidth <= 900) {
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
  nav.classList.add('appear');

  // expand by default on desktop
  if (window.innerWidth >= 900) {
    hamburger.click();
  }
}
