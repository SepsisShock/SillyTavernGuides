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
- `guides.html`: the complete static guide catalog, metadata, search keywords,
  and featured ordering. `assets/css/catalog.css` styles its compact list.
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
        <a href="./index.html#guides">Browse all guides</a>
      </div>
    </details>
  </div>
</nav>
```

Keep header styles in `navigation.css` and menu behavior in `navigation.js`.
Avoid page-specific header overrides or duplicate dismissal listeners. Add new
guide entries to `guides.html`. The active link uses color and background so its
font weight does not change wrapping on narrow screens. Search is added beside
Guides after the catalog loads, and moves below the header links on small screens.
The homepage also contains a visible search form above Featured Guides, styled by
`assets/css/search.css`. Keep shared navigation asset version strings consistent
across pages when publishing a behavior change.

## Guide catalog and search

`guides.html` is the single source for guide metadata. Its alphabetical
`li[data-guide]` entries contain the destination link, `[data-guide-title]`, and
`[data-guide-description]`. `data-heading` supplies the featured card's short
headline; `data-keywords` supplies plain-language search aliases. To feature a
guide, set `data-featured="1"` through `"4"` on the four chosen entries. The value
sets the homepage display order. Omit the attribute on all other guides.

Search matches all words in a query against titles, descriptions, keywords,
and the readable text inside every guide, regardless of whether it is featured.
Title matches come first, followed by topic matches and then guide-text matches.
Text matches show a short context excerpt. On the first nonempty query, guide
pages are fetched with at most four requests in flight; text is reused for later
queries and for both search forms on the same page. Scripts, styles, navigation,
contents rails, and footers are excluded from the text. No generated text index
or additional maintenance command is needed when editing a guide.

Results are ordinary links. Arrow keys move between results; Escape closes the
results and returns focus to the field. The homepage Search button keeps results
on the page; Enter in header search opens the first visible result. Empty queries
close results, unmatched queries show a short message, and failed guide requests
produce a partial-search notice while preserving title and topic matches.

The catalog page is fully usable without JavaScript. Other pages fetch it once
to populate their menu, search, and any featured section. If JavaScript or the
catalog request fails, static navigation still leads through the homepage to the
complete catalog. The homepage's static search form can submit to
`guides.html?q=…` if its live handler has not loaded; the catalog initializes
search from that query. Without JavaScript, the full static guide list remains
available and the homepage explains that live search requires JavaScript.
The homepage's featured cards are also embedded in HTML so they stay visible
when scripts are disabled, the
catalog request fails, or an older script is cached. After editing featured
choices or their displayed text, run `python3 scripts/sync-featured.py` to refresh
that snapshot from the catalog; `--check` verifies it without writing. This is a
maintenance command, not a required build step for serving the site.

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
JavaScript. The guide dropdown includes a static “Browse all guides” link, which
`navigation.js` replaces with the individual guide links. Copy controls
are added only when the script runs. Clipboard failure falls back to selecting
only the code and announcing how to copy it manually. No animation is required.

## Review checklist

Check desktop, tablet, and mobile layouts, including 320 CSS pixels and browser
zoom. Look for page overflow, long regex wrapping, preserved table relationships,
image proportions, readable labels, and focus indicators. Verify contents with
keyboard input, site-menu Escape/click-outside behavior, exact clipboard content,
and the page with JavaScript disabled. Check every existing site link and confirm
other guides have not adopted the stylesheet inadvertently.
