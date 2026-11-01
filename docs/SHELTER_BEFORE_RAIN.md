# Domek przed deszczem / A Shelter Before the Rain

Five-minute browser-first3D episode for the existing kitten/squirrel garden world. Default Polish and optional English dialogue/captions. Designed as a gentle4–7-year-old story proposal, not an age-rating or audience-performance claim.

## Characters and story

Kitten acts immediately and means well; Squirrel likes detailed plans; Butterfly needs a small dry place before the rain. Neither friend is the villain. Their mistakes lead to listening and shared work. The lesson comes through the action, with a final gutter shower joke.

| Time | Scene |
| --- | --- |
| 0:00–0:24 | A gust lifts Butterfly's leaf roof; the friends notice the problem. |
| 0:24–0:45 | Kitten confidently promises to build a shelter. Squirrel wants a plan. |
| 0:45–1:12 | Kitten carries boards and quickly assembles a crooked frame. |
| 1:12–1:36 | Wind tips the loose structure. Kitten realizes he rushed. |
| 1:36–2:02 | Squirrel proposes several floors and a balcony, showing a paper plan. |
| 2:02–2:28 | The growing complicated frame wobbles. Butterfly only needs a dry corner. |
| 2:28–2:54 | Both admit their mistake and agree on a simple, strong shelter. |
| 2:54–3:26 | They load the wheelbarrow; Kitten pushes, Squirrel walks beside it. |
| 3:26–4:02 | Base first, then posts, beams and pitched roof. Each friend helps. |
| 4:02–4:28 | Butterfly enters. Rain arrives and reveals a small leak. |
| 4:28–4:48 | Kitten brings a leaf; they turn it into a gutter. Butterfly is dry. |
| 4:48–5:00 | The gutter wets Kitten, who steps back and laughs. A warm ending. |

The33paired PL/EN dialogue cues in `src/shelter-dialogue.js` are the authoritative screenplay lines, with speaker and start/end times. `src/shelter-story.js` owns story/prop/weather/camera timing. No slideshow, generated video service, imported character image, external model/sample or paid API is used. The new procedural actors adapt the same shapes/colors as the earlier Strawberry film without changing its scene code.

## Playback

Open `shelter.html`, press **Odtwórz / Play**. There is no autoplay. Captions show the line/speaker; gaps show the chapter name.12chapter buttons, seek slider, pause, restart, language, speech/music toggles, music volume and fullscreen are available. Seeking or switching language pauses the film; replay after5:00 starts from0. Hiding/leaving the page stops music and speech. Context loss shows a return link.

SpeechSynthesis uses matching browser/device voices, preferring local voices. Missing voices are reported and captions remain usable; later voice availability is detected. Some browser voices may require a network. Character pitch differences are authored, but each device may honor them differently. Mouth motion is stylized expressive movement, not phoneme-synchronized speech. Long/slow device speech can meet a scene-window boundary; short lines limit this, but precise voice timing/quality is not guaranteed. No prerecorded speech is embedded.

The quiet synthesized melody uses the established FilmSound/WebAudio engine. This edition has no separately recorded wind/rain track. Speech, music and displayed story share the browser film transport, but speech synthesis itself is a device service rather than a sample-accurate soundtrack.

## Implementation and delivery

Isolated shelter story/dialogue/stage/player/CSS plus a gallery tile; landscape16:9 canvas with responsive controls. Existing strict CSP stays unchanged (`connect-src 'none'`, no external assets); no server or dependency needed beyond the existing static build. Build/public-file inventories and gallery regression are updated. Existing five main stories and unrelated unmerged PR11 remain separate.

Local checks: `npm test`, `npm run build`, `npm run check:workflows`, `npx playwright test tests/browser/shelter.spec.js --workers=1`, and public/license audit. Browser tests mock device speech for deterministic coverage; real device voice quality must be judged on the user's device. Actual milestone frames and visual geometry are separately inspected.

The user authorized merging this finished feature and deploying through the existing main CI/Pages workflow. Source/checkpoint/review/deployment evidence lives under `.agentic/tasks/shelter-before-rain/`. No MP4 export or social upload is included in this browser-first edition.
