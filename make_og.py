"""
Generate the Open Graph social preview image for Birds & Fin Midwest Fest.
Output: og-image.png  (1200 x 630 px — ideal for all platforms)
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os

W, H = 1200, 630
out_path = os.path.join(os.path.dirname(__file__), "og-image.png")

# ── Canvas ──────────────────────────────────────────────────────
img = Image.new("RGB", (W, H), "#0d2818")
draw = ImageDraw.Draw(img)

# ── Deep forest gradient background ─────────────────────────────
for y in range(H):
    t = y / H
    r = int(13  + (26  - 13)  * t)
    g = int(40  + (58  - 40)  * t)
    b = int(24  + (42  - 24)  * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# ── Radial glow (center top) ─────────────────────────────────────
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy = W // 2, 180
for i in range(120, 0, -1):
    alpha = int(55 * (1 - i / 120))
    rx, ry = i * 5, i * 3
    gd.ellipse([(cx - rx, cy - ry), (cx + rx, cy + ry)],
               fill=(82, 183, 136, alpha))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img)

# ── Bottom-right warm glow ────────────────────────────────────────
glow2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd2 = ImageDraw.Draw(glow2)
for i in range(80, 0, -1):
    alpha = int(35 * (1 - i / 80))
    rx, ry = i * 5, i * 3
    gd2.ellipse([(W - rx + 20, H - ry + 30), (W + rx + 20, H + ry + 30)],
                fill=(244, 160, 34, alpha))
img = Image.alpha_composite(img.convert("RGBA"), glow2).convert("RGB")
draw = ImageDraw.Draw(img)

# ── Decorative arc lines ─────────────────────────────────────────
for r in [480, 520, 560]:
    cx2, cy2 = W // 2, -60
    bbox = [cx2 - r, cy2 - r, cx2 + r, cy2 + r]
    draw.arc(bbox, start=20, end=160, fill=(82, 183, 136, 40), width=1)

# ── Dot grid pattern ─────────────────────────────────────────────
for gx in range(0, W, 48):
    for gy in range(0, H, 48):
        draw.ellipse([(gx - 1, gy - 1), (gx + 1, gy + 1)],
                     fill=(82, 183, 136, 25))

# ── Font loading (fallback to default) ───────────────────────────
def load_font(size, bold=False):
    candidates_bold = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    candidates_reg = [
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSText.ttf",
    ]
    candidates = candidates_bold if bold else candidates_reg
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

font_big   = load_font(88, bold=True)
font_sub   = load_font(36)
font_tag   = load_font(22)
font_badge = load_font(20)

# ── Helper: centered text ─────────────────────────────────────────
def ctext(text, y, font, color, draw=draw):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, y), text, font=font, fill=color)

# ── Top badge pill ────────────────────────────────────────────────
badge_text = "  MIDWEST'S PREMIERE EXOTIC PET & AQUARIUM EVENT  "
bb = draw.textbbox((0, 0), badge_text, font=font_badge)
bw = bb[2] - bb[0] + 32
bh = bb[3] - bb[1] + 18
bx = (W - bw) // 2
by = 52
draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=30,
                        fill=(82, 183, 136, 40), outline=(82, 183, 136, 120), width=1)
ctext(badge_text, by + 8, font_badge, (82, 183, 136))

# ── Emoji row ─────────────────────────────────────────────────────
# PIL doesn't render color emoji, so we draw stylized icon circles
icons = [
    ((82,  183, 136), "B"),   # Birds   → teal
    ((64,  164, 223), "F"),   # Fish    → blue
    ((180, 120,  60), "R"),   # Reptile → brown
    ((100, 180,  80), "P"),   # Plants  → green
]
icon_size = 54
spacing   = 80
total_w   = len(icons) * icon_size + (len(icons) - 1) * (spacing - icon_size)
sx = (W - total_w) // 2
iy = 118

icon_labels = ["🦜", "🐠", "🦎", "🌿"]
font_emoji = load_font(36)
for i, ((r, g, b), letter) in enumerate(icons):
    cx3 = sx + i * spacing + icon_size // 2
    cy3 = iy + icon_size // 2
    draw.ellipse([(cx3 - 28, cy3 - 28), (cx3 + 28, cy3 + 28)],
                 fill=(r, g, b, 60), outline=(r, g, b, 150), width=2)
    eb = draw.textbbox((0, 0), letter, font=font_emoji)
    ew = eb[2] - eb[0]
    eh = eb[3] - eb[1]
    draw.text((cx3 - ew // 2, cy3 - eh // 2), letter,
              font=font_emoji, fill=(r, g, b))

# ── Main title "Fins & Feathers" ─────────────────────────────────
line1 = "Fins & Feathers"
b1 = draw.textbbox((0, 0), line1, font=font_big)
tw1 = b1[2] - b1[0]
tx1 = (W - tw1) // 2
ty1 = 190

# Shadow
draw.text((tx1 + 3, ty1 + 4), line1, font=font_big, fill=(0, 0, 0, 80))
# Main text white
draw.text((tx1, ty1), line1, font=font_big, fill=(255, 255, 255))

# ── "Market App" in gold/teal gradient ───────────────────────────
line2 = "Market App"
b2 = draw.textbbox((0, 0), line2, font=font_big)
tw2 = b2[2] - b2[0]
tx2 = (W - tw2) // 2
ty2 = ty1 + (b1[3] - b1[1]) + 6

# Draw letter by letter with gradient color
chars = list(line2)
char_widths = []
for ch in chars:
    cb = draw.textbbox((0, 0), ch, font=font_big)
    char_widths.append(cb[2] - cb[0])

cx_start = tx2
for i, (ch, cw) in enumerate(zip(chars, char_widths)):
    t = i / max(len(chars) - 1, 1)
    # gold (#f4a022) → teal (#52b788)
    r2 = int(244 + (82  - 244) * t)
    g2 = int(160 + (183 - 160) * t)
    b2c = int(34  + (136 - 34)  * t)
    draw.text((cx_start, ty2), ch, font=font_big, fill=(r2, g2, b2c))
    cx_start += cw

# ── Divider line ──────────────────────────────────────────────────
div_y = ty2 + (b2[3] - b2[1]) + 24
draw.line([(W // 2 - 180, div_y), (W // 2 + 180, div_y)],
          fill=(82, 183, 136, 100), width=1)

# ── Tagline ───────────────────────────────────────────────────────
tagline = "Birds  ·  Aquarium Fish  ·  Reptiles  ·  Exotic Plants  ·  Vendors"
ctext(tagline, div_y + 16, font_tag, (200, 230, 215))

# ── Bottom pill "Join the Waitlist →" ────────────────────────────
pill_text = "  Join the Waitlist →  "
pb = draw.textbbox((0, 0), pill_text, font=font_tag)
pw = pb[2] - pb[0] + 28
ph = pb[3] - pb[1] + 20
px = (W - pw) // 2
py = div_y + 72
draw.rounded_rectangle([px, py, px + pw, py + ph], radius=30,
                        fill=(45, 106, 79), outline=(82, 183, 136), width=2)
ctext(pill_text, py + 9, font_tag, (255, 255, 255))


# ── Save ──────────────────────────────────────────────────────────
img.save(out_path, "PNG", optimize=True)
print(f"Saved: {out_path}  ({W}x{H})")
