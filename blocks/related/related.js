import { getMetadata, loadCSS, toClassName } from '../../scripts/scripts.js';

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
  if (block.children.length === 2) {
    block.classList.add('cards-fifty-fifty');
  }
  const classes = [
    'one', 'two', 'three', 'four', 'five', 'six',
  ];
  if (block.textContent.trim() === 'localNav') {
    block.innerHTML = '';
    const localNav = getMetadata('local-nav');
    // fetch nav content
    let nav = window.azmc && window.azmc.nav;
    if (!nav) {
      const navPath = localNav || `/${window.location.pathname.split('/')[1]}/nav`;
      const resp = await fetch(`${navPath}.plain.html`);
      if (resp.ok) {
        nav = await resp.text();
      }
    }
    if (nav) {
      const tmp = document.createElement('div');
      tmp.innerHTML = nav;
      const rootList = tmp.querySelector('ul, ol');
      block.append(...createCards(rootList));
    }
  }
  block.querySelectorAll(':scope > div > div').forEach((card, index) => {
    const style = classes[(index + 3) % classes.length];
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
        if (window.location.pathname.startsWith(pathname)) {
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
}
