/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-gallery. Base: carousel.
 * Source: https://www.millenniumhotels.com/ (.c-instagram-gallery)
 * Generated: 2026-09-30
 *
 * Block structure (2 columns), one row per social image:
 *   Cell 1: square image
 *   Cell 2: caption paragraph (username)
 *
 * Source notes:
 *   - Only the main swiper (.main-swiper) is used; the hidden .overlay-swiper
 *     (lightbox with long post text) is ignored.
 *   - Swiper loop duplicates (.swiper-slide-duplicate) are skipped, and images
 *     are de-duplicated by src.
 *   - Slides without a loaded image (lazy feed) are skipped.
 */
export default function parse(element, { document }) {
  const main = element.querySelector('.main-swiper') || element;
  let slides = [...main.querySelectorAll('.swiper-slide.item-outer')];
  if (!slides.length) slides = [...main.querySelectorAll('.item-outer, .swiper-slide')];
  // Skip overlay (lightbox) slides if the fallback scope picked them up
  slides = slides.filter((s) => !s.closest('.overlay'));

  let items = slides
    .filter((s) => !s.classList.contains('swiper-slide-duplicate'))
    .map((s) => ({ slide: s, img: s.querySelector('.image-wrapper img, img.image') }))
    .filter((it) => it.img && it.img.getAttribute('src'));

  // Fallback: if every image sits in a duplicate slide, use all slides
  if (!items.length) {
    items = slides
      .map((s) => ({ slide: s, img: s.querySelector('.image-wrapper img, img.image') }))
      .filter((it) => it.img && it.img.getAttribute('src'));
  }

  const seen = new Set();
  const cells = [];
  items.forEach(({ slide, img }) => {
    const src = img.getAttribute('src');
    if (seen.has(src)) return;
    seen.add(src);

    const image = document.createElement('img');
    image.src = src;
    image.alt = img.getAttribute('alt') || '';

    const username = slide.querySelector('.username');
    const caption = username && username.textContent.trim()
      ? (() => {
        const p = document.createElement('p');
        p.textContent = username.textContent.trim();
        return p;
      })()
      : '';

    cells.push([image, caption]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
