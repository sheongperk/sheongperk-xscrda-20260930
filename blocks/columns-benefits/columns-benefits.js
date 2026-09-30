import { createOptimizedPicture } from '../../scripts/aem.js';

function isBannerRow(row) {
  const cells = [...row.children];
  return cells.length === 1
    && !!cells[0].querySelector('picture, img')
    && !cells[0].textContent.trim();
}

function optimize(container, eager, width) {
  container.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, eager, [{ width }]);
    img.closest('picture').replaceWith(pic);
  });
}

/**
 * loads and decorates the block
 * Row 1 (optional): single cell with a banner image.
 * Following rows: one cell per benefit (icon + linked label).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const bannerRow = rows.length && isBannerRow(rows[0]) ? rows[0] : null;

  const banner = document.createElement('div');
  banner.className = 'columns-benefits-banner';
  if (bannerRow) {
    const pic = bannerRow.querySelector('picture') || bannerRow.querySelector('img');
    banner.append(pic);
    optimize(banner, false, '2000');
  }

  const list = document.createElement('ul');
  list.className = 'columns-benefits-list';
  rows.filter((row) => row !== bannerRow).forEach((row) => {
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) return;
      const li = document.createElement('li');
      li.className = 'columns-benefits-item';
      const icon = cell.querySelector('picture') || cell.querySelector('img');
      if (icon && icon.closest('a')) {
        // icon is part of the link itself: keep it in place, just mark it
        icon.classList.add('columns-benefits-icon');
      } else if (icon) {
        const iconWrap = document.createElement('span');
        iconWrap.className = 'columns-benefits-icon';
        // unwrap an icon that sits alone inside its own paragraph
        const iconParent = icon.parentElement;
        iconWrap.append(icon);
        if (iconParent !== cell && iconParent.tagName === 'P' && !iconParent.textContent.trim()
          && !iconParent.children.length) iconParent.remove();
        li.append(iconWrap);
      }
      const label = document.createElement('div');
      label.className = 'columns-benefits-label';
      while (cell.firstChild) label.append(cell.firstChild);
      // benefit links are text links, not buttons
      // (this project's decorateButtons wraps bold/italic links in p.button-wrapper)
      label.querySelectorAll('.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
      label.querySelectorAll('.button-wrapper, .button-container').forEach((p) => p.classList.remove('button-wrapper', 'button-container'));
      if (label.textContent.trim()) li.append(label);
      list.append(li);
    });
  });
  optimize(list, false, '96');

  block.textContent = '';
  if (banner.childElementCount) block.append(banner);
  else block.classList.add('no-banner');
  if (list.childElementCount) {
    list.style.setProperty('--benefit-count', list.childElementCount);
    block.append(list);
  }
}
