"""Adversarial repositories use synthetic identities and secrets only."""
import importlib.util
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile
import unittest
import zlib

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('privacy',ROOT/'scripts/audit-privacy.py')
privacy=importlib.util.module_from_spec(spec);spec.loader.exec_module(privacy)

class PrivacyTests(unittest.TestCase):
    def setUp(self):
        self.temporary=tempfile.TemporaryDirectory();self.path=Path(self.temporary.name)
        self.previous=Path.cwd();os.chdir(self.path)
        self.git('init','-q');self.git('config','user.name','kpok');self.git('config','user.email','10676481+kpok@users.noreply.github.com')
        (self.path/'note.md').write_text('A public note.');self.commit()
    def tearDown(self):
        os.chdir(self.previous);self.temporary.cleanup()
    def git(self,*args,**kwargs):return subprocess.check_output(['git',*args],stderr=subprocess.DEVNULL,**kwargs)
    def commit(self):self.git('add','.');self.git('commit','-qm','Synthetic test')
    def test_clean_repo_and_exact_service_identity(self):
        self.assertEqual(privacy.scan()[0],1)
        self.git('config','user.name','GitHub');self.git('config','user.email','noreply@github.com')
        (self.path/'note.md').write_text('Service update.');self.commit();privacy.scan()
    def test_deleted_historical_private_term_fails(self):
        (self.path/'note.md').write_text('SyntheticHiddenPhrase');self.commit()
        (self.path/'note.md').write_text('Removed.');self.commit()
        with self.assertRaises(ValueError):privacy.scan(['synthetichiddenphrase'])
    def test_second_branch_and_annotated_tag_are_scanned(self):
        self.git('checkout','-qb','side')
        (self.path/'note.md').write_text('SideBranchMarker');self.commit()
        self.git('checkout','-q','-')
        with self.assertRaises(ValueError):privacy.scan(['SideBranchMarker'])
        self.git('tag','-a','test-tag','-m','PrivateTagMarker')
        with self.assertRaises(ValueError):privacy.scan(['PrivateTagMarker'])
    def test_unexpected_identity_and_email_fail(self):
        self.git('config','user.name','Synthetic Person');(self.path/'note.md').write_text('Changed.');self.commit()
        with self.assertRaises(ValueError):privacy.scan()
    def test_working_email_and_disguised_binary_metadata_fail(self):
        (self.path/'new.md').write_text('person'+'@'+'example.invalid')
        with self.assertRaises(ValueError):privacy.scan()
        (self.path/'new.md').unlink()
        doc=json.dumps({'asset':{'version':'2.0','copyright':'Synthetic Author'}}).encode()
        blob=b'glTF'+struct.pack('<IIII',2,20+len(doc),len(doc),0x4e4f534a)+doc
        (self.path/'asset.dat').write_bytes(blob)
        with self.assertRaises(ValueError):privacy.scan()
    def test_png_metadata_and_compressed_historical_text(self):
        chunk=lambda kind,data:struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
        png=b'\x89PNG\r\n\x1a\n'+chunk(b'zTXt',b'Comment\0\0'+zlib.compress(b'SyntheticHiddenPhrase'))+chunk(b'IEND',b'')
        with self.assertRaises(ValueError):privacy.metadata(png,strict=True)
        self.assertIn('SyntheticHiddenPhrase',privacy.metadata(png))
    def test_encoded_private_terms_fail(self):
        for text in ['Synthetic\\u0048iddenPhrase','%53yntheticHiddenPhrase','Synthetic&#72;iddenPhrase']:
            with self.assertRaises(ValueError):privacy.check_text(text,['SyntheticHiddenPhrase'])
    def test_shallow_clone_fails(self):
        (self.path/'.git/shallow').write_bytes(self.git('rev-parse','HEAD'))
        with self.assertRaises(ValueError):privacy.scan()
    def test_public_failure_never_prints_matching_content(self):
        (self.path/'new.md').write_text('ConfidentialTestMarker')
        run=subprocess.run(['python3',str(ROOT/'scripts/audit-privacy.py')],env={**os.environ,'PRIVATE_TERMS':'ConfidentialTestMarker'},capture_output=True,text=True)
        self.assertEqual(run.returncode,1);self.assertNotIn('ConfidentialTestMarker',run.stdout+run.stderr)

class SecretTests(unittest.TestCase):
    setUp=PrivacyTests.setUp
    tearDown=PrivacyTests.tearDown
    git=PrivacyTests.git
    commit=PrivacyTests.commit
    @unittest.skipUnless(os.environ.get('GITLEAKS_PATH'),'Run with the verified Gitleaks binary')
    def test_deleted_secret_detected_on_other_branch(self):
        self.git('checkout','-qb','secret-side')
        token='ghp_'+''.join(chr(65+(i*7)%26) for i in range(36))
        (self.path/'old.txt').write_text('token = "'+token+'"');self.commit()
        (self.path/'old.txt').unlink();self.commit();self.git('checkout','-q','-')
        run=subprocess.run([os.environ['GITLEAKS_PATH'],'git','--log-opts=--all --full-history','--redact=100','--no-banner','--log-level','fatal'],capture_output=True,text=True)
        self.assertEqual(run.returncode,1);self.assertNotIn(token,run.stdout+run.stderr)

if __name__=='__main__':unittest.main()
