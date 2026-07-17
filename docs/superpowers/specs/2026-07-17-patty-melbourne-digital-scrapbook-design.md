# Patty's Melbourne Farewell Scrapbook — Design Specification

**Date:** 17 July 2026

**Status:** Approved design awaiting written-spec review

**Project:** `weloveupatty.com`

## 1. Purpose

Create a final, production-quality digital scrapbook as a farewell gift for Patty after four years in Melbourne. The site celebrates Patty's friendships, love, memories, and lived experience in Melbourne through contributions from 15 friends.

The result must feel like a real handmade physical scrapbook brought to life on a screen. It must not feel like a conventional website with scrapbook-themed decoration added afterward.

## 2. Non-negotiable experience goals

The experience must be:

- personal, warm, artistic, nostalgic, playful, and emotional;
- intentionally imperfect, with beautiful controlled chaos;
- visually rich and tactile on both desktop and mobile;
- centered entirely on Patty, her friends, and Melbourne;
- made from unique contribution compositions rather than repeated cards;
- discoverable through page turning, layered objects, envelopes, notes, and tucked-away details.

Avoid perfect grids, identical cards, uniform spacing, corporate layout conventions, pristine alignment, generic testimonial patterns, or a simplified mobile card feed.

## 3. Approved visual direction

Use the approved **Melbourne Memory Table** direction from the original visual preview.

### Desktop

The viewport feels like an open scrapbook resting on a warm table. Two album pages form each spread. Photos, notes, tape, stamps, tickets, doodles, receipts, and Melbourne fragments overlap with varied rotations and uneven spacing. A visible center binding, page edges, subtle paper grain, and restrained shadows provide depth.

### Mobile

The viewport feels like a scrapbook held in Patty's hands. It shows one fully composed page at a time. Pages preserve the same layers, paper treatments, decorations, and emotional density as desktop. The layout is recomposed for portrait space rather than flattened into a vertical list.

### Material treatment

Retain the original preview's warm illustrated-handmade treatment. Use handcrafted CSS for paper tones, modest texture, tape, shadows, rotations, folds, and page depth. Do not use the later photorealistic PBR texture experiments, AI-generated material contact sheet, stock-photo mockups, planet-like mottling, heavy grunge, or muddy surface scans.

Content photos are replaceable placeholders until the real photos are supplied.

### Palette

- sun-aged cream and warm album paper;
- warm wood brown around the book;
- muted tram blue;
- faded Melbourne postmark red;
- ticket mustard;
- restrained eucalyptus green;
- dark brown ink rather than pure black.

### Typography

Use a small self-hosted set of complementary typefaces:

- expressive handwriting for personal notes and captions;
- a warm editorial serif for large emotional headings;
- a restrained typewriter face for stamps, tickets, receipts, and metadata.

Typography may rotate and overlap with objects, but all messages must remain legible. Long messages receive a dedicated enlarged reading view.

## 4. Story and page sequence

The scrapbook follows a physical book sequence:

1. A closed cover titled **“We Love You, Patty.”**
2. An opening page that frames the gift and Patty's four years in Melbourne.
3. Fifteen friend-contribution pages, art-directed as eight desktop spreads.
4. A closing page that turns farewell into an ongoing expression of friendship rather than a final goodbye.

One contribution may use a full desktop spread when its message or photo set benefits from the space. The other contribution pages are paired into two-page desktop spreads. On mobile, every contribution remains its own single, richly composed page.

The final order is defined in the content source and can be changed without editing components.

## 5. Contribution compositions

Every contribution includes:

- the friend's name;
- one or more photos of that friend with Patty;
- a personal wish, message, or shared memory.

Fifteen layout identifiers provide deliberately distinct treatments:

1. taped Polaroid cluster;
2. folded handwritten letter;
3. airmail envelope with tucked photo;
4. torn notebook memory;
5. photobooth strip and annotations;
6. tram-ticket collage;
7. laneway coffee receipt and photo;
8. Melbourne map foldout feature spread;
9. handwritten postcard;
10. pressed-flower journal page;
11. film-negative and contact-sheet composition;
12. layered sticky-note conversation;
13. diary-entry page with margin doodles;
14. event-ticket and photo collage;
15. final love-letter contribution.

These layouts share one material and typography system but do not share a repetitive card shell. Each layout has a desktop composition and a mobile composition that express the same identity.

## 6. Interaction design

### Cover and page turns

- The experience begins with a closed cover.
- Opening the cover reveals the first spread.
- Desktop supports outer-corner click, drag gestures, visible previous/next controls, and left/right keyboard arrows.
- Mobile supports horizontal swipes and visible accessible controls.
- Page turns use layered paper movement, changing edge shadows, and a glimpse of the next page.
- Motion must feel tactile and restrained, not like a flashy 3D page-flip demo.
- With reduced motion enabled, page changes use a gentle fade and depth change while preserving all controls.

### Discoverable objects

- Envelopes, folded letters, and tucked notes expose clear hover, focus, or touch cues.
- Tapping an object opens or unfolds it.
- Long messages open in a paper-styled enlarged reading view.
- Closing the reading view returns focus and scroll position to the originating object.
- Decorative elements never block essential text or interactive targets.

### Navigation and progress

Navigation should look integrated into the scrapbook rather than like application chrome. Small page-edge tabs, corner cues, or a bookmark can communicate progress. There is no conventional header navigation or footer.

## 7. Responsive composition rules

Responsive behavior is art-directed rather than merely scaled.

- Desktop uses open spreads with two adjacent pages and a visible binding.
- Tablet may use a reduced two-page spread when space allows, then switch to one page before readability suffers.
- Mobile uses a one-page portrait deck with the same layered materials and contribution identity.
- Each layout owns explicit desktop and mobile positioning rules.
- Rotation, overlap, and spacing may change per breakpoint.
- Content order and message meaning remain identical.
- Reading views adapt to the viewport and never require tiny text or awkward zooming.
- Touch targets remain at least 44 by 44 CSS pixels even when the visible control looks handwritten or irregular.

## 8. Technical foundation

Use:

- React;
- Vite;
- TypeScript;
- Tailwind CSS v4 for responsive primitives and shared design tokens;
- handcrafted CSS for the scrapbook's physical surfaces, irregular geometry, page turns, and composition-specific styling.

The site is a static single-page experience. It needs no backend, database, router, CMS, authentication, or global state library. Deployment remains under the user's control.

Use a minimal dependency set. Implement page state and open-note state with local React state. Prefer native pointer events, CSS transforms, and the Web Animations API over a page-flip dependency unless implementation evidence shows a small dependency materially improves accessibility and stability.

## 9. Source-of-truth content model

All replaceable content lives in `src/content/scrapbook.ts`.

The file exports one typed `scrapbook` object containing:

- site title and metadata;
- opening copy;
- closing copy;
- the ordered array of 15 contributions.

Each contribution has this shape:

```ts
type ContributionPhoto = {
  src: string | null;
  alt: string;
  caption?: string;
  focalPoint?: "top" | "center" | "bottom";
};

type Contribution = {
  id: string;
  friendName: string;
  message: string;
  photos: [ContributionPhoto, ...ContributionPhoto[]];
  layout: ContributionLayout;
  accent: "tram-blue" | "postmark-red" | "ticket-mustard" | "eucalyptus";
  melbourneDetail?: string;
  location?: string;
  year?: string;
};
```

`src: null` intentionally renders a labelled scrapbook-style photo placeholder. Replacing a photo requires adding the file under `public/photos`, setting its path, and updating its alt text and optional caption in this same object.

The content file contains all ordering and layout selections. Components contain rendering behavior, not personal copy.

## 10. Component boundaries

- `App`: loads the content object and renders the scrapbook experience.
- `Scrapbook`: owns the cover/open state and current logical page.
- `PageTurner`: handles pointer, touch, button, keyboard, and reduced-motion transitions.
- `SpreadRenderer`: pairs pages for desktop and selects the current single page on mobile.
- `ContributionPage`: delegates to the selected layout implementation.
- `layouts/*`: 15 focused contribution compositions with paired desktop/mobile CSS.
- `PhotoFrame`: renders an image, caption, focal point, and missing-image fallback.
- `OpenableNote`: renders folded letters, envelopes, and accessible expanded reading views.
- `ReadingView`: focus-managed modal/dialog presentation for long content.
- `ScrapbookControls`: accessible previous/next controls styled as physical page cues.
- `decorations/*`: shared stamps, tape, tickets, doodles, and paper fragments.

Layout components receive typed contribution data and remain independent from navigation state.

## 11. Data flow and state

1. `App` imports the typed `scrapbook` object.
2. A deterministic page builder combines the opening, contribution order, full-spread selection, and closing page.
3. `Scrapbook` tracks the current page and whether the cover is open.
4. `SpreadRenderer` derives the visible desktop spread or mobile page.
5. A contribution layout receives only its content plus the current responsive mode.
6. `OpenableNote` reports its open/closed state locally and presents `ReadingView` when needed.

No user content is fetched at runtime. There are no loading spinners for data and no persistence requirements.

## 12. Accessibility

- Page-turn controls are real buttons with clear accessible names.
- Arrow keys navigate pages when focus is outside an open dialog.
- Swipe is never the only navigation method.
- Contribution content has a meaningful linear DOM order independent of visual overlap.
- Every real photo requires useful alt text in the content file.
- Decorative objects are hidden from assistive technology.
- Open notes use semantic buttons and dialogs with focus trapping, Escape support, and focus restoration.
- Text maintains sufficient contrast against its paper surface.
- Reduced-motion preferences remove large page rotation and parallax.
- Visible focus treatments fit the scrapbook style without disappearing.

## 13. Error and edge-case handling

- A missing or failed photo renders the intentional labelled placeholder rather than a broken-image icon.
- An unusually long message shows a readable excerpt on the page and the complete text in `ReadingView`; content is never silently truncated.
- Very long names use a smaller handwritten scale within a bounded label rather than overflowing.
- TypeScript makes invalid layout identifiers and accent values build errors.
- If a future unrecognized layout reaches runtime, use the torn-letter composition as a safe fallback.
- Navigation ignores repeated gestures while a page turn is settling, preventing skipped pages or corrupted state.
- Resizing preserves the current logical contribution instead of jumping to a different spread.

## 14. Performance

- Render the current page or spread plus adjacent pages needed for the turn animation.
- Preload current and next-page photos; lazy-load later photos.
- Use transforms and opacity for movement; apply `will-change` only while animating.
- Self-host the selected fonts and avoid runtime font-network dependencies.
- Keep decorative CSS and assets reusable rather than duplicating them per contribution.
- Recommend optimized JPEG or WebP contribution photos around 1600 pixels on the long edge.
- Avoid the abandoned high-resolution texture asset pack and large PBR files.

## 15. Privacy and metadata

The site is unlisted, not authenticated.

- Add `noindex, nofollow` search-engine metadata.
- Add a `robots.txt` rule disallowing crawling.
- Do not generate a sitemap.
- Clearly document that unlisted is not private: anyone with the URL can view the site.
- Do not add a fake front-end password screen.

## 16. Verification strategy

The user explicitly requested no unit tests. Do not create unit-test files or introduce a unit-test framework.

Verification consists of:

- TypeScript compilation and a clean production build;
- linting where configured;
- desktop and mobile visual checks against the approved original preview;
- cover opening and page-turn checks using buttons, keyboard, drag, and swipe;
- envelope/note opening, Escape closing, focus trapping, and focus restoration checks;
- reduced-motion checks;
- missing-image placeholder checks;
- long-message, long-name, and narrow-screen checks;
- checks that all 15 contributions are reachable and visually distinct;
- confirmation that the production output contains unlisted metadata and no external content dependencies.

## 17. Out of scope

- deployment or hosting work;
- authentication or password protection;
- a content-management system;
- friend submission forms or uploads;
- backend persistence;
- analytics;
- background music or autoplay audio;
- generated or stock photos pretending to show Patty and her friends;
- the discarded photorealistic material experiments;
- unit tests.

## 18. Acceptance criteria

The implementation is complete when:

- it reads immediately as a physical handmade scrapbook rather than a themed website;
- the approved original Melbourne Memory Table style is preserved;
- the cover and physical page-turn experience work on desktop and mobile;
- mobile remains layered, tactile, irregular, rich, and discovery-driven;
- all 15 unique contributions are driven by one typed content source;
- every contribution supports a name, one or more photos, and a complete message;
- photo and text placeholders are obvious and easy to replace;
- no contribution appears as a repeated profile/testimonial card;
- accessibility, error fallbacks, responsive behavior, and reduced motion work as specified;
- the production build succeeds without unit tests;
- the site is configured as unlisted; and
- no deployment is performed.
