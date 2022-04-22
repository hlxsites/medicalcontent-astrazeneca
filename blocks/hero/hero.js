export default function decorate(block) {
  const heroPic = block.querySelector(':scope picture');
  if (heroPic && heroPic.parentElement.nextElementSibling.tagName === 'H1') {
    // pic before H1 is considered hero pic
    const heroPicContainer = heroPic.parentElement;
    const picColumn = block.appendChild(document.createElement('div'));
    picColumn.classList.add('hero-picture-container');
    picColumn.appendChild(heroPic);
    heroPicContainer.remove();
    block.firstChild.classList.add('hero-text-container');
    block.closest('.hero-container').classList.add('hero-has-image');
  }
  // shortcut list
  const ul = document.createElement('ul');
  ul.className = 'hero-shortcuts';
  document.querySelectorAll('main > div:not(.related-container,.fragment-container) .default-content-wrapper > h2').forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${item.id}" title="${item.textContent}">${item.innerHTML}</a>`;
    ul.append(li);
  });
  block.append(ul);
}
