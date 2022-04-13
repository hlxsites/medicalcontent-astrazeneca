export default function decorate(block) {
  block.querySelectorAll(':scope > div').forEach((segment) => {
    // add a class to the segment
    segment.classList.add('accordion-segment');
    const title = segment.querySelector(':scope > div:first-child');
    // Add a class to the title container
    title.classList.add('accordion-item-title');
    // Decorate the content divs
    segment.querySelectorAll(':scope > div:not(:first-child')
      .forEach((div) => {
        div.classList.add('accordion-item-content');
        div.querySelectorAll(':scope p').forEach((p) => {
          if (p.children.length === 1 && p.firstChild.tagName === 'PICTURE') {
            p.classList.add('accordion-image-only');
          }
        });
      });
    // Add a click handler to open the content
    title.addEventListener('click', () => {
      title.parentElement.classList.toggle('accordion-open');
    });
  });
}
