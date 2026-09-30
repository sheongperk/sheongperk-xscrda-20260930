/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-featured. Base: carousel.
 * Source: https://www.millenniumhotels.com/
 *   (#home-hotels .new-look-hotel-dining__list, #home-dinings .new-look-hotel-dining__list)
 * Generated: 2026-09-30
 *
 * Block structure (2 columns), one row per slide (slick clones skipped):
 *   Cell 1: image
 *   Cell 2: eyebrow p, h3 (linked when source title is linked), optional detail p
 *           (e.g. "Cuisine: ..."), description p, CTA link(s)
 *
 * Handles both instance shapes:
 *   - hotels: plain h3 title, description in a div, single "Discover Now" CTA
 *   - dinings: h3 wrapped in <a>, subtips p, description p wrapped in <a>, two CTAs
 */
export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.new-look-hotel-dining__list-item')];
  if (!slides.length) slides = [...element.querySelectorAll('.slick-slide')];
  // Skip slick clone slides (duplicates added for infinite looping)
  slides = slides.filter((s) => !s.classList.contains('slick-cloned'));

  const makeP = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  const cells = [];
  slides.forEach((slide) => {
    const img = slide.querySelector('.new-look-hotel-dining__list-banner img, img');
    const content = slide.querySelector('.new-look-hotel-dining__list-content') || slide;
    const eyebrow = content.querySelector('.new-look-hotel-dining__list-content-tips');
    const titleEl = content.querySelector('.new-look-hotel-dining__list-content-title, h3, h2');
    const detail = content.querySelector('.new-look-hotel-dining__list-content-subtips');
    const desc = content.querySelector('.new-look-hotel-dining__list-content-des');
    const ctas = [...content.querySelectorAll('.new-look-hotel-dining__list-content-foot a[href]')];

    if (!img && !titleEl) return;

    const textCell = [];
    if (eyebrow && eyebrow.textContent.trim()) textCell.push(makeP(eyebrow.textContent.trim()));
    if (titleEl) {
      const h3 = document.createElement('h3');
      const text = titleEl.textContent.trim();
      const titleLink = titleEl.closest('a[href]');
      if (titleLink) {
        const a = document.createElement('a');
        a.href = titleLink.getAttribute('href');
        a.textContent = text;
        h3.append(a);
      } else {
        h3.textContent = text;
      }
      textCell.push(h3);
    }
    if (detail && detail.textContent.trim()) {
      // "Cuisine:" label and value are separate spans in the source - keep a space between them
      textCell.push(makeP(detail.textContent.trim().replace(/\s+/g, ' ').replace(/:(\S)/, ': $1')));
    }
    if (desc && desc.textContent.trim()) textCell.push(makeP(desc.textContent.trim()));
    ctas.forEach((cta) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim();
      // Source a.book = secondary button (em), a.view = primary button (strong)
      const wrap = document.createElement(cta.classList.contains('book') ? 'em' : 'strong');
      wrap.append(a);
      p.append(wrap);
      textCell.push(p);
    });

    cells.push([img || '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-featured', cells });
  element.replaceWith(block);
}
