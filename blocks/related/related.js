import { loadCSS } from '../../scripts/scripts.js';

export default function decorate(block) {
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
  block.querySelectorAll(':scope > div > div').forEach((card, index) => {
    const style = classes[(index + 3) % classes.length];
    card.classList.add('cards-card', `cards-card-${style}`);

    const viewContent = document.createElement('p');
    viewContent.classList.add('related-view-content');
    card.append(viewContent);

    const link = card.querySelector(':scope a');
    if (link && link.href) {
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
