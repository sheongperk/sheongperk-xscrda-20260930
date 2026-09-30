import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

function isVideoUrl(href) {
  return typeof href === 'string' && VIDEO_EXT.test(href);
}

function videoType(href) {
  return /\.webm(\?|#|$)/i.test(href) ? 'video/webm' : 'video/mp4';
}

/**
 * Builds a muted, looping, inline background video.
 * @param {string} src video url
 * @param {Element} [poster] optional poster image
 * @returns {HTMLVideoElement}
 */
function buildVideo(src, poster) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'metadata');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  if (poster?.src) video.setAttribute('poster', poster.src);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    video.autoplay = true;
    video.setAttribute('autoplay', '');
  }

  const source = document.createElement('source');
  source.src = src;
  source.type = videoType(src);
  video.append(source);

  if (!reduceMotion) {
    video.addEventListener('canplay', () => {
      video.muted = true;
      video.play().catch(() => {});
    }, { once: true });
  }
  return video;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Media row: the first row that holds a video link or an image.
  const mediaRow = rows.find((row) => {
    const link = row.querySelector('a[href]');
    return (link && isVideoUrl(link.href)) || row.querySelector('picture, img');
  });

  const media = document.createElement('div');
  media.className = 'hero-video-media';

  if (mediaRow) {
    const link = [...mediaRow.querySelectorAll('a[href]')].find((a) => isVideoUrl(a.href));
    const img = mediaRow.querySelector('img');
    if (link) {
      media.append(buildVideo(link.href, img));
    } else if (img) {
      media.append(createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]));
    }
  }

  // Everything else becomes the caption / CTA content.
  const content = document.createElement('div');
  content.className = 'hero-video-content';
  rows.filter((row) => row !== mediaRow).forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  block.textContent = '';
  if (media.childElementCount) block.append(media);
  if (content.textContent.trim() || content.querySelector('a, img')) block.append(content);
}
