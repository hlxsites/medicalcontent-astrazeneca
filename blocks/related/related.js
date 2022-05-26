import { loadCSS, toClassName } from '../../scripts/scripts.js';
import fetchNav from '../shared/nav.js';

function createCards(list, parent) {
  const cards = [];
  list.querySelectorAll(':scope > li').forEach((item, i) => {
    // skip first two root links
    if (parent || i > 1) {
      const title = item.firstChild.textContent;
      const safeTitle = toClassName(title);
      const subList = item.querySelector(':scope > ul, :scope > ol');
      if (subList) {
        // skip node item
        cards.push(...createCards(subList, `${parent || ''}${safeTitle}/`));
      } else {
        const wrapper = document.createElement('div');
        const card = wrapper.appendChild(document.createElement('div'));
        const h2 = card.appendChild(document.createElement('h2'));
        const link = h2.appendChild(document.createElement('a'));
        link.textContent = title;
        link.href = `./${parent || ''}${safeTitle}`;
        cards.push(wrapper);
      }
    }
  });
  return cards;
}

export default async function decorate(block) {
  if (!document.head.querySelector('link[href$="/cards.css"]')) {
    loadCSS('/blocks/cards/cards.css');
  }
  block.classList.add('cards');
  const classes = [
    'one', 'two', 'three', 'four', 'five', 'six',
  ];
  const isLocalNav = block.textContent.trim() === 'localNav';
  if (isLocalNav) {
    block.innerHTML = '';
    const tmp = document.createElement('div');
    const html = await fetchNav();
    if (html) {
      tmp.innerHTML = html;
      const rootList = tmp.querySelector('ul, ol');
      block.append(...createCards(rootList));
    }
  }
  block.querySelectorAll(':scope > div > div').forEach((card, index) => {
    const style = classes[(index) % classes.length];
    card.classList.add('cards-card', `cards-card-${style}`);
    if (!card.querySelector(':scope picture')) {
      card.classList.add('no-image');
    }

    const viewContent = document.createElement('p');
    viewContent.classList.add('related-view-content');
    card.append(viewContent);

    const link = card.querySelector(':scope a');
    if (link && link.href) {
      try {
        const { pathname } = new URL(link.href);
        const pathPrefix = pathname.split('/').filter((_, i) => i < 3).join('/');
        if ((!isLocalNav && window.location.pathname.startsWith(pathPrefix))
          || window.location.pathname === pathname) {
          // omit self
          card.parentElement.remove();
          return;
        }
      } catch (e) {
        // ignore
      }
      const cardLink = document.createElement('a');
      cardLink.href = link.href;
      cardLink.title = link.title || link.textContent;
      link.parentElement.append(...link.childNodes);
      link.remove();
      cardLink.append(...card.childNodes);
      card.append(cardLink);
    }
    card.parentElement.replaceWith(card);
  });
  if (block.children.length === 1) {
    block.classList.add('cards-single');
  } else if (block.children.length === 2) {
    block.classList.add('cards-fifty-fifty');
  }
}
