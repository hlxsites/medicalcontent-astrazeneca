/**
 * @param {HTMLDivElement} block 
 */
function createTabsMenu(block) {
  const tabs = [...block.querySelectorAll(":scope > div")];
  const tabsBtn = tabs.map((tab) => tab.querySelector(":scope > div"));

  const tabsMenu = document.createElement("div");
  tabsMenu.className = "tabs-menu";
  tabsBtn.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = "tabs-menu-button";
    btn.innerText = tab.innerText;
    tabsMenu.appendChild(btn);
  });
  block.prepend(tabsMenu);
}

export default async function decorateTabs(block, blockName, doc, isEager) {
  createTabsMenu(block);
}
