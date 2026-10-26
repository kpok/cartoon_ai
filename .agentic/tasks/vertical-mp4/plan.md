# Vertical cartoons and deterministic MP4 export
Baseline remote ba6c1bdc312465f15985895195f1c21983652e34; local snapshot 1a05dc6. Authorized edits, commits to main and existing auto Pages deployment. Manual export pipeline only, no social publishing or paid APIs.

AC1 Both episodes support deliberately composed 9:16 portrait in web player and shared export renderer, keeping principal subjects visible; landscape remains available. Locale/story/format shareable URLs.
AC2 Export MP4 H264/yuv420p/AAC, default1080x1920/30fps, full65/90sec, bothPLEN, deterministic timestamp stepping, caption safe areas and optionalcaptiondisable. No pagecontrols in film.
AC3 Original melody included automatically, dialogue included through default offline espeak-ng TTS, explicitly technical synthetic voices. --voice-dir prerecorded per-cue files alternative, missing/overlongfiles fail early. --dialogue none explicit silentvoice mode. No browser speech capture claim, no APIkey/cost.
AC4 Manual GitHubActions picks story/language/resolution, renders and uploadsMP4+SRT+metadata artifact. Existing CI runs bounded exporter smoke bothepisodes, validates streams dimensions/duration/audio; existing web tests retained.
AC5 Independent review, actual smoke and full-duration exports, browser checks, production build, CI+Pages verification. No runtime/dev secrets, generatedMP4 excludedfromgit.

Council: export_architecture and export_product independently recommend dedicated render page + absolute timestamps+FFmpeg image2pipe, offline music+TTS/recordings, portrait camera/re-layout notblindcrop. Product recommends conservative safe area x8–82%, captions around72%height. Voices fail early ratherthan silently omit.

Implementation: shared portrait renderer first; formatselectorweb; dedicated export.html entry renderFrame(t) with sharedrenderers andcanvascaptionoverlay; Nodeexporter localHTTPserver ephemeral loopback, browserownedcleanup, PNGstreambackpressure toFFmpeg, preflightcommands, offlinePCMmusic andper-cueTTS/recordings normalizedfitchecked, mix/delaybysample, SRT+JSON; manualworkflow; tests/docs/review. Resourcebudget smoke360x640/5fps shortsegments, full360x640/10fps bothepisodes then production1080render smoke tolimitCPU. Defaultproduction remains30fps.
