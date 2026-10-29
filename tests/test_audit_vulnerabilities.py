"""Exercise advisory lookup failures without making network requests."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
ROOT=Path(__file__).resolve().parents[1]

class AdvisoryTests(unittest.TestCase):
    def run_report(self,report,code=0):
        with tempfile.TemporaryDirectory() as directory:
            npm=Path(directory)/'npm'
            npm.write_text('#!/usr/bin/env python3\nimport json\nprint(json.dumps('+repr(report)+'))\nraise SystemExit('+str(code)+')\n')
            npm.chmod(0o755)
            return subprocess.run([shutil.which('node'),str(ROOT/'scripts/audit-vulnerabilities.mjs')],env={**os.environ,'PATH':directory+os.pathsep+os.environ['PATH']},capture_output=True).returncode
    def counts(self,**changes):
        return {'metadata':{'vulnerabilities':{'info':0,'low':0,'moderate':0,'high':0,'critical':0,'total':0,**changes}}}
    def test_clean_report_passes(self):self.assertEqual(self.run_report(self.counts()),0)
    def test_high_finding_fails(self):self.assertEqual(self.run_report(self.counts(high=1,total=1),1),1)
    def test_missing_counters_fail(self):self.assertEqual(self.run_report({'metadata':{'vulnerabilities':{}}}),1)
    def test_registry_error_fails(self):self.assertEqual(self.run_report({'error':{'code':'UNAVAILABLE'}},1),1)
    def test_nonstandard_exit_fails(self):self.assertEqual(self.run_report(self.counts(),2),1)

if __name__=='__main__':unittest.main()
