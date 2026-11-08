# Night shift / Nocna zmiana
Baseline: a50e4f789b07bb295d4fa0145bd5131ff93e8ca5. User authorized implementation, merge and GitHub Pages publication, with Polish/English switching. Source: user-supplied Nadmorski24 article excerpt; not independently verified. No employer identification, blame, injury closeups or invented entanglement mechanism. Dialogue is staged; geometry is illustrative.

## Analysis and acceptance
- AC-001: Six-scene approximately 90-second procedural human-character 3D film following approved screenplay. Establishing factory, can line, offscreen incident, responders, helicopter/hospital, investigation. No gore.
- AC-002: PL/EN selection changes all film UI, chapter titles, subtitles, speaker labels and browser narration/dialogue. Keep selected time; pause and cancel prior voice when switching. Query language preserved on home navigation.
- AC-003: Play, pause, replay, seek, chapters, captions, independent voice/music toggles, fullscreen. Missing voice retains captions and reports status. No autoplay. Stop when hidden. WebGL failure retains navigation.
- AC-004: Existing gallery and films preserved; new translated card. Same self-hosted Three.js, no new dependencies or external runtime assets. Strict static allowlist/CSP preserved.
- AC-005: Meaningful timeline/localization and browser playback, rendering and failure tests. Build/unit/security checks and independent plan/code review before merge. Confirm successful Pages deployment and live availability.

## Capabilities and decisions
Local clean isolated branch feat/night-shift-bilingual from current remote main. Git fetch available; GitHub connector for remote writes/PR/merge/CI evidence. Existing Pages workflow deploys tested dist on main. Required audit check retained. No new hosting or paid services.
Routine implementation reuses established procedural Three.js and FilmSound conventions; no material unresolved architecture choice requiring council. Browser voices are device dependent, as existing project; show explicit fallback and captions. Timing cues deliberately short. No claim of audio listening verification from a mock speech test.

## Slices
1. Bilingual story, scene state, UI and gallery integration; static build allowlist.
2. Animated procedural sets/people/camera for six chapters and isolated player lifecycle.
3. Timeline/localization tests and desktop/mobile browser regressions; visual contact sheet; independent code review and bounded repairs.
4. Commit, PR, audit/CI, merge and observe Pages deployment. Rollback via reverting this feature commit.
