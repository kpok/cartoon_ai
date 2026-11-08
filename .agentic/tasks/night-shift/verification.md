# Verification in progress
- npm run build: PASS, 48-file exact static inventory, reviewed CSP and self-hosted Three.js.
- npm test: PASS, 65 tests (including 3 new timeline/localization tests).
- npm run check:workflows: PASS, existing owner-only policy unchanged.
- python3 scripts/audit-privacy.py: PASS on fresh clone of remote main, 99 commits/496 historical blobs; private-term filter not configured locally. Initial clone inherited unrelated local refs and a development dependency symlink, so a clean remote clone is the delivery workspace.
- node scripts/audit-licenses.mjs: PASS, 6 locked dependencies and 6 reviewed binary assets.
- New browser suite: initial Playwright executable absent; downloaded official matching headless shell. Then desktop 5/5 passed; mobile 4/5 initially with exact screenshot restore mismatch; focused mobile retry 5/5. Full regression underway. Speech tests mock device voices; audible output/pronunciation not certified.
- Visual review: inspected contact sheet of factory, line, corridor, responders, helicopter and hospital at authored time points. Non-graphic and illustrative.
