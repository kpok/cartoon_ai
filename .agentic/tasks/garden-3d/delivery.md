# Garden 3D episode and faster original

## Accepted scope
Second 90-second preschool cartoon beside the original on the same Pages site; true 3D; plants need water, light and time; brisk actions. Speed up original long walks. Retain Polish/English, sound and player controls. Authorized repository delivery and existing automatic deployment.

## Decisions and independent review
Architecture and preschool-product council agreed on a separate lazy-loaded Three.js renderer, locally vendored dependency, absolute-time state and configurable episode clocks/sound. Original artwork stays Canvas2D with a 65-second playback map. First walks now take approximately 4–5 seconds. Garden has day/night transitions before sprouting and again before flowering, sparing water and leaf-specific explanation of light. No claim of instant growth.
Plan review passed with conditions for per-episode duration, backward seeks, asynchronous switching, audio cancellation and WebGL failures. Independent implementation reviewer found no architecture/education blocker. Fixed reported replay-test selector, stale ready marker on context loss, still-lost-context retry and home accessible label.

## Validation
20 Node tests passed; static production build passed. Browser coverage includes existing audio/language functionality, episode clocks, real software-WebGL garden rendering, changing frames through plant growth, backward seeks, language change and fallback when WebGL is absent. All 22 desktop/mobile browser tests passed in GitHub Actions. A local run passed 21/22, with one virtual-clock timing assertion needing a larger end margin; its targeted rerun passed after adjustment. CI is the authoritative browser/deployment gate.
Manual managed-preview QA verified both story cards and clear WebGL-unavailable fallback. This cloud UI browser reports GL disabled, so it cannot visually preview the actual 3D scene; real rendering is checked in Playwright using software WebGL. Inspected the saved 74-second rendered frame: the kitten, butterfly, grown flower, pot, shadows, day label and captions are clearly visible. No recorded AI dialogue or MP4 export is included.
