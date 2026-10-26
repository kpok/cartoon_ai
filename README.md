# Małe historie — two browser cartoons

A small Polish/English story library with two independently selectable episodes on one GitHub Pages site:

- **Kitten and Butterfly / Kotek i motyl** — 65 seconds, Canvas 2D. The original artwork is retained, with the long walks compressed to about 4–5 seconds each.
- **Kitten and the Little Seed / Kotek i małe nasionko** — 90 seconds, real-time 3D with Three.js. The kitten plants a seed, gives it a little water, moves its pot into light and waits through days and nights before a sprout, leaves and a flower appear.

The garden is an original procedural clay-style diorama: 3D kitten, terracotta pot, watering can, plant, butterfly, lights, shadows and changing camera shots. It does not use generated video, downloaded character models or paid AI services. The garden teaches a simplified preschool lesson: water, light and time help plants grow; the leaves use light. Growth represents many days, not an immediate result of watering.

## Watch

[Open the story library](https://kpok.github.io/cartoon_ai/).

Direct links use `?story=meadow&lang=pl`, `?story=garden&lang=pl`, or `?story=garden&lang=en`. Choose a story and language on the page. Switching stories resets playback; switching language pauses at the same time. Nothing starts automatically.

Requires a modern browser; the 3D episode requires WebGL2. If 3D is unavailable or its context is lost, the player displays a message and a button back to the first story. It does not substitute a blank or 2D garden. Rendering resolution is capped at 1.5× device pixel ratio and shadows at 1024 pixels.

## Local development

Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The predev/build scripts copy the installed Three.js modules and license into `vendor/`; the deployed app loads them from its own origin, with no CDN or runtime API call. The development server binds to all interfaces, for use on trusted networks. ES modules need an HTTP server; opening index.html directly is unsupported.

```sh
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

`dist/` is a standalone static website. To serve it locally, use `SERVE_DIR=dist npm run dev` (adapt environment-variable syntax for your shell). Browser tests run desktop and mobile Chromium with software WebGL enabled for CI, including real 3D renders, backward seeking, episode/language changes, replay and unavailable-WebGL fallback.

## Playback and sound

Play/pause, restart, arbitrary seek, replay and fullscreen are available. Space toggles playback and arrows seek five seconds outside controls. Hiding the page pauses it. Each episode stops at its own duration and never loops automatically.

Music is an original gentle melody synthesized through Web Audio. Short PL/EN dialogue uses the browser's speech synthesis voices; these are not prerecorded AI actors. If a matching voice is unavailable, translated captions remain available. Some system voices may use an online service. Music, dialogue, volume and captions can be changed independently. Audio starts only after a user gesture and stops on pause, seek, story/language change or completion.

No analytics, advertisements, accounts or application API keys are used.

## Implementation

`src/episodes.js` defines episode metadata, dialogue and the accelerated mapping to the original 120-second artwork timeline. That legacy artwork timeline remains in `src/story.js`; the actual first player lasts 65 seconds. `src/garden-state.js` samples the complete garden at an absolute timestamp; `src/garden-view.js` constructs and poses the 3D scene. Backward seeking therefore does not retain future plant growth. `src/app.js` coordinates the selected episode, clock, UI and asynchronous 3D loading. `src/sound.js` accepts the episode duration and dialogue provider.

Garden beats: 0–7 discover seed; 7–15 plant; 15–23 water; 23–30 light; 30–36 patience; 36–48 days/nights; 48–57 sprout; 57–67 leaves; 67–77 more days and flower; 77–85 recap; 85–90 goodbye. Walking is brief and camera/action changes punctuate the episode. MP4 export is not implemented.

## Deployment

GitHub Actions checks tests and build, then deploys that same `dist/` artifact to GitHub Pages after success on main. Set Pages source to **GitHub Actions** and repository variable `ENABLE_GITHUB_PAGES=true` for deployment. Pull requests only run checks. The deploy job has scoped Pages/OIDC permissions and serialized deployments; no personal access token is needed. Setting the variable to false pauses future publication.

Only the static build is published; project reports, tests and development scripts are excluded. Source and deployed assets are publicly readable. Three.js's MIT license is included with the vendored modules.
