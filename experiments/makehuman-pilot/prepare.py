"""Download hash-pinned upstream inputs into a disposable directory."""
import hashlib
import json
from pathlib import Path
import sys
import tarfile
import urllib.request
import zipfile

root = Path(sys.argv[1]).resolve()
root.mkdir(parents=True, exist_ok=True)
lock = json.loads(Path(__file__).with_name('inputs.lock.json').read_text())
for name, spec in lock.items():
    archive = root / (name + ('.tar.xz' if name == 'blender' else '.zip'))
    if not archive.exists():
        with urllib.request.urlopen(spec['url'], timeout=120) as response, archive.open('wb') as target:
            while chunk := response.read(1024 * 1024):
                target.write(chunk)
    if hashlib.file_digest(archive.open('rb'), 'sha256').hexdigest() != spec['sha256']:
        raise ValueError('Input checksum mismatch: ' + name)
    destination = root / name
    destination.mkdir(exist_ok=True)
    if name == 'blender':
        with tarfile.open(archive) as source:
            source.extractall(destination, filter='data')
    else:
        with zipfile.ZipFile(archive) as source:
            for entry in source.infolist():
                resolved = (destination / entry.filename).resolve()
                if not resolved.is_relative_to(destination) or (entry.external_attr >> 16) & 0o170000 == 0o120000:
                    raise ValueError('Unsafe archive entry')
            source.extractall(destination)
print(root)
