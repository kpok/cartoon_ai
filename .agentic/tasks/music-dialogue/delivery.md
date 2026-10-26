# Music and Polish dialogue

Baseline c2e7e2a6f4fc44e90cadbdb66e7c983cf9e55e49. User requested music/dialogue for the existing browser cartoon. Existing main delivery and automatic Pages deployment authorized.

Accepted design: original pentatonic sine-tone music via Web Audio, seven short Polish dialogue cues through the device/browser speech synthesizer, independent music/dialogue toggles and captions. Prefer local Polish voice; explicitly report missing Polish voice, remote service requirement or speech errors. No paid API, microphone, downloaded music or new runtime dependency. This is device speech, not recorded professional character dialogue.

AC: user-gesture-only start; controllable quiet music; Polish cues and captions; cancellation on pause/seek/restart/pagehide/visibility/end; no missed cue/note backlog; graceful voice/audio fallback; main delivery and successful existing CI/Pages.

Plan review /root/audio_plan_review PASS. Implementation review /root/audio_code_review PASS; reviewer independently ran 12 unit tests and build. Optional stale resume rejection status race fixed with generation guard. Browser QA via supported managed preview: start, seek into24s cue, captions and no-Polish-voice status visibly present. Cloud browser has no Polish voice; physical voice quality/loudness not listened to or verified. No physical Android test claimed.

Verification before commit: npm test12/12 PASS; npm run build PASS; git diff --check PASS. CI adds one audio/captions case per desktop/mobile project, retaining previous playback tests. Existing local runner cannot use managed preview route; GitHub Actions provides end-to-end evidence after commit. Existing narrowly triggered privacy workflow is rechecked to ensure connector-created commit uses noreply in reachable history. App content unaffected by metadata rewrite.
