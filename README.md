# Kotek i motyl

A complete, silent, two-minute browser cartoon for very young children. An orange kitten wakes in a basket, meets a butterfly, walks through the garden, offers a helping paw, and returns home to sleep. There are no dialogue, captions inside the film, sound, advertisements, analytics, accounts, external assets or runtime API calls.

The original artwork is drawn with Canvas 2D from JavaScript. This is a simple procedural cartoon, not generated video or a photorealistic animation. The Polish player interface is intended for an accompanying adult.

## Watch locally

Requires Node.js 22 or newer. From the project directory:

```sh
npm run dev
```

Open http://localhost:3000 and press **Obejrzyj bajkę**. Runtime dependencies do not need to be installed. To watch from a phone on the same trusted Wi-Fi, open `http://<computer-LAN-IP>:3000` while the server is running; firewall rules may need to allow this port. The development server binds to all network interfaces; use it on trusted networks only.

## Controls

Play/pause, restart, seek anywhere on the timeline, replay, and fullscreen when supported. Space toggles playback and left/right arrows seek five seconds when focus is outside a control. Native slider keyboard controls remain intact. Hiding the tab pauses the film; returning never starts it automatically. Playback ends at 120 seconds and does not loop automatically.

Fullscreen support depends on browser/device policy. A fixed 1280×720 drawing surface keeps rendering bounded on high-density phones. It scales to fit the player; there is no audio autoplay or media download.

## Build and tests

```sh
npm ci
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

`dist/` contains the standalone static website. Host it with any HTTP static server. ES modules require HTTP serving; double-clicking `index.html` as a file is not supported. To serve the build locally: `SERVE_DIR=dist npm run dev` (set the environment variable using your shell's syntax).

GitHub Actions runs unit tests, static build, and Playwright tests in desktop Chromium and an Android-sized Chromium viewport. It uploads the `kitten-film` build artifact. GitHub Pages deployment is included but disabled until the one-time setup below. The GitHub repository URL is source code, not a playback link.

## Story timeline

| Seconds | Scene |
| --- | --- |
| 0–18 | Kitten wakes in its basket |
| 18–38 | A butterfly appears |
| 38–58 | A gentle walk to a flower |
| 58–78 | A helping paw and a little heart |
| 78–100 | The friends enjoy the garden |
| 100–120 | The kitten returns home and sleeps |

`src/story.js` samples the complete scene at an absolute timestamp. `src/draw.js` renders it without persistent animation state. `src/app.js` owns the monotonic playback clock and controls. This separation allows deterministic backwards seeking and future export by rendering sequential frames. MP4 export is not implemented.

## GitHub Pages: one-time activation

The owner needs to configure the repository once:

1. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Open **Settings → Secrets and variables → Actions → Variables**, create a repository variable named `ENABLE_GITHUB_PAGES` with the exact value `true`. No secret or personal access token is needed.
3. Open **Actions → Film checks and Pages → Run workflow**, select `main`, and run it. Later pushes to `main` deploy automatically after all tests pass.

The deploy job depends on the test job and publishes its `dist/` Pages artifact, without rebuilding or checking out a different revision. Pull requests only run checks; they never publish. Deployment permissions (`pages: write` and `id-token: write`) belong only to the deploy job. Deployments are serialized. Keep the `github-pages` environment restricted to `main` if adding environment branch rules.

Before activation the workflow runs checks and skips publication. To pause future deployments, set `ENABLE_GITHUB_PAGES` to `false`; this does not remove an already published site. The final playback URL appears in the deploy job's environment link and **Settings → Pages**.

GitHub Free supports Pages for public repositories. This repository is private; Pages requires a suitable paid plan such as GitHub Pro. A public Pages site exposes the deployed HTML, JavaScript and artwork even if its source repository is private. Only `dist/` is published: tests, project reports, workflow files and development server are excluded. The workflow does not change repository visibility or purchase a plan.
