# Macarena music synchronization

Reference: Los del Rio — Macarena (Bayside Boys Remix), https://www.youtube.com/watch?v=zAVPXPOS-c0 . Baseline830b24f.

AC1: Preserve existing silent32s variant; add opt-in music timing at103BPM (provisional),16beats per phrase.
AC2: Deterministic beat-to-choreography mapping and adjustable first-beat offset; explicit unmeasured reference phase.
AC3: Browser local audio playback is the master clock, pause/seek/restart stay synchronized. Do not bundle or download an unprovided recording.
AC4: Verify against actual selected audio before claiming exact synchronization. Current internet BPM metadata is not a measured beat grid.

Slices: timing profile+tests; opt-in player integration; local audio master controls; measured beat/phrase calibration and browser regression. Draft PR, small commits; no merge authorization for this new PR assumed.
