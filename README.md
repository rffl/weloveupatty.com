# We Love You, Patty

A handmade digital farewell scrapbook celebrating Patty's four years in Melbourne.

## Stack and project boundary

- React 19 and TypeScript
- Vite 6
- Tailwind CSS v4 as the build foundation
- Handcrafted CSS for the physical scrapbook art direction
- Fontsource packages for self-hosted fonts

Use Node 22.12.0 (recorded in `.nvmrc`) and npm 10.9.0. There is no backend, router, CMS, authentication, analytics, unit-test framework, hosting configuration, or deployment workflow in this repository.

## Replace the placeholders

All scrapbook copy, contribution order, layout choices, photo metadata, and photo paths have one source of truth:

`src/content/scrapbook.ts`

Binary image files live separately in `public/photos/`. Do not import them into the content file.

The top-level content includes `title`, `subtitle`, the opening-page `eyebrow`, `title`, and `message`, and the closing-page `title`, `message`, and `signature`. Each contribution includes:

- `id`: a stable, unique page identifier
- `friendName`: the friend's displayed name
- `message`: their full wish or shared memory
- `photos`: the photo entries used by that page
- `layout`: the physical page recipe
- `accent`: its colour accent
- optional `melbourneDetail`, `location`, and `year` metadata

`melbourneDetail` appears in the enlarged reading view. `location` and `year` are reserved metadata and are not currently rendered.

The scrapbook requires exactly 15 contributions. Keep every `id` unique, and never use the reserved IDs `opening` or `closing`. The array order is the page order.

Keep each layout's existing photo entries and replace them in place. Every page recipe has fixed photo slots: if an expected entry is missing, that slot repeats the contribution's first photo, while extra entries are not displayed automatically. Change a contribution's `layout` or its number of visible photos only when you also intend to revise that layout recipe.

### Add the final photos

1. Create `public/photos/` if it does not exist.
2. Copy optimized images into that folder with simple, case-sensitive file names, such as `friend-01-laneway.jpg`.
3. Change the matching photo from `src: null` to a root-relative local path such as `src: "/photos/friend-01-laneway.jpg"`.
4. Replace the placeholder `alt` with meaningful text describing Patty, her friend, and the moment. Do not merely repeat the caption.
5. Replace or remove the optional `caption`, and set `focalPoint` to `"top"`, `"center"`, or `"bottom"` when a crop needs adjustment.

Landscape images around 1400 × 1050 pixels are a practical starting point. Export web-sized JPEG, WebP, or AVIF files instead of original multi-megabyte camera files. File names and paths are case-sensitive on most hosts.

When `src` stays `null`, the scrapbook renders a styled placeholder and makes no image request. If a real path fails at runtime, the same replacement panel appears instead of a broken-image icon.

Vite treats photo paths in the content file as strings, so a successful build does **not** prove that files under `/photos/...` exist. After replacing photos, use the production preview and visit every contribution to catch misspelled paths, wrong letter casing, poor crops, and inaccurate alternative text. Keep only optimized files in `public/photos/` that are referenced by the content file.

## Run locally

```bash
nvm use
npm install
npm run dev
```

Build the production bundle with:

```bash
npm run build
```

Preview that exact bundle with:

```bash
npm run preview
```

## Navigation

- Click or tap the cover to open it.
- Use the paper Back/Next controls or the outer page edges.
- Swipe or drag horizontally across non-interactive paper.
- Use Left/Right Arrow or Page Up/Page Down.
- Use Home/End to jump to the opening or closing page.
- Tap or click a friend's note to open an enlarged, scrollable reading view.

Desktop presents the pages as an open album spread on a table. Mobile presents the same materials and contribution recipes as one scrapbook page held in the hands. Their compositions are art-directed independently; mobile is not a collapsed card list.

## Unlisted, not private

`index.html` sends `noindex`, `nofollow`, and `noarchive` signals. `public/robots.txt` intentionally uses `Allow: /` so crawlers can access the HTML and read those meta directives; blocking crawling would prevent some crawlers from seeing `noindex`.

These signals reduce search-engine discovery, but they are not secrecy or access control. Anyone with the URL can view the scrapbook, and links can still be shared. Add real host-level authentication later if Patty's scrapbook must be private.

Hosting and deployment are deliberately not configured here. The site owner controls where and how the finished build is published.
