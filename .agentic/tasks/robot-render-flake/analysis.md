# Paused robot seek/render synchronization

Baseline remote d2b60d40, PR20. CI run42974036564 first attempt:107/108 browser tests passed; mobile paused-seek test failed at the5s screenshot poll. The same test passed unchanged locally (13.3s), which suggests environment sensitivity but does not prove the sole cause.

Confirmed code ordering: seek handler updated pose, data-time and cue synchronously, then scheduled renderer.render in requestAnimationFrame. The previous state assertions did not acknowledge frame submission. Screenshot polling then performed repeated expensive image captures within a5s predicate budget.

Acceptance: expose submitted-frame time and monotonic revision only after successful renderer.render; use the same wrapper for interactive and export paths. Paused seek test must await new revision and expected submitted time, retain actual image inequality, verify rotation image changes and restart frame. Reduced-motion preference makes paused startup explicit. Test has a bounded60s total budget; state acknowledgment has15s budget; no unconditional sleeps, retries, GL finish or preserved drawing buffer added.

The marker indicates successful WebGL submission, not physical GPU completion. Playwright still captures the presented image. Independent plan review passed. Full JS tests73/73 and build53files pass. Repeated desktop/mobile paused-seek and export checks are run three times each; final outcome recorded in delivery response. Required full CI remains a publication gate.
