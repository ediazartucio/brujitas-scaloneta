"""
Regenerates per-team share images + share pages for Freezer Mundialista.

Requires: pip install pillow cairosvg
Usage: python3 generate_share_assets.py

Run this once per new team as the bracket progresses (semis, final).
Add the team to TEAMS below, then run — outputs go to:
  images/share/{code}.png   (composited og:image, 1254x1254)
  share/{code}.html         (static share page with og: tags + redirect)
"""
import cairosvg
from PIL import Image

SITE_URL = "https://freezermundialista.netlify.app"
BASE_IMAGE = "og-base-final.png"

# (fifa_code, spanish display name)
TEAMS = [
    ("FRA", "Francia"),
    ("MAR", "Marruecos"),
    ("ESP", "España"),
    ("BEL", "Bélgica"),
    ("NOR", "Noruega"),
    ("ENG", "Inglaterra"),
    ("ARG", "Argentina"),
    ("SUI", "Suiza"),
]

PAPELITO_SVG = """<svg width="420" height="300" viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <radialGradient id="rim" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#bfe9ff" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#bfe9ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="210" cy="150" rx="170" ry="120" fill="url(#rim)" filter="url(#glow)"/>
  <g transform="translate(210,150) rotate(-6)">
    <rect x="-120" y="-76" width="240" height="152" rx="4" fill="#000000" opacity="0.4" filter="url(#shadow)" transform="translate(7,12)"/>
    <rect x="-120" y="-76" width="240" height="152" rx="4" fill="#f5f0e2"/>
    <rect x="-120" y="-76" width="240" height="152" rx="4" fill="none" stroke="#e8c468" stroke-width="3"/>
    <polygon points="80,76 120,76 120,38" fill="#e0dac6"/>
    <rect x="-48" y="-96" width="96" height="26" rx="2" fill="#e7e2cc" opacity="0.9" transform="rotate(2)"/>
    <text x="0" y="-6" text-anchor="middle" font-family="Humor Sans" font-size="{fontsize}" fill="#1a1a1c">{name}</text>
  </g>
</svg>"""

SHARE_HTML = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Freezer mundialista — congelar a {name}</title>
<meta property="og:title" content="\u2744 Vot\u00e9 para congelar a {name}">
<meta property="og:description" content="Sumate al freezer colectivo del Mundial 2026 \u2014 vot\u00e1 y congel\u00e1 con nosotros.">
<meta property="og:image" content="{site_url}/images/share/{code_lower}.jpg">
<meta property="og:image:width" content="1254">
<meta property="og:image:height" content="1254">
<meta property="og:url" content="{site_url}/share/{code_lower}.html">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=/">
</head>
<body>
<script>location.replace('/');</script>
<p>Redirigiendo a Freezer Mundialista...</p>
</body>
</html>"""

# placement tuned against the freezer photo — same spot for every team since
# it's the same base image each time (moved right from the original x=700 to
# clear the door's hinge column, confirmed against grid overlay)
PLACEMENT = {"x": 840, "y": 300, "w": 320, "h": 229}

def font_size_for(name):
    # longer team names need a smaller font to keep fitting inside the papelito
    return 42 if len(name) <= 9 else 34

def generate():
    base = Image.open(BASE_IMAGE).convert("RGBA")
    for code, name in TEAMS:
        svg = PAPELITO_SVG.format(name=name, fontsize=font_size_for(name))
        png_bytes = cairosvg.svg2png(bytestring=svg.encode(), output_width=840, output_height=600)
        import io
        papelito = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        papelito = papelito.resize((PLACEMENT["w"], PLACEMENT["h"]), Image.LANCZOS)

        composed = base.copy()
        composed.paste(papelito, (PLACEMENT["x"], PLACEMENT["y"]), papelito)
        composed.convert("RGB").save(f"images/share/{code.lower()}.jpg", "JPEG", quality=82, optimize=True)

        html = SHARE_HTML.format(name=name, site_url=SITE_URL, code_lower=code.lower())
        with open(f"share/{code.lower()}.html", "w") as f:
            f.write(html)

        print(f"generated {code} -> images/share/{code.lower()}.jpg + share/{code.lower()}.html")

if __name__ == "__main__":
    import os
    os.makedirs("images/share", exist_ok=True)
    os.makedirs("share", exist_ok=True)
    generate()
