# English version on the same Pages site

Baseline82d0b2d0c84b410d834d599c2e90770a031c05c1. Request: separate English cartoon version on the same GitHub Pages page. Authorized main updates and auto deployment retained.

Plan: shared unchanged 120s timeline, translated UI/metadata/ARIA, separate English dialogue text with stable speaker IDs, header selector and shareable ?lang=en/pl. Changing locale pauses, preserves playback position/preferences and cancels active speech. Unknown URL language defaultsPL, Back/Forward handled. Voice selection requires language match, supportsregional variants, preferslocal; localized fallback when missing.

AC: PL/ENversions reachable on samepage; correctdialogues/captions/UI/speechselection; no overlap on switch; valid mobile layout and existing playback; tests plus CI/Pages; no newruntime dependencies. Planreview /root/english_plan_review PASS. Local16 unit tests PASS, build PASS, diff check PASS. Independent implementation review /root/english_code_review PASS. Minor brand-span styling issue fixed by restricting decorative styling to aria-hidden flower span. BrowserQA: English deep link, 24s English caption and switch to Polish at the same timestamp verified in supported managed browser. CI/Pages outcome to be checked after commit. No physicalphone voicequality claim.
