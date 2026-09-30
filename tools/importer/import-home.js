/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoParser from "./parsers/hero-video.js";
import columnsBenefitsParser from "./parsers/columns-benefits.js";
import cardsOfferParser from "./parsers/cards-offer.js";
import carouselFeaturedParser from "./parsers/carousel-featured.js";
import carouselGalleryParser from "./parsers/carousel-gallery.js";

// TRANSFORMER IMPORTS
import millenniumCleanupTransformer from "./transformers/millennium-cleanup.js";
import millenniumSectionsTransformer from "./transformers/millennium-sections.js";

// PARSER REGISTRY
const parsers = {
  "hero-video": heroVideoParser,
  "columns-benefits": columnsBenefitsParser,
  "cards-offer": cardsOfferParser,
  "carousel-featured": carouselFeaturedParser,
  "carousel-gallery": carouselGalleryParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  millenniumCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [millenniumSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name (beforeTransform or afterTransform)
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section break markers
    executeTransformers("beforeTransform", main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers("afterTransform", main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement("hr");
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path - root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, "")
      .replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
