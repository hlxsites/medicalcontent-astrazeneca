export default function decorate(block) {
  if (block.children.length === 2) {
    block.classList.add('cards-fifty-fifty');
  }
  const classes = [
    'one', 'two', 'three', 'four', 'five', 'six',
  ];
  block.querySelectorAll(':scope > div > div').forEach((cell, index) => {
    if (cell.firstChild) {
      const details = document.createElement('div');
      details.classList.add('cards-card-details');
      const style = classes[index] || classes[index % classes.length];
      cell.classList.add('cards-card', `cards-card-${style}`);
      while (cell.firstChild) details.append(cell.firstChild);
      const link = details.querySelector(':scope a');
      if (link && link.href) {
        const cardLink = document.createElement('a');
        cardLink.href = link.href;
        cardLink.title = link.title || link.textContent;
        cardLink.append(details);
        cell.append(cardLink);
      } else {
        cell.append(details);
      }
    }
  });
}
