import { loadBlocks, requestIdleCallback } from '../../scripts/scripts.js';

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
      const modalContainer = dom.querySelector(
        `div.modal-content:nth-child(${modalIndex})`,
      );

      const header = modalContainer.querySelector(
        ':scope > div:first-child :where(h1, h2, h3, h4)',
      );
      header.remove();

      // eslint-disable-next-line prefer-const
      let [mainContent, highlightContent, references, ...rest] = [
        ...modalContainer.querySelectorAll(
          `div.modal-content:nth-child(${modalIndex}) > div`,
        ),
      ];
      mainContent.classList.add('modal-content-main');

      if (!references) {
        references = highlightContent;
        highlightContent = null;
      }
      if (highlightContent) {
        highlightContent.classList.add('modal-content-highlight');
      }
      if (references) {
        references.classList.add('block', 'references');
        references.dataset.blockName = 'references';
      }

      const contents = [
        mainContent,
        highlightContent,
        references,
        ...rest,
      ].filter((block) => Boolean(block));
      this.#preloaded.set(`${group}/${modalIndex}`, { header, contents });
    });

    // cleanup references to other unused DOM nodes from the preloaded modals
    this.#preloaded.forEach((modal) => {
      modal.header.remove();
      modal.contents.forEach((content) => content && content.remove());
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
    const loadModalContent = (href) => {
      const modalContents = this.#preloaded.get(getModalTriggerLinkKey(href));
      modalContainer
        .querySelector('.modal-content-header')
        .replaceChildren(modalContents.header, modalCloseBtn);
      modalContainer
        .querySelector('.modal-content-content')
        .replaceChildren(...modalContents.contents);
      requestIdleCallback(() => loadBlocks(modalContainer));
    };
    const closeModal = () => {
      document.body.style.removeProperty('overflow');
      modalContainer.classList.remove('is-open');
    };
    const onEsc = (ev) => {
      if (ev.key === 'Escape') {
        closeModal();
        document.removeEventListener('keyup', onEsc);
      }
    };
    const openModal = () => {
      document.body.style.overflow = 'hidden';
      modalContainer.classList.add('is-open');
      document.addEventListener('keyup', onEsc, { passive: true });
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (ev) => {
      if (!modalContainer.querySelector('.modal-content').contains(ev.target)) {
        closeModal();
      }
    });

    modalTriggerLinks.forEach((link) => {
      link.addEventListener('mousedown', (ev) => loadModalContent(ev.target.href));
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        openModal();
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
