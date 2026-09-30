/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Base: hero.
 * Source: https://www.millenniumhotels.com/ (#home-hero)
 * Generated: 2026-09-30
 *
 * Block structure (1 column):
 *   Row 1: link to the .mp4 video (source swiper slides are duplicates - collapsed to one)
 *   Row 2: paragraph links - caption link + "Book Now" CTA (placeholder for booking widget)
 */
export default function parse(element, { document }) {
  // Video: first <video> (duplicate swiper slides all point to the same file)
  const video = element.querySelector('.swiper-slide video, video');
  let videoSrc = video ? (video.getAttribute('src') || '') : '';
  if (!videoSrc && video) {
    const source = video.querySelector('source[src]');
    if (source) videoSrc = source.getAttribute('src');
  }
  if (videoSrc && videoSrc.startsWith('/')) {
    videoSrc = `https://www.millenniumhotels.com${videoSrc}`;
  }

  // Caption link ("Your next adventure awaits")
  const caption = element.querySelector('a.swiper-title, .swiper-controller a[href]');

  if (!videoSrc && !caption) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  if (videoSrc) {
    const videoLink = document.createElement('a');
    videoLink.href = videoSrc;
    videoLink.textContent = videoSrc;
    cells.push([videoLink]);
  }

  const contentCell = [];
  if (caption) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = caption.getAttribute('href') || '/en/';
    a.textContent = caption.textContent.trim();
    p.append(a);
    contentCell.push(p);
  }
  // Booking widget is not migratable - represented by a "Book Now" CTA placeholder
  const bookP = document.createElement('p');
  const bookA = document.createElement('a');
  bookA.href = 'https://www.millenniumhotels.com/en/hotels/';
  bookA.textContent = 'Book Now';
  // Primary CTA button
  const bookStrong = document.createElement('strong');
  bookStrong.append(bookA);
  bookP.append(bookStrong);
  contentCell.push(bookP);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
