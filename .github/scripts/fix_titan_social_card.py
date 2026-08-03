from pathlib import Path
import re
from PIL import Image, ImageOps

source = Path('titan-article-og.webp')
if not source.exists():
    raise SystemExit('Missing titan-article-og.webp')

with Image.open(source) as image:
    image = image.convert('RGB')
    image = ImageOps.fit(image, (1200, 630), method=Image.Resampling.LANCZOS)
    image.save('titan-article-og.png', format='PNG', optimize=True)

path = Path('titan.html')
html = path.read_text(encoding='utf-8')

replacements = {
    r'<meta property="og:image"[^>]*>': '<meta property="og:image" content="https://purushothaman-98.github.io/titan-article-og.png">',
    r'<meta name="twitter:image"[^>]*>': '<meta name="twitter:image" content="https://purushothaman-98.github.io/titan-article-og.png">',
    r'<meta name="twitter:description"[^>]*>': '<meta name="twitter:description" content="How public investment and private execution helped build Titan.">',
}

for pattern, replacement in replacements.items():
    html, count = re.subn(pattern, replacement, html, count=1)
    if count != 1:
        raise SystemExit(f'Expected one match for {pattern}; found {count}')

marker = '<meta property="og:url" content="https://purushothaman-98.github.io/titan.html">'
extra = """<meta property="og:image:secure_url" content="https://purushothaman-98.github.io/titan-article-og.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Titan, TIDCO and Tamil Nadu's public-private industrial model">"""
if 'og:image:secure_url' not in html:
    html = html.replace(marker, extra + '\n  ' + marker, 1)

twitter_marker = '<meta name="twitter:image" content="https://purushothaman-98.github.io/titan-article-og.png">'
twitter_alt = "<meta name=\"twitter:image:alt\" content=\"Titan, TIDCO and Tamil Nadu's public-private industrial model\">"
if 'twitter:image:alt' not in html:
    html = html.replace(twitter_marker, twitter_marker + '\n  ' + twitter_alt, 1)

path.write_text(html, encoding='utf-8')
