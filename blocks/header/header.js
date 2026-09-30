const DESKTOP = window.matchMedia('(width >= 1200px)');

/**
 * Fetches the nav fragment: /content first (local preview), then site root (DA/EDS).
 * @returns {Promise<{root: Element, base: string}|null>} nav sections and their base path
 */
async function fetchNav() {
  let base = '/content/';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/nav.plain.html');
  }
  if (!resp.ok) return null;
  const root = document.createElement('div');
  root.innerHTML = await resp.text();
  return { root, base };
}

/**
 * Resolves relative image paths in the fragment against the folder it was served from.
 * @param {Element} root fragment root
 * @param {string} base base path for relative images
 */
function fixImagePaths(root, base) {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', `${base}${src}`);
    }
  });
}

function closeAll(nav, except) {
  nav.querySelectorAll('[aria-expanded="true"]').forEach((btn) => {
    if (btn !== except) btn.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Text of a list item without its nested list.
 * @param {Element} li list item
 * @returns {string}
 */
function ownText(li) {
  return [...li.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ')
    .trim();
}

/**
 * Builds a dropdown toggle from a tools list item that holds a nested list.
 * @param {Element} li tools list item
 * @param {Element} nav nav element
 */
function buildDropdown(li, nav) {
  const panel = li.querySelector(':scope > ul');
  const label = ownText(li);
  const icon = li.querySelector(':scope > img');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-tool-toggle';
  btn.setAttribute('aria-expanded', 'false');
  if (icon) btn.append(icon);
  const text = document.createElement('span');
  text.className = 'nav-tool-label';
  text.textContent = label;
  btn.append(text);
  const hasChevron = panel.querySelectorAll(':scope > li').length > 1;
  if (hasChevron) {
    const chevron = document.createElement('span');
    chevron.className = 'nav-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    btn.append(chevron);
  }
  panel.classList.add('nav-dropdown');
  const items = [...panel.querySelectorAll(':scope > li')];
  items.forEach((item) => item.classList.add('nav-option'));
  if (items.some((item) => item.querySelector('img'))) panel.classList.add('nav-dropdown-grid');
  if (items.length === 1 && !items[0].querySelector('a, img')) panel.classList.add('nav-dropdown-note');
  if (panel.classList.length === 1) panel.classList.add('nav-dropdown-list');

  // mark the current selection (matching code or language prefix)
  const current = items.find((item) => {
    const t = item.textContent.trim().toUpperCase();
    return t === label.toUpperCase() || t.slice(0, 2) === label.toUpperCase();
  });
  if (current && items.length > 1) current.classList.add('active');

  // selectable (non-link) options update the toggle label
  items.forEach((item) => {
    if (item.querySelector('a') || items.length < 2) return;
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    const select = () => {
      items.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');
      text.textContent = item.textContent.trim();
      btn.setAttribute('aria-expanded', 'false');
    };
    item.addEventListener('click', select);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select();
      }
    });
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = btn.getAttribute('aria-expanded') === 'true';
    closeAll(nav, btn);
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
  });
  li.classList.add('nav-tool-dropdown');
  [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).forEach((n) => n.remove());
  li.prepend(btn);
}

/**
 * Builds the search bar + suggestions panel from the search section and wires its toggle.
 * @param {Element} section search section from the fragment
 * @param {Element} li tools item that opens search
 * @param {Element} nav nav element
 */
function buildSearch(section, li, nav) {
  const placeholder = section.querySelector('p')?.textContent.trim() || '';
  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  form.action = '/en/search/';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder || 'Search');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-search-close';
  close.setAttribute('aria-label', 'Close search');
  form.append(input, close);

  const suggestions = document.createElement('div');
  suggestions.className = 'nav-search-suggestions';
  [...section.children].filter((el) => el.tagName !== 'P').forEach((el) => suggestions.append(el));
  section.replaceChildren(form, suggestions);

  const label = ownText(li) || li.textContent.trim();
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-tool-toggle nav-search-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'nav-search');
  btn.innerHTML = `<span class="nav-tool-label">${label}</span>`;
  li.replaceChildren(btn);
  section.id = 'nav-search';

  const setOpen = (open) => {
    nav.classList.toggle('search-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) input.focus();
  };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAll(nav, btn);
    setOpen(!nav.classList.contains('search-open'));
  });
  close.addEventListener('click', () => setOpen(false));
  section.addEventListener('click', (e) => e.stopPropagation());
}

/**
 * Toggles the mobile menu.
 * @param {Element} nav nav element
 * @param {boolean} [force] force open/closed
 */
function toggleMenu(nav, force) {
  const open = typeof force === 'boolean' ? force : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  const hamburger = nav.querySelector('.nav-hamburger button');
  hamburger?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = open && !DESKTOP.matches ? 'hidden' : '';
}

/**
 * Finds the tools dropdown a drawer row stands for: by label, by icon alt text,
 * or else the first selectable dropdown not yet claimed.
 * @param {string} label drawer row label
 * @param {Element[]} dropdowns tools dropdown items
 * @param {Set<Element>} claimed dropdowns already mapped
 * @returns {Element|undefined}
 */
function matchDropdown(label, dropdowns, claimed) {
  const key = label.toLowerCase();
  const byText = dropdowns.find((d) => !claimed.has(d)
    && (d.querySelector('.nav-tool-label')?.textContent.trim().toLowerCase() === key
      || d.querySelector('.nav-tool-toggle img')?.alt.toLowerCase() === key));
  if (byText) return byText;
  return dropdowns.find((d) => !claimed.has(d) && d.querySelector('.nav-chevron'));
}

/**
 * Builds the mobile drawer (and mobile bar actions) from the mobile section.
 * @param {Element} nav nav element
 * @param {Element} drawer mobile section from the fragment
 */
function buildMobile(nav, drawer) {
  drawer.classList.add('nav-drawer');
  drawer.id = 'nav-drawer';

  // bar actions: last paragraph link (booking CTA) + search icon
  const actions = document.createElement('div');
  actions.className = 'nav-mobile-actions';
  const cta = [...drawer.querySelectorAll(':scope > p')].pop();
  if (cta?.querySelector('a')) {
    const link = cta.querySelector('a');
    link.className = 'nav-book';
    actions.append(link);
    cta.remove();
  }
  const searchToggle = nav.querySelector('.nav-search-toggle');
  if (searchToggle) {
    const icon = document.createElement('button');
    icon.type = 'button';
    icon.className = 'nav-search-icon';
    icon.setAttribute('aria-label', searchToggle.textContent.trim());
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      searchToggle.click();
    });
    actions.append(icon);
  }
  nav.querySelector('.nav-brand')?.after(actions);

  // close button
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-drawer-close';
  close.setAttribute('aria-label', 'Close navigation');
  close.addEventListener('click', () => toggleMenu(nav, false));

  // profile: paragraphs before the menu list
  const menu = drawer.querySelector(':scope > ul');
  const profile = document.createElement('div');
  profile.className = 'nav-drawer-profile';
  const children = [...drawer.children];
  const menuIndex = menu ? children.indexOf(menu) : -1;
  children.filter((el, i) => el.tagName === 'P' && i < menuIndex)
    .forEach((p) => profile.append(p));

  // switch block: heading + following paragraphs
  const heading = drawer.querySelector(':scope > h2, :scope > h3');
  const switcher = document.createElement('div');
  switcher.className = 'nav-drawer-switch';
  if (heading) {
    let next = heading.nextElementSibling;
    switcher.append(heading);
    while (next && next.tagName === 'P') {
      const after = next.nextElementSibling;
      switcher.append(next);
      next = after;
    }
  }

  // menu rows: links navigate, text rows open a sub-panel with the matching tool dropdown
  const dropdowns = [...nav.querySelectorAll('.nav-tool-dropdown')];
  const claimed = new Set();
  const panels = [];
  menu?.classList.add('nav-drawer-menu');
  menu?.querySelectorAll(':scope > li').forEach((li) => {
    li.classList.add('nav-drawer-item');
    if (li.querySelector('a')) return;
    const label = li.textContent.trim();
    const tool = matchDropdown(label, dropdowns, claimed);
    if (!tool) return;
    claimed.add(tool);
    const toolLabel = tool.querySelector('.nav-tool-label');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'nav-drawer-row';
    row.innerHTML = '<span class="nav-drawer-row-label"></span><span class="nav-drawer-row-value"></span>';
    row.querySelector('.nav-drawer-row-label').textContent = label;
    const value = row.querySelector('.nav-drawer-row-value');
    const hasValue = !!tool.querySelector('.nav-chevron');
    if (hasValue) value.textContent = toolLabel.textContent.trim();
    li.replaceChildren(row);

    const panel = document.createElement('div');
    panel.className = 'nav-drawer-panel';
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'nav-drawer-back';
    back.textContent = label;
    const source = tool.querySelector('.nav-dropdown');
    const options = source.cloneNode(true);
    options.className = 'nav-drawer-options';
    options.querySelectorAll('li').forEach((opt, i) => {
      opt.addEventListener('click', () => {
        source.children[i]?.click();
        options.querySelectorAll('li').forEach((o) => o.classList.remove('active'));
        opt.classList.add('active');
        if (hasValue) value.textContent = toolLabel.textContent.trim();
      });
    });
    panel.append(back, options);
    panels.push(panel);
    row.addEventListener('click', () => panel.classList.add('open'));
    back.addEventListener('click', () => panel.classList.remove('open'));
  });

  drawer.replaceChildren(close, profile, ...(menu ? [menu] : []), switcher, ...panels);

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.addEventListener('click', () => toggleMenu(nav, false));
  drawer.after(backdrop);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const result = await fetchNav();
  if (!result) return;
  const { root: fragment, base } = result;
  fixImagePaths(fragment, base);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.setAttribute('aria-expanded', 'false');
  const sections = [...fragment.children];
  const classes = ['brand', 'sections', 'tools', 'search', 'mobile'];
  sections.forEach((section, i) => {
    if (classes[i]) section.classList.add(`nav-${classes[i]}`);
    nav.append(section);
  });

  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink) brandLink.setAttribute('aria-label', brandLink.querySelector('img')?.alt || 'Home');

  const tools = nav.querySelector('.nav-tools');
  const search = nav.querySelector('.nav-search');
  if (tools) {
    tools.querySelectorAll(':scope > ul > li').forEach((li) => {
      li.classList.add('nav-tool');
      if (li.querySelector(':scope > ul')) buildDropdown(li, nav);
      else if (!li.querySelector('a') && search) buildSearch(search, li, nav);
    });
  }

  // hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);

  const mobile = nav.querySelector('.nav-mobile');
  if (mobile) buildMobile(nav, mobile);

  document.addEventListener('click', () => closeAll(nav));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAll(nav);
    nav.classList.remove('search-open');
    nav.querySelector('.nav-search-toggle')?.setAttribute('aria-expanded', 'false');
  });

  // reset open states when crossing the desktop breakpoint
  DESKTOP.addEventListener('change', () => {
    closeAll(nav);
    toggleMenu(nav, false);
    nav.classList.remove('search-open');
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}
