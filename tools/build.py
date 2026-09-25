"""Build the existing GitHub Pages public-only release; Python standard library only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib, json, re, zipfile

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
business = json.loads((ROOT / 'business-info.json').read_text(encoding='utf-8'))
checkout = business['paymentLink']
assert checkout == 'https://buy.stripe.com/9B6eVf9RU5sa6OTbhe6Ri00'
assert business['priceUSD'] == 79

class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]; self.ids=set(); self.h1=0; self.checkout=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='h1': self.h1+=1
        if 'id' in a: self.ids.add(a['id'])
        for attr in ('href','src'):
            if attr in a: self.refs.append(a[attr])
        if tag=='a' and a.get('href')==checkout: self.checkout+=1

files=sorted(p for p in SITE.rglob('*') if p.is_file())
assert all(p.suffix.lower() in {'.html','.css','.js','.webp','.jpeg','.png','.xml','.txt','.woff2',''} for p in files)
assert (SITE/'CNAME').read_text().strip()=='growthms.dev'
docs={}
for p in files:
    if p.suffix not in {'.html','.js','.css','.xml','.txt'}: continue
    text=p.read_text(encoding='utf-8')
    assert not re.search(r'(sk_live_|sk_test_|whsec_|ghp_)[A-Za-z0-9]{12,}',text),p
    assert 'soloBusinessOS.v1' not in text, f'Paid source: {p}'
    assert not re.search(r'[A-Z]:[/\\]Users[/\\]|127\.0\.0\.1|localhost',text),p
    assert not re.search(r'lovable\.(app|dev)|lovable-badge|~flock|gpteng\.co',text),p
    if p.suffix=='.html':
        d=Document(); d.feed(text);docs[p]=d
        assert d.h1==1,(p,d.h1)
landing=SITE/'solo-business-os/index.html'
assert docs[landing].checkout==5
assert 'From first lead to recorded payment, keep your solo business in one place.' in landing.read_text(encoding='utf-8')
assert landing.read_text(encoding='utf-8').count('Get Solo Business OS — $79 once')==5
assert 'PLACEHOLDER' not in landing.read_text(encoding='utf-8')
refs=0
for p,d in docs.items():
    for ref in d.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc: continue
        path=unquote(u.path)
        target=(SITE/path.lstrip('/')) if path.startswith('/') else (p.parent/path if path else p)
        if target.is_dir(): target=target/'index.html'
        assert target.is_file(),(p,ref)
        if u.fragment and target in docs: assert u.fragment in docs[target].ids,(p,ref)
        refs+=1
archive=ROOT/'growth-ms-public-site.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:
        entry=zipfile.ZipInfo(p.relative_to(SITE).as_posix(),date_time=(2026,9,23,0,0,0))
        entry.compress_type=zipfile.ZIP_DEFLATED;entry.external_attr=0o100644<<16
        z.writestr(entry,p.read_bytes())
sha=hashlib.sha256(archive.read_bytes()).hexdigest()
expected={p.relative_to(SITE).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
verifier='''from pathlib import Path
import hashlib, zipfile
ARCHIVE_SHA = %r
EXPECTED = %r
archive=Path('growth-ms-public-site.zip')
assert hashlib.sha256(archive.read_bytes()).hexdigest()==ARCHIVE_SHA,'Archive checksum mismatch'
with zipfile.ZipFile(archive) as z:
    assert sorted(z.namelist())==sorted(EXPECTED),'Unexpected or duplicate public files'
    for name in z.namelist():
        path=Path(name)
        assert not path.is_absolute() and '..' not in path.parts,'Unsafe path'
        content=z.read(name)
        assert hashlib.sha256(content).hexdigest()==EXPECTED[name],'File checksum mismatch'
        target=Path('_site')/path
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(content)
print('Verified and extracted',len(EXPECTED),'public files; paid product excluded.')
''' % (sha,expected)
(ROOT/'verify-and-extract.py').write_text(verifier,encoding='utf-8')
print(f'PASS: {len(docs)} pages, {refs} local references, 5 purchase links, {len(files)} public files. SHA256 {sha}')
