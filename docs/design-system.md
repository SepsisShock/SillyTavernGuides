# Guide design foundation

Every page shares the site header. Guides can separately adopt the article
foundation while keeping their own teaching layouts and interactions.

## Files and adoption

- `assets/css/guides.css`: color, typography, spacing, and radius tokens; article
  layout and contents; tables; code and copy controls; screenshots;
  notices; optional source/result comparisons; responsive and print presentation.
- `assets/css/regex.css`: Regex table column widths, mobile flag/symbol/recipe
  presentation, settings relationships, and the pink Character Status demonstration.
- `assets/js/guides.js`: optional enhancements for contents, active-section links,
  copy buttons, and screenshot fallback URLs.

- `assets/css/navigation.css`: the site header, dropdown, focus indicators, and
  responsive and print rules shared by all pages, independent of page themes.
- `assets/data/guides.json`: guide metadata, search keywords, and featured ordering.
- `assets/js/navigation.js`: catalog loading, alphabetical menu, current-page
  marker, guide search, featured cards, and keyboard/dismissal behavior.

Link shared CSS first, then a guide's own CSS. Load the shared script with `defer`.
Use paths relative to the HTML file, such as `./assets/css/guides.css`, so project
GitHub Pages sites work without a build step. No framework, font download, or
runtime package is required.

Future guides can adopt the tokens and individual components after review. They
should keep their own teaching layouts, diagrams, and interactions; they do not
need to adopt Regex Basics' entire page structure or table variants.

## Site header

Every HTML page links `./assets/css/navigation.css` before its page styles and loads
`./assets/js/navigation.js` with `defer`. Use the same `.st-site-nav` markup:

```html
<nav class="st-site-nav" aria-label="Site navigation">
  <a class="st-brand" href="./index.html">Main</a>
  <div class="st-site-actions">
    <details>
      <summary>Guides</summary>
      <div class="st-menu" data-guide-menu>
        <a href="./ppp.html">Prompt Post-Processing</a>
        <a href="./regex.html">Regex Basics</a>
      </div>
    </details>
  </div>
</nav>
```

Keep header styles in `navigation.css` and menu behavior in `navigation.js`.
Avoid page-specific header overrides or duplicate dismissal listeners. Add new
guide entries to `assets/data/guides.json`, then run the sync command below. The active link uses color and background so its
font weight does not change wrapping on narrow screens. Search is added beside
Guides after the catalog loads, and moves below the header links on small screens.
The homepage also contains a visible search form below Featured Guides, styled by
`assets/css/search.css`. Keep shared navigation asset version strings consistent
across pages when publishing a behavior change.

## Guide catalog and search

`assets/data/guides.json` is the single source for guide metadata. Each entry has
href, title, heading, description, keywords, and featured fields. A featured
value of 1 through 4 chooses a homepage guide and sets its display order; 0
keeps it in navigation and search only. Entries stay alphabetical.

Run `python3 scripts/sync-featured.py` after catalog edits. It refreshes the four
static homepage cards and the complete static menu on every page. The `--check`
option verifies those snapshots without writing. No build step is required to
serve the site. The shared navigation script reads the JSON catalog directly;
guide metadata does not depend on a separate directory page.

Search matches titles, descriptions, keywords, and the readable text inside all
guides. Title matches come first, followed by topic matches and then text matches.
Text matches show a short excerpt. On the first nonempty query, guide pages load
with at most four requests in flight; their text is reused for later queries and
both forms on the page. Scripts, styles, navigation, contents rails, and footers
are excluded. Editing guide text does not require generating a search index.

Results are ordinary links. Arrow keys move between them; Escape closes results
and returns focus to the field. The homepage Search button keeps results on the
page; Enter in header search opens the first visible result. Empty queries close
results; unmatched queries show a message. Failed guide requests produce a
partial-search notice while preserving title and topic matches.

The homepage search form submits to `index.html?q=…#main-guide-query` if its live
handler has not loaded. The homepage initializes search from that query.
Without JavaScript, featured cards and the complete guide menus remain usable.
The homepage explains that live search needs JavaScript. If the JSON request
fails, those static cards and links remain visible and search shows a short
availability message.

## Component contracts

- `.guide-shell` contains `.guide-hero`, `.guide-toc`, and `.guide-article`. The
  contents rail is sticky on desktop and becomes a native disclosure on mobile.
  The main landmark stays intact at every width.
- `.toc-panel` is a native `details` element, initially open for access without
  JavaScript. `.toc-links` contains ordinary links to existing section IDs.
- `.guide-table.table-stack` remains a semantic table. Each `th` has an ID and
  `scope="col"`; each cell references it through `headers`. A `.table-label`
  repeats the column name visually on mobile and has `aria-hidden="true"` to avoid
  duplicate announcements. `.cell-content` holds the original content.
- Cells with `data-kind="find"`, `"replace"`, `"source"`, or `"result"` identify
  their role. Color supplements the visible column names and mobile labels.
- `code[data-copy]` marks an exact copy target. The attribute names its field.
  The script adds a native button and copies only the code node's text, retaining
  backslashes, macros, and line breaks. Empty replacement instructions are not
  treated as code. Feedback is announced in `#copy-status` with `role="status"`.
- `.code-block` preserves code line breaks, wraps long lines, and remains
  keyboard-scrollable when needed. `.example-comparison` is an optional source
  and result pair, not a required layout for every guide.
- `.screenshot` provides spacing without a background or frame. Images keep their
  original URLs, fallback URLs, attributes, and proportions.
- `.notice` is neutral; `.notice-warning` adds amber only for genuine caveats.

Article content, contents links, and the header home link remain usable without
JavaScript. The guide dropdown contains static links to every guide, which
`navigation.js` refreshes from the JSON catalog. Copy controls
are added only when the script runs. Clipboard failure falls back to selecting
only the code and announcing how to copy it manually. No animation is required.

## Review checklist

Check desktop, tablet, and mobile layouts, including 320 CSS pixels and browser
zoom. Look for page overflow, long regex wrapping, preserved table relationships,
image proportions, readable labels, and focus indicators. Verify contents with
keyboard input, site-menu Escape/click-outside behavior, exact clipboard content,
and the page with JavaScript disabled. Check every existing site link and confirm
other guides have not adopted the stylesheet inadvertently.
