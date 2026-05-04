#!/usr/bin/env python3
"""Generate docs/35mmAI-media-kit.pdf for partner programs (e.g. Impact)."""

from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "35mmAI-media-kit.pdf"


def main() -> None:
    pdf = FPDF()
    pdf.set_margins(left=18, top=18, right=18)
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    usable_w = pdf.w - pdf.l_margin - pdf.r_margin

    pdf.set_font("Helvetica", "B", 18)
    pdf.multi_cell(usable_w, 9, "35mmAI Media Kit")
    pdf.ln(6)

    pdf.set_font("Helvetica", "B", 12)
    pdf.multi_cell(usable_w, 7, "About")
    pdf.set_font("Helvetica", "", 11)
    body = (
        "35mmAI is a curated AI tools directory and workflow resource for independent "
        "filmmakers, editors, and small production teams. We help users discover practical "
        "software for pre-production, production, and post with clear, role-aware guidance."
    )
    pdf.multi_cell(usable_w, 6, body)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.multi_cell(usable_w, 7, "Primary website")
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(usable_w, 6, "https://www.35mmai.com")
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.multi_cell(usable_w, 7, "Audience")
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(
        usable_w,
        6,
        "Independent filmmakers, video editors, producers, and creator teams comparing "
        "tools for real-world film and video workflows.",
    )
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.multi_cell(usable_w, 7, "Promotion and affiliate approach")
    pdf.set_font("Helvetica", "", 11)
    promo = (
        "We publish editorial listings, category guides, and workflow notes on 35mmAI. "
        "Affiliate links are used only where a partner product is a genuine fit for the "
        "reader. Pages that include referral links include clear disclosure that we may earn "
        "a commission. We do not operate coupon farms, misleading discount claims, or paid "
        "search on partner trademarks."
    )
    pdf.multi_cell(usable_w, 6, promo)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.multi_cell(usable_w, 7, "Contact")
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(usable_w, 6, "35mmAI | https://www.35mmai.com")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
