/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Millennium Hotels site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (https://www.millenniumhotels.com/).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays, popups and widgets that could interfere with block parsing.
    WebImporter.DOMUtils.remove(element, [
      // OneTrust cookie consent: <div id="onetrust-consent-sdk">
      '#onetrust-consent-sdk',
      // accessiBe accessibility widget: <access-widget-ui>, <a class="acsb-sr-only">, <div class="acsb-trigger acsb-widget">
      'access-widget-ui',
      '.acsb-sr-only',
      '.acsb-trigger',
      // Hidden popups: <div class="PromoPopup|ReviewPopup|GalleryPopup">, <div class="popupRegion popup-hide">
      '.PromoPopup',
      '.ReviewPopup',
      '.GalleryPopup',
      '.popupRegion',
      // Mobile "collect tips" toast: <div class="mobile collect-tips">
      '.collect-tips',
      // Floating booking bar: <div class="booking-bar">
      '.booking-bar',
      // Inline booking widget form below hero: <div class="widget-booking-hero ...">
      '.widget-booking-hero',
      // Hero "Scroll to Explore" button: <div class="tpl-scrollbutton">
      '.tpl-scrollbutton',
      // Sign-in modal: <div class="mp1-signin-wrapper">
      '.mp1-signin-wrapper',
      // Booking form submit mask: <div class="tpl-full-screen-mask-crs">
      '.tpl-full-screen-mask-crs',
      // Chat messenger widget: <div id="bmb_webview">, <div id="bmb_service_view">, <div id="messenger_avtar">,
      // <div id="bmbmessengerbubble">, <div id="bmb_msg_nudges_container">, <iframe id="messengeriframe">
      '#bmb_webview',
      '#bmb_service_view',
      '#messenger_avtar',
      '#bmbmessengerbubble',
      '#bmb_msg_nudges_container',
      '#messengeriframe',
      // reCAPTCHA bubbles: <div class="g-recaptcha-bubble-arrow">
      '.g-recaptcha-bubble-arrow',
      // Analytics tracking pixel: <img src="https://www.pages03.net/WTS/event.jpeg?...">
      'img[src*="pages03.net"]',
    ]);

    // Default-content CTA buttons in the MyMillennium promo:
    // <a class="view">JOIN NOW</a> = primary (strong), <a class="book">Learn more</a> = secondary (em).
    // Each gets its own <p> so decorateButtons (single-child paragraphs only) turns both into buttons.
    element.querySelectorAll('.my-millennium.home-page-new > .newlook-hotel-configuration-title a.view, .my-millennium.home-page-new > .newlook-hotel-configuration-title a.book').forEach((a) => {
      const p = a.ownerDocument.createElement('p');
      const wrap = a.ownerDocument.createElement(a.classList.contains('book') ? 'em' : 'strong');
      a.replaceWith(p);
      p.append(wrap);
      wrap.append(a);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome.
    WebImporter.DOMUtils.remove(element, [
      // Header / navigation: <div class="navbar new-design has-notice">
      '.navbar',
      // Footer: <footer id="main-footer-wrapper">
      '#main-footer-wrapper',
      // Empty placeholders: <div id="count-down">, <div id="belowhero">, <div class="mobile-components-wrapper">
      '#count-down',
      '#belowhero',
      '.mobile-components-wrapper',
      // Back-to-top button: <div class="back-to-top">
      '.back-to-top',
      // Tracking / recaptcha iframes, and safe leftovers
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
