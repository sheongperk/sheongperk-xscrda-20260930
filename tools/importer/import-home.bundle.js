/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document: document2 }) {
    const video = element.querySelector(".swiper-slide video, video");
    let videoSrc = video ? video.getAttribute("src") || "" : "";
    if (!videoSrc && video) {
      const source = video.querySelector("source[src]");
      if (source) videoSrc = source.getAttribute("src");
    }
    if (videoSrc && videoSrc.startsWith("/")) {
      videoSrc = `https://www.millenniumhotels.com${videoSrc}`;
    }
    const caption = element.querySelector("a.swiper-title, .swiper-controller a[href]");
    if (!videoSrc && !caption) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (videoSrc) {
      const videoLink = document2.createElement("a");
      videoLink.href = videoSrc;
      videoLink.textContent = videoSrc;
      cells.push([videoLink]);
    }
    const contentCell = [];
    if (caption) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = caption.getAttribute("href") || "/en/";
      a.textContent = caption.textContent.trim();
      p.append(a);
      contentCell.push(p);
    }
    const bookP = document2.createElement("p");
    const bookA = document2.createElement("a");
    bookA.href = "https://www.millenniumhotels.com/en/hotels/";
    bookA.textContent = "Book Now";
    const bookStrong = document2.createElement("strong");
    bookStrong.append(bookA);
    bookP.append(bookStrong);
    contentCell.push(bookP);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-benefits.js
  function parse2(element, { document: document2 }) {
    const bannerImg = element.querySelector(
      ".my-millennium-container__banner img, img.my-millennium-container__banner-img"
    );
    let labels = [...element.querySelectorAll(".my-millennium-container__content-item-title")];
    if (!labels.length) {
      labels = [...element.querySelectorAll(".my-millennium-container__content a[href] > span")];
    }
    const benefitCells = labels.map((label) => {
      const anchor = label.closest("a[href]");
      let icon = label.previousElementSibling;
      while (icon && icon.tagName !== "IMG") icon = icon.previousElementSibling;
      if (!icon && anchor) icon = anchor.querySelector("img");
      const cell = [];
      if (icon) {
        const img = document2.createElement("img");
        img.src = icon.getAttribute("src");
        img.alt = icon.getAttribute("alt") || "";
        cell.push(img);
      }
      const p = document2.createElement("p");
      const text = label.textContent.trim();
      if (anchor) {
        const a = document2.createElement("a");
        a.href = anchor.getAttribute("href");
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-benefits", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-offer.js
  function parse3(element, { document: document2 }) {
    let offers = [...element.querySelectorAll(".offers2__listing-offer")];
    if (!offers.length) offers = [...element.querySelectorAll(":scope > div")];
    const cells = [];
    offers.forEach((offer) => {
      const img = offer.querySelector(".offers2__listing-offer-img img, img");
      const ctx = offer.querySelector(".offers2__listing-offer-ctx") || offer;
      const eyebrow = ctx.querySelector(".offers2__listing-offer-city");
      const titleEl = ctx.querySelector(".offers2__listing-offer-title, h2, h3, h4");
      const titleLink = titleEl ? titleEl.closest("a[href]") : null;
      const ctas = [...ctx.querySelectorAll(".offers2__listing-offer-bottom a[href]")];
      if (!img && !titleEl) return;
      const textCell = [];
      if (eyebrow && eyebrow.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = eyebrow.textContent.trim();
        textCell.push(p);
      }
      if (titleEl) {
        const h3 = document2.createElement("h3");
        const text = titleEl.textContent.trim();
        const href = titleLink && titleLink.getAttribute("href") || ctas[0] && ctas[0].getAttribute("href");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = text;
          h3.append(a);
        } else {
          h3.textContent = text;
        }
        textCell.push(h3);
      }
      ctas.forEach((cta) => {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.trim();
        const strong = document2.createElement("strong");
        strong.append(a);
        p.append(strong);
        textCell.push(p);
      });
      cells.push([img || "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-offer", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-featured.js
  function parse4(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".new-look-hotel-dining__list-item")];
    if (!slides.length) slides = [...element.querySelectorAll(".slick-slide")];
    slides = slides.filter((s) => !s.classList.contains("slick-cloned"));
    const makeP = (text) => {
      const p = document2.createElement("p");
      p.textContent = text;
      return p;
    };
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".new-look-hotel-dining__list-banner img, img");
      const content = slide.querySelector(".new-look-hotel-dining__list-content") || slide;
      const eyebrow = content.querySelector(".new-look-hotel-dining__list-content-tips");
      const titleEl = content.querySelector(".new-look-hotel-dining__list-content-title, h3, h2");
      const detail = content.querySelector(".new-look-hotel-dining__list-content-subtips");
      const desc = content.querySelector(".new-look-hotel-dining__list-content-des");
      const ctas = [...content.querySelectorAll(".new-look-hotel-dining__list-content-foot a[href]")];
      if (!img && !titleEl) return;
      const textCell = [];
      if (eyebrow && eyebrow.textContent.trim()) textCell.push(makeP(eyebrow.textContent.trim()));
      if (titleEl) {
        const h3 = document2.createElement("h3");
        const text = titleEl.textContent.trim();
        const titleLink = titleEl.closest("a[href]");
        if (titleLink) {
          const a = document2.createElement("a");
          a.href = titleLink.getAttribute("href");
          a.textContent = text;
          h3.append(a);
        } else {
          h3.textContent = text;
        }
        textCell.push(h3);
      }
      if (detail && detail.textContent.trim()) {
        textCell.push(makeP(detail.textContent.trim().replace(/\s+/g, " ").replace(/:(\S)/, ": $1")));
      }
      if (desc && desc.textContent.trim()) textCell.push(makeP(desc.textContent.trim()));
      ctas.forEach((cta) => {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.trim();
        const wrap = document2.createElement(cta.classList.contains("book") ? "em" : "strong");
        wrap.append(a);
        p.append(wrap);
        textCell.push(p);
      });
      cells.push([img || "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse5(element, { document: document2 }) {
    const main = element.querySelector(".main-swiper") || element;
    let slides = [...main.querySelectorAll(".swiper-slide.item-outer")];
    if (!slides.length) slides = [...main.querySelectorAll(".item-outer, .swiper-slide")];
    slides = slides.filter((s) => !s.closest(".overlay"));
    let items = slides.filter((s) => !s.classList.contains("swiper-slide-duplicate")).map((s) => ({ slide: s, img: s.querySelector(".image-wrapper img, img.image") })).filter((it) => it.img && it.img.getAttribute("src"));
    if (!items.length) {
      items = slides.map((s) => ({ slide: s, img: s.querySelector(".image-wrapper img, img.image") })).filter((it) => it.img && it.img.getAttribute("src"));
    }
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    items.forEach(({ slide, img }) => {
      const src = img.getAttribute("src");
      if (seen.has(src)) return;
      seen.add(src);
      const image = document2.createElement("img");
      image.src = src;
      image.alt = img.getAttribute("alt") || "";
      const username = slide.querySelector(".username");
      const caption = username && username.textContent.trim() ? (() => {
        const p = document2.createElement("p");
        p.textContent = username.textContent.trim();
        return p;
      })() : "";
      cells.push([image, caption]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/millennium-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // OneTrust cookie consent: <div id="onetrust-consent-sdk">
        "#onetrust-consent-sdk",
        // accessiBe accessibility widget: <access-widget-ui>, <a class="acsb-sr-only">, <div class="acsb-trigger acsb-widget">
        "access-widget-ui",
        ".acsb-sr-only",
        ".acsb-trigger",
        // Hidden popups: <div class="PromoPopup|ReviewPopup|GalleryPopup">, <div class="popupRegion popup-hide">
        ".PromoPopup",
        ".ReviewPopup",
        ".GalleryPopup",
        ".popupRegion",
        // Mobile "collect tips" toast: <div class="mobile collect-tips">
        ".collect-tips",
        // Floating booking bar: <div class="booking-bar">
        ".booking-bar",
        // Inline booking widget form below hero: <div class="widget-booking-hero ...">
        ".widget-booking-hero",
        // Hero "Scroll to Explore" button: <div class="tpl-scrollbutton">
        ".tpl-scrollbutton",
        // Sign-in modal: <div class="mp1-signin-wrapper">
        ".mp1-signin-wrapper",
        // Booking form submit mask: <div class="tpl-full-screen-mask-crs">
        ".tpl-full-screen-mask-crs",
        // Chat messenger widget: <div id="bmb_webview">, <div id="bmb_service_view">, <div id="messenger_avtar">,
        // <div id="bmbmessengerbubble">, <div id="bmb_msg_nudges_container">, <iframe id="messengeriframe">
        "#bmb_webview",
        "#bmb_service_view",
        "#messenger_avtar",
        "#bmbmessengerbubble",
        "#bmb_msg_nudges_container",
        "#messengeriframe",
        // reCAPTCHA bubbles: <div class="g-recaptcha-bubble-arrow">
        ".g-recaptcha-bubble-arrow",
        // Analytics tracking pixel: <img src="https://www.pages03.net/WTS/event.jpeg?...">
        'img[src*="pages03.net"]'
      ]);
      element.querySelectorAll(".my-millennium.home-page-new > .newlook-hotel-configuration-title a.view, .my-millennium.home-page-new > .newlook-hotel-configuration-title a.book").forEach((a) => {
        const p = a.ownerDocument.createElement("p");
        const wrap = a.ownerDocument.createElement(a.classList.contains("book") ? "em" : "strong");
        a.replaceWith(p);
        p.append(wrap);
        wrap.append(a);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header / navigation: <div class="navbar new-design has-notice">
        ".navbar",
        // Footer: <footer id="main-footer-wrapper">
        "#main-footer-wrapper",
        // Empty placeholders: <div id="count-down">, <div id="belowhero">, <div class="mobile-components-wrapper">
        "#count-down",
        "#belowhero",
        ".mobile-components-wrapper",
        // Back-to-top button: <div class="back-to-top">
        ".back-to-top",
        // Tracking / recaptcha iframes, and safe leftovers
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/millennium-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-video": parse,
    "columns-benefits": parse2,
    "cards-offer": parse3,
    "carousel-featured": parse4,
    "carousel-gallery": parse5
  };
  var PAGE_TEMPLATE = {
    "name": "home",
    "description": "Millennium Hotels homepage: hero video, loyalty promo, featured offers, featured hotels and dining carousels, social gallery",
    "urls": [
      "https://www.millenniumhotels.com/"
    ],
    "blocks": [
      {
        "name": "hero-video",
        "instances": [
          "#home-hero"
        ]
      },
      {
        "name": "columns-benefits",
        "instances": [
          ".my-millennium.home-page-new .my-millennium-container"
        ]
      },
      {
        "name": "cards-offer",
        "instances": [
          ".offers2__listing"
        ]
      },
      {
        "name": "carousel-featured",
        "instances": [
          "#home-hotels .new-look-hotel-dining__list",
          "#home-dinings .new-look-hotel-dining__list"
        ]
      },
      {
        "name": "carousel-gallery",
        "instances": [
          ".c-instagram-gallery"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "Hero video",
        "selector": [
          "#home-hero"
        ],
        "style": null,
        "blocks": [
          "hero-video"
        ],
        "defaultContent": []
      },
      {
        "id": "2",
        "name": "MyMillennium loyalty promo",
        "selector": [
          ".my-millennium.home-page-new"
        ],
        "style": null,
        "blocks": [
          "columns-benefits"
        ],
        "defaultContent": [
          ".my-millennium.home-page-new > .newlook-hotel-configuration-title"
        ]
      },
      {
        "id": "3",
        "name": "Featured Offers",
        "selector": [
          "#home-offers",
          ".new-look-hotel-offer.home-page-new"
        ],
        "style": "grey",
        "blocks": [
          "cards-offer"
        ],
        "defaultContent": [
          "#home-offers > .newlook-hotel-configuration-title"
        ]
      },
      {
        "id": "4",
        "name": "Featured Hotels",
        "selector": [
          "#home-hotels"
        ],
        "style": null,
        "blocks": [
          "carousel-featured"
        ],
        "defaultContent": [
          "#home-hotels > .newlook-hotel-configuration-title"
        ]
      },
      {
        "id": "5",
        "name": "Dine With Us",
        "selector": [
          "#home-dinings"
        ],
        "style": "grey",
        "blocks": [
          "carousel-featured"
        ],
        "defaultContent": [
          "#home-dinings > .newlook-hotel-configuration-title"
        ]
      },
      {
        "id": "6",
        "name": "Connect With Us",
        "selector": [
          "#home-gallery",
          ".new-look-hotel__wall.home-page-new"
        ],
        "style": "grey",
        "blocks": [
          "carousel-gallery"
        ],
        "defaultContent": [
          "#home-gallery > .newlook-hotel-configuration-title"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
