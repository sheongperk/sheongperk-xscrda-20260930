import { createOptimizedPicture } from '../../scripts/aem.js';

let carouselId = 0;

function isLinkOnly(el) {
  if (el.tagName !== 'P') return false;
  const links = el.querySelectorAll('a[href]');
  if (links.length !== 1 || el.querySelector('picture, img')) return false;
  return el.textContent.trim() === links[0].textContent.trim();
}

function buildSlide(row, index) {
  const slide = document.createElement('li');
  slide.className = 'carousel-featured-slide';
  slide.dataset.slideIndex = index;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture, img') && !c.textContent.trim());
  if (imageCell) {
    imageCell.className = 'carousel-featured-slide-image';
    slide.append(imageCell);
  }

  const content = document.createElement('div');
  content.className = 'carousel-featured-slide-content';
  cells.filter((c) => c !== imageCell).forEach((cell) => {
    while (cell.firstChild) content.append(cell.firstChild);
  });

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const first = content.firstElementChild;
    if (first && first !== heading && first.tagName === 'P' && !first.querySelector('a, picture, img')) {
      first.classList.add('carousel-featured-eyebrow');
    }
    slide.setAttribute('aria-label', heading.textContent.trim());
  }

  // group trailing link-only paragraphs (e.g. "view restaurant" + "BOOK A TABLE") into one CTA row
  const ctas = [];
  let last = content.lastElementChild;
  while (last && isLinkOnly(last)) {
    ctas.unshift(last);
    last = last.previousElementSibling;
  }
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'carousel-featured-actions';
    actions.append(...ctas);
    content.append(actions);
  }

  // with 2+ text paragraphs after the heading, the first is a detail line ("Cuisine: ...")
  if (heading) {
    const texts = [];
    let next = heading.nextElementSibling;
    while (next && next.tagName === 'P') {
      texts.push(next);
      next = next.nextElementSibling;
    }
    if (texts.length > 1) texts[0].classList.add('carousel-featured-detail');
    const description = texts.length > 1 ? texts[1] : texts[0];
    if (description) description.classList.add('carousel-featured-description');
  }

  if (content.childElementCount) slide.append(content);
  return slide;
}

function showSlide(block, target) {
  const slides = block.querySelectorAll('.carousel-featured-slide');
  if (!slides.length) return;
  const index = (target + slides.length) % slides.length;
  block.dataset.activeSlide = index;
  const track = block.querySelector('.carousel-featured-slides');
  track.scrollTo({ left: slides[index].offsetLeft, behavior: 'smooth' });
}

function updateActive(block, index) {
  block.dataset.activeSlide = index;
  block.querySelectorAll('.carousel-featured-slide').forEach((slide, i) => {
    const active = i === index;
    slide.setAttribute('aria-hidden', String(!active));
    slide.querySelectorAll('a, button, input, select, textarea').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  const status = block.querySelector('.carousel-featured-status');
  if (status) status.textContent = `${index + 1} / ${block.querySelectorAll('.carousel-featured-slide').length}`;
}

/**
 * loads and decorates the block
 * Each row = one slide: image cell | text cell (eyebrow, heading, description, CTA links).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  carouselId += 1;
  const id = `carousel-featured-${carouselId}`;
  block.id = block.id || id;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');

  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('picture, img'));

  const track = document.createElement('ul');
  track.className = 'carousel-featured-slides';
  rows.forEach((row, i) => track.append(buildSlide(row, i)));

  track.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });

  block.textContent = '';
  block.append(track);

  const count = track.children.length;
  if (count > 1) {
    const nav = document.createElement('div');
    nav.className = 'carousel-featured-navigation';
    nav.innerHTML = `
      <button type="button" class="carousel-featured-prev" aria-controls="${block.id}" aria-label="Previous slide"></button>
      <span class="carousel-featured-status" aria-live="polite"></span>
      <button type="button" class="carousel-featured-next" aria-controls="${block.id}" aria-label="Next slide"></button>`;
    block.append(nav);

    nav.querySelector('.carousel-featured-prev').addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
    });
    nav.querySelector('.carousel-featured-next').addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        updateActive(block, parseInt(entry.target.dataset.slideIndex, 10));
      });
    }, { root: track, threshold: 0.6 });
    track.querySelectorAll('.carousel-featured-slide').forEach((slide) => observer.observe(slide));
  } else {
    block.classList.add('single');
  }

  updateActive(block, 0);
}
