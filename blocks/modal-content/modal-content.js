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

  #modalContainer;

  #modalCloseBtn;

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
      contents.forEach((block) => {
        block.querySelectorAll('img').forEach((img) => {
          img.loading = 'eager';
        });
      });
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

    return Object.keys(triggerLinks).reduce(
      (tasks, group) => tasks
        .then(() => fetch(getModalsAddress(group)))
        .then((req) => req.text())
        .then((text) => this.#processAndSaveModal(text, group, triggerLinks[group])),
      Promise.resolve(),
    );
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
    this.#modalContainer = this.#block.closest('.modal-content-container');
    this.#modalCloseBtn = this.#block.querySelector(
      'button.modal-content-close',
    );
  }

  #openModal() {
    document.body.style.overflow = 'hidden';
    this.#modalContainer.classList.add('is-open');
  }

  #closeModal() {
    document.body.style.removeProperty('overflow');
    this.#modalContainer.classList.remove('is-open');
  }

  async #loadModalContent(href) {
    const modalContents = this.#preloaded.get(getModalTriggerLinkKey(href));
    this.#modalContainer
      .querySelector('.modal-content-header')
      .replaceChildren(modalContents.header, this.#modalCloseBtn);
    this.#modalContainer
      .querySelector('.modal-content-content')
      .replaceChildren(...modalContents.contents);
    await loadBlocks(this.#modalContainer);
  }

  #initEvents() {
    const modalTriggerLinks = getModalTriggerLinks();
    const onEsc = (ev) => {
      if (ev.key === 'Escape') {
        this.#closeModal();
      }
    };

    this.#modalCloseBtn.addEventListener('click', () => this.#closeModal());
    this.#modalContainer.addEventListener('click', (ev) => {
      if (
        !this.#modalContainer
          .querySelector('.modal-content')
          .contains(ev.target)
      ) {
        this.#closeModal();
      }
    });

    modalTriggerLinks.forEach((link) => {
      let modalLoaded = false;
      link.addEventListener('touchstart', (ev) => {
        modalLoaded = true;
        this.#loadModalContent(ev.target.href);
      });
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        if (modalLoaded) {
          modalLoaded = false;
        } else {
          this.#loadModalContent(ev.target.href);
        }
        this.#openModal();
      });
    });
    document.addEventListener('keyup', onEsc, { passive: true });
  }

  /**
   * load modals so that the browser uses the idle time
   * to download images & blocks ahead of time
   */
  async #loadModals() {
    const modals = [...this.#preloaded.keys()];
    return modals.reduce(
      (promise, modalKey) => promise
        .then(
          () => new Promise((resolve) => {
            requestIdleCallback(() => resolve());
          }),
        )
        .then(() => this.#loadModalContent(modalKey)),
      Promise.resolve(),
    );
  }

  async initialize() {
    this.#decorateModal();
    await this.#preloadModalContents();
    this.#initEvents();
    await this.#loadModals();
    return this;
  }
}

/**
 * @param {HTMLDivElement} block
 */
export default async function decorateModal(block) {
  new Modal(block).initialize();
}
