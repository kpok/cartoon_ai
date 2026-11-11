# Full rough animatic

Baseline: f294aa91128c043ab96d4a71c21643c61f62e260. Authorized scope: full 870-second, 149-shot, 22-sequence APK with scrubbing, sequence picker, rough dialogue captions and exact ending. Same branch and draft PR #19; no merge.

## Acceptance criteria

1. Compile the canonical runtime plan from validated production.json.
2. Use one 870-second clock; deterministic seek, sequence jumps, background pause and terminal state.
3. Construct all 149 shots from location kits, recognizable rough procedural props and reused rigs; deterministic major events and cameras. No claim of final asset quality.
4. Keep only the current shot subtree alive; repeated visits must have bounded node counts.
5. Preserve exact opening cards, final black and silence intervals; suppress controls in finale unless explicitly revealed. Do not substitute a beep for the missing final AI voice; disclose incomplete audio.
6. Validate source, subtitles, timeline, all shot construction, representative rendered frames and signed CPU CI APK. Artifact retention: one day.

Independent plan review (animatic_plan_review) passed with conditions: distinct compositions/actions; exact 870-second boundary and source intervals; no stale events after seek; exact final intervals; missing audio remains incomplete; previous scenes freed; representative frames for all families and critical events.

Implementation slices: compiler/timeline/clock → scene and proxy builders with major cues → controls, subtitles and cards → walkthrough tests, independent review and fixes → signed APK.

Real phone performance and full viewing remain acceptance work. No paid GPU, generated video or newly generated voices. The old 25-second sample remains a separate test scene. See VERIFICATION.md for current evidence and limitations.
