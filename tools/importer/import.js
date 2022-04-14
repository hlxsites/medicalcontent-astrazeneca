/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console, class-methods-use-this, no-undef */

const location = () => document.querySelector('iframe#contentFrame').contentWindow.location;

const createRelatedFragment = (main, document) => {
  main.querySelectorAll('.related-section').forEach((section) => {
    const data = [['Fragment']];
    const path = location().pathname;
    const hub = (path && path.split('/')[1]) || 'breast-cancer';
    const linkPrefix = `https://medicalcontent.astrazeneca.com/${hub}/`;
    const link = document.createElement('a');
    const title = section.previousSibling;
    if (title && title.previousSibling && title.previousSibling.tagName !== 'HR') {
      section.parentNode.insertBefore(document.createElement('hr'), title);
    }
    const linkSuffix = title && title.textContent.trim().toLowerCase().replace(' ', '-');
    link.href = `${linkPrefix}${linkSuffix}`;
    link.textContent = link.href;
    data.push([[link]]);
    const table = WebImporter.DOMUtils.createTable(data, document);
    section.replaceWith(table);
  });
};

const makeAbsoluteImages = (main) => {
  main.querySelectorAll('img').forEach((img) => {
    if (img.src.startsWith('/')) {
      const u = new URL(img.src, 'http://localhost:3000/');
      img.src = u.toString();
    }
  });
};

const makeAbsoluteLinks = (main) => {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      const u = new URL(a.href, 'https://medicalcontent.astrazeneca.com/');
      a.href = u.toString();
    }
  });
};

function createMetadata(main, document) {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const shortTitle = document.querySelector('h1');
  if (shortTitle) {
    meta['Short Title'] = shortTitle.textContent.trim();
  }

  const desc = document.querySelector('[name="description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const theme = document.querySelector('#root > div')?.classList.item(0).split('-')[0];
  if (theme) {
    meta.Theme = theme;
  }

  // ILD pages have special nav
  const localNav = location(document).pathname.includes('/ild/') ? '/breast-cancer/ild/nav' : '';
  if (localNav) {
    meta['Local Nav'] = localNav;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
}

function createReferenceBlock(main, document) {
  const references = main.querySelectorAll('.references');
  if (references) {
    references.forEach((reference) => {
      const data = [['References']];
      data.push([reference.innerHTML]);
      // reference.querySelectorAll('.reference').forEach((item) => {
      //   data.push([item]);
      // });
      const table = WebImporter.DOMUtils.createTable(data, document);
      reference.replaceWith(table);
      table.parentNode.insertBefore(document.createElement('hr'), table.nextSibling);
    });
  }
}

function createTabBlock(main, document) {
  const modules = main.querySelectorAll('.tabbed-module');
  if (modules) {
    modules.forEach((module) => {
      const h2 = module.querySelector('h2');
      if (h2) {
        module.before(h2);
      }

      const data = [['Tabs']];

      const buttons = module.querySelectorAll('.tabbed-module__tab-btn');
      if (buttons) {
        buttons.forEach((btn) => {
          btn.click(); // enable the corresponding content

          const references = module.querySelector('.references');
          const content = module.querySelector('.base-module__body:nth-of-type(3)');

          data.push([btn.textContent, content ? content.innerHTML : '', references ? references.innerHTML : '']);
        });
      }

      const table = WebImporter.DOMUtils.createTable(data, document);
      table.querySelector('th').setAttribute('colspan', '3');
      module.replaceWith(table);

      const references = table.querySelectorAll('.references');
      if (references) {
        references.forEach((reference) => {
          reference.remove();
        });
      }
    });
  }
}

function createAccordionBlock(main, document) {
  const modules = main.querySelectorAll('.accordion-module');
  if (modules) {
    modules.forEach((module) => {
      const h2 = module.querySelector('h2');
      if (h2) {
        module.before(h2);
      }

      const data = [['Accordion']];

      const details = module.querySelectorAll('details');
      if (details) {
        details.forEach((detail) => {
          const references = detail.querySelector('.references');
          const summary = detail.querySelector('summary.base-module__body p');
          const content = detail.querySelector('div.base-module__body');

          data.push([summary ? summary.textContent : '', content ? content.innerHTML : '', references ? references.innerHTML : '']);
        });
      }

      const table = WebImporter.DOMUtils.createTable(data, document);
      table.querySelector('th').setAttribute('colspan', '3');
      module.replaceWith(table);

      const references = table.querySelectorAll('.references');
      if (references) {
        references.forEach((reference) => {
          reference.remove();
        });
      }
    });
  }
}

function createSliderCTA(main, document) {
  const sliderCTAs = main.querySelectorAll('.slider-cta__item button');
  if (sliderCTAs) {
    sliderCTAs.forEach((sliderCTA) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = `#${sliderCTA.textContent.toLowerCase().replace(/\s/g, '-')}`;
      a.textContent = sliderCTA.textContent;
      p.append(a);
      sliderCTA.replaceWith(p);
    });
  }
}
function createSliderBlock(main, document) {
  const modules = main.querySelectorAll('.slider-module');
  if (modules) {
    modules.forEach((module) => {
      const data = [['Slider']];

      const content = module.querySelector('.base-module');
      data.push([content ? content.innerHTML : '']);

      const table = WebImporter.DOMUtils.createTable(data, document);
      module.replaceWith(table);
    });
  }
}

function createCardsBlock(main, document) {
  main.querySelectorAll('.studies').forEach((module) => {
    module.parentNode.insertBefore(document.createElement('hr'), module);
    module.parentNode.insertBefore(document.createElement('hr'), module.nextSibling);
    const data = [['Cards']];
    module.querySelectorAll(':scope > li').forEach((study) => {
      data.push([[study.innerHTML]]);
    });
    const table = WebImporter.DOMUtils.createTable(data, document);
    module.replaceWith(table);
  });
}

function createDisclaimersBlock(main, document) {
  main.querySelectorAll('.hub-page__constrainer .expander').forEach((module) => {
    module.innerHTML = `<h2>${module.textContent}</h2>`;
    const data = [['Disclaimers']];
    data.push([[...module.children]]);
    data.push([['']]); // todo: fetch disclaimer content
    const table = WebImporter.DOMUtils.createTable(data, document);
    module.replaceWith(table);
  });
}

function restructure(main, document) {
  // move h1 before first module
  const h1 = main.querySelector('h1');
  if (h1) {
    const module = h1.closest('.module');
    if (module) {
      module.before(h1);
      module.remove();
    }
    // section break after h1 on study pages
    if (document.querySelector('.study-page')) {
      h1.parentElement.insertBefore(document.createElement('hr'), h1.nextSibling);
    }
  }

  // remove dynamic elements
  document.querySelector('.breadcrumbs')?.remove();
  document.querySelector('.hero__logo')?.parentNode.remove();

  // const modules = main.querySelectorAll('.module');
  // if (modules) {
  //   // create sections
  //   modules.forEach((h2) => {
  //     const br = document.createElement('br');
  //     h2.parentNode.prepend(br);
  //   });
  // }
}

function fixHeadings(main) {
  const headings = main.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings) {
    headings.forEach((heading) => {
      heading.innerHTML = heading.textContent;
    });
  }
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: ({ document }) => {
    const main = document.body;

    restructure(main, document);
    createRelatedFragment(main, document);
    createTabBlock(main, document);
    createAccordionBlock(main, document);
    createReferenceBlock(main, document);
    createSliderBlock(main, document);
    createSliderCTA(main, document);
    createMetadata(main, document);
    makeAbsoluteImages(main);
    makeAbsoluteLinks(main);
    createCardsBlock(main, document);
    createDisclaimersBlock(main, document);
    fixHeadings(main);

    WebImporter.DOMUtils.remove(main, [
      '.study-page__nav',
      '.study-page__crumbs',
      '.header-module__body',
      '.base-module__back-to-top',
      '.header-module__icons',
      '.study-page__next-prev',
    ]);

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ url }) => new URL(url).pathname.replace(/\/$/, ''),
};
