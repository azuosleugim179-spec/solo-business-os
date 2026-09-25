from pathlib import Path
import zipfile,hashlib,re
archive=Path('growth-ms-public-site.zip')
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='7ffbeb010acdb5fc884b1fff422789f04304f84d5d28bacf5f362b623a578e46','Archive checksum mismatch'
with zipfile.ZipFile(archive) as z:
    assert sorted(z.namelist())==sorted(['.nojekyll', '404.html', 'assets/css/clientops.css', 'assets/css/site.css', 'assets/images/clients.webp', 'assets/images/crm.webp', 'assets/images/dashboard-small.webp', 'assets/images/dashboard.webp', 'assets/images/growth-ms-logo.jpeg', 'assets/images/help.webp', 'assets/images/marketing.webp', 'assets/images/money.webp', 'assets/images/og.png', 'assets/images/projects.webp', 'assets/images/start.webp', 'assets/js/clientops.js', 'assets/js/config.js', 'assets/js/site.js', 'clientops/index.html', 'CNAME', 'index.html', 'privacy/index.html', 'refund-policy/index.html', 'robots.txt', 'sitemap.xml', 'solo-business-os/cancel/index.html', 'solo-business-os/index.html', 'solo-business-os/success/index.html', 'terms/index.html']),'Unexpected public artifact files'
    for entry in z.infolist():
        assert not entry.is_dir() and not (entry.external_attr>>16)&0o170000==0o120000,'Links are not allowed'
        path=Path(entry.filename)
        assert not path.is_absolute() and '..' not in path.parts,'Unsafe path'
        content=z.read(entry)
        if path.suffix in ['.html','.js','.css']:
            text=content.decode('utf-8')
            assert 'soloBusinessOS.v1' not in text,'Paid application source detected'
            assert not re.search(r'(sk_live_|sk_test_|whsec_|ghp_)[A-Za-z0-9]{12,}',text),'Possible secret'
            assert not re.search(r'[A-Z]:[/\\]Users[/\\]|127\.0\.0\.1|localhost',text),'Local reference'
        target=Path('_site')/path
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(content)
print('Verified and extracted',29,'public files. Paid application is not included.')
