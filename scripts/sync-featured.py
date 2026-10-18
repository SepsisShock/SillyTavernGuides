#!/usr/bin/env python3
"""Refresh the homepage's static featured cards from guides.html."""

import argparse
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re


class CatalogParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.guides = []
        self.current = None
        self.field = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "li" and "data-guide" in attrs:
            self.current = {
                "rank": int(attrs.get("data-featured", "0")),
                "heading": attrs.get("data-heading", ""),
            }
        elif self.current is not None:
            if tag == "a":
                self.current["href"] = attrs["href"]
            elif "data-guide-title" in attrs:
                self.field = "title"
            elif "data-guide-description" in attrs:
                self.field = "description"

    def handle_data(self, text):
        if self.current is not None and self.field:
            self.current[self.field] = self.current.get(self.field, "") + text

    def handle_endtag(self, tag):
        if tag in ("h2", "p"):
            self.field = None
        elif tag == "li" and self.current is not None:
            self.guides.append(self.current)
            self.current = None


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--check", action="store_true", help="Check without writing")
    options = args.parse_args()
    root = Path(__file__).resolve().parents[1]
    catalog = CatalogParser()
    catalog.feed((root / "guides.html").read_text(encoding="utf-8"))
    featured = sorted(
        (guide for guide in catalog.guides if guide["rank"] > 0),
        key=lambda guide: guide["rank"],
    )
    if not featured or len({guide["rank"] for guide in featured}) != len(featured):
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
    if options.check:
        if after != before:
            raise SystemExit("Featured cards need updating: python3 scripts/sync-featured.py")
        print(f"Verified {len(featured)} static featured cards.")
    else:
        path.write_text(after, encoding="utf-8")
        print(f"Updated {len(featured)} static featured cards.")


if __name__ == "__main__":
    main()
