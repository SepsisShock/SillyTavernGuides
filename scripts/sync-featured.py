#!/usr/bin/env python3
"""Sync static featured cards and guide menus from the shared JSON catalog."""

import argparse
from html import escape
import json
from pathlib import Path
import re


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--check", action="store_true", help="Check without writing")
    options = args.parse_args()
    root = Path(__file__).resolve().parents[1]
    guides = json.loads((root / "assets/data/guides.json").read_text(encoding="utf-8"))
    featured = sorted(
        (guide for guide in guides if guide.get("featured", 0) > 0),
        key=lambda guide: guide["featured"],
    )
    if not featured or len({guide["featured"] for guide in featured}) != len(featured):
        raise SystemExit("Featured guides need unique positive display ranks.")
    cards = []
    for guide in featured:
        title = guide["title"].strip()
        heading = guide["heading"] or title
        cards.append(
            f'      <a class="guide" href="{escape(guide["href"], quote=True)}">\n'
            f'        <span class="number">{escape(title.upper())}</span>\n'
            f'        <h3>{escape(heading)}</h3>\n'
            f'        <p>{escape(guide["description"].strip())}</p>\n'
            '      </a>'
        )
    replacement = (
        '<div class="cards" data-featured-guides>\n'
        + "\n".join(cards)
        + '\n    </div>'
    )
    path = root / "index.html"
    before = path.read_text(encoding="utf-8")
    after, count = re.subn(
        r'<div class="cards" data-featured-guides>[\s\S]*?</div>',
        lambda match: replacement,
        before,
    )
    if count != 1:
        raise SystemExit("Expected one featured guide container in index.html.")
    after = after.replace('<div data-featured-section hidden>', '<div data-featured-section>')
    updates = {path: after}
    ordered = sorted(guides, key=lambda guide: guide["title"].casefold())
    for page in sorted(root.glob("*.html")):
        links = []
        for guide in ordered:
            active = ' aria-current="page"' if guide["href"].split("/")[-1] == page.name else ""
            links.append(
                f'<a href="{escape(guide["href"], quote=True)}"{active}>'
                f'{escape(guide["title"])}</a>'
            )
        content = updates.get(page, page.read_text(encoding="utf-8"))
        updated, menus = re.subn(
            r'(<div class="st-menu" data-guide-menu>)[\s\S]*?(</div>)',
            lambda match: match[1] + "".join(links) + match[2],
            content,
        )
        if menus != 1:
            raise SystemExit(f"Expected one shared guide menu in {page.name}.")
        updates[page] = updated
    if options.check:
        stale = [
            page.name for page, content in updates.items()
            if page.read_text(encoding="utf-8") != content
        ]
        if stale:
            raise SystemExit("Run python3 scripts/sync-featured.py to update: " + ", ".join(stale))
        print(f"Verified {len(featured)} featured cards and {len(updates)} guide menus.")
    else:
        for page, content in updates.items():
            page.write_text(content, encoding="utf-8")
        print(f"Updated {len(featured)} featured cards and {len(updates)} guide menus.")


if __name__ == "__main__":
    main()
