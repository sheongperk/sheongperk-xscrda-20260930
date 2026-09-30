import { createOptimizedPicture } from '../../scripts/aem.js';

let galleryId = 0;

function buildItem(row) {
  const li = document.createElement('li');
  li.className = 'carousel-gallery-item';

  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture, img'));
  if (imageCell) {
    const media = document.createElement('div');
    media.className = 'carousel-gallery-item-image';
    const link = imageCell.querySelector('a');
    const pic = imageCell.querySelector('picture') || imageCell.querySelector('img');
    // keep an image that is wrapped in a link clickable
    media.append(link && link.contains(pic) ? link : pic);
    li.append(media);
  }

  const caption = document.createElement('div');
  caption.className = 'carousel-gallery-item-caption';
  cells.forEach((cell) => {
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
      if (node.nodeType === Node.ELEMENT_NODE && node.matches('picture, img')) return;
      caption.append(node);
    });
  });
  if (caption.textContent.trim()) li.append(caption);
  return li;
}

function updateButtons(block) {
  const track = block.querySelector('.carousel-gallery-slides');
  const prev = block.querySelector('.carousel-gallery-prev');
  const next = block.querySelector('.carousel-gallery-next');
  if (!track || !prev || !next) return;
  const max = track.scrollWidth - track.clientWidth - 1;
  prev.disabled = track.scrollLeft <= 0;
  next.disabled = track.scrollLeft >= max;
}

/**
 * loads and decorates the block
 * Each row = one gallery item: image cell, optional caption cell (e.g. username).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  galleryId += 1;
  block.id = block.id || `carousel-gallery-${galleryId}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');

  const track = document.createElement('ul');
  track.className = 'carousel-gallery-slides';
  [...block.children]
    .filter((row) => row.textContent.trim() || row.querySelector('picture, img'))
    .forEach((row) => track.append(buildItem(row)));

  // only same-origin (EDS media) images go through the optimizer: third-party feed/CDN urls
  // (e.g. social-wall proxies) would lose their own query params and get unsupported ones added
  track.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    if (new URL(img.src, window.location.href).origin !== window.location.origin) {
      picture.querySelectorAll('source').forEach((source) => source.remove());
      img.loading = 'lazy';
      return;
    }
    picture.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.textContent = '';
  block.append(track);

  if (track.children.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'carousel-gallery-navigation';
    nav.innerHTML = `
      <button type="button" class="carousel-gallery-prev" aria-controls="${block.id}" aria-label="Previous images"></button>
      <button type="button" class="carousel-gallery-next" aria-controls="${block.id}" aria-label="Next images"></button>`;
    block.append(nav);

    const step = (dir) => {
      const item = track.querySelector('.carousel-gallery-item');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const itemWidth = item ? item.getBoundingClientRect().width + gap : track.clientWidth;
      const perView = Math.max(1, Math.round((track.clientWidth + gap) / itemWidth));
      track.scrollBy({ left: dir * perView * itemWidth, behavior: 'smooth' });
    };
    nav.querySelector('.carousel-gallery-prev').addEventListener('click', () => step(-1));
    nav.querySelector('.carousel-gallery-next').addEventListener('click', () => step(1));

    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateButtons(block);
        ticking = false;
      });
    }, { passive: true });
    window.addEventListener('resize', () => updateButtons(block));
    requestAnimationFrame(() => updateButtons(block));
  }
}
