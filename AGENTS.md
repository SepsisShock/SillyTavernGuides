# Repository guidance

## Project and structure

- This is an independent, beginner-friendly collection of SillyTavern guides.
- The site is static HTML, CSS, and vanilla JavaScript hosted on GitHub Pages.
  There is no required build step, package manifest, or automated test suite.
- Keep the site dependency-free unless the task requires otherwise.
- `index.html` contains the public guide catalog; root-level topic HTML files
  contain the individual guides and their demonstrations.
- `assets/js/navigation.js` contains the shared alphabetical guide menu.
- `assets/css/guides.css` provides the opt-in shared design foundation;
  `assets/js/guides.js` provides optional contents, copy, and image enhancements.
- `assets/css/regex.css` contains Regex-specific presentation.
- Read `docs/design-system.md` for component contracts and review guidance.
  Its opening adoption note is historical; inspect each page's asset links to
  determine which shared files it currently uses.

## Editing and file organization

- Keep changes focused. Match surrounding conventions and avoid unrelated
  reformatting. Use readable formatting for new or substantially rewritten code.
- Preserve each guide's teaching layout and interactive behavior unless the task
  calls for changing them.
- Reuse shared components where appropriate. Do not apply the entire shared
  stylesheet to a page merely to reuse one component: its global styles can
  affect typography and layout.
- Keep the shared stylesheet coherent. Extract substantial or repeated CSS/JS
  when it improves maintenance; do not mechanically split small inline demos.
- Keep site-menu interaction behavior in `assets/js/navigation.js`. When editing
  navigation, consolidate duplicate handlers rather than adding another copy.
  Keep guide-specific interactions local to their guide.
- Load shared CSS before page-specific CSS, and external scripts with `defer`.
- Use relative internal links and asset paths that work under
  `/SillyTavernGuides/`. Preserve `.nojekyll`, existing page URLs, and section
  anchors unless changing them is necessary.
- When adding, removing, or renaming a guide, update the alphabetical menu in
  `assets/js/navigation.js` and the catalog in `index.html`. Keep README listings
  consistent with their stated scope, whether complete or explicitly selected.
- Update documentation when a change makes its description inaccurate.

## Content and accessibility

- Explain unfamiliar terms in plain language with practical examples.
- Verify technical claims against official SillyTavern documentation or relevant
  source code. Distinguish illustrative demonstrations from exact backend
  behavior, and qualify behavior that varies by provider, model, or version.
- Preserve regex escapes, macros, whitespace, line breaks, and replacement
  strings exactly. Copy controls must copy only the intended example text.
- Preserve screenshot sources, fallback behavior, proportions, and useful alt
  text unless the task calls for changing them.
- Preserve static reference content and useful navigation when scripts fail.
  JavaScript should enhance them. New guide menus should include a static
  “Browse all guides” link to `./index.html#guides` that JavaScript can replace.
- Use semantic headings and native controls, unique IDs, explicit labels, and
  visible keyboard focus. Preserve focus restoration when menus close.
- Preserve table header relationships, avoid conveying meaning by color alone,
  and respect reduced-motion preferences when introducing animation.

## Validation

- Preview from the repository root with `python3 -m http.server 8000`.
- Run `node --check` on changed standalone JavaScript files. Validate changed
  inline scripts too; checking only the external files does not cover them.
- Check affected local links, fragments, asset paths, duplicate IDs, and guide
  catalog consistency. Do not assume a fragment is correct merely because an
  element with that ID exists; confirm it targets the intended element.
- Check changed pages at desktop and mobile widths, including 320 CSS pixels
  and browser zoom. Look for overflow, wrapping, and distorted images.
- Exercise changed demonstrations, contents links, menus, and copy controls.
  Check keyboard navigation, Escape and focus behavior, and console errors.
- Check relevant static content and navigation with JavaScript disabled.
- For shared CSS/JS changes, identify consuming pages and check affected layouts
  and interactions across them, including distinct legacy page layouts.
- Run `git diff --check`. Add lightweight validation when it catches meaningful
  regressions; avoid introducing a tooling stack for a small content edit.
- Report what changed, what was checked, and any checks that could not run.
