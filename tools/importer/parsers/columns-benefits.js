/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-benefits. Base: columns.
 * Source: https://www.millenniumhotels.com/ (.my-millennium.home-page-new .my-millennium-container)
 * Generated: 2026-09-30
 *
 * Block structure:
 *   Row 1: single cell - banner image (block JS detects a single-cell image-only first row)
 *   Row 2: one cell per benefit - icon image + linked label
 *
 * Iteration note: benefits are sibling <a> elements sharing the same href, which the
 * importer's inline-merge preprocessing can fold into one anchor. Iterate the inner
 * label spans instead and read the href from the closest anchor.
 */
export default function parse(element, { document }) {
  const bannerImg = element.querySelector(
    '.my-millennium-container__banner img, img.my-millennium-container__banner-img',
  );

  // Iterate inner label spans (safe against anchor merging)
  let labels = [...element.querySelectorAll('.my-millennium-container__content-item-title')];
  if (!labels.length) {
    labels = [...element.querySelectorAll('.my-millennium-container__content a[href] > span')];
  }

  const benefitCells = labels.map((label) => {
    const anchor = label.closest('a[href]');
    // icon image is the preceding sibling img of the label
    let icon = label.previousElementSibling;
    while (icon && icon.tagName !== 'IMG') icon = icon.previousElementSibling;
    if (!icon && anchor) icon = anchor.querySelector('img');

    const cell = [];
    if (icon) {
      const img = document.createElement('img');
      img.src = icon.getAttribute('src');
      img.alt = icon.getAttribute('alt') || '';
      cell.push(img);
    }
    const p = document.createElement('p');
    const text = label.textContent.trim();
    if (anchor) {
      const a = document.createElement('a');
      a.href = anchor.getAttribute('href');
      a.textContent = text;
      p.append(a);
    } else {
      p.textContent = text;
    }
    cell.push(p);
    return cell;
  });

  if (!bannerImg && !benefitCells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bannerImg) cells.push([bannerImg]);
  if (benefitCells.length) cells.push(benefitCells);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-benefits', cells });
  element.replaceWith(block);
}
