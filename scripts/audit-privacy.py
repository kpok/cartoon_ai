"""Fail closed on repository identity drift; never log matched content or paths."""
import html
from urllib.parse import unquote
import hashlib
import json
import os
from pathlib import Path
import re
import struct
import subprocess
import sys
import unicodedata

IDENTITIES = {('kpok', '10676481+kpok@users.noreply.github.com'), ('GitHub', 'noreply@github.com')}
EMAILS = {mail.lower() for _, mail in IDENTITIES}
EMAIL = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')

def git(*args):
    return subprocess.check_output(['git', *args], stderr=subprocess.DEVNULL)

def normalize(text):
    return ''.join(c for c in unicodedata.normalize('NFKD', text.casefold()) if not unicodedata.combining(c))

def check_text(text, terms):
    if any(mail.lower() not in EMAILS for mail in EMAIL.findall(text)):
        raise ValueError('unapproved email')
    for _ in range(3):
        text=unquote(html.unescape(text))
        text=re.sub(r'\\u([a-fA-F0-9]{4})',lambda m:chr(int(m[1],16)),text)
        text=re.sub(r'\\x([a-fA-F0-9]{2})',lambda m:chr(int(m[1],16)),text)
    normalized = normalize(text)
    if any(normalize(term) in normalized for term in terms):
        raise ValueError('private term')

def png_chunks(data):
    if not data.startswith(b'\x89PNG\r\n\x1a\n'):
        raise ValueError('invalid PNG')
    pos = 8
    while pos < len(data):
        if pos + 12 > len(data):
            raise ValueError('truncated PNG')
        length = int.from_bytes(data[pos:pos+4], 'big')
        if pos + 12 + length > len(data):
            raise ValueError('truncated PNG chunk')
        yield data[pos+4:pos+8], data[pos+8:pos+8+length]
        pos += 12 + length

def metadata(data, strict=False):
    if data[:4] == b'glTF':
        if len(data) < 20:
            raise ValueError('truncated GLB')
        size, kind = struct.unpack_from('<II', data, 12)
        if kind != 0x4e4f534a or 20 + size > len(data):
            raise ValueError('invalid GLB JSON')
        doc = json.loads(data[20:20+size])
        if strict and set(doc.get('asset', {})) - {'version', 'generator', 'minVersion'}:
            raise ValueError('unreviewed GLB metadata')
        return json.dumps(doc, ensure_ascii=False)
    if data.startswith(b'\x89PNG'):
        texts=[]
        for kind, value in png_chunks(data):
            if kind in {b'tEXt', b'zTXt', b'iTXt', b'eXIf'}:
                if strict:
                    raise ValueError('unreviewed PNG metadata')
                # Historical compressed text is decoded before privacy checks.
                if kind == b'zTXt':
                    import zlib
                    value=zlib.decompress(value.split(b'\0',1)[1][1:])
                elif kind == b'iTXt':
                    import zlib
                    _, rest=value.split(b'\0',1)
                    compressed, method=rest[:2]
                    _, _, value=rest[2:].split(b'\0',2)
                    if compressed:
                        value=zlib.decompress(value)
                texts.append(value.decode('utf-8',errors='replace'))
        return '\n'.join(texts)
    return data.decode('utf-8',errors='replace') + '\n' + data.decode('utf-16-le',errors='ignore')

def scan(terms=()):
    if git('rev-parse','--is-shallow-repository').strip()!=b'false':
        raise ValueError('full history required')
    for ref in git('for-each-ref','--format=%(refname)').decode().splitlines():
        check_text(ref,terms)
        if git('cat-file','-t',ref).strip()==b'tag':
            tag=git('cat-file','tag',ref).decode('utf-8')
            check_text(tag,terms)
            tagger=re.search(r'^tagger (.*?) <([^>]+)> ',tag,re.M)
            if not tagger or tuple(tagger.groups()) not in IDENTITIES:
                raise ValueError('unexpected tag identity')
    commits=git('rev-list','--all').splitlines()
    for commit in commits:
        raw=git('show','-s','--format=%an%x00%ae%x00%cn%x00%ce%x00%B',commit.decode()).decode('utf-8')
        author,mail,committer,cmail,message=raw.split('\0',4)
        if (author,mail) not in IDENTITIES or (committer,cmail) not in IDENTITIES:
            raise ValueError('unexpected commit identity')
        check_text(message,terms)
    # Every historical tree path is checked, not only rev-list's representative name.
    objects=set()
    for commit in commits:
        for row in git('ls-tree','-rz',commit.decode()).split(b'\0'):
            if not row:continue
            header,path=row.split(b'\t',1)
            mode,kind,oid=header.split()
            check_text(path.decode('utf-8',errors='replace'),terms)
            if kind!=b'blob' or mode not in {b'100644',b'100755'}:
                raise ValueError('unsupported repository object')
            objects.add(oid)
    for oid in objects:
        check_text(metadata(git('cat-file','blob',oid.decode())),terms)
    for path in git('ls-files','-z','--cached','--others','--exclude-standard').split(b'\0'):
        if not path:continue
        p=Path(os.fsdecode(path));check_text(str(p),terms)
        if p.is_symlink() or not p.is_file():raise ValueError('unsupported working file')
        check_text(metadata(p.read_bytes(),strict=True),terms)
    return len(commits),len(objects)

if __name__=='__main__':
    try:
        terms=[line.strip() for line in os.environ.get('PRIVATE_TERMS','').splitlines() if line.strip()]
        commits,blobs=scan(terms)
        print(f'Privacy audit passed: {commits} commits, {blobs} historical blobs and working tree. Private-term filter: {"enabled" if terms else "not configured"}.')
    except Exception:
        # Paths, exceptions and matching values could themselves disclose private data.
        print('Privacy audit FAILED. Inspect locally; no finding values are published.',file=sys.stderr)
        sys.exit(1)
