# Patty's Melbourne Farewell Scrapbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality, unlisted digital farewell scrapbook for Patty with a physical page-turning experience, 15 unique friend contributions, and equally rich desktop and mobile compositions.

**Architecture:** A static React/Vite application reads one typed scrapbook content object and converts it into an ordered page deck. A responsive page engine renders either two-page desktop spreads or one-page mobile compositions, while recipe-driven layout files art-direct all 15 contributions without repeating a card shell. Shared paper, decoration, photo, note, dialog, and navigation components keep the experience accessible and maintainable.

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS v4, handcrafted CSS, native pointer events, native `<dialog>`, self-hosted Fontsource packages, npm.

**Verification policy:** The user explicitly prohibited unit tests. Do not install a unit-test framework or create unit-test files. Use TypeScript compilation, production builds, and focused desktop/mobile interaction checks instead.

**Approved visual guardrail:** Preserve the original “Melbourne Memory Table” direction: warm, illustrated-handmade CSS materials with controlled chaos. Do not introduce the later discarded photorealistic/PBR paper experiments, generic cartoon asset packs, pristine card grids, or a simplified mobile feed. Desktop must feel like an album opened on a table; mobile must feel like the same album held in the hands.

---

## File map

### Project foundation

- `package.json` — scripts and production/development dependencies.
- `package-lock.json` — exact dependency lock.
- `index.html` — document shell, title, description, and unlisted metadata.
- `vite.config.ts` — React and Tailwind Vite plugins.
- `tsconfig.json` — strict TypeScript configuration.
- `public/robots.txt` — crawler exclusion for the unlisted site.
- `src/main.tsx` — application entry and self-hosted font imports.
- `src/App.tsx` — connects the content source to the scrapbook experience.

### Content and page model

- `src/content/types.ts` — content, layout, accent, and photo types.
- `src/content/scrapbook.ts` — the single source of truth for all replaceable copy, photos, order, and layouts.
- `src/scrapbook/pageModel.ts` — deterministic mobile pages and desktop spread derivation.

### Scrapbook engine

- `src/scrapbook/Scrapbook.tsx` — cover state, active page, keyboard navigation, and main composition.
- `src/scrapbook/PageTurner.tsx` — pointer gesture surface and page-turn animation state.
- `src/scrapbook/SpreadRenderer.tsx` — desktop spread versus mobile page rendering.
- `src/scrapbook/usePageTurner.ts` — navigation state, transition lock, and responsive stepping.
- `src/scrapbook/useResponsiveMode.ts` — reactive desktop/mobile mode.
- `src/scrapbook/useSwipeGesture.ts` — drag progress and swipe threshold behavior.
- `src/scrapbook/useAdjacentImagePreload.ts` — preloads current and adjacent photos.

### Shared components

- `src/components/Cover.tsx` — closed scrapbook cover.
- `src/components/OpeningPage.tsx` — opening dedication.
- `src/components/ClosingPage.tsx` — final farewell page.
- `src/components/PhotoFrame.tsx` — real image, caption, focal point, and missing-image fallback.
- `src/components/OpenableNote.tsx` — tactile trigger for letters, envelopes, and notes.
- `src/components/ReadingView.tsx` — accessible enlarged message dialog.
- `src/components/ScrapbookControls.tsx` — previous/next controls and progress bookmark.
- `src/components/Decoration.tsx` — CSS-native tape, stamp, ticket, receipt, flower, film, map, and doodle pieces.

### Contribution layouts

- `src/layouts/types.ts` — responsive placement and layout recipe types.
- `src/layouts/ContributionLayout.tsx` — generic renderer for art-directed recipes.
- `src/layouts/index.ts` — exhaustive layout recipe registry and safe fallback.
- `src/layouts/recipes/*.ts` — 15 focused composition recipes, one per contribution style.

### Styling and documentation

- `src/styles/index.css` — Tailwind import and stylesheet ordering.
- `src/styles/tokens.css` — palette, type, shadow, spacing, and motion tokens.
- `src/styles/materials.css` — table, album, paper, tape, stamp, ticket, envelope, and photo surfaces.
- `src/styles/scrapbook.css` — cover, binding, page deck, controls, and responsive shell.
- `src/styles/layouts.css` — contribution piece variants and responsive canvas rules.
- `src/styles/accessibility.css` — focus, dialog, screen-reader, and reduced-motion behavior.
- `README.md` — content replacement, photo preparation, local development, build, and unlisted-site notes.

---

### Task 1: Establish the React, Vite, TypeScript, and Tailwind foundation

**Files:**

- Create: `package.json`
- Create: `package-lock.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `public/robots.txt`
- Create: `src/vite-env.d.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/index.css`

- [ ] **Step 1: Initialize npm metadata**

Run:

```bash
npm init -y
```

Expected: `package.json` is created without a `test` script being used by this project.

- [ ] **Step 2: Install the runtime dependencies and self-hosted fonts**

Run:

```bash
npm install react react-dom @fontsource/caveat @fontsource/dm-serif-display @fontsource/special-elite
```

Expected: dependencies are added to `package.json` and `package-lock.json` is created.

- [ ] **Step 3: Install the minimal build dependencies**

Run:

```bash
npm install --save-dev vite typescript @vitejs/plugin-react tailwindcss @tailwindcss/vite @types/react @types/react-dom
```

Expected: Vite, TypeScript, React types, and Tailwind's Vite plugin appear under `devDependencies`; no unit-test dependency is installed.

- [ ] **Step 4: Define the package scripts**

Run:

```bash
npm pkg set type=module
npm pkg set scripts.dev=vite
npm pkg set "scripts.build=tsc --noEmit && vite build"
npm pkg set "scripts.preview=vite preview"
npm pkg delete scripts.test
```

Expected: `package.json` exposes only `dev`, `build`, and `preview` scripts.

- [ ] **Step 5: Add Vite and TypeScript configuration**

Create `vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "noUncheckedIndexedAccess": true
  },
  "include": ["src", "vite.config.ts"]
}
```

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 6: Add the unlisted document shell and crawler rules**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <meta
      name="description"
      content="A handmade digital scrapbook celebrating Patty's four years in Melbourne."
    />
    <meta name="theme-color" content="#3f3028" />
    <title>We Love You, Patty</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `public/robots.txt`:

```text
User-agent: *
Disallow: /
```

- [ ] **Step 7: Add the first renderable application shell**

Create `src/main.tsx`:

```tsx
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/600.css";
import "@fontsource/caveat/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/special-elite/400.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("The #root application element is missing.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#3f3028] p-6 text-[#f4ead8]">
      <h1 className="font-serif text-5xl">We Love You, Patty</h1>
    </main>
  );
}
```

Create `src/styles/index.css`:

```css
@import "tailwindcss";

:root {
  font-family: "Special Elite", ui-monospace, monospace;
  color: #342a25;
  background: #3f3028;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-width: 320px;
  min-height: 100%;
  margin: 0;
}

button,
dialog {
  font: inherit;
}
```

- [ ] **Step 8: Verify the clean foundation**

Run:

```bash
npm run build
```

Expected: TypeScript succeeds and Vite writes a production bundle to `dist/`.

- [ ] **Step 9: Commit the foundation**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json index.html public/robots.txt src
git commit -m "chore: establish scrapbook app foundation"
```

---

### Task 2: Create the typed single source of truth and page model

**Files:**

- Create: `src/content/types.ts`
- Create: `src/content/scrapbook.ts`
- Create: `src/scrapbook/pageModel.ts`

- [ ] **Step 1: Define the complete content types**

Create `src/content/types.ts`:

```ts
export const layoutIds = [
  "map-foldout",
  "taped-polaroids",
  "folded-letter",
  "airmail-envelope",
  "torn-notebook",
  "photobooth-strip",
  "tram-ticket",
  "coffee-receipt",
  "postcard",
  "pressed-flower",
  "film-negative",
  "sticky-notes",
  "diary-entry",
  "event-ticket",
  "final-love-letter",
] as const;

export type ContributionLayout = (typeof layoutIds)[number];

export const accentIds = [
  "tram-blue",
  "postmark-red",
  "ticket-mustard",
  "eucalyptus",
] as const;

export type ContributionAccent = (typeof accentIds)[number];
export type PhotoFocalPoint = "top" | "center" | "bottom";

export type ContributionPhoto = {
  src: string | null;
  alt: string;
  caption?: string;
  focalPoint?: PhotoFocalPoint;
};

export type Contribution = {
  id: string;
  friendName: string;
  message: string;
  photos: readonly [ContributionPhoto, ...ContributionPhoto[]];
  layout: ContributionLayout;
  accent: ContributionAccent;
  melbourneDetail?: string;
  location?: string;
  year?: string;
};

export type ScrapbookContent = {
  title: string;
  subtitle: string;
  opening: {
    eyebrow: string;
    title: string;
    message: string;
  };
  closing: {
    title: string;
    message: string;
    signature: string;
  };
  contributions: readonly Contribution[];
};
```

- [ ] **Step 2: Create the complete 15-contribution placeholder source**

Create `src/content/scrapbook.ts`:

```ts
import type { ContributionPhoto, ScrapbookContent } from "./types";

function photo(
  friendNumber: number,
  photoNumber: number,
  overrides: Partial<ContributionPhoto> = {},
): ContributionPhoto {
  const friend = String(friendNumber).padStart(2, "0");
  const item = String(photoNumber).padStart(2, "0");

  return {
    src: null,
    alt: `Replace with photo ${item} of Friend ${friend} together with Patty`,
    caption: `Replace with a caption for photo ${item}`,
    focalPoint: "center",
    ...overrides,
  };
}

export const scrapbook = {
  title: "We Love You, Patty",
  subtitle: "Four years in Melbourne, and a lifetime of people who love you.",
  opening: {
    eyebrow: "Melbourne · four unforgettable years",
    title: "This city was better with you in it.",
    message:
      "Fifteen friends left you photographs, memories, wishes, and little pieces of Melbourne. Turn the pages slowly — this was made with all our love.",
  },
  closing: {
    title: "Never really goodbye.",
    message:
      "Melbourne will always carry traces of you, and every one of us carries a piece of the life we shared here. Wherever you go next, you take our love with you.",
    signature: "All of us, always",
  },
  contributions: [
    {
      id: "friend-01",
      friendName: "Friend 01",
      message: "Replace this with Friend 01's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(1, 1), photo(1, 2), photo(1, 3)],
      layout: "map-foldout",
      accent: "tram-blue",
      melbourneDetail: "Our Melbourne map",
      location: "Melbourne CBD",
      year: "2022–2026",
    },
    {
      id: "friend-02",
      friendName: "Friend 02",
      message: "Replace this with Friend 02's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(2, 1), photo(2, 2)],
      layout: "taped-polaroids",
      accent: "postmark-red",
      melbourneDetail: "One perfect Melbourne day",
    },
    {
      id: "friend-03",
      friendName: "Friend 03",
      message: "Replace this with Friend 03's longer handwritten-letter message for Patty.",
      photos: [photo(3, 1)],
      layout: "folded-letter",
      accent: "eucalyptus",
      melbourneDetail: "Keep this letter",
    },
    {
      id: "friend-04",
      friendName: "Friend 04",
      message: "Replace this with Friend 04's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(4, 1), photo(4, 2)],
      layout: "airmail-envelope",
      accent: "tram-blue",
      melbourneDetail: "MEL → wherever comes next",
    },
    {
      id: "friend-05",
      friendName: "Friend 05",
      message: "Replace this with Friend 05's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(5, 1), photo(5, 2)],
      layout: "torn-notebook",
      accent: "ticket-mustard",
      melbourneDetail: "A page from the best years",
    },
    {
      id: "friend-06",
      friendName: "Friend 06",
      message: "Replace this with Friend 06's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(6, 1), photo(6, 2), photo(6, 3)],
      layout: "photobooth-strip",
      accent: "postmark-red",
      melbourneDetail: "Three frames, too many laughs",
    },
    {
      id: "friend-07",
      friendName: "Friend 07",
      message: "Replace this with Friend 07's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(7, 1), photo(7, 2)],
      layout: "tram-ticket",
      accent: "tram-blue",
      melbourneDetail: "Tram 86 · valid forever",
    },
    {
      id: "friend-08",
      friendName: "Friend 08",
      message: "Replace this with Friend 08's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(8, 1), photo(8, 2)],
      layout: "coffee-receipt",
      accent: "ticket-mustard",
      melbourneDetail: "Two flat whites and one very long chat",
    },
    {
      id: "friend-09",
      friendName: "Friend 09",
      message: "Replace this with Friend 09's postcard message and favourite Melbourne memory with Patty.",
      photos: [photo(9, 1)],
      layout: "postcard",
      accent: "postmark-red",
      melbourneDetail: "Wish you could stay",
    },
    {
      id: "friend-10",
      friendName: "Friend 10",
      message: "Replace this with Friend 10's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(10, 1), photo(10, 2)],
      layout: "pressed-flower",
      accent: "eucalyptus",
      melbourneDetail: "A little piece of spring",
    },
    {
      id: "friend-11",
      friendName: "Friend 11",
      message: "Replace this with Friend 11's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(11, 1), photo(11, 2), photo(11, 3)],
      layout: "film-negative",
      accent: "tram-blue",
      melbourneDetail: "The moments between the moments",
    },
    {
      id: "friend-12",
      friendName: "Friend 12",
      message: "Replace this with Friend 12's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(12, 1), photo(12, 2)],
      layout: "sticky-notes",
      accent: "ticket-mustard",
      melbourneDetail: "Things we never want to forget",
    },
    {
      id: "friend-13",
      friendName: "Friend 13",
      message: "Replace this with Friend 13's diary-style memory and farewell message for Patty.",
      photos: [photo(13, 1), photo(13, 2)],
      layout: "diary-entry",
      accent: "eucalyptus",
      melbourneDetail: "Dear diary: Patty made today better",
    },
    {
      id: "friend-14",
      friendName: "Friend 14",
      message: "Replace this with Friend 14's personal wish, shared memory, or farewell message for Patty.",
      photos: [photo(14, 1), photo(14, 2)],
      layout: "event-ticket",
      accent: "postmark-red",
      melbourneDetail: "Admit two · one unforgettable night",
    },
    {
      id: "friend-15",
      friendName: "Friend 15",
      message: "Replace this with Friend 15's final love-letter contribution and farewell wish for Patty.",
      photos: [photo(15, 1), photo(15, 2)],
      layout: "final-love-letter",
      accent: "tram-blue",
      melbourneDetail: "Open whenever you miss us",
    },
  ],
} as const satisfies ScrapbookContent;
```

- [ ] **Step 3: Build deterministic pages and desktop spreads**

Create `src/scrapbook/pageModel.ts`:

```ts
import type { Contribution, ScrapbookContent } from "../content/types";

export type OpeningPage = {
  id: "opening";
  kind: "opening";
  content: ScrapbookContent["opening"];
};

export type ContributionPage = {
  id: string;
  kind: "contribution";
  contribution: Contribution;
};

export type ClosingPage = {
  id: "closing";
  kind: "closing";
  content: ScrapbookContent["closing"];
};

export type ScrapbookPage = OpeningPage | ContributionPage | ClosingPage;

export type DesktopSpread = {
  index: number;
  pages: readonly [ScrapbookPage] | readonly [ScrapbookPage, ScrapbookPage];
};

export function buildPages(content: ScrapbookContent): ScrapbookPage[] {
  if (content.contributions.length !== 15) {
    throw new Error(
      `The scrapbook requires exactly 15 contributions; received ${content.contributions.length}.`,
    );
  }

  const ids = new Set(content.contributions.map((item) => item.id));

  if (ids.size !== content.contributions.length) {
    throw new Error("Every contribution id must be unique.");
  }

  return [
    { id: "opening", kind: "opening", content: content.opening },
    ...content.contributions.map(
      (contribution): ContributionPage => ({
        id: contribution.id,
        kind: "contribution",
        contribution,
      }),
    ),
    { id: "closing", kind: "closing", content: content.closing },
  ];
}

export function buildDesktopSpreads(
  pages: readonly ScrapbookPage[],
): DesktopSpread[] {
  const opening = pages[0];

  if (!opening || opening.kind !== "opening") {
    throw new Error("The first scrapbook page must be the opening page.");
  }

  const spreads: DesktopSpread[] = [{ index: 0, pages: [opening] }];
  const remaining = pages.slice(1);

  for (let index = 0; index < remaining.length; index += 2) {
    const left = remaining[index];
    const right = remaining[index + 1];

    if (!left) {
      break;
    }

    spreads.push({
      index: spreads.length,
      pages: right ? [left, right] : [left],
    });
  }

  return spreads;
}

export function desktopSpreadForPageIndex(pageIndex: number): number {
  return pageIndex === 0 ? 0 : Math.ceil(pageIndex / 2);
}

export function firstPageIndexForDesktopSpread(spreadIndex: number): number {
  return spreadIndex === 0 ? 0 : spreadIndex * 2 - 1;
}
```

- [ ] **Step 4: Compile the content foundation**

Run:

```bash
npm run build
```

Expected: strict TypeScript accepts all 15 contributions and Vite completes the build.

- [ ] **Step 5: Commit the content model**

```bash
git add src/content src/scrapbook/pageModel.ts
git commit -m "feat: add typed scrapbook content model"
```

---

### Task 3: Build the shared physical material and decoration system

**Files:**

- Create: `src/styles/tokens.css`
- Create: `src/styles/materials.css`
- Create: `src/styles/accessibility.css`
- Create: `src/components/Decoration.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Define the visual tokens**

Create `src/styles/tokens.css`:

```css
:root {
  --color-ink: #342a25;
  --color-ink-soft: #67584c;
  --color-paper: #e6d4b6;
  --color-paper-light: #f4ead8;
  --color-paper-dark: #d1b98f;
  --color-table: #5b4436;
  --color-table-dark: #33251f;
  --color-tram-blue: #315f72;
  --color-postmark-red: #a44b43;
  --color-ticket-mustard: #d1a04c;
  --color-eucalyptus: #718873;
  --font-hand: "Caveat", cursive;
  --font-display: "DM Serif Display", Georgia, serif;
  --font-typewriter: "Special Elite", ui-monospace, monospace;
  --shadow-contact: 0 3px 6px rgb(49 30 19 / 22%);
  --shadow-lifted: 0 10px 18px rgb(42 23 13 / 28%);
  --shadow-book: 0 28px 48px rgb(21 10 6 / 46%);
  --page-turn-duration: 520ms;
  --page-turn-ease: cubic-bezier(0.22, 0.7, 0.2, 1);
}
```

- [ ] **Step 2: Create the complete shared material stylesheet**

Create `src/styles/materials.css`:

```css
.table-surface {
  background:
    radial-gradient(circle at 24% 8%, rgb(255 236 205 / 10%), transparent 30%),
    repeating-linear-gradient(92deg, transparent 0 28px, rgb(36 18 10 / 7%) 29px 31px),
    linear-gradient(135deg, #725744, var(--color-table) 58%, var(--color-table-dark));
}

.paper-surface {
  color: var(--color-ink);
  background:
    repeating-linear-gradient(4deg, rgb(84 54 31 / 2%) 0 1px, transparent 1px 7px),
    var(--color-paper);
  box-shadow: inset 0 0 28px rgb(93 60 34 / 12%);
}

.paper-surface--light {
  background-color: var(--color-paper-light);
}

.paper-surface--graph {
  background:
    linear-gradient(rgb(70 105 118 / 12%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(70 105 118 / 12%) 1px, transparent 1px),
    var(--color-paper-light);
  background-size: 18px 18px;
}

.paper-surface--kraft {
  background:
    repeating-linear-gradient(8deg, rgb(77 48 26 / 3%) 0 1px, transparent 1px 5px),
    #c7a778;
}

.paper-surface--black {
  color: #f2e7d4;
  background: #292725;
}

.decoration {
  position: absolute;
  z-index: var(--piece-z, 4);
  transform: rotate(var(--rotation, 0deg));
  pointer-events: none;
  user-select: none;
}

.decoration--tape {
  width: 5rem;
  height: 1.35rem;
  background:
    linear-gradient(100deg, rgb(255 255 255 / 14%), transparent 38% 72%, rgb(79 51 25 / 8%)),
    rgb(218 199 151 / 72%);
  border-inline: 2px dotted rgb(82 60 34 / 18%);
  box-shadow: 0 1px 2px rgb(58 36 18 / 16%);
}

.decoration--stamp {
  display: grid;
  min-width: 4.4rem;
  min-height: 4.4rem;
  place-items: center;
  padding: 0.45rem;
  color: var(--color-postmark-red);
  border: 2px solid currentColor;
  border-radius: 50%;
  font-size: 0.65rem;
  line-height: 1.05;
  text-align: center;
  text-transform: uppercase;
  opacity: 0.8;
  mix-blend-mode: multiply;
}

.decoration--ticket,
.decoration--receipt {
  padding: 0.7rem 0.65rem;
  color: var(--color-ink);
  background: var(--color-ticket-mustard);
  box-shadow: var(--shadow-contact);
  font-size: 0.68rem;
  line-height: 1.35;
  text-align: center;
  text-transform: uppercase;
}

.decoration--receipt {
  background: #eee8da;
  clip-path: polygon(0 0, 100% 0, 100% 94%, 92% 100%, 84% 94%, 76% 100%, 68% 94%, 60% 100%, 52% 94%, 44% 100%, 36% 94%, 28% 100%, 20% 94%, 12% 100%, 4% 94%, 0 100%);
}

.decoration--doodle {
  color: var(--color-tram-blue);
  font-family: var(--font-hand);
  font-size: 1.45rem;
  font-weight: 700;
}

.decoration--flower {
  width: 2.2rem;
  height: 5.4rem;
  border-left: 2px solid #65755d;
  opacity: 0.72;
}

.decoration--flower::before,
.decoration--flower::after {
  position: absolute;
  width: 1.35rem;
  height: 1.8rem;
  background: #c28d78;
  border-radius: 55% 45% 58% 42%;
  content: "";
}

.decoration--flower::before {
  top: -0.2rem;
  left: -0.7rem;
  transform: rotate(-28deg);
}

.decoration--flower::after {
  top: 0.1rem;
  left: 0.2rem;
  transform: rotate(28deg);
}

.decoration--film {
  width: 7rem;
  height: 2.1rem;
  background:
    repeating-linear-gradient(90deg, #ede2ce 0 7px, transparent 7px 14px) top / auto 5px repeat-x,
    repeating-linear-gradient(90deg, #ede2ce 0 7px, transparent 7px 14px) bottom / auto 5px repeat-x,
    #282725;
  box-shadow: var(--shadow-contact);
}

.decoration--map {
  width: 7rem;
  height: 5rem;
  background:
    linear-gradient(42deg, transparent 42%, rgb(49 95 114 / 28%) 43% 45%, transparent 46%),
    linear-gradient(-32deg, transparent 48%, rgb(164 75 67 / 24%) 49% 51%, transparent 52%),
    #dfcfb1;
  box-shadow: var(--shadow-contact);
}

.decoration--heart {
  color: var(--color-postmark-red);
  font-family: var(--font-hand);
  font-size: 2.5rem;
  line-height: 1;
}
```

- [ ] **Step 3: Create the reusable decoration component**

Create `src/components/Decoration.tsx`:

```tsx
import type { CSSProperties } from "react";

export type DecorationKind =
  | "tape"
  | "stamp"
  | "ticket"
  | "receipt"
  | "doodle"
  | "flower"
  | "film"
  | "map"
  | "heart";

type DecorationProps = {
  kind: DecorationKind;
  className?: string;
  label?: string;
  style?: CSSProperties;
};

const defaultLabels: Record<DecorationKind, string> = {
  tape: "",
  stamp: "Melbourne\nVIC",
  ticket: "Tram ticket",
  receipt: "Melbourne memory",
  doodle: "always us ↗",
  flower: "",
  film: "",
  map: "",
  heart: "♥",
};

export function Decoration({
  kind,
  className = "",
  label = defaultLabels[kind],
  style,
}: DecorationProps) {
  return (
    <span
      aria-hidden="true"
      className={`decoration decoration--${kind} ${className}`}
      style={style}
    >
      {label.split("\n").map((line, index) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < label.split("\n").length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 4: Add accessibility and reduced-motion foundations**

Create `src/styles/accessibility.css`:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

:focus-visible {
  outline: 3px solid var(--color-tram-blue);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

- [ ] **Step 5: Order the global stylesheets**

Replace `src/styles/index.css` with:

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./materials.css";
@import "./scrapbook.css";
@import "./layouts.css";
@import "./accessibility.css";

:root {
  font-family: var(--font-typewriter);
  color: var(--color-ink);
  background: var(--color-table-dark);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-width: 320px;
  min-height: 100%;
  margin: 0;
}

body {
  min-height: 100dvh;
  overflow: hidden;
}

button,
dialog {
  font: inherit;
}

button {
  color: inherit;
}
```

Create valid empty CSS layers so the global import order is established immediately:

`src/styles/scrapbook.css`

```css
@layer components {
}
```

`src/styles/layouts.css`

```css
@layer components {
}
```

- [ ] **Step 6: Verify and commit the shared material system**

Run:

```bash
npm run build
```

Expected: the production build succeeds with no missing stylesheet or TypeScript errors.

```bash
git add src/components/Decoration.tsx src/styles
git commit -m "feat: add scrapbook material system"
```

---

### Task 4: Build tactile photos, openable notes, and the enlarged reading view

**Files:**

- Create: `src/components/PhotoFrame.tsx`
- Create: `src/components/ReadingView.tsx`
- Create: `src/components/OpenableNote.tsx`
- Modify: `src/styles/materials.css`
- Modify: `src/styles/accessibility.css`

- [ ] **Step 1: Render real photos and honest replacement placeholders through one component**

Create `src/components/PhotoFrame.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { ContributionPhoto } from "../content/types";

export type PhotoFrameVariant =
  | "polaroid"
  | "snapshot"
  | "photobooth"
  | "film"
  | "postcard";

type PhotoFrameProps = {
  photo: ContributionPhoto;
  variant?: PhotoFrameVariant;
  className?: string;
  eager?: boolean;
};

export function PhotoFrame({
  photo,
  variant = "polaroid",
  className = "",
  eager = false,
}: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photo.src]);

  const showImage = Boolean(photo.src) && !failed;

  return (
    <figure className={`photo-frame photo-frame--${variant} ${className}`}>
      <div className="photo-frame__image-wrap">
        {showImage ? (
          <img
            className="photo-frame__image"
            src={photo.src ?? undefined}
            alt={photo.alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
            style={{ objectPosition: `center ${photo.focalPoint ?? "center"}` }}
          />
        ) : (
          <div
            className="photo-frame__placeholder"
            role="img"
            aria-label={photo.alt}
          >
            <span aria-hidden="true">✦</span>
            <strong>Photo goes here</strong>
            <small>{photo.alt}</small>
          </div>
        )}
      </div>
      {photo.caption ? (
        <figcaption className="photo-frame__caption">{photo.caption}</figcaption>
      ) : null}
    </figure>
  );
}
```

- [ ] **Step 2: Create the accessible full-message dialog**

Create `src/components/ReadingView.tsx`:

```tsx
import { useEffect, useId, useRef } from "react";

type ReadingViewProps = {
  open: boolean;
  title: string;
  message: string;
  detail?: string;
  onRequestClose: () => void;
};

export function ReadingView({
  open,
  title,
  message,
  detail,
  onRequestClose,
}: ReadingViewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="reading-view"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onRequestClose();
        }
      }}
    >
      <article className="reading-view__paper paper-surface paper-surface--light">
        <button
          className="reading-view__close"
          type="button"
          onClick={onRequestClose}
          autoFocus
          aria-label="Close enlarged message"
        >
          Close ×
        </button>
        {detail ? <p className="reading-view__detail">{detail}</p> : null}
        <h2 id={titleId}>{title}</h2>
        <p className="reading-view__message">{message}</p>
      </article>
    </dialog>
  );
}
```

- [ ] **Step 3: Create note triggers that open instead of forcing tiny text**

Create `src/components/OpenableNote.tsx`:

```tsx
import { useRef, useState } from "react";
import { ReadingView } from "./ReadingView";

export type NoteVariant =
  | "letter"
  | "envelope"
  | "notebook"
  | "postcard"
  | "sticky"
  | "diary"
  | "receipt"
  | "ticket"
  | "love-letter";

type OpenableNoteProps = {
  title: string;
  message: string;
  detail?: string;
  variant: NoteVariant;
  className?: string;
};

function previewMessage(message: string) {
  const maximumLength = 170;

  if (message.length <= maximumLength) {
    return message;
  }

  return `${message.slice(0, maximumLength).trimEnd()}…`;
}

export function OpenableNote({
  title,
  message,
  detail,
  variant,
  className = "",
}: OpenableNoteProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        ref={triggerRef}
        className={`openable-note openable-note--${variant} ${className}`}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open ${title}'s full message`}
      >
        <span className="openable-note__eyebrow">A note from</span>
        <strong className="openable-note__name">{title}</strong>
        <span className="openable-note__preview">{previewMessage(message)}</span>
        <span className="openable-note__hint" aria-hidden="true">
          tap to open ↗
        </span>
      </button>
      <ReadingView
        open={open}
        title={title}
        message={message}
        detail={detail}
        onRequestClose={close}
      />
    </>
  );
}
```

- [ ] **Step 4: Add photo, note, envelope, and reading-view material styles**

Append to `src/styles/materials.css`:

```css
.photo-frame {
  display: grid;
  gap: 0.45rem;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0.55rem 0.55rem 0.8rem;
  color: var(--color-ink);
  background: #f4ead8;
  box-shadow: var(--shadow-lifted);
}

.photo-frame--snapshot {
  padding-bottom: 0.55rem;
}

.photo-frame--photobooth {
  padding: 0.35rem;
  background: #252321;
}

.photo-frame--film {
  padding: 0.65rem 0.4rem;
  color: #f4ead8;
  background:
    repeating-linear-gradient(90deg, #e9dcc4 0 6px, transparent 6px 12px) top / auto 5px repeat-x,
    repeating-linear-gradient(90deg, #e9dcc4 0 6px, transparent 6px 12px) bottom / auto 5px repeat-x,
    #252321;
}

.photo-frame--postcard {
  padding: 0.45rem;
  background: #ead8bb;
}

.photo-frame__image-wrap {
  position: relative;
  min-height: 0;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: #b9a98e;
}

.photo-frame--photobooth .photo-frame__image-wrap {
  aspect-ratio: 1 / 1;
}

.photo-frame__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.88) contrast(0.96) sepia(0.08);
}

.photo-frame__placeholder {
  display: grid;
  place-content: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  padding: 0.65rem;
  color: rgb(52 42 37 / 72%);
  text-align: center;
  background:
    linear-gradient(135deg, transparent 48%, rgb(52 42 37 / 9%) 49% 51%, transparent 52%),
    #d6c5a7;
}

.photo-frame__placeholder span {
  font-size: 1.45rem;
}

.photo-frame__placeholder strong {
  font-family: var(--font-hand);
  font-size: clamp(1rem, 2.1vw, 1.35rem);
}

.photo-frame__placeholder small {
  max-width: 24ch;
  font-size: clamp(0.48rem, 1vw, 0.65rem);
  line-height: 1.25;
}

.photo-frame__caption {
  min-height: 1em;
  overflow: hidden;
  font-family: var(--font-hand);
  font-size: clamp(0.72rem, 1.6vw, 1rem);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-frame--photobooth .photo-frame__caption,
.photo-frame--film .photo-frame__caption {
  display: none;
}

.openable-note {
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: 100%;
  align-content: start;
  gap: 0.35rem;
  padding: clamp(0.8rem, 2.2vw, 1.4rem);
  overflow: hidden;
  color: var(--color-ink);
  text-align: left;
  border: 0;
  cursor: pointer;
  box-shadow: var(--shadow-lifted);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.openable-note:hover {
  transform: translateY(-2px) rotate(-0.35deg);
  box-shadow: 0 14px 21px rgb(42 23 13 / 32%);
}

.openable-note--letter,
.openable-note--love-letter {
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(76 101 110 / 14%) 28px 29px),
    #f1e6cf;
}

.openable-note--envelope {
  padding-top: 28%;
  background:
    linear-gradient(148deg, transparent 49.5%, rgb(86 54 34 / 16%) 50%),
    linear-gradient(32deg, transparent 49.5%, rgb(86 54 34 / 12%) 50%),
    #d7bd91;
}

.openable-note--notebook,
.openable-note--diary {
  background:
    linear-gradient(90deg, transparent 0 12%, rgb(164 75 67 / 35%) 12.2% 12.7%, transparent 12.9%),
    repeating-linear-gradient(0deg, transparent 0 24px, rgb(70 105 118 / 16%) 25px 26px),
    #f1e7d1;
}

.openable-note--postcard {
  background:
    linear-gradient(90deg, transparent 49.5%, rgb(52 42 37 / 20%) 50% 50.5%, transparent 51%),
    #dfc89f;
}

.openable-note--sticky {
  background: #e8cb68;
}

.openable-note--receipt,
.openable-note--ticket {
  background:
    repeating-linear-gradient(0deg, transparent 0 20px, rgb(52 42 37 / 8%) 21px),
    #e9dfca;
}

.openable-note--love-letter::after {
  content: "♥";
  justify-self: end;
  color: var(--color-postmark-red);
  font-family: var(--font-hand);
  font-size: 2rem;
}

.openable-note__eyebrow,
.openable-note__hint {
  font-family: var(--font-typewriter);
  font-size: clamp(0.54rem, 1.2vw, 0.72rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.openable-note__name {
  font-family: var(--font-hand);
  font-size: clamp(1.35rem, 3vw, 2.1rem);
  line-height: 0.95;
}

.openable-note__preview {
  display: -webkit-box;
  overflow: hidden;
  font-family: var(--font-hand);
  font-size: clamp(0.82rem, 1.7vw, 1.15rem);
  line-height: 1.15;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}

.openable-note__hint {
  align-self: end;
  justify-self: end;
  margin-top: auto;
  opacity: 0.7;
}
```

Append to `src/styles/accessibility.css`:

```css
.reading-view {
  width: min(92vw, 42rem);
  max-height: 88dvh;
  padding: 0;
  overflow: visible;
  color: var(--color-ink);
  border: 0;
  background: transparent;
}

.reading-view::backdrop {
  background: rgb(28 17 12 / 72%);
  backdrop-filter: blur(3px);
}

.reading-view__paper {
  position: relative;
  max-height: 88dvh;
  padding: clamp(2.5rem, 7vw, 4.5rem) clamp(1.5rem, 6vw, 4rem);
  overflow-y: auto;
  border-radius: 0.1rem;
  box-shadow: var(--shadow-book);
  transform: rotate(-0.6deg);
}

.reading-view__paper::before {
  position: absolute;
  top: -0.5rem;
  left: 42%;
  width: 5.5rem;
  height: 1.45rem;
  content: "";
  background: rgb(224 202 151 / 74%);
  transform: rotate(2deg);
}

.reading-view__close {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  padding: 0.45rem 0.65rem;
  color: var(--color-ink);
  border: 1px solid rgb(52 42 37 / 28%);
  background: rgb(244 234 216 / 88%);
  cursor: pointer;
}

.reading-view__detail {
  margin: 0 0 0.5rem;
  color: var(--color-ink-soft);
  font-family: var(--font-typewriter);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.reading-view h2 {
  margin: 0;
  font-family: var(--font-hand);
  font-size: clamp(2.2rem, 8vw, 4rem);
  line-height: 0.95;
}

.reading-view__message {
  margin: 1.5rem 0 0;
  white-space: pre-wrap;
  font-family: var(--font-hand);
  font-size: clamp(1.35rem, 4vw, 1.9rem);
  line-height: 1.35;
}
```

- [ ] **Step 5: Compile the shared content pieces**

Run:

```bash
npm run build
```

Expected: the production build succeeds; no image source is required because `src: null` renders an intentional replacement panel.

- [ ] **Step 6: Commit the tactile content components**

```bash
git add src/components/PhotoFrame.tsx src/components/ReadingView.tsx src/components/OpenableNote.tsx src/styles
git commit -m "feat: add tactile scrapbook content pieces"
```

---

### Task 5: Create the responsive layout recipe engine and first five compositions

**Files:**

- Create: `src/layouts/types.ts`
- Create: `src/layouts/ContributionLayout.tsx`
- Create: `src/layouts/recipes/mapFoldout.ts`
- Create: `src/layouts/recipes/tapedPolaroids.ts`
- Create: `src/layouts/recipes/foldedLetter.ts`
- Create: `src/layouts/recipes/airmailEnvelope.ts`
- Create: `src/layouts/recipes/tornNotebook.ts`
- Modify: `src/styles/layouts.css`

- [ ] **Step 1: Define an explicit art-direction schema for both screen modes**

Create `src/layouts/types.ts`:

```ts
import type { DecorationKind } from "../components/Decoration";
import type { NoteVariant } from "../components/OpenableNote";
import type { PhotoFrameVariant } from "../components/PhotoFrame";
import type { ContributionLayout } from "../content/types";

export type ResponsiveMode = "desktop" | "mobile";
export type PageSurface = "paper" | "light" | "graph" | "kraft" | "black";

export type PiecePlacement = Readonly<{
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width: string;
  height?: string;
  rotate?: number;
  z?: number;
}>;

export type ResponsivePlacement = Readonly<{
  desktop: PiecePlacement;
  mobile: PiecePlacement;
}>;

export type PhotoPiece = Readonly<{
  photoIndex: number;
  variant: PhotoFrameVariant;
  placement: ResponsivePlacement;
}>;

export type MessagePiece = Readonly<{
  variant: NoteVariant;
  placement: ResponsivePlacement;
}>;

export type DecorationPiece = Readonly<{
  kind: DecorationKind;
  label?: string;
  placement: ResponsivePlacement;
}>;

export type LayoutRecipe = Readonly<{
  id: ContributionLayout;
  surface: PageSurface;
  namePlacement: ResponsivePlacement;
  photos: readonly PhotoPiece[];
  message: MessagePiece;
  decorations: readonly DecorationPiece[];
}>;
```

- [ ] **Step 2: Build the recipe renderer with safe photo fallback and real responsive placements**

Create `src/layouts/ContributionLayout.tsx`:

```tsx
import { useId } from "react";
import type { CSSProperties } from "react";
import { Decoration } from "../components/Decoration";
import { OpenableNote } from "../components/OpenableNote";
import { PhotoFrame } from "../components/PhotoFrame";
import type { Contribution } from "../content/types";
import type {
  LayoutRecipe,
  PiecePlacement,
  ResponsiveMode,
} from "./types";

type ContributionLayoutProps = {
  contribution: Contribution;
  recipe: LayoutRecipe;
  mode: ResponsiveMode;
  eagerPhotos?: boolean;
};

type PieceStyle = CSSProperties & {
  "--piece-rotation": string;
  "--rotation": string;
  "--piece-z": number;
};

function pieceStyle(placement: PiecePlacement): PieceStyle {
  const rotation = `${placement.rotate ?? 0}deg`;

  return {
    top: placement.top,
    right: placement.right,
    bottom: placement.bottom,
    left: placement.left,
    width: placement.width,
    height: placement.height,
    "--piece-rotation": rotation,
    "--rotation": rotation,
    "--piece-z": placement.z ?? 1,
  };
}

const surfaceClasses = {
  paper: "paper-surface",
  light: "paper-surface paper-surface--light",
  graph: "paper-surface paper-surface--graph",
  kraft: "paper-surface paper-surface--kraft",
  black: "paper-surface paper-surface--black",
} as const;

export function ContributionLayout({
  contribution,
  recipe,
  mode,
  eagerPhotos = false,
}: ContributionLayoutProps) {
  const nameId = useId();

  return (
    <article
      className={`contribution-layout ${surfaceClasses[recipe.surface]}`}
      data-accent={contribution.accent}
      data-layout={recipe.id}
      aria-labelledby={nameId}
    >
      <div
        className="contribution-piece contribution-piece--name"
        style={pieceStyle(recipe.namePlacement[mode])}
      >
        <span className="contribution-name__from">from</span>
        <h2 id={nameId} className="contribution-name">
          {contribution.friendName}
        </h2>
      </div>

      {recipe.photos.map((piece, index) => {
        const photo =
          contribution.photos[piece.photoIndex] ?? contribution.photos[0];

        return (
          <div
            className="contribution-piece contribution-piece--photo"
            style={pieceStyle(piece.placement[mode])}
            key={`${contribution.id}-photo-${index}`}
          >
            <PhotoFrame
              photo={photo}
              variant={piece.variant}
              eager={eagerPhotos}
            />
          </div>
        );
      })}

      <div
        className="contribution-piece contribution-piece--message"
        style={pieceStyle(recipe.message.placement[mode])}
      >
        <OpenableNote
          title={contribution.friendName}
          message={contribution.message}
          detail={contribution.melbourneDetail}
          variant={recipe.message.variant}
        />
      </div>

      {recipe.decorations.map((piece, index) => (
        <Decoration
          key={`${contribution.id}-decoration-${index}`}
          kind={piece.kind}
          label={piece.label}
          className="contribution-piece contribution-piece--decoration"
          style={pieceStyle(piece.placement[mode])}
        />
      ))}
    </article>
  );
}
```

- [ ] **Step 3: Establish the bounded scrapbook canvas without imposing a grid**

Replace `src/styles/layouts.css` with:

```css
@layer components {
  .contribution-layout {
    --accent-color: var(--color-tram-blue);
    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .contribution-layout::after {
    position: absolute;
    inset: 0;
    z-index: 20;
    content: "";
    pointer-events: none;
    box-shadow:
      inset 0 0 1.6rem rgb(82 52 31 / 15%),
      inset 0.15rem 0 0 rgb(255 255 255 / 20%);
  }

  .contribution-layout[data-accent="tram-blue"] {
    --accent-color: var(--color-tram-blue);
  }

  .contribution-layout[data-accent="postmark-red"] {
    --accent-color: var(--color-postmark-red);
  }

  .contribution-layout[data-accent="ticket-mustard"] {
    --accent-color: var(--color-ticket-mustard);
  }

  .contribution-layout[data-accent="eucalyptus"] {
    --accent-color: var(--color-eucalyptus);
  }

  .contribution-piece {
    position: absolute;
    z-index: var(--piece-z, 1);
    min-width: 0;
    transform: rotate(var(--piece-rotation, 0deg));
    transform-origin: center;
  }

  .contribution-piece--photo .photo-frame {
    grid-template-rows: minmax(0, 1fr) auto;
    height: 100%;
  }

  .contribution-piece--message .openable-note {
    height: 100%;
  }

  .contribution-piece--name {
    display: inline-grid;
    align-content: center;
    padding: 0.35rem 0.75rem 0.45rem;
    color: var(--color-ink);
    background: #eee0c6;
    box-shadow: var(--shadow-contact);
  }

  .contribution-name__from {
    font-family: var(--font-typewriter);
    font-size: clamp(0.48rem, 1vw, 0.66rem);
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
  }

  .contribution-name {
    max-width: 100%;
    margin: 0;
    overflow: hidden;
    font-family: var(--font-hand);
    font-size: clamp(1.45rem, 3.5vw, 2.6rem);
    font-weight: 700;
    line-height: 0.85;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .contribution-piece--name::after {
    width: 48%;
    height: 0.2rem;
    margin-top: 0.18rem;
    content: "";
    background: var(--accent-color);
    opacity: 0.72;
  }

  .contribution-piece--decoration {
    pointer-events: none;
  }

  .contribution-layout[data-layout="torn-notebook"]::before,
  .contribution-layout[data-layout="diary-entry"]::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 6%;
    z-index: 1;
    width: 1px;
    content: "";
    background: rgb(164 75 67 / 32%);
  }

  .contribution-layout[data-layout="film-negative"] .contribution-name,
  .contribution-layout[data-layout="film-negative"] .contribution-name__from {
    color: #f4ead8;
  }

  .contribution-layout[data-layout="film-negative"] .contribution-piece--name {
    background: #3a3734;
  }
}
```

- [ ] **Step 4: Art-direct the map foldout composition**

Create `src/layouts/recipes/mapFoldout.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const mapFoldout = {
  id: "map-foldout",
  surface: "graph",
  namePlacement: {
    desktop: { top: "5%", left: "7%", width: "44%", rotate: -3, z: 8 },
    mobile: { top: "5%", left: "7%", width: "58%", rotate: -3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "17%", left: "8%", width: "49%", height: "38%", rotate: -5, z: 5 },
        mobile: { top: "17%", left: "7%", width: "61%", height: "30%", rotate: -5, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: { top: "12%", right: "5%", width: "38%", height: "29%", rotate: 5, z: 4 },
        mobile: { top: "11%", right: "5%", width: "36%", height: "23%", rotate: 6, z: 4 },
      },
    },
    {
      photoIndex: 2,
      variant: "polaroid",
      placement: {
        desktop: { bottom: "9%", right: "7%", width: "37%", height: "29%", rotate: 4, z: 6 },
        mobile: { bottom: "8%", right: "6%", width: "44%", height: "24%", rotate: 4, z: 6 },
      },
    },
  ],
  message: {
    variant: "notebook",
    placement: {
      desktop: { bottom: "7%", left: "8%", width: "51%", height: "34%", rotate: 2, z: 7 },
      mobile: { top: "48%", left: "9%", width: "75%", height: "29%", rotate: 2, z: 7 },
    },
  },
  decorations: [
    {
      kind: "map",
      placement: {
        desktop: { top: "43%", right: "7%", width: "31%", height: "21%", rotate: -4, z: 2 },
        mobile: { top: "37%", right: "4%", width: "32%", height: "17%", rotate: -4, z: 2 },
      },
    },
    {
      kind: "tape",
      placement: {
        desktop: { top: "15%", left: "23%", width: "19%", rotate: 2, z: 9 },
        mobile: { top: "15%", left: "24%", width: "24%", rotate: 2, z: 9 },
      },
    },
    {
      kind: "doodle",
      label: "we were here ↗",
      placement: {
        desktop: { top: "59%", right: "9%", width: "26%", rotate: -7, z: 9 },
        mobile: { bottom: "5%", left: "8%", width: "38%", rotate: -7, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 5: Art-direct the taped Polaroids composition**

Create `src/layouts/recipes/tapedPolaroids.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const tapedPolaroids = {
  id: "taped-polaroids",
  surface: "paper",
  namePlacement: {
    desktop: { top: "7%", right: "8%", width: "43%", rotate: 3, z: 8 },
    mobile: { top: "5%", right: "7%", width: "57%", rotate: 3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "13%", left: "7%", width: "52%", height: "42%", rotate: -7, z: 5 },
        mobile: { top: "16%", left: "6%", width: "65%", height: "34%", rotate: -7, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      placement: {
        desktop: { top: "25%", right: "6%", width: "43%", height: "35%", rotate: 6, z: 6 },
        mobile: { top: "25%", right: "5%", width: "49%", height: "29%", rotate: 6, z: 6 },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: { bottom: "8%", left: "12%", width: "76%", height: "32%", rotate: -1, z: 7 },
      mobile: { bottom: "8%", left: "8%", width: "82%", height: "34%", rotate: -1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "10%", left: "21%", width: "22%", rotate: -2, z: 10 },
        mobile: { top: "13%", left: "24%", width: "26%", rotate: -2, z: 10 },
      },
    },
    {
      kind: "tape",
      placement: {
        desktop: { top: "22%", right: "16%", width: "19%", rotate: 9, z: 10 },
        mobile: { top: "23%", right: "13%", width: "22%", rotate: 9, z: 10 },
      },
    },
    {
      kind: "heart",
      placement: {
        desktop: { bottom: "5%", right: "6%", width: "10%", rotate: 7, z: 9 },
        mobile: { bottom: "3%", right: "5%", width: "12%", rotate: 7, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 6: Art-direct the folded letter composition**

Create `src/layouts/recipes/foldedLetter.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const foldedLetter = {
  id: "folded-letter",
  surface: "kraft",
  namePlacement: {
    desktop: { top: "7%", left: "8%", width: "46%", rotate: -2, z: 8 },
    mobile: { top: "5%", left: "8%", width: "63%", rotate: -2, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "snapshot",
      placement: {
        desktop: { top: "11%", right: "7%", width: "39%", height: "31%", rotate: 6, z: 6 },
        mobile: { top: "14%", right: "6%", width: "54%", height: "28%", rotate: 6, z: 6 },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: { top: "32%", left: "10%", width: "76%", height: "56%", rotate: -1, z: 5 },
      mobile: { top: "37%", left: "7%", width: "85%", height: "53%", rotate: -1, z: 5 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "29%", left: "41%", width: "21%", rotate: 1, z: 10 },
        mobile: { top: "35%", left: "38%", width: "25%", rotate: 1, z: 10 },
      },
    },
    {
      kind: "stamp",
      label: "KEEP\nFOREVER",
      placement: {
        desktop: { bottom: "6%", right: "4%", width: "20%", height: "13%", rotate: -9, z: 8 },
        mobile: { bottom: "4%", right: "3%", width: "24%", height: "11%", rotate: -9, z: 8 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 7: Art-direct the airmail envelope composition**

Create `src/layouts/recipes/airmailEnvelope.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const airmailEnvelope = {
  id: "airmail-envelope",
  surface: "light",
  namePlacement: {
    desktop: { top: "6%", right: "7%", width: "42%", rotate: 3, z: 9 },
    mobile: { top: "5%", right: "6%", width: "58%", rotate: 3, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "postcard",
      placement: {
        desktop: { top: "14%", left: "6%", width: "48%", height: "34%", rotate: -5, z: 4 },
        mobile: { top: "16%", left: "5%", width: "61%", height: "29%", rotate: -5, z: 4 },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: { top: "31%", right: "6%", width: "37%", height: "28%", rotate: 7, z: 7 },
        mobile: { top: "27%", right: "5%", width: "43%", height: "24%", rotate: 7, z: 7 },
      },
    },
  ],
  message: {
    variant: "envelope",
    placement: {
      desktop: { bottom: "8%", left: "10%", width: "74%", height: "41%", rotate: 1, z: 6 },
      mobile: { bottom: "8%", left: "7%", width: "84%", height: "42%", rotate: 1, z: 6 },
    },
  },
  decorations: [
    {
      kind: "stamp",
      label: "MELBOURNE\nVIC",
      placement: {
        desktop: { top: "9%", left: "51%", width: "19%", height: "13%", rotate: -7, z: 8 },
        mobile: { top: "11%", left: "55%", width: "23%", height: "11%", rotate: -7, z: 8 },
      },
    },
    {
      kind: "doodle",
      label: "MEL → YOU",
      placement: {
        desktop: { bottom: "4%", right: "4%", width: "25%", rotate: -5, z: 9 },
        mobile: { bottom: "3%", right: "3%", width: "31%", rotate: -5, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 8: Art-direct the torn notebook composition**

Create `src/layouts/recipes/tornNotebook.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const tornNotebook = {
  id: "torn-notebook",
  surface: "paper",
  namePlacement: {
    desktop: { top: "6%", left: "12%", width: "42%", rotate: -1, z: 8 },
    mobile: { top: "5%", left: "12%", width: "59%", rotate: -1, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "14%", right: "7%", width: "44%", height: "36%", rotate: 7, z: 5 },
        mobile: { top: "15%", right: "5%", width: "56%", height: "30%", rotate: 7, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: { top: "22%", left: "9%", width: "39%", height: "29%", rotate: -6, z: 6 },
        mobile: { top: "26%", left: "6%", width: "43%", height: "23%", rotate: -6, z: 6 },
      },
    },
  ],
  message: {
    variant: "notebook",
    placement: {
      desktop: { bottom: "7%", left: "11%", width: "76%", height: "41%", rotate: 1, z: 7 },
      mobile: { bottom: "8%", left: "9%", width: "82%", height: "42%", rotate: 1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "12%", right: "18%", width: "19%", rotate: 4, z: 10 },
        mobile: { top: "13%", right: "18%", width: "23%", rotate: 4, z: 10 },
      },
    },
    {
      kind: "doodle",
      label: "do not forget this",
      placement: {
        desktop: { bottom: "3%", left: "5%", width: "29%", rotate: -8, z: 9 },
        mobile: { bottom: "3%", left: "4%", width: "38%", rotate: -8, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 9: Compile the first recipe group**

Run:

```bash
npm run build
```

Expected: the generic renderer and all five recipes satisfy strict TypeScript. Every recipe contains independent `desktop` and `mobile` placements.

- [ ] **Step 10: Commit the layout engine and first recipes**

```bash
git add src/layouts src/styles/layouts.css
git commit -m "feat: add responsive scrapbook layout engine"
```

---

### Task 6: Add five more distinct contribution compositions

**Files:**

- Create: `src/layouts/recipes/photoboothStrip.ts`
- Create: `src/layouts/recipes/tramTicket.ts`
- Create: `src/layouts/recipes/coffeeReceipt.ts`
- Create: `src/layouts/recipes/postcard.ts`
- Create: `src/layouts/recipes/pressedFlower.ts`

- [ ] **Step 1: Art-direct the photobooth strip composition**

Create `src/layouts/recipes/photoboothStrip.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const photoboothStrip = {
  id: "photobooth-strip",
  surface: "kraft",
  namePlacement: {
    desktop: { top: "6%", right: "8%", width: "47%", rotate: 3, z: 8 },
    mobile: { top: "5%", left: "8%", width: "61%", rotate: -2, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "photobooth",
      placement: {
        desktop: { top: "10%", left: "8%", width: "31%", height: "25%", rotate: -4, z: 5 },
        mobile: { top: "15%", left: "5%", width: "35%", height: "22%", rotate: -6, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "photobooth",
      placement: {
        desktop: { top: "36%", left: "9%", width: "31%", height: "25%", rotate: -2, z: 5 },
        mobile: { top: "18%", left: "33%", width: "35%", height: "22%", rotate: 1, z: 6 },
      },
    },
    {
      photoIndex: 2,
      variant: "photobooth",
      placement: {
        desktop: { top: "62%", left: "10%", width: "31%", height: "25%", rotate: 0, z: 5 },
        mobile: { top: "15%", right: "4%", width: "35%", height: "22%", rotate: 6, z: 5 },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: { top: "22%", right: "7%", width: "51%", height: "60%", rotate: 2, z: 6 },
      mobile: { bottom: "9%", left: "8%", width: "84%", height: "49%", rotate: -1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "film",
      placement: {
        desktop: { bottom: "5%", right: "8%", width: "37%", height: "6%", rotate: -5, z: 8 },
        mobile: { top: "38%", left: "23%", width: "54%", height: "5%", rotate: -3, z: 8 },
      },
    },
    {
      kind: "doodle",
      label: "again! again!",
      placement: {
        desktop: { top: "12%", right: "8%", width: "28%", rotate: 8, z: 9 },
        mobile: { bottom: "4%", right: "5%", width: "38%", rotate: 7, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 2: Art-direct the tram ticket composition**

Create `src/layouts/recipes/tramTicket.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const tramTicket = {
  id: "tram-ticket",
  surface: "graph",
  namePlacement: {
    desktop: { top: "6%", left: "8%", width: "42%", rotate: -3, z: 8 },
    mobile: { top: "5%", left: "7%", width: "60%", rotate: -3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "snapshot",
      placement: {
        desktop: { top: "15%", right: "7%", width: "49%", height: "36%", rotate: 6, z: 5 },
        mobile: { top: "16%", right: "5%", width: "62%", height: "30%", rotate: 6, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      placement: {
        desktop: { top: "28%", left: "7%", width: "41%", height: "34%", rotate: -7, z: 6 },
        mobile: { top: "28%", left: "5%", width: "46%", height: "26%", rotate: -7, z: 6 },
      },
    },
  ],
  message: {
    variant: "ticket",
    placement: {
      desktop: { bottom: "7%", left: "14%", width: "72%", height: "35%", rotate: 1, z: 7 },
      mobile: { bottom: "8%", left: "8%", width: "84%", height: "39%", rotate: 1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "ticket",
      label: "86 · MELBOURNE\nVALID FOREVER",
      placement: {
        desktop: { top: "8%", left: "49%", width: "39%", height: "12%", rotate: -4, z: 9 },
        mobile: { top: "11%", right: "3%", width: "43%", height: "10%", rotate: -4, z: 9 },
      },
    },
    {
      kind: "doodle",
      label: "ding ding ↗",
      placement: {
        desktop: { bottom: "4%", right: "4%", width: "24%", rotate: -6, z: 9 },
        mobile: { bottom: "3%", right: "3%", width: "31%", rotate: -6, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 3: Art-direct the coffee receipt composition**

Create `src/layouts/recipes/coffeeReceipt.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const coffeeReceipt = {
  id: "coffee-receipt",
  surface: "kraft",
  namePlacement: {
    desktop: { top: "6%", right: "8%", width: "45%", rotate: 4, z: 8 },
    mobile: { top: "5%", right: "7%", width: "61%", rotate: 3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "11%", left: "6%", width: "48%", height: "39%", rotate: -6, z: 6 },
        mobile: { top: "15%", left: "5%", width: "59%", height: "31%", rotate: -6, z: 6 },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: { top: "25%", right: "6%", width: "38%", height: "29%", rotate: 7, z: 5 },
        mobile: { top: "27%", right: "5%", width: "45%", height: "24%", rotate: 7, z: 5 },
      },
    },
  ],
  message: {
    variant: "receipt",
    placement: {
      desktop: { bottom: "6%", left: "27%", width: "49%", height: "48%", rotate: -1, z: 7 },
      mobile: { bottom: "7%", left: "16%", width: "68%", height: "47%", rotate: -1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "receipt",
      label: "2 × FLAT WHITE\n1 × VERY LONG CHAT",
      placement: {
        desktop: { bottom: "11%", left: "5%", width: "29%", height: "34%", rotate: 5, z: 4 },
        mobile: { top: "47%", left: "3%", width: "29%", height: "25%", rotate: 5, z: 4 },
      },
    },
    {
      kind: "tape",
      placement: {
        desktop: { bottom: "50%", left: "40%", width: "18%", rotate: 2, z: 10 },
        mobile: { bottom: "50%", left: "40%", width: "23%", rotate: 2, z: 10 },
      },
    },
    {
      kind: "doodle",
      label: "same table next time?",
      placement: {
        desktop: { bottom: "4%", right: "4%", width: "33%", rotate: -6, z: 9 },
        mobile: { bottom: "3%", right: "3%", width: "42%", rotate: -6, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 4: Art-direct the postcard composition**

Create `src/layouts/recipes/postcard.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const postcard = {
  id: "postcard",
  surface: "light",
  namePlacement: {
    desktop: { top: "7%", left: "8%", width: "44%", rotate: -3, z: 8 },
    mobile: { top: "5%", left: "7%", width: "61%", rotate: -3, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "postcard",
      placement: {
        desktop: { top: "15%", left: "6%", width: "58%", height: "43%", rotate: -4, z: 5 },
        mobile: { top: "15%", left: "5%", width: "73%", height: "35%", rotate: -4, z: 5 },
      },
    },
  ],
  message: {
    variant: "postcard",
    placement: {
      desktop: { bottom: "10%", right: "6%", width: "65%", height: "42%", rotate: 3, z: 6 },
      mobile: { bottom: "9%", right: "6%", width: "84%", height: "43%", rotate: 3, z: 6 },
    },
  },
  decorations: [
    {
      kind: "stamp",
      label: "MELBOURNE\n2026",
      placement: {
        desktop: { top: "12%", right: "7%", width: "23%", height: "15%", rotate: 8, z: 8 },
        mobile: { top: "11%", right: "4%", width: "26%", height: "12%", rotate: 8, z: 8 },
      },
    },
    {
      kind: "doodle",
      label: "wish you could stay",
      placement: {
        desktop: { bottom: "4%", left: "6%", width: "37%", rotate: -5, z: 9 },
        mobile: { bottom: "3%", left: "5%", width: "46%", rotate: -5, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 5: Art-direct the pressed flower composition**

Create `src/layouts/recipes/pressedFlower.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const pressedFlower = {
  id: "pressed-flower",
  surface: "light",
  namePlacement: {
    desktop: { top: "6%", right: "9%", width: "44%", rotate: 2, z: 8 },
    mobile: { top: "5%", right: "7%", width: "60%", rotate: 2, z: 8 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "13%", left: "7%", width: "46%", height: "38%", rotate: -5, z: 5 },
        mobile: { top: "15%", left: "6%", width: "60%", height: "31%", rotate: -5, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: { top: "25%", right: "7%", width: "39%", height: "30%", rotate: 5, z: 6 },
        mobile: { top: "28%", right: "5%", width: "44%", height: "24%", rotate: 5, z: 6 },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: { bottom: "7%", left: "12%", width: "74%", height: "39%", rotate: -1, z: 7 },
      mobile: { bottom: "8%", left: "9%", width: "82%", height: "40%", rotate: -1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "flower",
      placement: {
        desktop: { top: "7%", left: "53%", width: "14%", height: "18%", rotate: 17, z: 9 },
        mobile: { top: "8%", left: "57%", width: "16%", height: "15%", rotate: 17, z: 9 },
      },
    },
    {
      kind: "flower",
      placement: {
        desktop: { bottom: "3%", right: "4%", width: "16%", height: "20%", rotate: -13, z: 8 },
        mobile: { bottom: "2%", right: "2%", width: "18%", height: "16%", rotate: -13, z: 8 },
      },
    },
    {
      kind: "tape",
      placement: {
        desktop: { top: "11%", left: "20%", width: "19%", rotate: 1, z: 10 },
        mobile: { top: "13%", left: "22%", width: "24%", rotate: 1, z: 10 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 6: Compile the second recipe group**

Run:

```bash
npm run build
```

Expected: all ten recipes authored so far compile, and none imports an image asset or duplicates contribution copy.

- [ ] **Step 7: Commit the second recipe group**

```bash
git add src/layouts/recipes
git commit -m "feat: add Melbourne memory page compositions"
```

---

### Task 7: Complete all 15 compositions and make the layout registry exhaustive

**Files:**

- Create: `src/layouts/recipes/filmNegative.ts`
- Create: `src/layouts/recipes/stickyNotes.ts`
- Create: `src/layouts/recipes/diaryEntry.ts`
- Create: `src/layouts/recipes/eventTicket.ts`
- Create: `src/layouts/recipes/finalLoveLetter.ts`
- Create: `src/layouts/index.ts`

- [ ] **Step 1: Art-direct the film negative composition**

Create `src/layouts/recipes/filmNegative.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const filmNegative = {
  id: "film-negative",
  surface: "black",
  namePlacement: {
    desktop: { top: "6%", left: "7%", width: "44%", rotate: -2, z: 9 },
    mobile: { top: "5%", left: "7%", width: "61%", rotate: -2, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "film",
      placement: {
        desktop: { top: "17%", left: "5%", width: "43%", height: "29%", rotate: -4, z: 5 },
        mobile: { top: "16%", left: "4%", width: "49%", height: "24%", rotate: -5, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "film",
      placement: {
        desktop: { top: "13%", right: "5%", width: "43%", height: "29%", rotate: 4, z: 6 },
        mobile: { top: "18%", right: "4%", width: "49%", height: "24%", rotate: 5, z: 6 },
      },
    },
    {
      photoIndex: 2,
      variant: "film",
      placement: {
        desktop: { top: "43%", left: "28%", width: "44%", height: "29%", rotate: -1, z: 7 },
        mobile: { top: "37%", left: "25%", width: "52%", height: "24%", rotate: -1, z: 7 },
      },
    },
  ],
  message: {
    variant: "letter",
    placement: {
      desktop: { bottom: "6%", left: "11%", width: "78%", height: "29%", rotate: 1, z: 8 },
      mobile: { bottom: "7%", left: "8%", width: "84%", height: "34%", rotate: 1, z: 8 },
    },
  },
  decorations: [
    {
      kind: "film",
      placement: {
        desktop: { top: "48%", left: "4%", width: "29%", height: "6%", rotate: 7, z: 3 },
        mobile: { top: "48%", left: "2%", width: "32%", height: "5%", rotate: 7, z: 3 },
      },
    },
    {
      kind: "doodle",
      label: "keep the outtakes",
      placement: {
        desktop: { top: "64%", right: "4%", width: "32%", rotate: -7, z: 9 },
        mobile: { top: "58%", right: "3%", width: "39%", rotate: -7, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 2: Art-direct the sticky notes composition**

Create `src/layouts/recipes/stickyNotes.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const stickyNotes = {
  id: "sticky-notes",
  surface: "graph",
  namePlacement: {
    desktop: { top: "6%", right: "7%", width: "43%", rotate: 4, z: 9 },
    mobile: { top: "5%", right: "6%", width: "59%", rotate: 4, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "snapshot",
      placement: {
        desktop: { top: "13%", left: "6%", width: "49%", height: "37%", rotate: -6, z: 5 },
        mobile: { top: "15%", left: "5%", width: "61%", height: "30%", rotate: -6, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      placement: {
        desktop: { top: "27%", right: "6%", width: "40%", height: "33%", rotate: 7, z: 6 },
        mobile: { top: "28%", right: "5%", width: "45%", height: "25%", rotate: 7, z: 6 },
      },
    },
  ],
  message: {
    variant: "sticky",
    placement: {
      desktop: { bottom: "9%", left: "16%", width: "62%", height: "37%", rotate: -3, z: 7 },
      mobile: { bottom: "9%", left: "10%", width: "79%", height: "40%", rotate: -3, z: 7 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "11%", left: "20%", width: "20%", rotate: -1, z: 10 },
        mobile: { top: "13%", left: "21%", width: "25%", rotate: -1, z: 10 },
      },
    },
    {
      kind: "heart",
      placement: {
        desktop: { bottom: "4%", right: "7%", width: "11%", rotate: 8, z: 9 },
        mobile: { bottom: "3%", right: "5%", width: "13%", rotate: 8, z: 9 },
      },
    },
    {
      kind: "doodle",
      label: "remember this bit! ↗",
      placement: {
        desktop: { top: "53%", left: "5%", width: "31%", rotate: -8, z: 8 },
        mobile: { top: "48%", left: "4%", width: "39%", rotate: -8, z: 8 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 3: Art-direct the diary entry composition**

Create `src/layouts/recipes/diaryEntry.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const diaryEntry = {
  id: "diary-entry",
  surface: "paper",
  namePlacement: {
    desktop: { top: "6%", left: "11%", width: "43%", rotate: -2, z: 9 },
    mobile: { top: "5%", left: "11%", width: "60%", rotate: -2, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "13%", right: "7%", width: "43%", height: "35%", rotate: 6, z: 6 },
        mobile: { top: "15%", right: "5%", width: "56%", height: "29%", rotate: 6, z: 6 },
      },
    },
    {
      photoIndex: 1,
      variant: "snapshot",
      placement: {
        desktop: { top: "25%", left: "10%", width: "38%", height: "29%", rotate: -6, z: 5 },
        mobile: { top: "27%", left: "6%", width: "43%", height: "23%", rotate: -6, z: 5 },
      },
    },
  ],
  message: {
    variant: "diary",
    placement: {
      desktop: { bottom: "6%", left: "10%", width: "78%", height: "44%", rotate: 1, z: 7 },
      mobile: { bottom: "7%", left: "8%", width: "84%", height: "45%", rotate: 1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "11%", right: "18%", width: "19%", rotate: 3, z: 10 },
        mobile: { top: "13%", right: "18%", width: "23%", rotate: 3, z: 10 },
      },
    },
    {
      kind: "doodle",
      label: "Dear diary…",
      placement: {
        desktop: { top: "10%", left: "11%", width: "27%", rotate: -5, z: 8 },
        mobile: { top: "11%", left: "10%", width: "34%", rotate: -5, z: 8 },
      },
    },
    {
      kind: "flower",
      placement: {
        desktop: { bottom: "3%", right: "3%", width: "15%", height: "19%", rotate: -12, z: 8 },
        mobile: { bottom: "2%", right: "2%", width: "17%", height: "16%", rotate: -12, z: 8 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 4: Art-direct the event ticket composition**

Create `src/layouts/recipes/eventTicket.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const eventTicket = {
  id: "event-ticket",
  surface: "kraft",
  namePlacement: {
    desktop: { top: "6%", right: "8%", width: "44%", rotate: 3, z: 9 },
    mobile: { top: "5%", right: "7%", width: "60%", rotate: 3, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "snapshot",
      placement: {
        desktop: { top: "14%", left: "6%", width: "51%", height: "38%", rotate: -6, z: 5 },
        mobile: { top: "15%", left: "5%", width: "64%", height: "31%", rotate: -6, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      placement: {
        desktop: { top: "28%", right: "6%", width: "39%", height: "32%", rotate: 7, z: 6 },
        mobile: { top: "29%", right: "4%", width: "44%", height: "25%", rotate: 7, z: 6 },
      },
    },
  ],
  message: {
    variant: "ticket",
    placement: {
      desktop: { bottom: "8%", left: "11%", width: "77%", height: "36%", rotate: -1, z: 7 },
      mobile: { bottom: "8%", left: "8%", width: "84%", height: "40%", rotate: -1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "ticket",
      label: "ADMIT TWO\nONE PERFECT NIGHT",
      placement: {
        desktop: { top: "8%", left: "46%", width: "42%", height: "12%", rotate: -4, z: 8 },
        mobile: { top: "11%", right: "3%", width: "46%", height: "10%", rotate: -4, z: 8 },
      },
    },
    {
      kind: "stamp",
      label: "USED\nWITH LOVE",
      placement: {
        desktop: { bottom: "4%", right: "4%", width: "19%", height: "13%", rotate: 8, z: 9 },
        mobile: { bottom: "3%", right: "3%", width: "23%", height: "11%", rotate: 8, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 5: Art-direct the final love letter composition**

Create `src/layouts/recipes/finalLoveLetter.ts`:

```ts
import type { LayoutRecipe } from "../types";

export const finalLoveLetter = {
  id: "final-love-letter",
  surface: "light",
  namePlacement: {
    desktop: { top: "6%", left: "8%", width: "46%", rotate: -2, z: 9 },
    mobile: { top: "5%", left: "7%", width: "63%", rotate: -2, z: 9 },
  },
  photos: [
    {
      photoIndex: 0,
      variant: "polaroid",
      placement: {
        desktop: { top: "13%", left: "6%", width: "45%", height: "36%", rotate: -6, z: 5 },
        mobile: { top: "15%", left: "5%", width: "58%", height: "30%", rotate: -6, z: 5 },
      },
    },
    {
      photoIndex: 1,
      variant: "polaroid",
      placement: {
        desktop: { top: "19%", right: "6%", width: "43%", height: "35%", rotate: 6, z: 6 },
        mobile: { top: "27%", right: "5%", width: "48%", height: "26%", rotate: 6, z: 6 },
      },
    },
  ],
  message: {
    variant: "love-letter",
    placement: {
      desktop: { bottom: "6%", left: "10%", width: "79%", height: "45%", rotate: 1, z: 7 },
      mobile: { bottom: "7%", left: "8%", width: "84%", height: "45%", rotate: 1, z: 7 },
    },
  },
  decorations: [
    {
      kind: "tape",
      placement: {
        desktop: { top: "11%", left: "19%", width: "20%", rotate: 0, z: 10 },
        mobile: { top: "13%", left: "20%", width: "25%", rotate: 0, z: 10 },
      },
    },
    {
      kind: "stamp",
      label: "OPEN WHEN\nYOU MISS US",
      placement: {
        desktop: { top: "6%", right: "6%", width: "23%", height: "15%", rotate: 8, z: 9 },
        mobile: { top: "9%", right: "3%", width: "27%", height: "12%", rotate: 8, z: 9 },
      },
    },
    {
      kind: "heart",
      placement: {
        desktop: { bottom: "3%", right: "4%", width: "12%", rotate: -7, z: 9 },
        mobile: { bottom: "2%", right: "3%", width: "15%", rotate: -7, z: 9 },
      },
    },
  ],
} as const satisfies LayoutRecipe;
```

- [ ] **Step 6: Register all 15 layout ids with compile-time exhaustiveness**

Create `src/layouts/index.ts`:

```ts
import type { ContributionLayout as ContributionLayoutId } from "../content/types";
import { airmailEnvelope } from "./recipes/airmailEnvelope";
import { coffeeReceipt } from "./recipes/coffeeReceipt";
import { diaryEntry } from "./recipes/diaryEntry";
import { eventTicket } from "./recipes/eventTicket";
import { filmNegative } from "./recipes/filmNegative";
import { finalLoveLetter } from "./recipes/finalLoveLetter";
import { foldedLetter } from "./recipes/foldedLetter";
import { mapFoldout } from "./recipes/mapFoldout";
import { photoboothStrip } from "./recipes/photoboothStrip";
import { postcard } from "./recipes/postcard";
import { pressedFlower } from "./recipes/pressedFlower";
import { stickyNotes } from "./recipes/stickyNotes";
import { tapedPolaroids } from "./recipes/tapedPolaroids";
import { tornNotebook } from "./recipes/tornNotebook";
import { tramTicket } from "./recipes/tramTicket";
import type { LayoutRecipe } from "./types";

export const layoutRecipes = {
  "map-foldout": mapFoldout,
  "taped-polaroids": tapedPolaroids,
  "folded-letter": foldedLetter,
  "airmail-envelope": airmailEnvelope,
  "torn-notebook": tornNotebook,
  "photobooth-strip": photoboothStrip,
  "tram-ticket": tramTicket,
  "coffee-receipt": coffeeReceipt,
  postcard,
  "pressed-flower": pressedFlower,
  "film-negative": filmNegative,
  "sticky-notes": stickyNotes,
  "diary-entry": diaryEntry,
  "event-ticket": eventTicket,
  "final-love-letter": finalLoveLetter,
} satisfies Record<ContributionLayoutId, LayoutRecipe>;

export function getLayoutRecipe(layout: ContributionLayoutId): LayoutRecipe {
  return layoutRecipes[layout] ?? tornNotebook;
}
```

- [ ] **Step 7: Compile the exhaustive recipe registry**

Run:

```bash
npm run build
```

Expected: the registry proves that every content layout id has a recipe, and all 15 recipes contain desktop/mobile art direction.

- [ ] **Step 8: Commit the complete contribution system**

```bash
git add src/layouts
git commit -m "feat: complete fifteen scrapbook contribution layouts"
```

---

### Task 8: Build the responsive page-turning and swipe interaction engine

**Files:**

- Create: `src/scrapbook/useResponsiveMode.ts`
- Create: `src/scrapbook/useSwipeGesture.ts`
- Create: `src/scrapbook/usePageTurner.ts`
- Create: `src/scrapbook/PageTurner.tsx`
- Create: `src/components/ScrapbookControls.tsx`
- Modify: `src/styles/scrapbook.css`

- [ ] **Step 1: Observe the composition breakpoint without CSS/React disagreement**

Create `src/scrapbook/useResponsiveMode.ts`:

```ts
import { useEffect, useState } from "react";
import type { ResponsiveMode } from "../layouts/types";

export const desktopMediaQuery = "(min-width: 900px)";

function readMode(): ResponsiveMode {
  return window.matchMedia(desktopMediaQuery).matches ? "desktop" : "mobile";
}

export function useResponsiveMode(): ResponsiveMode {
  const [mode, setMode] = useState<ResponsiveMode>(readMode);

  useEffect(() => {
    const media = window.matchMedia(desktopMediaQuery);
    const update = () => setMode(media.matches ? "desktop" : "mobile");

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return mode;
}
```

- [ ] **Step 2: Translate pointer gestures into intentional swipes without stealing note clicks**

Create `src/scrapbook/useSwipeGesture.ts`:

```ts
import { useRef, useState } from "react";
import type { PointerEventHandler } from "react";

type SwipeGestureOptions = {
  enabled: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const swipeThreshold = 56;
const maximumDrag = 130;

export function useSwipeGesture({
  enabled,
  onSwipeLeft,
  onSwipeRight,
}: SwipeGestureOptions) {
  const pointerId = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function reset() {
    pointerId.current = null;
    setDragOffset(0);
    setIsDragging(false);
  }

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as Element;

    if (
      !enabled ||
      !event.isPrimary ||
      event.button !== 0 ||
      target.closest("button, a, dialog, input, textarea, select")
    ) {
      return;
    }

    pointerId.current = event.pointerId;
    startX.current = event.clientX;
    startY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current !== event.pointerId) {
      return;
    }

    const horizontal = event.clientX - startX.current;
    const vertical = event.clientY - startY.current;

    if (Math.abs(vertical) > Math.abs(horizontal) && Math.abs(vertical) > 12) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      reset();
      return;
    }

    setDragOffset(Math.max(-maximumDrag, Math.min(maximumDrag, horizontal)));
  };

  const onPointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
    if (pointerId.current !== event.pointerId) {
      return;
    }

    const horizontal = event.clientX - startX.current;

    if (horizontal <= -swipeThreshold) {
      onSwipeLeft();
    } else if (horizontal >= swipeThreshold) {
      onSwipeRight();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    reset();
  };

  const onPointerCancel: PointerEventHandler<HTMLDivElement> = () => reset();

  return {
    dragOffset,
    isDragging,
    gestureProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}
```

- [ ] **Step 3: Create one navigation state machine that preserves page identity across modes**

Create `src/scrapbook/usePageTurner.ts`:

```ts
import { useEffect, useRef, useState } from "react";
import {
  desktopSpreadForPageIndex,
  firstPageIndexForDesktopSpread,
} from "./pageModel";
import type { ResponsiveMode } from "../layouts/types";

export type TurnDirection = "forward" | "backward";

type PageTurnerOptions = {
  pageCount: number;
  mode: ResponsiveMode;
};

export function usePageTurner({ pageCount, mode }: PageTurnerOptions) {
  const [coverOpen, setCoverOpen] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [turnDirection, setTurnDirection] = useState<TurnDirection | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const lastPageIndex = Math.max(0, pageCount - 1);
  const desktopSpreadCount = 1 + Math.ceil(Math.max(0, pageCount - 1) / 2);

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  function navigateToPage(target: number, direction: TurnDirection) {
    const nextIndex = Math.max(0, Math.min(lastPageIndex, target));

    if (transitionTimer.current !== null || nextIndex === activePageIndex) {
      return;
    }

    setTurnDirection(direction);
    setActivePageIndex(nextIndex);
    transitionTimer.current = window.setTimeout(() => {
      setTurnDirection(null);
      transitionTimer.current = null;
    }, 520);
  }

  function next() {
    if (!coverOpen) {
      setCoverOpen(true);
      return;
    }

    if (mode === "mobile") {
      navigateToPage(activePageIndex + 1, "forward");
      return;
    }

    const spread = desktopSpreadForPageIndex(activePageIndex);

    if (spread >= desktopSpreadCount - 1) {
      return;
    }

    navigateToPage(firstPageIndexForDesktopSpread(spread + 1), "forward");
  }

  function previous() {
    if (!coverOpen || turnDirection) {
      return;
    }

    if (activePageIndex === 0) {
      setCoverOpen(false);
      return;
    }

    if (mode === "mobile") {
      navigateToPage(activePageIndex - 1, "backward");
      return;
    }

    const spread = desktopSpreadForPageIndex(activePageIndex);
    navigateToPage(firstPageIndexForDesktopSpread(spread - 1), "backward");
  }

  function goToPage(pageIndex: number) {
    navigateToPage(
      pageIndex,
      pageIndex >= activePageIndex ? "forward" : "backward",
    );
  }

  const activeStep =
    mode === "desktop"
      ? desktopSpreadForPageIndex(activePageIndex)
      : activePageIndex;
  const totalSteps = mode === "desktop" ? desktopSpreadCount : pageCount;
  const canNext =
    coverOpen &&
    (mode === "desktop"
      ? activeStep < desktopSpreadCount - 1
      : activePageIndex < lastPageIndex);

  return {
    coverOpen,
    openCover: () => setCoverOpen(true),
    activePageIndex,
    activeStep,
    totalSteps,
    turnDirection,
    isTurning: turnDirection !== null,
    canPrevious: coverOpen,
    canNext,
    next,
    previous,
    goToPage,
  };
}
```

- [ ] **Step 4: Build the physical gesture surface and clickable page edges**

Create `src/scrapbook/PageTurner.tsx`:

```tsx
import type { CSSProperties, ReactNode } from "react";
import type { TurnDirection } from "./usePageTurner";
import { useSwipeGesture } from "./useSwipeGesture";

type PageTurnerProps = {
  children: ReactNode;
  enabled: boolean;
  isTurning: boolean;
  direction: TurnDirection | null;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

type DragStyle = CSSProperties & { "--drag-offset": string };

export function PageTurner({
  children,
  enabled,
  isTurning,
  direction,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: PageTurnerProps) {
  const { dragOffset, isDragging, gestureProps } = useSwipeGesture({
    enabled: enabled && !isTurning,
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
  });
  const style: DragStyle = { "--drag-offset": `${dragOffset}px` };

  return (
    <div
      className="page-turner"
      data-dragging={isDragging || undefined}
      data-turn={direction ?? undefined}
      style={style}
      {...gestureProps}
    >
      <div className="page-turner__content">{children}</div>
      {isTurning ? <span className="page-turner__turning-leaf" aria-hidden="true" /> : null}
      <button
        className="page-turner__edge page-turner__edge--previous"
        type="button"
        onClick={onPrevious}
        disabled={!canPrevious || isTurning}
        aria-label="Turn to the previous scrapbook page"
      />
      <button
        className="page-turner__edge page-turner__edge--next"
        type="button"
        onClick={onNext}
        disabled={!canNext || isTurning}
        aria-label="Turn to the next scrapbook page"
      />
    </div>
  );
}
```

- [ ] **Step 5: Create accessible controls styled as loose scrapbook objects**

Create `src/components/ScrapbookControls.tsx`:

```tsx
type ScrapbookControlsProps = {
  activeStep: number;
  totalSteps: number;
  canPrevious: boolean;
  canNext: boolean;
  isTurning: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function ScrapbookControls({
  activeStep,
  totalSteps,
  canPrevious,
  canNext,
  isTurning,
  onPrevious,
  onNext,
}: ScrapbookControlsProps) {
  return (
    <nav className="scrapbook-controls" aria-label="Scrapbook pages">
      <button
        type="button"
        className="scrapbook-control scrapbook-control--previous"
        onClick={onPrevious}
        disabled={!canPrevious || isTurning}
      >
        <span aria-hidden="true">←</span> Back
      </button>
      <p className="scrapbook-progress" aria-live="polite">
        <span>memory</span>
        <strong>
          {activeStep + 1} / {totalSteps}
        </strong>
      </p>
      <button
        type="button"
        className="scrapbook-control scrapbook-control--next"
        onClick={onNext}
        disabled={!canNext || isTurning}
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
```

- [ ] **Step 6: Style drag feedback, turning paper, page-edge hit zones, and controls**

Replace `src/styles/scrapbook.css` with:

```css
@layer components {
  .page-turner {
    position: relative;
    width: 100%;
    height: 100%;
    touch-action: pan-y;
    user-select: none;
  }

  .page-turner__content {
    width: 100%;
    height: 100%;
    transform: translateX(calc(var(--drag-offset, 0px) * 0.12));
    transition: transform 180ms ease;
  }

  .page-turner[data-dragging] .page-turner__content {
    transition: none;
  }

  .page-turner__turning-leaf {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: block;
    pointer-events: none;
    background:
      linear-gradient(90deg, transparent, rgb(73 45 27 / 20%) 47%, rgb(247 233 207 / 88%) 50%, transparent 54%),
      #dfcba8;
    box-shadow: var(--shadow-lifted);
    transform-origin: left center;
    animation: turn-forward var(--page-turn-duration) var(--page-turn-ease) both;
  }

  .page-turner[data-turn="backward"] .page-turner__turning-leaf {
    transform-origin: right center;
    animation-name: turn-backward;
  }

  @keyframes turn-forward {
    0% { transform: perspective(1200px) rotateY(92deg); opacity: 0; }
    15% { opacity: 1; }
    100% { transform: perspective(1200px) rotateY(-92deg); opacity: 0; }
  }

  @keyframes turn-backward {
    0% { transform: perspective(1200px) rotateY(-92deg); opacity: 0; }
    15% { opacity: 1; }
    100% { transform: perspective(1200px) rotateY(92deg); opacity: 0; }
  }

  .page-turner__edge {
    position: absolute;
    top: 9%;
    bottom: 9%;
    z-index: 30;
    width: 7%;
    min-width: 2.25rem;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .page-turner__edge:disabled {
    cursor: default;
  }

  .page-turner__edge--previous {
    left: 0;
  }

  .page-turner__edge--next {
    right: 0;
  }

  .scrapbook-controls {
    position: absolute;
    right: 50%;
    bottom: clamp(0.35rem, 1.6vh, 1rem);
    z-index: 80;
    display: flex;
    align-items: end;
    gap: clamp(0.4rem, 2vw, 1rem);
    transform: translateX(50%);
  }

  .scrapbook-control {
    min-width: 5.1rem;
    padding: 0.58rem 0.75rem;
    font-family: var(--font-typewriter);
    font-size: clamp(0.64rem, 1.2vw, 0.78rem);
    border: 0;
    background: #e9d8b9;
    box-shadow: var(--shadow-contact);
    cursor: pointer;
  }

  .scrapbook-control--previous {
    transform: rotate(-2deg);
  }

  .scrapbook-control--next {
    transform: rotate(2deg);
  }

  .scrapbook-control:disabled {
    cursor: default;
    opacity: 0.38;
  }

  .scrapbook-progress {
    display: grid;
    min-width: 4.2rem;
    margin: 0;
    padding: 0.42rem 0.55rem 1rem;
    color: var(--color-paper-light);
    text-align: center;
    background: var(--color-postmark-red);
    box-shadow: var(--shadow-contact);
    transform: rotate(-1deg);
  }

  .scrapbook-progress span {
    font-family: var(--font-hand);
    font-size: 0.85rem;
  }

  .scrapbook-progress strong {
    font-family: var(--font-typewriter);
    font-size: 0.68rem;
  }

  @media (max-width: 899px) {
    .page-turner__edge {
      top: 12%;
      bottom: 12%;
      width: 9%;
    }

    .scrapbook-controls {
      width: calc(100% - 1rem);
      justify-content: space-between;
    }

    .scrapbook-progress {
      position: absolute;
      right: 50%;
      bottom: 0;
      transform: translateX(50%) rotate(-1deg);
    }
  }
}
```

- [ ] **Step 7: Compile the page-turning engine**

Run:

```bash
npm run build
```

Expected: pointer handlers, navigation state, and custom CSS properties compile under strict TypeScript.

- [ ] **Step 8: Commit navigation and gestures**

```bash
git add src/scrapbook src/components/ScrapbookControls.tsx src/styles/scrapbook.css
git commit -m "feat: add physical page turning interactions"
```

---

### Task 9: Assemble the cover, album shell, opening, contributions, and closing page

**Files:**

- Create: `src/components/Cover.tsx`
- Create: `src/components/OpeningPage.tsx`
- Create: `src/components/ClosingPage.tsx`
- Create: `src/scrapbook/SpreadRenderer.tsx`
- Create: `src/scrapbook/Scrapbook.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/scrapbook.css`

- [ ] **Step 1: Build a closed clothbound cover as the first interaction**

Create `src/components/Cover.tsx`:

```tsx
import { Decoration } from "./Decoration";

type CoverProps = {
  title: string;
  subtitle: string;
  open: boolean;
  onOpen: () => void;
};

export function Cover({ title, subtitle, open, onOpen }: CoverProps) {
  return (
    <section
      className="scrapbook-cover"
      data-open={open || undefined}
      aria-hidden={open}
    >
      <button
        type="button"
        className="scrapbook-cover__button"
        onClick={onOpen}
        disabled={open}
        tabIndex={open ? -1 : 0}
        aria-label="Open Patty's Melbourne scrapbook"
      >
        <span className="scrapbook-cover__stitched-border" aria-hidden="true" />
        <span className="scrapbook-cover__label">
          <span className="scrapbook-cover__eyebrow">Melbourne · 4 years</span>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </span>
        <span className="scrapbook-cover__prompt">open the scrapbook ↗</span>
        <Decoration
          kind="stamp"
          label="PATTY\nMELBOURNE"
          className="scrapbook-cover__stamp"
        />
        <Decoration
          kind="heart"
          className="scrapbook-cover__heart"
        />
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Create an opening dedication that spans the book instead of looking like a landing page**

Create `src/components/OpeningPage.tsx`:

```tsx
import type { ScrapbookContent } from "../content/types";
import { Decoration } from "./Decoration";

type OpeningPageProps = {
  content: ScrapbookContent["opening"];
};

export function OpeningPage({ content }: OpeningPageProps) {
  return (
    <section className="opening-page paper-surface paper-surface--light">
      <Decoration kind="tape" className="opening-page__tape" />
      <Decoration
        kind="stamp"
        label="MELBOURNE\nWITH LOVE"
        className="opening-page__stamp"
      />
      <Decoration kind="map" className="opening-page__map" />
      <Decoration
        kind="doodle"
        label="turn slowly →"
        className="opening-page__doodle"
      />
      <div className="opening-page__copy">
        <p>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <div className="opening-page__underline" aria-hidden="true" />
        <p className="opening-page__message">{content.message}</p>
      </div>
      <div className="opening-page__route" aria-hidden="true">
        <span>the first hello</span>
        <i />
        <span>four years of us</span>
        <i />
        <span>never really goodbye</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create the closing farewell as the final handmade page**

Create `src/components/ClosingPage.tsx`:

```tsx
import type { ScrapbookContent } from "../content/types";
import { Decoration } from "./Decoration";

type ClosingPageProps = {
  content: ScrapbookContent["closing"];
};

export function ClosingPage({ content }: ClosingPageProps) {
  return (
    <section className="closing-page paper-surface paper-surface--light">
      <Decoration kind="tape" className="closing-page__tape" />
      <Decoration kind="flower" className="closing-page__flower" />
      <Decoration kind="heart" className="closing-page__heart" />
      <div className="closing-page__letter">
        <p className="closing-page__eyebrow">Patty, one last thing…</p>
        <h2>{content.title}</h2>
        <p>{content.message}</p>
        <strong>{content.signature}</strong>
      </div>
      <p className="closing-page__postscript">
        P.S. Melbourne is still yours whenever you come home.
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Render one held page on mobile and a true spread on desktop**

Create `src/scrapbook/SpreadRenderer.tsx`:

```tsx
import { ClosingPage } from "../components/ClosingPage";
import { OpeningPage } from "../components/OpeningPage";
import { ContributionLayout } from "../layouts/ContributionLayout";
import { getLayoutRecipe } from "../layouts";
import type { ResponsiveMode } from "../layouts/types";
import type { DesktopSpread, ScrapbookPage } from "./pageModel";
import { desktopSpreadForPageIndex } from "./pageModel";

type SpreadRendererProps = {
  pages: readonly ScrapbookPage[];
  desktopSpreads: readonly DesktopSpread[];
  activePageIndex: number;
  mode: ResponsiveMode;
};

type PageViewProps = {
  page: ScrapbookPage;
  mode: ResponsiveMode;
  side: "left" | "right" | "single";
};

function PageView({ page, mode, side }: PageViewProps) {
  return (
    <div
      className={`scrapbook-page scrapbook-page--${page.kind}`}
      data-side={side}
      data-page-id={page.id}
    >
      {page.kind === "opening" ? <OpeningPage content={page.content} /> : null}
      {page.kind === "contribution" ? (
        <ContributionLayout
          contribution={page.contribution}
          recipe={getLayoutRecipe(page.contribution.layout)}
          mode={mode}
          eagerPhotos
        />
      ) : null}
      {page.kind === "closing" ? <ClosingPage content={page.content} /> : null}
    </div>
  );
}

export function SpreadRenderer({
  pages,
  desktopSpreads,
  activePageIndex,
  mode,
}: SpreadRendererProps) {
  if (mode === "mobile") {
    const page = pages[activePageIndex];

    if (!page) {
      return null;
    }

    return (
      <div className="mobile-page" key={page.id}>
        <PageView page={page} mode={mode} side="single" />
      </div>
    );
  }

  const spread = desktopSpreads[desktopSpreadForPageIndex(activePageIndex)];

  if (!spread) {
    return null;
  }

  const [left, right] = spread.pages;
  const isSingle = !right;

  return (
    <div
      className="desktop-spread"
      data-single={isSingle || undefined}
      key={`spread-${spread.index}`}
    >
      <PageView page={left} mode={mode} side={isSingle ? "single" : "left"} />
      {right ? <PageView page={right} mode={mode} side="right" /> : null}
    </div>
  );
}
```

- [ ] **Step 5: Assemble the book state, physical shell, keyboard access, and table details**

Create `src/scrapbook/Scrapbook.tsx`:

```tsx
import { useEffect, useMemo } from "react";
import { Cover } from "../components/Cover";
import { Decoration } from "../components/Decoration";
import { ScrapbookControls } from "../components/ScrapbookControls";
import type { ScrapbookContent } from "../content/types";
import { PageTurner } from "./PageTurner";
import { buildDesktopSpreads, buildPages } from "./pageModel";
import { SpreadRenderer } from "./SpreadRenderer";
import { usePageTurner } from "./usePageTurner";
import { useResponsiveMode } from "./useResponsiveMode";

type ScrapbookProps = {
  content: ScrapbookContent;
};

export function Scrapbook({ content }: ScrapbookProps) {
  const mode = useResponsiveMode();
  const pages = useMemo(() => buildPages(content), [content]);
  const desktopSpreads = useMemo(() => buildDesktopSpreads(pages), [pages]);
  const turner = usePageTurner({ pageCount: pages.length, mode });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (
        target?.closest("button, a, input, textarea, select, dialog") ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        turner.next();
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        turner.previous();
      } else if (event.key === "Home" && turner.coverOpen) {
        event.preventDefault();
        turner.goToPage(0);
      } else if (event.key === "End" && turner.coverOpen) {
        event.preventDefault();
        turner.goToPage(pages.length - 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pages.length, turner]);

  return (
    <main
      className="scrapbook-experience table-surface"
      data-mode={mode}
      data-cover-open={turner.coverOpen || undefined}
    >
      <a className="skip-link" href="#scrapbook-content">
        Skip to scrapbook content
      </a>

      <div className="table-scatter" aria-hidden="true">
        <span className="table-scatter__tram-ticket">METCARD · 86</span>
        <span className="table-scatter__coffee-ring" />
        <span className="table-scatter__pencil">Patty was here ♥</span>
      </div>

      <div className="scrapbook-stage">
        <div className="scrapbook-book" id="scrapbook-content">
          <PageTurner
            enabled={turner.coverOpen}
            isTurning={turner.isTurning}
            direction={turner.turnDirection}
            canPrevious={turner.canPrevious}
            canNext={turner.canNext}
            onPrevious={turner.previous}
            onNext={turner.next}
          >
            <SpreadRenderer
              pages={pages}
              desktopSpreads={desktopSpreads}
              activePageIndex={turner.activePageIndex}
              mode={mode}
            />
          </PageTurner>

          <Cover
            title={content.title}
            subtitle={content.subtitle}
            open={turner.coverOpen}
            onOpen={turner.openCover}
          />
        </div>

        {turner.coverOpen ? (
          <ScrapbookControls
            activeStep={turner.activeStep}
            totalSteps={turner.totalSteps}
            canPrevious={turner.canPrevious}
            canNext={turner.canNext}
            isTurning={turner.isTurning}
            onPrevious={turner.previous}
            onNext={turner.next}
          />
        ) : null}
      </div>

      <Decoration kind="flower" className="table-flower" />
    </main>
  );
}
```

- [ ] **Step 6: Connect the single content source to the production application**

Replace `src/App.tsx` with:

```tsx
import { scrapbook } from "./content/scrapbook";
import { Scrapbook } from "./scrapbook/Scrapbook";

export function App() {
  return <Scrapbook content={scrapbook} />;
}
```

- [ ] **Step 7: Style the complete desk spread and held-book compositions**

Append to `src/styles/scrapbook.css`:

```css
@layer components {
  .skip-link {
    position: fixed;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 200;
    padding: 0.65rem 0.85rem;
    color: var(--color-ink);
    background: var(--color-paper-light);
    box-shadow: var(--shadow-contact);
    transform: translateY(-180%);
  }

  .skip-link:focus {
    transform: translateY(0);
  }

  .scrapbook-experience {
    position: relative;
    display: grid;
    width: 100%;
    min-height: 100dvh;
    place-items: center;
    overflow: hidden;
    padding: 1rem;
  }

  .scrapbook-stage {
    position: relative;
    z-index: 10;
    width: min(94vw, calc((100dvh - 4.5rem) * 1.66), 82.5rem);
    aspect-ratio: 1.66 / 1;
    filter: drop-shadow(0 2rem 1.4rem rgb(23 12 8 / 28%));
  }

  .scrapbook-book {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 1.1%;
    overflow: visible;
    background:
      repeating-linear-gradient(90deg, rgb(255 255 255 / 3%) 0 1px, transparent 1px 5px),
      #493126;
    border-radius: 0.45rem 0.8rem 0.8rem 0.45rem;
    box-shadow: var(--shadow-book), inset 0 0 0 2px rgb(237 212 175 / 12%);
    transform-style: preserve-3d;
  }

  .scrapbook-book::after {
    position: absolute;
    top: 1.1%;
    bottom: 1.1%;
    left: 50%;
    z-index: 45;
    width: 1.45rem;
    content: "";
    pointer-events: none;
    background:
      linear-gradient(90deg, rgb(39 21 14 / 28%), rgb(255 245 225 / 16%) 48%, rgb(39 21 14 / 34%));
    box-shadow: 0 0 0.7rem rgb(45 24 15 / 25%);
    transform: translateX(-50%);
  }

  .desktop-spread {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    height: 100%;
    gap: 0.55rem;
    overflow: hidden;
    border-radius: 0.2rem;
  }

  .desktop-spread[data-single] .scrapbook-page {
    grid-column: 1 / -1;
  }

  .mobile-page,
  .scrapbook-page {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .scrapbook-page {
    position: relative;
    overflow: hidden;
    background: var(--color-paper);
    box-shadow: inset 0 0 1rem rgb(84 52 29 / 13%);
  }

  .scrapbook-page[data-side="left"] {
    border-radius: 0.22rem 0.05rem 0.05rem 0.22rem;
    box-shadow:
      inset -1rem 0 1.2rem rgb(70 42 25 / 11%),
      inset 0 0 1rem rgb(84 52 29 / 9%);
  }

  .scrapbook-page[data-side="right"] {
    border-radius: 0.05rem 0.22rem 0.22rem 0.05rem;
    box-shadow:
      inset 1rem 0 1.2rem rgb(70 42 25 / 11%),
      inset 0 0 1rem rgb(84 52 29 / 9%);
  }

  .scrapbook-cover {
    position: absolute;
    inset: 0;
    z-index: 70;
    border-radius: 0.45rem 0.8rem 0.8rem 0.45rem;
    box-shadow: var(--shadow-book);
    transform-origin: left center;
    transform-style: preserve-3d;
    transition:
      transform 780ms cubic-bezier(0.2, 0.68, 0.18, 1),
      visibility 0ms linear 0ms;
  }

  .scrapbook-cover[data-open] {
    visibility: hidden;
    pointer-events: none;
    transform: perspective(1800px) rotateY(-168deg);
    transition:
      transform 780ms cubic-bezier(0.2, 0.68, 0.18, 1),
      visibility 0ms linear 780ms;
  }

  .scrapbook-cover__button {
    position: relative;
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    padding: clamp(1rem, 4vw, 4rem);
    overflow: hidden;
    color: #f1dfc2;
    border: 0;
    border-radius: inherit;
    background:
      radial-gradient(circle at 72% 19%, rgb(255 237 201 / 9%), transparent 22%),
      repeating-linear-gradient(7deg, rgb(255 255 255 / 2%) 0 1px, transparent 1px 4px),
      #315760;
    box-shadow:
      inset 1rem 0 1.4rem rgb(20 29 29 / 24%),
      inset 0 0 0 0.35rem rgb(33 45 43 / 36%);
    cursor: pointer;
  }

  .scrapbook-cover__button::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 3.2%;
    width: 3.4%;
    content: "";
    border-right: 1px solid rgb(242 218 180 / 16%);
    border-left: 1px solid rgb(27 42 42 / 30%);
    background: rgb(34 66 72 / 55%);
  }

  .scrapbook-cover__stitched-border {
    position: absolute;
    inset: 3.5%;
    border: 2px dashed rgb(238 213 175 / 42%);
    border-radius: 0.2rem;
    pointer-events: none;
  }

  .scrapbook-cover__label {
    position: relative;
    display: grid;
    width: min(72%, 36rem);
    gap: 0.65rem;
    padding: clamp(1.4rem, 5vw, 3.4rem);
    color: var(--color-ink);
    text-align: center;
    background:
      repeating-linear-gradient(3deg, transparent 0 6px, rgb(75 52 34 / 3%) 7px),
      #e7d1aa;
    box-shadow: var(--shadow-lifted);
    transform: rotate(-1.2deg);
  }

  .scrapbook-cover__label::before,
  .scrapbook-cover__label::after {
    position: absolute;
    top: -0.65rem;
    width: 5.5rem;
    height: 1.35rem;
    content: "";
    background: rgb(233 211 163 / 68%);
  }

  .scrapbook-cover__label::before {
    left: 8%;
    transform: rotate(-5deg);
  }

  .scrapbook-cover__label::after {
    right: 8%;
    transform: rotate(5deg);
  }

  .scrapbook-cover__eyebrow {
    font-family: var(--font-typewriter);
    font-size: clamp(0.6rem, 1.2vw, 0.9rem);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .scrapbook-cover__label strong {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 6.5vw, 6.2rem);
    font-weight: 400;
    line-height: 0.86;
  }

  .scrapbook-cover__label > span:last-child {
    font-family: var(--font-hand);
    font-size: clamp(1rem, 2.3vw, 1.8rem);
    line-height: 1.05;
  }

  .scrapbook-cover__prompt {
    position: absolute;
    right: 8%;
    bottom: 7%;
    font-family: var(--font-hand);
    font-size: clamp(1rem, 2vw, 1.5rem);
    transform: rotate(-5deg);
  }

  .scrapbook-cover__stamp {
    top: 8%;
    right: 8%;
    width: clamp(4.2rem, 10vw, 7rem);
    height: clamp(3.1rem, 7vw, 5rem);
    --rotation: 8deg;
  }

  .scrapbook-cover__heart {
    bottom: 8%;
    left: 9%;
    width: 2rem;
    --rotation: -8deg;
  }

  .opening-page,
  .closing-page {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .opening-page {
    display: grid;
    place-items: center;
    padding: clamp(2rem, 7vw, 6rem);
  }

  .opening-page__copy {
    position: relative;
    z-index: 5;
    display: grid;
    width: min(69%, 48rem);
    justify-items: center;
    text-align: center;
    transform: rotate(-0.6deg);
  }

  .opening-page__copy > p:first-child {
    margin: 0 0 0.8rem;
    font-family: var(--font-typewriter);
    font-size: clamp(0.58rem, 1.2vw, 0.9rem);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .opening-page h1 {
    max-width: 16ch;
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 6vw, 6.1rem);
    font-weight: 400;
    line-height: 0.88;
  }

  .opening-page__underline {
    width: 48%;
    height: 0.45rem;
    margin: 0.8rem 0;
    background: var(--color-postmark-red);
    clip-path: polygon(0 42%, 18% 30%, 39% 55%, 61% 35%, 81% 48%, 100% 31%, 98% 70%, 72% 61%, 49% 76%, 22% 64%, 2% 78%);
  }

  .opening-page__message {
    max-width: 48ch;
    margin: 0;
    font-family: var(--font-hand);
    font-size: clamp(1.15rem, 2.4vw, 2rem);
    line-height: 1.25;
  }

  .opening-page__route {
    position: absolute;
    right: 8%;
    bottom: 8%;
    left: 8%;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--color-tram-blue);
    font-family: var(--font-typewriter);
    font-size: clamp(0.45rem, 1vw, 0.7rem);
  }

  .opening-page__route i {
    flex: 1;
    height: 2px;
    border-top: 2px dashed currentColor;
  }

  .opening-page__route span::before {
    display: inline-block;
    width: 0.55rem;
    height: 0.55rem;
    margin-right: 0.25rem;
    content: "";
    border: 2px solid currentColor;
    border-radius: 50%;
    background: var(--color-paper-light);
  }

  .opening-page__tape {
    top: 8%;
    left: 38%;
    width: 18%;
    --rotation: -2deg;
  }

  .opening-page__stamp {
    top: 9%;
    right: 7%;
    width: 16%;
    height: 12%;
    --rotation: 8deg;
  }

  .opening-page__map {
    bottom: 15%;
    left: 6%;
    width: 18%;
    height: 21%;
    --rotation: -7deg;
  }

  .opening-page__doodle {
    right: 7%;
    bottom: 16%;
    width: 17%;
    --rotation: 5deg;
  }

  .closing-page {
    display: grid;
    place-items: center;
    padding: clamp(1rem, 4vw, 3rem);
  }

  .closing-page__letter {
    position: relative;
    z-index: 5;
    display: grid;
    width: 76%;
    gap: clamp(0.45rem, 1.5vh, 1rem);
    padding: clamp(1.2rem, 4vw, 3rem);
    background:
      repeating-linear-gradient(0deg, transparent 0 26px, rgb(70 105 118 / 13%) 27px 28px),
      #f1e6cf;
    box-shadow: var(--shadow-lifted);
    transform: rotate(-1.4deg);
  }

  .closing-page__eyebrow {
    margin: 0;
    font-family: var(--font-typewriter);
    font-size: clamp(0.5rem, 1vw, 0.7rem);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .closing-page h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2rem, 4.5vw, 4rem);
    font-weight: 400;
    line-height: 0.9;
  }

  .closing-page__letter > p:not(.closing-page__eyebrow) {
    margin: 0;
    font-family: var(--font-hand);
    font-size: clamp(1rem, 2.2vw, 1.55rem);
    line-height: 1.25;
  }

  .closing-page__letter strong {
    justify-self: end;
    font-family: var(--font-hand);
    font-size: clamp(1.25rem, 2.8vw, 2rem);
  }

  .closing-page__postscript {
    position: absolute;
    right: 7%;
    bottom: 5%;
    z-index: 8;
    max-width: 42%;
    margin: 0;
    font-family: var(--font-hand);
    font-size: clamp(0.78rem, 1.7vw, 1.15rem);
    transform: rotate(-5deg);
  }

  .closing-page__tape {
    top: 10%;
    left: 35%;
    width: 28%;
    --rotation: 1deg;
  }

  .closing-page__flower {
    right: 4%;
    bottom: 6%;
    width: 16%;
    height: 20%;
    --rotation: -13deg;
  }

  .closing-page__heart {
    top: 7%;
    right: 8%;
    width: 10%;
    --rotation: 8deg;
  }

  .table-scatter,
  .table-flower {
    position: absolute;
    pointer-events: none;
  }

  .table-scatter {
    inset: 0;
    z-index: 2;
  }

  .table-scatter__tram-ticket {
    position: absolute;
    top: 5%;
    left: 3%;
    padding: 0.75rem 1.2rem;
    font-family: var(--font-typewriter);
    font-size: 0.65rem;
    background: #d9aa54;
    box-shadow: var(--shadow-contact);
    transform: rotate(-12deg);
  }

  .table-scatter__coffee-ring {
    position: absolute;
    right: 3%;
    bottom: 4%;
    width: clamp(5rem, 10vw, 8rem);
    aspect-ratio: 1;
    border: clamp(0.35rem, 0.7vw, 0.6rem) solid rgb(80 42 22 / 28%);
    border-radius: 50%;
    filter: blur(0.3px);
    transform: scaleY(0.9) rotate(8deg);
  }

  .table-scatter__pencil {
    position: absolute;
    right: 4%;
    top: 7%;
    color: rgb(245 223 190 / 68%);
    font-family: var(--font-hand);
    font-size: clamp(1rem, 2vw, 1.5rem);
    transform: rotate(8deg);
  }

  .table-flower {
    bottom: 5%;
    left: 3%;
    z-index: 3;
    width: 5rem;
    height: 7rem;
    --rotation: 18deg;
  }

  .scrapbook-experience[data-mode="desktop"] .page-turner[data-turn="forward"] .page-turner__turning-leaf {
    right: 0;
    left: 50%;
  }

  .scrapbook-experience[data-mode="desktop"] .page-turner[data-turn="backward"] .page-turner__turning-leaf {
    right: 50%;
    left: 0;
  }

  @media (max-width: 899px) {
    .scrapbook-experience {
      padding: 0.7rem;
    }

    .scrapbook-stage {
      width: min(92vw, calc((100dvh - 5rem) * 0.72), 27rem);
      aspect-ratio: 0.72 / 1;
    }

    .scrapbook-book {
      padding: 2.2%;
      border-radius: 0.42rem 0.65rem 0.65rem 0.42rem;
    }

    .scrapbook-book::after {
      top: 2.2%;
      bottom: 2.2%;
      left: 2.3%;
      width: 0.7rem;
      background: linear-gradient(90deg, rgb(39 21 14 / 32%), rgb(255 245 225 / 13%), rgb(39 21 14 / 26%));
    }

    .mobile-page {
      overflow: hidden;
      border-radius: 0.16rem;
    }

    .scrapbook-cover__label {
      width: 79%;
      padding: 2.1rem 1.1rem;
    }

    .scrapbook-cover__label strong {
      font-size: clamp(2.6rem, 15vw, 4.6rem);
    }

    .scrapbook-cover__prompt {
      right: 7%;
      bottom: 5%;
    }

    .opening-page {
      padding: 1.35rem;
    }

    .opening-page__copy {
      width: 86%;
    }

    .opening-page h1 {
      font-size: clamp(2.5rem, 12vw, 4rem);
    }

    .opening-page__message {
      font-size: clamp(1.15rem, 5.4vw, 1.6rem);
    }

    .opening-page__route {
      right: 6%;
      left: 6%;
      align-items: start;
      font-size: 0.42rem;
    }

    .opening-page__route span {
      max-width: 7ch;
    }

    .opening-page__map {
      bottom: 15%;
      width: 26%;
      height: 15%;
    }

    .opening-page__stamp {
      width: 25%;
      height: 10%;
    }

    .opening-page__doodle {
      right: 4%;
      bottom: 18%;
      width: 28%;
    }

    .closing-page__letter {
      width: 84%;
      padding: 1.5rem 1.15rem;
    }

    .closing-page h2 {
      font-size: clamp(2.2rem, 10vw, 3.5rem);
    }

    .closing-page__letter > p:not(.closing-page__eyebrow) {
      font-size: clamp(1rem, 4.5vw, 1.35rem);
    }

    .closing-page__postscript {
      right: 4%;
      bottom: 3%;
      max-width: 54%;
    }

    .table-scatter__tram-ticket {
      top: 2%;
      left: -4%;
      transform: rotate(-15deg) scale(0.8);
    }

    .table-scatter__pencil {
      top: 2%;
      right: -2%;
    }

    .table-flower {
      bottom: 1%;
      left: -2%;
      transform: scale(0.8) rotate(18deg);
    }
  }
}
```

- [ ] **Step 8: Compile the complete album**

Run:

```bash
npm run build
```

Expected: the whole page sequence builds from `scrapbook.ts`, with 17 pages total (opening + 15 contributions + closing) and nine desktop steps.

- [ ] **Step 9: Commit the assembled experience**

```bash
git add src/App.tsx src/components src/scrapbook src/styles/scrapbook.css
git commit -m "feat: assemble Patty's physical scrapbook experience"
```

---

### Task 10: Add adjacent-photo preloading, final tactile polish, and replacement documentation

**Files:**

- Create: `src/scrapbook/useAdjacentImagePreload.ts`
- Modify: `src/scrapbook/Scrapbook.tsx`
- Modify: `src/styles/scrapbook.css`
- Modify: `src/styles/accessibility.css`
- Create: `README.md`

- [ ] **Step 1: Preload only the nearby memories instead of the entire scrapbook**

Create `src/scrapbook/useAdjacentImagePreload.ts`:

```ts
import { useEffect } from "react";
import type { ScrapbookPage } from "./pageModel";

export function useAdjacentImagePreload(
  pages: readonly ScrapbookPage[],
  activePageIndex: number,
  radius: number,
) {
  useEffect(() => {
    const firstIndex = Math.max(0, activePageIndex - radius);
    const lastIndex = Math.min(pages.length - 1, activePageIndex + radius);
    const nearbySources = new Set<string>();

    for (let index = firstIndex; index <= lastIndex; index += 1) {
      const page = pages[index];

      if (page?.kind !== "contribution") {
        continue;
      }

      page.contribution.photos.forEach((photo) => {
        if (photo.src) {
          nearbySources.add(photo.src);
        }
      });
    }

    nearbySources.forEach((source) => {
      const image = new Image();
      image.decoding = "async";
      image.src = source;
    });
  }, [activePageIndex, pages, radius]);
}
```

- [ ] **Step 2: Activate the preload radius for the current presentation mode**

In `src/scrapbook/Scrapbook.tsx`, add this import:

```ts
import { useAdjacentImagePreload } from "./useAdjacentImagePreload";
```

Immediately after creating `turner`, add:

```ts
useAdjacentImagePreload(
  pages,
  turner.activePageIndex,
  mode === "desktop" ? 4 : 2,
);
```

This loads the active images and the next/previous memories while leaving distant pages lazy.

- [ ] **Step 3: Add page corners, touch targets, selection behavior, and small-screen dialog polish**

Append to `src/styles/scrapbook.css`:

```css
@layer components {
  .scrapbook-page::after {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 50;
    width: clamp(0.8rem, 2.2vw, 1.7rem);
    aspect-ratio: 1;
    content: "";
    pointer-events: none;
    background:
      linear-gradient(135deg, rgb(91 61 39 / 14%) 0 49%, #efe0c4 51% 100%);
    box-shadow: -0.18rem -0.18rem 0.35rem rgb(71 42 25 / 10%);
  }

  .scrapbook-cover__button:hover .scrapbook-cover__label {
    transform: translateY(-0.15rem) rotate(-1.2deg);
  }

  .scrapbook-cover__label {
    transition: transform 180ms ease;
  }

  .scrapbook-control,
  .reading-view__close,
  .openable-note {
    -webkit-tap-highlight-color: transparent;
  }

  @media (pointer: coarse) {
    .scrapbook-control {
      min-height: 2.75rem;
    }

    .page-turner__edge {
      min-width: 2.75rem;
    }
  }
}
```

Append to `src/styles/accessibility.css`:

```css
::selection {
  color: var(--color-ink);
  background: rgb(209 160 76 / 48%);
}

@media (max-width: 520px) {
  .reading-view {
    width: 94vw;
  }

  .reading-view__paper {
    max-height: 90dvh;
    padding: 3.2rem 1.35rem 2rem;
    transform: rotate(-0.25deg);
  }
}

@media (prefers-contrast: more) {
  :focus-visible {
    outline-width: 4px;
  }

  .openable-note,
  .photo-frame,
  .scrapbook-control {
    border: 2px solid currentColor;
  }
}
```

- [ ] **Step 4: Document the one-file replacement workflow and unlisted boundary**

Create `README.md`:

```md
# We Love You, Patty

A handmade digital farewell scrapbook celebrating Patty's four years in Melbourne.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS v4 for the build foundation
- Handcrafted CSS for the physical scrapbook art direction
- Fontsource packages for self-hosted fonts

There is no backend, router, CMS, authentication layer, analytics package, or unit-test framework.

## Replace the placeholders

All replaceable scrapbook content lives in one file:

`src/content/scrapbook.ts`

The scrapbook currently requires exactly 15 contributions. Keep each contribution's `id` unique. For every contribution, replace:

- `friendName`
- `message`
- each photo's `src`, `alt`, and optional `caption`
- optional `melbourneDetail`, `location`, and `year`

Keep `layout` and `accent` unless you intentionally want to swap that friend's art direction.

### Add photos

1. Create `public/photos/`.
2. Copy the final images into that folder with simple file names, such as `friend-01-laneway.jpg`.
3. Change the matching photo from `src: null` to `src: "/photos/friend-01-laneway.jpg"`.
4. Write meaningful `alt` text describing Patty, her friend, and the moment. Do not repeat the caption as the alt text.
5. Set `focalPoint` to `"top"`, `"center"`, or `"bottom"` if a crop needs adjustment.

Landscape images around 1400 × 1050 pixels are a practical starting point. Export web-sized JPEG, WebP, or AVIF files and avoid uploading original multi-megabyte camera files.

When a `src` remains `null` or an image fails, the page shows a styled replacement panel instead of a broken-image icon.

## Run locally

```bash
npm install
npm run dev
```

Build the production bundle with:

```bash
npm run build
```

Preview that bundle with:

```bash
npm run preview
```

## Navigation

- Click the cover to open it.
- Use the paper Back/Next controls or the page edges.
- Swipe or drag horizontally across non-interactive paper.
- Use Left/Right Arrow or Page Up/Page Down.
- Use Home/End to jump to the opening/closing page.
- Tap or click a friend's note to open an enlarged reading view.

## Desktop and mobile

Desktop renders the pages as an open album spread on a table. Mobile renders the same materials and contribution recipes as one scrapbook page held in the hands. The positions are art-directed independently for each mode; mobile is not a collapsed card list.

## Unlisted, not private

`index.html` uses `noindex`, `nofollow`, and `noarchive`, and `public/robots.txt` asks crawlers not to index any route. This makes the eventual deployment unlisted, but it is not access control. Anyone with the URL can view it. Add password protection at the host level later if true privacy is required.

Deployment is deliberately not configured in this repository; the site owner controls where and how it is published.
```

- [ ] **Step 5: Compile the polished build and inspect its bundle output**

Run:

```bash
npm run build
```

Expected: strict TypeScript and Vite succeed; `dist/` contains only local application/font assets and no missing-photo build errors.

- [ ] **Step 6: Commit preloading, polish, and owner documentation**

```bash
git add src/scrapbook src/styles README.md
git commit -m "docs: add scrapbook content replacement guide"
```

---

### Task 11: Perform final build, desktop/mobile, and interaction verification

**Files:**

- Modify only files that fail the checks below.

- [ ] **Step 1: Confirm the repository contains no forbidden test suite or external asset dependency**

Run:

```bash
rg --files -g '*.test.*' -g '*.spec.*' -g '__tests__/**'
```

Expected: no output.

Run:

```bash
rg -n '"(vitest|jest|@testing-library)' package.json
```

Expected: no output.

Run:

```bash
rg -n 'https?://' src public index.html
```

Expected: no output; fonts, materials, and decorations are local or CSS-native.

- [ ] **Step 2: Confirm the content contract and production build**

Run:

```bash
rg -n 'id: "friend-' src/content/scrapbook.ts
```

Expected: exactly 15 matching contribution lines.

Run:

```bash
npm run build
```

Expected: TypeScript exits successfully and Vite completes the production bundle without warnings that indicate broken imports or missing assets.

- [ ] **Step 3: Start the local site for human-scale visual verification**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

Expected: Vite serves the site at `http://127.0.0.1:4173/`. Keep this process running only while the checks below are performed.

- [ ] **Step 4: Verify the desktop experience at 1440 × 900**

Open the local site in the browser at a 1440 × 900 viewport and confirm:

- the first view is a closed clothbound album on a warm table, not a conventional hero section;
- opening the cover visibly turns it away and reveals an actual two-page book;
- the opening dedication uses the full spread;
- contribution spreads have overlapping, tilted photos, uneven placement, paper artifacts, and a visible center binding;
- paired pages do not read as identical cards or a testimonial grid;
- page-edge click, Back/Next, Left/Right Arrow, Page Up/Page Down, Home, and End work;
- opening a message traps focus in the reading view, Escape closes it, and focus returns to the note;
- the final contribution sits beside the closing farewell;
- the browser console has no uncaught errors or missing-asset requests.

- [ ] **Step 5: Verify the mobile experience at 390 × 844**

Resize to 390 × 844 and reload, then confirm:

- the first view is the same physical album scaled as something held in the hands;
- opening reveals one richly layered page rather than a vertical list;
- all 15 recipes retain tape, texture, overlaps, rotations, and decorations;
- horizontal swipe/drag changes pages, while vertical movement still behaves normally and tapping notes is not swallowed;
- every message can be read in the enlarged view without horizontal scrolling;
- controls have comfortable touch targets and never cover the note trigger;
- the cover, opening, all 15 contributions, and closing page are reachable;
- rotating or widening across the 900px breakpoint preserves the current memory instead of resetting to page one.

- [ ] **Step 6: Verify motion preference and narrow-screen resilience**

Enable reduced motion in the browser and confirm page/cover transitions become effectively immediate while navigation still works. Then check 320 × 568 and confirm the album remains within the viewport, the page does not become a normal stacked website, and the reading dialog scrolls internally for long messages.

- [ ] **Step 7: Fix only observed defects, then re-run build and the affected checks**

For every issue found in Steps 4–6:

1. record the failing viewport and interaction;
2. make the smallest CSS or component correction;
3. run `npm run build`;
4. repeat the exact failing check at desktop and mobile sizes when the change affects shared behavior.

Do not replace the approved illustrated-handmade material direction with generated photorealistic paper assets during polish.

- [ ] **Step 8: Confirm a clean diff and commit verified polish**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` reports no whitespace errors. Review every remaining path in `git status --short` before committing.

If visual verification required fixes, commit them:

```bash
git add src README.md
git commit -m "fix: polish scrapbook across desktop and mobile"
```

If no fixes were required, do not create an empty commit.

- [ ] **Step 9: Stop the local development server and hand off without deploying**

Stop the Vite process. Report the final production-build result, the desktop/mobile viewports checked, the navigation and note interactions checked, and the content replacement file. Do not publish or configure hosting; deployment remains with the user.
