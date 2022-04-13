export default function decorate(block) {
  block.classList.add('cards');
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
