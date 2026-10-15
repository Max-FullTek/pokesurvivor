"""Package a self-contained browser game; no runtime/installer is required."""
import pathlib
import re
import shutil
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEST = ROOT / 'dist' / 'windows'
DEST.mkdir(parents=True, exist_ok=True)
# Explicit allowlist: never ship server settings, node_modules, caches, or .git.
FILES = ['index.html', 'favicon.ico', 'sw.js', 'manifest.webmanifest', 'version.json',
         'LICENSE', 'LICENSE-NONCOMMERCIAL.md', 'CREDITS.md', 'README.md']
DIRS = ['assets', 'css']
for name in FILES:
    shutil.copy2(ROOT / name, DEST / name)
(DEST / 'js').mkdir(exist_ok=True)
shutil.copy2(ROOT / 'js' / 'app.min.js', DEST / 'js' / 'app.min.js')
for name in DIRS:
    shutil.copytree(ROOT / name, DEST / name, dirs_exist_ok=True)
html = (DEST / 'index.html').read_text(encoding='utf-8')
for ref in re.findall(r'(?:src|href)="([^"#]+)"', html):
    if not ref.startswith(('http:', 'https:', 'mailto:', 'data:')):
        if not (DEST / ref.split('?')[0]).is_file():
            raise RuntimeError(f'Missing entry-point asset: {ref}')
with zipfile.ZipFile(ROOT / 'dist' / 'PokeSurvivor-Windows-zh-Hant.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(DEST.rglob('*')):
        if file.is_file():
            archive.write(file, file.relative_to(DEST))
print('Windows package ready: dist/PokeSurvivor-Windows-zh-Hant.zip')
