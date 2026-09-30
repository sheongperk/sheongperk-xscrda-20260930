/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-offer. Base: cards.
 * Source: https://www.millenniumhotels.com/ (.offers2__listing)
 * Generated: 2026-09-30
 *
 * Block structure (2 columns), one row per offer:
 *   Cell 1: image
 *   Cell 2: eyebrow paragraph, linked h3 title, CTA link
 */
export default function parse(element, { document }) {
  let offers = [...element.querySelectorAll('.offers2__listing-offer')];
  if (!offers.length) offers = [...element.querySelectorAll(':scope > div')];

  const cells = [];
  offers.forEach((offer) => {
    const img = offer.querySelector('.offers2__listing-offer-img img, img');
    const ctx = offer.querySelector('.offers2__listing-offer-ctx') || offer;
    const eyebrow = ctx.querySelector('.offers2__listing-offer-city');
    const titleEl = ctx.querySelector('.offers2__listing-offer-title, h2, h3, h4');
    const titleLink = titleEl ? titleEl.closest('a[href]') : null;
    const ctas = [...ctx.querySelectorAll('.offers2__listing-offer-bottom a[href]')];

    if (!img && !titleEl) return;

    const textCell = [];
    if (eyebrow && eyebrow.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = eyebrow.textContent.trim();
      textCell.push(p);
    }
    if (titleEl) {
      const h3 = document.createElement('h3');
      const text = titleEl.textContent.trim();
      const href = (titleLink && titleLink.getAttribute('href'))
        || (ctas[0] && ctas[0].getAttribute('href'));
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        h3.append(a);
      } else {
        h3.textContent = text;
      }
      textCell.push(h3);
    }
    ctas.forEach((cta) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim();
      // Primary CTA button (source: a.wgt-sqbutton-golden)
      const strong = document.createElement('strong');
      strong.append(a);
      p.append(strong);
      textCell.push(p);
    });

    cells.push([img || '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-offer', cells });
  element.replaceWith(block);
}
