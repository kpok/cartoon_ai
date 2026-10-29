"""Run verified Gitleaks without publishing matches, paths, or raw reports."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile

with tempfile.TemporaryDirectory(prefix='cartoon-secret-audit-') as temporary:
    binary=os.environ.get('GITLEAKS_PATH','gitleaks')
    empty_ignore=Path(temporary)/'.gitleaksignore';empty_ignore.write_text('')
    common=['--gitleaks-ignore-path',str(empty_ignore),'--max-archive-depth','2','--config','.security/gitleaks.toml','--redact=100','--no-banner','--log-level','fatal','--ignore-gitleaks-allow','--report-format','json']
    commands=[['git','--log-opts=--all --full-history'],['dir','.']]
    for index,command in enumerate(commands):
        report=str(Path(temporary)/f'report-{index}.json')
        try:
            result=subprocess.run([binary,*command,*common,'--report-path',report],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        except OSError:
            result=None
        if result is None or result.returncode!=0:
            print('Secret audit FAILED (finding or scanner error). Inspect locally; values are redacted.',file=sys.stderr)
            sys.exit(1)
print('Secret audit passed: reachable history and working directory.')
