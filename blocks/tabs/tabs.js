import { loadBlocks } from '../../scripts/scripts.js';

/**
 * @param {NodeListOf<Element>} modalTriggers
 */
function cleanupPreviousModalTriggers(modalTriggers) {
  const modalTriggerParents = new Set();
  modalTriggers.forEach((triggerLink) => {
    modalTriggerParents.add(triggerLink.parentElement);
    triggerLink.remove();
  });
  modalTriggerParents.forEach((parent) => {
    if (!parent.hasChildNodes()) {
      parent.remove();
    }
  });
}

/**
 * @param {HTMLDivElement} block
 */
function decorateModalTriggers(block) {
  const tabs = block.querySelectorAll('.tabs-tab');

  tabs.forEach((tab) => {
    const modalTriggers = tab.querySelectorAll('a[href^="bookmark://modals/"]');
    const modalTriggersCopy = [...modalTriggers].map((trigger) => trigger.cloneNode(true));

    const container = document.createElement('div');
    container.className = 'modal-triggers block';
    container.dataset.blockName = 'modal-triggers';
    container.append(...modalTriggersCopy);

    tab.querySelector('.tabs-tab-content').append(container);
    cleanupPreviousModalTriggers(modalTriggers);
  });
}

/**
 * @param {HTMLDivElement} block
 */
function decorateBlock(block) {
  block.classList.add('references-container');
}

function decorateTabs(block) {
  const tabs = [...block.querySelectorAll(':scope > div')];
  tabs.forEach((tab, idx) => {
    tab.classList.add('tabs-tab');
    if (idx > 0) {
      tab.classList.add('tabs-tab-hidden');
    }
    tab.dataset.tab = idx + 1;

    tab
      .querySelector(':scope > div:nth-child(2)')
      .classList.add('tabs-tab-content');
    tab.querySelector(':scope > div:last-child').classList.add('references');
  });
}

/**
 * @param {HTMLDivElement} block
 */
function createTabsMenu(block) {
  const tabs = [...block.querySelectorAll(':scope > div.tabs-tab')];
  const tabsBtn = tabs.map((tab) => tab.querySelector(':scope > div'));

  const tabsMenu = document.createElement('div');
  tabsMenu.className = 'tabs-menu';
  tabsBtn.forEach((tab, idx) => {
    const btn = document.createElement('button');
    btn.classList.add('tabs-menu-button');
    if (idx === 0) {
      btn.classList.add('tabs-menu-button-active');
    }
    btn.innerText = tab.innerText;
    btn.dataset.tab = idx + 1;
    tabsMenu.appendChild(btn);
  });
  block.prepend(tabsMenu);
}

function initEvents(block) {
  const buttons = block.querySelectorAll('button.tabs-menu-button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => {
        btn.classList.remove('tabs-menu-button-active');
      });
      button.classList.add('tabs-menu-button-active');
      const tabId = button.dataset.tab;
      block.querySelectorAll('div.tabs-tab').forEach((tab) => {
        tab.classList.add('tabs-tab-hidden');
        if (tab.dataset.tab === tabId) {
          tab.classList.remove('tabs-tab-hidden');
        }
      });
    });
  });
}

/**
 * load the references block if not loaded
 * @param {HTMLDivElement} block
 */
function decorateReferences(block) {
  const referencesBlock = block.querySelector('.references');
  referencesBlock.dataset.blockName = 'references';
}

export default async function initializeTabs(block) {
  decorateBlock(block);
  decorateTabs(block);
  createTabsMenu(block);
  decorateModalTriggers(block);
  decorateReferences(block);
  initEvents(block);
  return loadBlocks(document.querySelector('main'));
}
