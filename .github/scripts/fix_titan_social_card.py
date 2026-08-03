from pathlib import Path
import re
from PIL import Image, ImageOps

SOURCE = Path('titan-article-og.webp')
OUTPUT = Path('titan-social-card-20260803.jpg')
IMAGE_URL = 'https://purushothaman-98.github.io/titan-social-card-20260803.jpg'

if not SOURCE.exists():
    raise SystemExit(f'Missing {SOURCE}')

with Image.open(SOURCE) as image:
    image = image.convert('RGB')
    image = ImageOps.fit(image, (1200, 630), method=Image.Resampling.LANCZOS)
    image.save(OUTPUT, format='JPEG', quality=86, optimize=True, progressive=True)

size_mb = OUTPUT.stat().st_size / (1024 * 1024)
if size_mb > 4.5:
    raise SystemExit(f'Social card is too large: {size_mb:.2f} MB')

path = Path('titan.html')
html = path.read_text(encoding='utf-8')

fields = {
    'og:image': IMAGE_URL,
    'og:image:secure_url': IMAGE_URL,
    'og:image:type': 'image/jpeg',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': "Titan, TIDCO and Tamil Nadu's public-private industrial model",
    'twitter:image': IMAGE_URL,
    'twitter:image:alt': "Titan, TIDCO and Tamil Nadu's public-private industrial model",
    'twitter:card': 'summary_large_image',
    'twitter:description': 'How public investment and private execution helped build Titan.',
}

for name, value in fields.items():
    if name.startswith('og:'):
        pattern = rf'<meta property="{re.escape(name)}"[^>]*>'
        replacement = f'<meta property="{name}" content="{value}">'
    else:
        pattern = rf'<meta name="{re.escape(name)}"[^>]*>'
        replacement = f'<meta name="{name}" content="{value}">'

    if re.search(pattern, html):
        html = re.sub(pattern, replacement, html, count=1)
    else:
        html = html.replace('</head>', f'  {replacement}\n</head>', 1)

path.write_text(html, encoding='utf-8')
print(f'Created {OUTPUT} ({size_mb:.2f} MB) and updated titan.html')
