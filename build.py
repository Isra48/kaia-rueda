"""Empaqueta src/ en un solo archivo: python3 build.py"""
import base64, json, pathlib
p = pathlib.Path(__file__).parent
img = {f.stem: 'data:image/webp;base64,' + base64.b64encode(f.read_bytes()).decode() for f in sorted((p/'src/assets').glob('*.webp')) if not f.stem.startswith('c_')}
s = (p/'src/kaia-rueda.js').read_text().replace('/*__IMG__*/{}', json.dumps(img)).replace('/*__LOGO__*/', (p/'src/logo.txt').read_text().strip())
(p/'kaia-rueda.js').write_text(s); print(len(s)//1024, 'KB')
