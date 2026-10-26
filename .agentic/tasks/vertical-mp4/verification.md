# Verification and review evidence

Baseline remote ba6c1bdc312465f15985895195f1c21983652e34, local snapshot1a05dc6. Read-only tool/CLI capabilities verified; no APIcredentials used. Writes scoped to repository and existing Pages auto-deploy. Manual export workflow does not upload to social platforms.

Architecture and product council: independent export_architecture/export_product. Accepted dedicated render page, exact timestamps, shared scenes/cues, local FFmpeg and offline music+eSpeakNG, optional recorded voices. Plan reviewer export_plan_review PASS with conditions: voice fit, pipe failure handling, build includes export surface, keep time on format change. Implemented.

Independent code review export_code_review PASS subject to full exports. Fixed landscape defaultwidth, home-format preservation; added cooperativeSIGINT/SIGTERM handling. No remaining substantiated blockers.

Local23 Node tests pass; productionbuild and gitdiffcheck pass. Two voiced3second360×640/5FPS MP4 smoke exports passed (meadowPL, gardenEN), ffprobe validatesH264/yuv420p/AAC, framecount,duration; decoded audio non-silent. Allfour story/language TTS cue sets generated and windowvalidated; missingrecordings fail. Additionalrecordings success/overlong checks in exportintegration. Production1080×1920/30FPS2secondgardenPL export passed. Full65secondmeadowPL (650frames) and90secondgardenEN (900frames),360×640/10FPS exports passed internalffprobechecks. All26 desktop/mobile browserchecks passed. CI+Pages validation pending remotecommit.

Browsernewtests coverallfour portrait/storylanguage combinations and exactreverse-seekframes, formatbacknavigation,timepreservation,nohorizontaloverflow. Savedframes inspected: meadow12/29andgarden18/74. Corrected2Dstageup80px toclearcaptionoverlap; newframe29 showsentirecat,paw,flowerandbutterflyabove subtitles. ManagedpreviewUI verifiedportraitselector,seek,controlavailability; cloudbrowserGLdisabled, actual3DcheckedthroughsoftwareChromium.

Environment: systempackage install restricted; officialUbuntu eSpeakNGdebpackages downloaded/extractedunder /tmp withtemporary wrapper forlocaltests. Thiswrapper isnotpartofrepository. CIinstallsnormal systemtools. LocalChromiuminstalledfromofficialPlaywrightdistribution. Nochangednetworkpermissions.
