import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the block
 * Each row = one offer: image cell | text cell (eyebrow, title, CTA).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-offer-card';

    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img') && !c.textContent.trim());
    const bodyCells = cells.filter((c) => c !== imageCell);

    if (imageCell) {
      imageCell.className = 'cards-offer-card-image';
      li.append(imageCell);
    }

    const body = document.createElement('div');
    body.className = 'cards-offer-card-body';
    bodyCells.forEach((cell) => {
      while (cell.firstChild) body.append(cell.firstChild);
    });

    // first plain paragraph before the heading acts as the eyebrow
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const first = body.firstElementChild;
      if (first && first !== heading && first.tagName === 'P'
        && !first.querySelector('a, picture, img')) {
        first.classList.add('cards-offer-eyebrow');
      }
    }

    if (body.textContent.trim() || body.querySelector('a')) li.append(body);
    if (li.childElementCount) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });

  if (ul.childElementCount > 1) block.classList.add('multi');
  block.textContent = '';
  block.append(ul);
}
