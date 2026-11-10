"""Download credited stock originals and export local responsive WebP crops.

Run: py -3 scripts/prepare-editorial-photos.py (Pillow required).
Sources and usage rights: public/assets/photos/SOURCES.md.
"""
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = ROOT / 'assets-src' / 'photos'
OUTPUT = ROOT / 'public' / 'assets' / 'photos'
PHOTOS = [
    ('research-library', 8199762, 'Yan Krukau', 'people-studying-in-library'),
    ('writing-desk', 34607, 'Negative Space', 'coffee-notebook-writing-computer'),
    ('peer-discussion', 7097, 'Startup Stock Photos', 'group-of-people-having-a-meeting'),
    ('conference-hall', 31584584, 'Mitchel Onwuchuruba', 'vast-indoor-conference-hall-with-large-audience'),
    ('research-presentation', 7964167, 'Felicity Tai', 'woman-writing-on-a-whiteboard'),
    ('evidence-review', 7691673, 'Yan Krukau', 'two-people-discussing-graphs-on-printouts'),
    ('community-study', 16420473, 'Ludovic Delot', 'a-group-of-students-sitting-in-a-library-and-studying'),
]


def main():
    ORIGINALS.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for name, photo_id, author, slug in PHOTOS:
        filename = {34607: 'pexels-photo.jpg', 7097: 'people-coffee-tea-meeting.jpg'}.get(photo_id, f'pexels-photo-{photo_id}.jpeg')
        url = f'https://images.pexels.com/photos/{photo_id}/{filename}'
        original = ORIGINALS / f'{name}.jpg'
        if not original.exists():
            temporary = original.with_suffix('.download')
            subprocess.run(['curl.exe', '--fail', '--location', '--silent', '--show-error',
                            '--retry', '2', '--max-time', '90', url, '-o', str(temporary)], check=True)
            # Reject error pages and incomplete images before caching the download.
            with Image.open(temporary) as check:
                check.verify()
            temporary.replace(original)
        with Image.open(original) as source:
            source = ImageOps.exif_transpose(source).convert('RGB')
            width, height = source.size
            if width < 3840 or height < 2160:
                raise ValueError(f'{name}: {source.size} cannot produce native UHD without upscaling')
            variants = []
            for target in (640, 1280, 1920, 3840):
                size = (target, target * 9 // 16)
                crop = ImageOps.fit(source, size, method=Image.Resampling.LANCZOS)
                path = OUTPUT / f'{name}-{target}.webp'
                crop.save(path, 'WEBP', quality=85 if target == 3840 else 80, method=6)
                with Image.open(path) as check:
                    assert check.size == size and check.format == 'WEBP'
                variants.append({'src': f'/assets/photos/{path.name}', 'width': target,
                                 'height': size[1], 'bytes': path.stat().st_size})
            manifest.append({'name': name, 'author': author, 'page': f'https://www.pexels.com/photo/{slug}-{photo_id}/',
                             'download': url, 'license': 'Pexels License',
                             'licenseUrl': 'https://www.pexels.com/license/',
                             'originalSize': [width, height], 'variants': variants})
            print(f'{name}: {width}x{height} -> UHD 3840x2160, {variants[-1]["bytes"]:,} bytes')
    (OUTPUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
