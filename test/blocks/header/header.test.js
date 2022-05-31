/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: '../../scripts/dummy.html' });

const { buildBlock, decorateBlock, loadBlock } = await import('../../../scripts/scripts.js');

document.head.innerHTML = await readFile({ path: '../../scripts/head.html' });
document.body.innerHTML = await readFile({ path: '../../scripts/body.html' });

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

const headerBlock = buildBlock('header', []);
document.querySelector('header').append(headerBlock);
decorateBlock(headerBlock);
await loadBlock(headerBlock);
await sleep();

describe('Header block', () => {
  it('Hamburger shows and hides nav', async () => {
    const hamburger = document.querySelector('.header .nav-hamburger');
    const nav = document.querySelector('.header .nav');
    expect(hamburger).to.exist;
    expect(nav).to.exist;
    expect(nav.getAttribute('aria-role')).to.equal('navigation');
    hamburger.click();
    expect(nav.getAttribute('aria-expanded')).to.equal('true');
    hamburger.click();
    expect(nav.getAttribute('aria-expanded')).to.equal('false');
  });
});
