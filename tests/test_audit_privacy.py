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
    def test_nested_tag_message_is_scanned(self):
        self.git('tag','-a','inner','-m','NestedPrivateMarker')
        self.git('tag','-a','outer','inner','-m','Public outer tag')
        self.git('tag','-d','inner')
        with self.assertRaises(ValueError):privacy.scan(['NestedPrivateMarker'])
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
    @staticmethod
    def jpeg_segment(marker, value):
        return bytes([255, marker]) + struct.pack('>H', len(value)+2) + value
    def jpeg(self, entropy=b'compressed samples', before=b'', after=b''):
        header=self.jpeg_segment(0xda,b'\x01\x01\x00\x00\x3f\x00')
        return b'\xff\xd8'+before+header+entropy+after+b'\xff\xd9'
    def test_jpeg_entropy_is_not_metadata_even_with_stuffing_restarts_and_multiple_scans(self):
        email=('synthetic'+'@'+'example.invalid').encode()
        header=self.jpeg_segment(0xda,b'\x01\x01\x00\x01\x3f\x00')
        image=self.jpeg(email+b'\xff\x00more\xff\xd0samples',after=header+email+b'\xff\xd7end')
        self.assertEqual(privacy.metadata(image),'')
        (self.path/'image.jpg').write_bytes(image);self.commit();privacy.scan()
    def test_all_jpeg_app_and_comment_metadata_remain_scanned(self):
        email=('synthetic'+'@'+'example.invalid')
        for marker in [*range(0xe0,0xf0),0xfe]:
            for value in [email.encode(),email.encode('utf-16-le'),b'X'+email.encode('utf-16-be'),b'PrivateFixtureMarker']:
                with self.subTest(marker=marker,value_type=len(value)):
                    segment=self.jpeg_segment(marker,value)
                    # Metadata after image samples is just as sensitive as metadata before them.
                    for image in [self.jpeg(before=segment),self.jpeg(after=segment)]:
                        for strict in [False,True]:
                            with self.assertRaises(ValueError):
                                privacy.check_text(privacy.metadata(image,strict),['PrivateFixtureMarker'])
    def test_jpeg_public_metadata_is_retained(self):
        image=self.jpeg(before=self.jpeg_segment(0xe0,b'JFIF\0Public label'),after=self.jpeg_segment(0xfe,b'Public comment'))
        text=privacy.metadata(image,strict=True)
        self.assertIn('Public label',text);self.assertIn('Public comment',text)
        privacy.check_text(text,[])
    def test_jpeg_malformed_framing_and_trailing_content_fail_closed(self):
        valid=self.jpeg()
        invalid=[b'\xff\xd8',valid[:-1],valid[:-2],valid+b'extra',
                 b'\xff\xd8\xff\xd9',b'\xff\xd8garbage',
                 b'\xff\xd8\xff',b'\xff\xd8\xff\xe1\x00',
                 b'\xff\xd8\xff\xe1\x00\x01',b'\xff\xd8\xff\xe1\xff\xffshort',
                 b'\xff\xd8\xff\xd0',b'\xff\xd8\xff\x02\x00\x02',self.jpeg(entropy=b'data\xff\xd8'),
                 b'\xff\xd8'+self.jpeg_segment(0xda,b'bad')+b'\xff\xd9']
        for image in invalid:
            with self.subTest(size=len(image)):
                with self.assertRaises(ValueError):privacy.metadata(image)
    def test_jpeg_comment_on_deleted_branch_still_fails_privacy_scan(self):
        self.git('checkout','-qb','jpeg-side')
        image=self.jpeg(after=self.jpeg_segment(0xfe,b'HistoricalPrivateMarker'))
        (self.path/'old.jpg').write_bytes(image);self.commit()
        (self.path/'old.jpg').unlink();self.commit();self.git('checkout','-q','-')
        with self.assertRaises(ValueError):privacy.scan(['HistoricalPrivateMarker'])
    def test_encoded_private_terms_fail(self):
        for text in ['Synthetic\\u0048iddenPhrase','%53yntheticHiddenPhrase','Synthetic&#72;iddenPhrase']:
            with self.assertRaises(ValueError):privacy.check_text(text,['SyntheticHiddenPhrase'])
    def test_encoded_emails_fail_without_private_terms(self):
        for text in ['person'+separator+'example.invalid' for separator in ['%40','\\u0040','&#64;']]:
            with self.assertRaises(ValueError):privacy.check_text(text,[])
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
        run=subprocess.run([os.environ['GITLEAKS_PATH'],'git','--log-opts=--all --full-history -m','--redact=100','--no-banner','--log-level','fatal'],capture_output=True,text=True)
        self.assertEqual(run.returncode,1);self.assertNotIn(token,run.stdout+run.stderr)

    @unittest.skipUnless(os.environ.get('GITLEAKS_PATH'),'Run with the verified Gitleaks binary')
    def test_secret_introduced_only_by_merge_is_detected(self):
        first=self.git('rev-parse','HEAD').strip().decode()
        self.git('checkout','-qb','merge-parent')
        (self.path/'branch.md').write_text('Other parent');self.commit()
        second=self.git('rev-parse','HEAD').strip().decode()
        self.git('checkout','-q','-')
        token='ghp_'+''.join(chr(65+(i*7)%26) for i in range(36))
        (self.path/'merge.txt').write_text('token = "'+token+'"');self.git('add','.')
        tree=self.git('write-tree').strip().decode()
        merge=self.git('commit-tree',tree,'-p',first,'-p',second,input=b'Merge-only synthetic fixture').strip().decode()
        self.git('update-ref','HEAD',merge)
        run=subprocess.run([os.environ['GITLEAKS_PATH'],'git','--log-opts=--all --full-history -m','--redact=100','--no-banner','--log-level','fatal'],capture_output=True,text=True)
        self.assertEqual(run.returncode,1);self.assertNotIn(token,run.stdout+run.stderr)

    @unittest.skipUnless(os.environ.get('GITLEAKS_PATH'),'Run with the verified Gitleaks binary')
    def test_repository_ignore_file_cannot_bypass_wrapper(self):
        token='ghp_'+''.join(chr(65+(i*7)%26) for i in range(36))
        (self.path/'key.txt').write_text('token = "'+token+'"');self.commit()
        report=self.path.parent/(self.path.name+'-report.json')
        try:
            command=[os.environ['GITLEAKS_PATH'],'git','--redact=100','--no-banner','--log-level','fatal']
            run=subprocess.run([*command,'--report-format','json','--report-path',str(report)],capture_output=True,text=True)
            self.assertEqual(run.returncode,1)
            findings=json.loads(report.read_text());self.assertTrue(findings)
            (self.path/'.gitleaksignore').write_text('\n'.join(f['Fingerprint'] for f in findings))
            self.assertEqual(subprocess.run(command,capture_output=True).returncode,0)
            (self.path/'.security').mkdir();shutil.copyfile(ROOT/'.security/gitleaks.toml',self.path/'.security/gitleaks.toml')
            wrapped=subprocess.run(['python3',str(ROOT/'scripts/audit-secrets.py')],capture_output=True,text=True)
            self.assertEqual(wrapped.returncode,1);self.assertNotIn(token,wrapped.stdout+wrapped.stderr)
        finally:report.unlink(missing_ok=True)

    @unittest.skipUnless(os.environ.get('GITLEAKS_PATH'),'Run with the verified Gitleaks binary')
    def test_secret_in_commit_message_is_detected_by_wrapper(self):
        token='ghp_'+''.join(chr(65+(i*7)%26) for i in range(36))
        self.git('commit','--allow-empty','-qm','token = "'+token+'"')
        (self.path/'.security').mkdir();shutil.copyfile(ROOT/'.security/gitleaks.toml',self.path/'.security/gitleaks.toml')
        run=subprocess.run(['python3',str(ROOT/'scripts/audit-secrets.py')],capture_output=True,text=True)
        self.assertEqual(run.returncode,1);self.assertNotIn(token,run.stdout+run.stderr)

if __name__=='__main__':unittest.main()
