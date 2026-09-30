# Millennium Hotels Homepage Migration Plan

## Overview
This plan moves the Millennium Hotels homepage (https://www.millenniumhotels.com/) to AEM Edge Delivery Services. The project uses Document Authoring. You asked to migrate one page, so the plan covers only the homepage. Other pages can be added later and will reuse the blocks built here.

## Scope
- **Source page:** https://www.millenniumhotels.com/ (homepage)
- **Target:** the homepage (`/index`) in the Document Authoring project `sheongperk/sheongperk-xscrda-20260930`
- **Included:** page content, block structure, block code and styling, and importing the content
- **Not included for now (can be added later):** migrating the full header and footer, and other pages or templates

## Approach
1. **Project check:** confirm the project type (Document Authoring) and which block library it uses.
2. **Page analysis:** capture the source page and its screenshots. Identify the sections, such as the hero, hotel search or booking widget, destination and hotel cards, offers, loyalty promotion and newsletter. Decide which content stays as plain text and which becomes a block.
3. **Block mapping:** match each part of the page to an existing block (hero, cards, carousel, columns, etc.) or to a new block variant, and record where each one appears on the source page.
4. **Block building:** create or adapt the block code and styling each variant needs, and check that each one works.
5. **Import setup:** write the rules that turn the source page into structured content, including cleanup of unneeded page parts and section breaks.
6. **Content import:** run the import to produce the homepage content, with its images and page metadata.
7. **Preview check:** look at the page in the local preview and compare it with the original for missing content, broken images and layout problems.
8. **Design pass:** match fonts, colors and spacing to the original site.

## Considerations
- **Booking or search widget:** the hotel search on the homepage is dynamic. By default it becomes a placeholder block with a link to the booking flow, not a working search.
- **Carousels and sliders:** these will be authored as carousel-style blocks with every slide included.
- **Bot protection:** if the site blocks automated capture, a fallback capture method will be used.
- **Optional add-on:** a forms migration add-on is available. It is only useful if you want the booking or newsletter form rebuilt as a real form. I'll ask before turning it on.

## Checklist
- [ ] Confirm the project setup and the block library it uses
- [ ] Capture and analyze the homepage (sections, content, screenshots)
- [ ] Identify block variants and decide what stays as plain content and what becomes a block
- [ ] Map each block variant to its location on the source page
- [ ] Build or adapt the block code and styling for each variant
- [ ] Set up the import rules (cleanup, sections, block content)
- [ ] Run the content import for the homepage
- [ ] Check the imported page in the preview (content, images, blocks rendering)
- [ ] Compare the preview with the original page and fix any gaps
- [ ] Apply the design pass (fonts, colors, spacing)
- [ ] Summarize the results and suggest next steps (header and footer, more pages)

## Status
The plan is ready. Running it requires Execute mode. Once you switch, I'll start with the project check and page analysis.
