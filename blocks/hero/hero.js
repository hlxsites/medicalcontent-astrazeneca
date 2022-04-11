export default function decorate(block) {
  // shortcut list
  const ul = document.createElement('ul');
  ul.className = 'hero-shortcuts';
  document.querySelectorAll('main .default-content-wrapper > h2').forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${item.id}" title="${item.textContent}">${item.textContent}</a>`;
    ul.append(li);
  });
  block.append(ul);
}
