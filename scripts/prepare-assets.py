"""Derive web assets from assets-src without changing the originals. Run: py -3 scripts/prepare-assets.py."""
from pathlib import Path
from PIL import Image, ImageChops, ImageOps

root = Path(__file__).resolve().parents[1]
src = root / "assets-src"
out = root / "public" / "assets"
out.mkdir(parents=True, exist_ok=True)

source = Image.open(src / "logo.png").convert("RGB")
assert max(high for _, high in ImageChops.difference(source, ImageOps.grayscale(source).convert("RGB")).getextrema()) <= 5, "Logo must be nearly neutral for white-matte removal"
# ponytail: source tint differs by at most 5/255; use vector source if exact metallic color is required.
alpha = ImageOps.invert(ImageOps.grayscale(source))
# White-matte grayscale equals black ink with inverse-luminance alpha, preserving soft edges.
alpha = alpha.crop(alpha.getbbox())
alpha.thumbnail((1600, 500), Image.Resampling.LANCZOS)
for name, color in (("logo-transparent.png", "black"), ("logo-light.png", "white")):
    logo = Image.new("RGBA", alpha.size, color)
    logo.putalpha(alpha)
    logo.save(out / name, optimize=True)
    reopened = Image.open(out / name)
    assert reopened.mode == "RGBA" and reopened.getchannel("A").getextrema() == (0, 255)

symbol = Image.open(out / "logo-transparent.png").crop((0, 0, 600, 270))
symbol.thumbnail((56, 56), Image.Resampling.LANCZOS)
favicon = Image.new("RGBA", (64, 64), "#f7f8f7")
favicon.alpha_composite(symbol, ((64 - symbol.width) // 2, (64 - symbol.height) // 2))
favicon.save(out / "favicon.png", optimize=True)

photos = {
    "hero": ("hero.png", (1400, 1100)),
    "ecosystem-journals": ("ecosystem-journals.jpg", (1000, 760)),
    "ecosystem-books": ("ecosystem-books.jpg", (1000, 760)),
    "ecosystem-media": ("ecosystem-media.jpg", (1000, 760)),
    "ecosystem-training": ("ecosystem-training.jpg", (1000, 760)),
}
for name, (file, box) in photos.items():
    image = Image.open(src / file).convert("RGB")
    image.thumbnail(box, Image.Resampling.LANCZOS)
    image.save(out / f"{name}.webp", "WEBP", quality=82, method=6)
    assert (out / f"{name}.webp").stat().st_size < 350_000
    print(f"{name}.webp: {image.size}, {(out / f'{name}.webp').stat().st_size:,} bytes")

hero = Image.open(src / "hero.png").convert("RGB")
width, height = hero.size
about = hero.crop((int(width * 0.55), 0, width, height))
about = about.resize((about.width * 2, about.height * 2), Image.Resampling.LANCZOS)
about.thumbnail((880, 1100), Image.Resampling.LANCZOS)
about.save(out / "about-shelves.webp", "WEBP", quality=82, method=6)
print(f"about-shelves.webp: {about.size}, {(out / 'about-shelves.webp').stat().st_size:,} bytes")

cover = Image.open(src / "jetsi-cover.png").convert("RGB")
cover.thumbnail((900, 1280), Image.Resampling.LANCZOS)
cover.save(out / "journal-jetsi-cover.webp", "WEBP", quality=85, method=6)
assert (out / "journal-jetsi-cover.webp").stat().st_size < 250_000
print(f"journal-jetsi-cover.webp: {cover.size}, {(out / 'journal-jetsi-cover.webp').stat().st_size:,} bytes")

for slug in ("jetsi", "jiel"):
    shot = Image.open(src / f"{slug}-preview.png").convert("RGB")
    shot.thumbnail((1200, 1000), Image.Resampling.LANCZOS)
    shot.save(out / f"journal-{slug}-preview.webp", "WEBP", quality=80, method=6)
    assert (out / f"journal-{slug}-preview.webp").stat().st_size < 250_000
    print(f"journal-{slug}-preview.webp: {shot.size}, {(out / f'journal-{slug}-preview.webp').stat().st_size:,} bytes")
