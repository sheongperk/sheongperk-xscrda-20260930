/**
 * Fetches the footer fragment: /content first (local preview), then site root (DA/EDS).
 * @returns {Promise<{root: Element, base: string}|null>} footer sections and their base path
 */
async function fetchFooter() {
  let base = '/content/';
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/footer.plain.html');
  }
  if (!resp.ok) return null;
  const root = document.createElement('div');
  root.innerHTML = await resp.text();
  return { root, base };
}

/**
 * Resolves relative image paths against the folder the fragment was served from.
 * @param {Element} root fragment root
 * @param {string} base base path
 */
function fixImagePaths(root, base) {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) img.setAttribute('src', `${base}${src}`);
    img.loading = 'lazy';
  });
}

/**
 * Groups each heading with the elements that follow it (until the next heading).
 * @param {Element} section section element
 * @param {string} selector heading selector
 * @param {string} className class for each group
 * @returns {Element[]} groups
 */
function groupByHeading(section, selector, className) {
  const groups = [];
  let current = null;
  [...section.children].forEach((el) => {
    if (el.matches(selector)) {
      current = document.createElement('div');
      current.className = className;
      groups.push(current);
      el.before(current);
    }
    if (current) current.append(el);
  });
  return groups;
}

/**
 * Builds the newsletter form from the paragraphs under its heading:
 * field label, button label, consent text.
 * @param {Element} group newsletter group
 */
function buildNewsletter(group) {
  const [fieldText, buttonText, consentText] = [...group.querySelectorAll(':scope > p')];
  if (!fieldText) return;
  const form = document.createElement('form');
  form.className = 'footer-newsletter-form';
  form.noValidate = true;

  const field = document.createElement('div');
  field.className = 'footer-newsletter-field';
  const input = document.createElement('input');
  input.type = 'email';
  input.name = 'email';
  input.id = 'footer-newsletter-email';
  input.placeholder = ' ';
  input.autocomplete = 'email';
  const label = document.createElement('label');
  label.htmlFor = input.id;
  label.textContent = fieldText.textContent.trim();
  field.append(input, label);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'footer-newsletter-submit';
  submit.textContent = buttonText ? buttonText.textContent.trim() : '';
  form.append(field, submit);

  if (consentText) {
    const consent = document.createElement('label');
    consent.className = 'footer-newsletter-consent';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.name = 'consent';
    const text = document.createElement('span');
    text.textContent = consentText.textContent.trim();
    consent.append(box, text);
    form.append(consent);
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    input.reportValidity();
  });
  [fieldText, buttonText, consentText].forEach((p) => p?.remove());
  group.append(form);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const result = await fetchFooter();
  if (!result) return;
  const { root, base } = result;
  fixImagePaths(root, base);

  const names = ['brands', 'member', 'links', 'connect', 'legal'];
  const sections = [...root.children];
  sections.forEach((section, i) => {
    if (names[i]) section.classList.add(`footer-${names[i]}`);
  });

  // brand portfolio: category heading + logo list per column
  const brands = root.querySelector('.footer-brands');
  if (brands) {
    brands.querySelector(':scope > p')?.classList.add('footer-logo');
    const groups = groupByHeading(brands, 'h2, h3', 'footer-brand-group');
    const grid = document.createElement('div');
    grid.className = 'footer-brand-grid';
    groups[0]?.before(grid);
    grid.append(...groups);
  }

  // member logo: first image is the default state, second the hover state
  root.querySelectorAll('.footer-member a').forEach((a) => {
    const imgs = a.querySelectorAll('img');
    if (imgs.length > 1) {
      imgs[0].classList.add('footer-logo-default');
      imgs[1].classList.add('footer-logo-hover');
      imgs[1].alt = '';
    }
  });

  // link columns (collapsible on mobile)
  const links = root.querySelector('.footer-links');
  if (links) {
    groupByHeading(links, 'h2, h3, h4', 'footer-column').forEach((column, i) => {
      const heading = column.querySelector('h2, h3, h4');
      const list = column.querySelector('ul');
      if (!heading || !list) return;
      list.id = `footer-column-${i + 1}`;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'footer-column-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', list.id);
      toggle.append(...heading.childNodes);
      heading.append(toggle);
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        // one column open at a time, as on the source
        links.querySelectorAll('.footer-column-toggle').forEach((t) => t.setAttribute('aria-expanded', 'false'));
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  // follow + newsletter
  const connect = root.querySelector('.footer-connect');
  if (connect) {
    const groups = groupByHeading(connect, 'h2, h3, h4', 'footer-connect-group');
    groups.forEach((group) => {
      if (group.querySelector(':scope > p')) {
        group.classList.add('footer-newsletter');
        buildNewsletter(group);
      } else {
        group.classList.add('footer-follow');
        group.querySelectorAll('a').forEach((a) => {
          a.target = '_blank';
          a.rel = 'noopener';
          a.setAttribute('aria-label', a.querySelector('img')?.alt || a.textContent.trim());
        });
      }
    });
  }

  // legal bar: legal links, copyright, badges
  const legal = root.querySelector('.footer-legal');
  if (legal) {
    const [legalList, badgeList] = legal.querySelectorAll(':scope > ul');
    legalList?.classList.add('footer-legal-links');
    badgeList?.classList.add('footer-badges');
    legal.querySelector(':scope > p')?.classList.add('footer-copyright');
    const info = document.createElement('div');
    info.className = 'footer-legal-info';
    legalList?.before(info);
    info.append(...[legalList, legal.querySelector('.footer-copyright')].filter(Boolean));
    badgeList?.querySelectorAll('a').forEach((a) => {
      if (/^https?:/.test(a.getAttribute('href'))) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
    });
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'footer-inner';
  wrapper.append(...sections);
  block.replaceChildren(wrapper);
}
