# AGENTS.md — TripNest

## 1. Project mission

TripNest is a Traditional Chinese personal travel-guide library. It turns every destination into the same dependable guide: orientation, highlights, food, transport, a sample itinerary, practical notes, and source links.

The main extensibility rule is simple: **a new destination is normally one new object in `data/destinations.json`, not a new HTML page**. `destination.html?id=<destination-id>` is the shared detail-page template.

All agents must read this file before changing the project. Preserve existing user-authored content and keep the site deployable as a static GitHub Pages site.

## 2. Technology and constraints

- HTML5, CSS3, vanilla JavaScript (ES6+), and JSON only.
- No backend, database, build step, frontend framework, or runtime package dependency.
- All internal links and assets use relative paths so the site works from a GitHub Pages project subpath.
- The interface and travel content use Traditional Chinese (`zh-Hant`).
- Progressive enhancement: core content remains understandable if animation is unavailable.
- Do not add libraries when the browser platform is sufficient.
- Do not add accounts, online editing, payments, booking, or data collection unless explicitly requested.

## 3. Canonical project structure

```text
.
├── AGENTS.md
├── README.md
├── index.html
├── destination.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── shared.js
│       ├── app.js
│       └── destination.js
├── data/destinations.json
├── docs/extension-verification.md
└── tests/validate.mjs
```

Keep destination data in the JSON file. Do not duplicate the detail-page markup for individual cities.

## 4. Design system

### Direction

The visual style is a calm Japanese travel journal: editorial typography, warm paper backgrounds, deep forest green, vermilion accents, generous spacing, asymmetrical photography, and subtle map/route motifs. It should feel curated rather than like a generic dashboard.

### Tokens

- Paper: `#f3efe6`
- Warm white: `#fbfaf6`
- Ink: `#18332c`
- Muted ink: `#66736d`
- Forest: `#244d40`
- Vermilion: `#cf5b3c`
- Sand: `#d9c9ad`
- Border: `rgba(24, 51, 44, 0.16)`
- Display face: Georgia or an available serif fallback.
- Body face: system sans-serif stack.

### UI rules

- Reuse the existing button, chip, card, and section-heading classes.
- Minimum body text size is 16px; keep comfortable line height.
- Visible focus indicators are mandatory.
- Do not communicate state using color alone.
- Use semantic headings in order and landmarks (`header`, `nav`, `main`, `footer`).
- Motion must respect `prefers-reduced-motion`.
- Desktop layout must adapt at approximately 1024px, 760px, and 480px.
- At 320px wide, there must be no horizontal scrolling and all controls must remain usable.
- Destination photos use a 16:10 or taller editorial crop and meaningful alternative text.

## 5. Destination data schema

`data/destinations.json` is a JSON array. Every object must include all fields below.

| Field | Type / rule |
| --- | --- |
| `id` | Unique lowercase kebab-case ASCII identifier. Never change after publication. |
| `city` | Traditional Chinese city name. |
| `cityEn` | English city name. |
| `country` | Traditional Chinese country name. |
| `region` | Region used by filtering; currently `關西`, `九州`, or `關東`. |
| `theme` | One of `文化古都`, `美食漫遊`, `海港慢旅`, `都會探索`. |
| `eyebrow` | Short editorial label. |
| `tagline` | One concise sentence, 12–28 Chinese characters preferred. |
| `description` | Original overview; 45–100 Chinese characters. |
| `heroImage` | HTTPS image URL or relative image path. |
| `imageAlt` | Specific Traditional Chinese image description. |
| `imageCredit` | Object with non-empty `name` and HTTPS `url`. |
| `bestFor` | Array of 2–4 short audience labels. |
| `recommendedDays` | Human-readable duration, e.g. `3–4 天`. |
| `bestSeason` | Concise seasonal guidance without claiming certainty. |
| `pace` | Short travel-pace label. |
| `highlights` | Exactly 3 objects with `name`, `area`, and `description`. |
| `foods` | Exactly 3 objects with `name` and `note`. |
| `transport` | Object with `arrival`, `gettingAround`, and `tip`. |
| `itinerary` | Exactly 3 objects with `day`, `title`, and non-empty `stops` array. |
| `tips` | Array of 3–5 practical, non-duplicative strings. |
| `sources` | Array of at least 2 objects with `label` and HTTPS `url`; prefer official tourism or transport sources. |
| `updatedAt` | ISO date `YYYY-MM-DD`, representing the last content review. |

### Content integrity

- Use reliable sources, preferably official tourism bureaus, public transport operators, and venue sites.
- Travel information is time-sensitive. Verify prices, schedules, opening hours, closures, pass coverage, and reservation rules before including them.
- Prefer durable guidance over brittle exact figures. If an exact figure is necessary, add the review date and source.
- Do not fabricate personal experience, endorsements, safety guarantees, crowd levels, or accessibility claims.
- Do not copy long source passages. Summarize in original language and link the source.
- Do not use placeholder copy, invented statistics, or unlicensed imagery.
- Describe the sample itinerary as inspiration, not a guaranteed schedule.

## 6. Homepage behavior

- Load destination cards and counts from `data/destinations.json`; never hard-code the number of destinations.
- Search is case-insensitive and covers `city`, `cityEn`, `country`, `region`, `theme`, `tagline`, and `bestFor`.
- Region filters are generated from the JSON data and include an `全部` option.
- Search, region, and sort controls combine predictably.
- The result count updates after every filter operation.
- Empty results show a helpful state and a reset action.
- Each card links to `destination.html?id=<encoded-id>`.
- Image failures receive a styled fallback instead of a broken-image icon.

## 7. Detail-page behavior

- Read the `id` query parameter and match it exactly against the JSON data.
- Render every required guide section from the matching object.
- Missing or unknown IDs show an accessible not-found state with a link back to the library.
- JSON/network failures show an accessible error state; do not leave a blank page.
- Source links open safely with `target="_blank"` and `rel="noreferrer noopener"`.
- Related destinations are derived from the data rather than hard-coded.
- Keep the shared template generic; destination-specific conditionals require a documented reason.

## 8. Standard workflow for adding a destination

1. Read `AGENTS.md` and inspect at least one existing JSON object.
2. Confirm the requested city does not already exist by `id` or city name.
3. Research current information using at least two reliable sources.
4. Prepare one complete object conforming to Section 5.
5. Add only that object to `data/destinations.json`; do not clone `destination.html`.
6. Run `node tests/validate.mjs`.
7. Start a local static server and verify:
   - the card appears on the homepage;
   - search finds the Chinese and English city names;
   - the region filter includes and finds the city;
   - `destination.html?id=<id>` renders every guide section;
   - an unknown ID shows the not-found state;
   - keyboard focus and mobile layout remain usable.
8. Update `docs/extension-verification.md` when the addition is an assignment or acceptance-test demonstration.
9. Report sources, changed files, and test results.

Do not create a city-specific HTML file or change unrelated destination objects.

## 9. Modification rules

- Make the smallest coherent change that satisfies the request.
- Preserve public IDs and existing URLs.
- Keep content, presentation, and behavior separated: JSON, CSS, and JavaScript respectively.
- Prefer reusable rendering helpers over copied markup.
- Do not silently remove content or weaken tests.
- Do not commit secrets, tokens, personal data, generated dependency folders, or machine-specific files.
- Update README when structure, commands, behavior, or deployment changes.
- If a request conflicts with these rules, explain the conflict and ask before changing the project contract.

## 10. Validation and acceptance criteria

Every change must satisfy the applicable checks:

- [ ] `node tests/validate.mjs` exits successfully.
- [ ] JSON parses and every destination satisfies the schema.
- [ ] IDs are unique and kebab-case.
- [ ] All internal files referenced by HTML exist.
- [ ] Homepage renders from JSON; search, filter, sort, reset, and empty state work.
- [ ] Every destination detail URL renders all required sections.
- [ ] Invalid IDs and data-load failures have clear error states.
- [ ] No uncaught browser console errors on the homepage or representative detail page.
- [ ] Keyboard navigation and visible focus work.
- [ ] Layout is checked at 320px, 768px, and a desktop width.
- [ ] Text and controls meet basic contrast and touch-target expectations.
- [ ] GitHub Pages serves the deployed commit and its public URL returns successfully.

## 11. Deployment

- The production branch is `main`.
- GitHub Pages publishes the repository root through the included Pages workflow.
- Before publishing, confirm `git status`, run validation, and make sure only intended files are committed.
- After publishing, open both the repository and deployed site URLs. Test at least one destination query URL on the deployed site.
- Never place credentials in repository files or command output.

## 12. Definition of done

A change is complete only when the content follows the schema, shared templates render it, automated checks pass, representative browser flows work, documentation is current, and the requested deployment state is verified. A plausible-looking page without these checks is not done.
