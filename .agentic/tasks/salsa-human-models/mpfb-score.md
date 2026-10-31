# MPFB foreground similarity

Baseline repository3892b88. User authorized expert council, new percentage implementation and frequent commits on existing PR10. No merge/deployment or paid service. Model/reference geometry remains unchanged for this measurement slice.

Analysis: existing old paired-crop score34.1109 belongs to a different procedural scene/metric; MPFB front640x800 and approved crop832x1344 have different aspect ratios. Whole-frame comparison rewards backgrounds. No new score has been measured when this decision is frozen.

DEC-MPFB-SCORE accepted: independent similarity_council_metric and similarity_council_eval proposals agree on foreground masks, one shared isotropic pair registration, per-person protection, diagnostic faces/edges and honest80target. Chosen simpler geometricmean avoids adding arbitrary compensation weights: perperson100sqrt(silhouetteIoU*union-foreground RGBblockSSIM); pair=min(woman,man). EdgeF1/faceROIs diagnostic only. No embeddingcosine-as-percent. Source masks are versioned manual visible-silhouette approximations; sourceimage/hash unchanged. Render ID masks use both people in the actual scene and preserve material alpha/occlusion. Reference sourcefaces remain fixed ROIs transformed only by pairregistration.

Acceptance:
- SCORE-001: hash-bound/versioned source annotations, pinned canonical208x336/margin8/8x8SSIM/alpha128/Pillow12.3.0 and formula frozen before model score.
- SCORE-002: same-camera semantic render, both visible roles, original material alpha, no geometry/lighting/camera tuning to improve score.
- SCORE-003: one pairwide uniform scale+translation, recorded transform; no perperson/face fitting; background true negatives excluded; missing candidate person0, invalid reference error.
- SCORE-004: real percentage and components for eachperson, face/edge diagnostics, overlay/difference/reference annotation images, hashes, JSON/Markdown; oldscore explicitly incomparable.
- SCORE-005: self100, background/padding invariance, missingperson0, swaps/displacements/colors reduce score, invalidmask/hash errors; actual model computation and independent review.
- SCORE-006: existing audited owner-only CI publishes original model artifact before threshold80 comparison; comparisonreport uploaded even when threshold fails; truthful Summary.80 is aspirational technicaltarget, not80%identity confidence.

Plan: freeze annotations/config and checkpoint; plan review; add renderer masks and metric/test slices; checkpoint; actual local render/score after behavior tests; independent implementation review bounded3rounds; fix confirmed defects; CI score/report; record firstbaseline without tuning weights/masks to improve it.
