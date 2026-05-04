#!/usr/bin/env python3
"""
Generate docs/35mmAI-media-kit.pdf for partner programs (e.g. Impact).

Creates supporting PNGs under docs/media-kit-assets/ (brand hero + site-style preview).
Optional: downloads favicon from https://www.35mmai.com for the logo mark.

Install deps (project-local venv recommended):
  python3 -m venv .venv-media-kit
  . .venv-media-kit/bin/activate
  pip install -r scripts/requirements-media-kit.txt
  python3 scripts/generate-media-kit-pdf.py
"""

from __future__ import annotations

import urllib.request
from io import BytesIO
from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "35mmAI-media-kit.pdf"
ASSETS = ROOT / "docs" / "media-kit-assets"

BRAND_BG = (15, 15, 15)
ACCENT = (225, 29, 72)
TEXT_MUTED = (209, 213, 219)


def _try_import_pil():
    try:
        from PIL import Image, ImageDraw, ImageFont

        return Image, ImageDraw, ImageFont
    except ImportError as e:
        raise SystemExit(
            "Pillow is required. Run: pip install -r scripts/requirements-media-kit.txt"
        ) from e


def _font(size: int, bold: bool = False):
    Image, _, ImageFont = _try_import_pil()
    paths = []
    if bold:
        paths.append("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
    paths.extend(
        [
            "/Library/Fonts/Arial.ttf",
            "/Library/Fonts/Arial Unicode.ttf",
        ]
    )
    for p in paths:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def download_favicon_png() -> Path | None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    ico_path = ASSETS / "favicon-source.ico"
    png_path = ASSETS / "site-favicon.png"
    try:
        urllib.request.urlretrieve(
            "https://www.35mmai.com/favicon.ico",
            ico_path,
        )
    except OSError:
        return None

    Image, _, _ = _try_import_pil()
    try:
        im = Image.open(ico_path)
        im = im.convert("RGBA")
        # Use largest icon frame if multi-size .ico
        if hasattr(im, "seek"):
            sizes = []
            i = 0
            while True:
                try:
                    im.seek(i)
                    sizes.append((im.size[0], im.size[1], i))
                    i += 1
                except EOFError:
                    break
            if sizes:
                sizes.sort(key=lambda t: t[0] * t[1], reverse=True)
                im.seek(sizes[0][2])
        im.load()
        box = im.copy()
        box = box.resize((128, 128), Image.Resampling.LANCZOS)
        bg = Image.new("RGB", box.size, BRAND_BG)
        bg.paste(box, mask=box.split()[3] if box.mode == "RGBA" else None)
        bg.save(png_path, format="PNG")
        return png_path
    except OSError:
        return None


def build_hero_banner(favicon_png: Path | None = None) -> Path:
    Image, ImageDraw, _ = _try_import_pil()
    w, h = 1400, 420
    img = Image.new("RGB", (w, h), BRAND_BG)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, w, 4], fill=ACCENT)

    title = _font(64, bold=True)
    sub = _font(26, bold=False)
    tag = _font(20, bold=True)

    draw.text((48, 52), "35", fill=ACCENT, font=title)
    tw = draw.textlength("35", font=title)
    draw.text((48 + tw, 52), "mm", fill=(255, 255, 255), font=title)
    tw2 = draw.textlength("35mm", font=title)
    draw.text((48 + tw2, 52), "AI", fill=ACCENT, font=title)

    draw.rounded_rectangle([48, 130, 158, 168], radius=8, outline=(245, 158, 11), width=2)
    draw.text((62, 138), "BETA", fill=(245, 158, 11), font=tag)

    draw.text(
        (48, 210),
        "Curated AI tools for filmmakers — from script to screen.",
        fill=TEXT_MUTED,
        font=sub,
    )
    draw.text(
        (48, 258),
        "35mmai.com",
        fill=(161, 161, 170),
        font=_font(22, bold=False),
    )

    if favicon_png and favicon_png.exists():
        logo = Image.open(favicon_png).convert("RGBA")
        logo = logo.resize((112, 112), Image.Resampling.LANCZOS)
        img.paste(logo, (w - 48 - 112, 48), logo)

    ASSETS.mkdir(parents=True, exist_ok=True)
    path = ASSETS / "hero-brand.png"
    img.save(path, format="PNG", optimize=True)
    return path


def build_home_preview_mosaic() -> Path:
    """Approximates the homepage choice cards (visual cue from 35mmai.com)."""
    Image, ImageDraw, _ = _try_import_pil()
    w, h = 1400, 380
    img = Image.new("RGB", (w, h), BRAND_BG)
    draw = ImageDraw.Draw(img)

    draw.text(
        (48, 28),
        "Product snapshot (homepage structure)",
        fill=(161, 161, 170),
        font=_font(18, bold=False),
    )

    card_w = (w - 48 * 3) // 2
    y = 72
    h_card = 260
    x1, x2 = 48, 48 + card_w + 48

    # Card 1 — emerald lane
    draw.rounded_rectangle(
        [x1, y, x1 + card_w, y + h_card],
        radius=28,
        outline=(52, 211, 153),
        width=2,
    )
    draw.text((x1 + 28, y + 28), "INDIE / LOW BUDGET", fill=(52, 211, 153), font=_font(16, bold=True))
    draw.text((x1 + 28, y + 70), "Solo / Short Film", fill=(255, 255, 255), font=_font(36, bold=True))
    draw.text(
        (x1 + 28, y + 130),
        "Under ~$5,000 — fast, free & cheap tools",
        fill=TEXT_MUTED,
        font=_font(20, bold=False),
    )
    draw.rounded_rectangle(
        [x1 + 28, y + h_card - 72, x1 + card_w - 28, y + h_card - 24],
        radius=18,
        fill=(5, 150, 105),
    )

    # Card 2 — gold lane
    draw.rounded_rectangle(
        [x2, y, x2 + card_w, y + h_card],
        radius=28,
        outline=(234, 179, 8),
        width=2,
    )
    draw.text(
        (x2 + 28, y + 28),
        "HOLLYWOOD-STYLE / ASPIRATIONAL",
        fill=(234, 179, 8),
        font=_font(16, bold=True),
    )
    draw.text((x2 + 28, y + 70), "Indie Feature", fill=(255, 255, 255), font=_font(36, bold=True))
    draw.text(
        (x2 + 28, y + 130),
        "~$5K – $30K — cinematic polish on any budget",
        fill=TEXT_MUTED,
        font=_font(20, bold=False),
    )
    draw.rounded_rectangle(
        [x2 + 28, y + h_card - 72, x2 + card_w - 28, y + h_card - 24],
        radius=18,
        fill=(202, 138, 4),
    )

    path = ASSETS / "site-structure-preview.png"
    img.save(path, format="PNG", optimize=True)
    return path


def section_title(pdf: FPDF, title: str) -> None:
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(225, 29, 72)
    pdf.cell(pdf.epw, 7, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_text_color(30, 30, 30)
    pdf.ln(1)


def body_text(pdf: FPDF, text: str) -> None:
    pdf.set_font("Helvetica", "", 10.5)
    pdf.multi_cell(pdf.epw, 5.2, text)
    pdf.ln(2)


def main() -> None:
    _try_import_pil()

    ASSETS.mkdir(parents=True, exist_ok=True)
    logo_path = download_favicon_png()
    hero_path = build_hero_banner(favicon_png=logo_path)
    preview_path = build_home_preview_mosaic()

    pdf = FPDF(format="letter")
    pdf.set_margins(16, 14, 16)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_title("35mmAI Media Kit")
    pdf.set_author("35mmAI")

    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(pdf.epw, 8, "35mmAI - Partner media kit", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(
        pdf.epw,
        5,
        "Filmmaker-focused directory & workflow resource",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )
    pdf.ln(3)
    pdf.set_text_color(30, 30, 30)

    pdf.image(str(hero_path), x=pdf.l_margin, w=pdf.epw)
    pdf.ln(4)
    pdf.image(str(preview_path), x=pdf.l_margin, w=pdf.epw)
    pdf.ln(5)

    section_title(pdf, "About")
    body_text(
        pdf,
        "35mmAI is a curated AI tools directory and workflow planner for independent filmmakers, "
        "editors, and small production teams. We surface practical software for pre-production, "
        "production, and post - organized by role and stage so crews can compare options quickly.",
    )

    section_title(pdf, "Primary website")
    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(37, 99, 235)
    pdf.cell(
        pdf.epw,
        6,
        "https://www.35mmai.com",
        link="https://www.35mmai.com",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )
    pdf.set_text_color(30, 30, 30)
    pdf.ln(1)

    section_title(pdf, "Audience")
    body_text(
        pdf,
        "Independent filmmakers, video editors, producers, and creator teams who need trustworthy "
        "shortlists for real film workflows (not generic AI hype lists).",
    )

    # Page 2 — compliance + contact (room for partner review)
    pdf.add_page()
    section_title(pdf, "Promotion & affiliate approach")
    body_text(
        pdf,
        "Editorial listings, category guides, and workflow notes published on 35mmai.com. "
        "Affiliate links are used only when a product is a genuine fit for the reader. "
        "Pages with referral links include clear FTC-style disclosure. "
        "We do not run coupon farms, misleading discounts, or paid search on partner trademarks.",
    )

    section_title(pdf, "Why partner with 35mmAI")
    bullets = [
        "Niche audience actively choosing software for film and video production.",
        "Editorial positioning: practical stacks, budgets, and crew roles.",
        "Transparent disclosure aligned with affiliate program policies.",
    ]
    pdf.set_font("Helvetica", "", 10.5)
    for b in bullets:
        pdf.multi_cell(pdf.epw, 5.2, f"- {b}")
    pdf.ln(2)

    section_title(pdf, "Visual assets note")
    body_text(
        pdf,
        "Hero and preview images in this PDF are brand-aligned artwork generated for this kit "
        "plus the live site favicon when downloadable. They reflect the public 35mmai.com layout "
        "and positioning.",
    )

    section_title(pdf, "Contact")
    pdf.set_font("Helvetica", "", 10.5)
    pdf.multi_cell(pdf.epw, 5.5, "35mmAI | https://www.35mmai.com")
    pdf.ln(1)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT}")
    print(f"Assets in {ASSETS}")


if __name__ == "__main__":
    main()
