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
- `assets/js/navigation.js`: the alphabetical guide list, current-page marker,
  outside-click dismissal, and Escape handling with focus returned to Guides.

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
  <a class="st-brand" href="./index.html">ST BEGINNER GUIDES</a>
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
guide links to the shared list in `navigation.js`. The active link uses color
and background so its font weight does not change wrapping on narrow screens.

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
