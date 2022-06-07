/**
 * @param {string} href
 */
function getModalTriggerLinkKey(href) {
  return href.replace('bookmark://modals/', '');
}

function getModalTriggerLinks() {
  return document.querySelectorAll('a[href^="bookmark://modals/"]');
}

/**
 * @param {string} group
 */
function getModalsAddress(group) {
  const pathSegments = document.location.pathname.split('/');
  pathSegments[pathSegments.length - 1] = group;
  return new URL(`${document.location.origin}${pathSegments.join('/')}`);
}

class Modal {
  #preloaded = new Map();

  #block;

  /**
   * @param {HTMLDivElement} block
   */
  constructor(block) {
    this.#block = block;
  }

  /**
   * @param {string} resp
   * @param {string} group
   * @param {Set<number>} set
   */
  #processAndSaveModal(resp, group, set) {
    const dom = new DOMParser().parseFromString(resp, 'text/html');

    set.forEach((modalIndex) => {
      const modalContents = dom.querySelectorAll(
        `div.modal-content:nth-child(${modalIndex}) > div > div > *`,
      );
      const header = modalContents[0];
      const contents = [...modalContents].slice(1);
      this.#preloaded.set(`${group}/${modalIndex}`, { header, contents });
    });

    // cleanup references to other unused DOM nodes from the preloaded modals
    this.#preloaded.forEach((modal) => {
      modal.header.remove();
      modal.contents.forEach((content) => content.remove());
    });
  }

  async #preloadModalContents() {
    const triggerLinks = [...getModalTriggerLinks()]
      .map((link) => getModalTriggerLinkKey(link.href).split('/'))
      .map(([group, modalIndex]) => ({ group, modalIndex }))
      .reduce((map, current) => {
        if (map[current.group] instanceof Set) {
          map[current.group].add(current.modalIndex);
        } else {
          map[current.group] = new Set().add(current.modalIndex);
        }
        return map;
      }, {});

    let tasks = Promise.resolve();
    Object.keys(triggerLinks).forEach((group) => {
      tasks = tasks
        .then(() => fetch(getModalsAddress(group)))
        .then((req) => req.text())
        .then((text) => this.#processAndSaveModal(text, group, triggerLinks[group]));
    });
  }

  #decorateModal() {
    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-content-header');
    const modalCloseBtn = document.createElement('button');
    modalCloseBtn.classList.add('modal-content-close');
    modalHeader.appendChild(modalCloseBtn);
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content-content');
    this.#block.replaceChildren(modalHeader, modalContent);
  }

  #initEvents() {
    const modalContainer = this.#block.closest('.modal-content-container');
    const modalCloseBtn = this.#block.querySelector(
      'button.modal-content-close',
    );
    const modalTriggerLinks = getModalTriggerLinks();
    const closeModal = () => {
      document.body.style.removeProperty('overflow');
      modalContainer.classList.remove('is-open');
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (ev) => {
      if (!modalContainer.querySelector('.modal-content').contains(ev.target)) {
        closeModal();
      }
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        closeModal();
      }
    });

    modalTriggerLinks.forEach((link) => {
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        const modalContents = this.#preloaded.get(
          getModalTriggerLinkKey(link.href),
        );
        modalContainer
          .querySelector('.modal-content-header')
          .replaceChildren(modalContents.header, modalCloseBtn);
        modalContainer
          .querySelector('.modal-content-content')
          .replaceChildren(...modalContents.contents);

        document.body.style.overflow = 'hidden';
        modalContainer.classList.add('is-open');
      });
    });
  }

  async initialize() {
    this.#decorateModal();
    await this.#preloadModalContents();
    this.#initEvents();
    return this;
  }
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorateModal(block) {
  new Modal(block).initialize();
}
