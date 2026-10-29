"""License-gate failure paths, isolated from the working tree."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
ROOT=Path(__file__).resolve().parents[1]

class LicenseGateTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)/'repo'
        shutil.copytree(ROOT,self.root,ignore=shutil.ignore_patterns('.git','node_modules','dist','vendor','__pycache__'))
        (self.root/'node_modules').symlink_to(ROOT/'node_modules',target_is_directory=True)
        (self.root/'dist/vendor').mkdir(parents=True)
        shutil.copyfile(ROOT/'node_modules/three/LICENSE',self.root/'dist/vendor/THREE-LICENSE.txt')
        subprocess.run(['git','init','-q'],cwd=self.root,check=True)
        (self.root/'.git/info/exclude').write_text('node_modules\n')
    def tearDown(self):self.temp.cleanup()
    def run_gate(self):
        run=subprocess.run(['node','scripts/audit-licenses.mjs'],cwd=self.root,capture_output=True,text=True)
        return run.returncode
    def test_approved_inventory_passes(self):self.assertEqual(self.run_gate(),0)
    def test_unknown_or_disallowed_dependency_fails(self):
        p=self.root/'package-lock.json';lock=json.loads(p.read_text());lock['packages']['node_modules/three']['license']='Unknown';p.write_text(json.dumps(lock))
        self.assertEqual(self.run_gate(),1)
    def test_reference_image_cannot_inherit_output_license(self):
        p=self.root/'.security/assets.json';assets=json.loads(p.read_text());assets['docs/images/robot-concept.jpg']['license']='CC-BY-4.0';p.write_text(json.dumps(assets))
        self.assertEqual(self.run_gate(),1)
    def test_missing_notice_fails(self):
        (self.root/'dist/vendor/THREE-LICENSE.txt').unlink();self.assertEqual(self.run_gate(),1)
    def test_new_disguised_binary_fails(self):
        (self.root/'notes.dat').write_bytes(b'\0unreviewed media');self.assertEqual(self.run_gate(),1)
    def test_modified_approved_asset_fails(self):
        with (self.root/'published/robot/preview.png').open('ab') as f:f.write(b'changed')
        self.assertEqual(self.run_gate(),1)

if __name__=='__main__':unittest.main()
