# DEC-REALISM-001 — human generation strategy

Status: PROPOSED to owner, not an approved migration. Evidence: repository revision6bc751b361c3d63bb22b1cd3d14cc168b9ccb3c7, council2026-10-30. Latest paired-crop score34.1109%, immediate previous34.5677%. No implementation, installations, model downloads, inference, paid services or deployment were performed for this council.

## Question and scope

Owner finds current humans visibly unrealistic and asks experts to reconsider generation, not merely increase a number. Goal: plausible anatomical humans and materials, true editable3D, reproducible code-driven construction and renders. A single synthetic image of an occluded dancing pair is the design reference, not measured multi-view geometry. The current plan's prohibition on third-party human bases must be explicitly reconsidered before adopting a new base. The existing draft remains available and unmerged.

## Independent participants and proposals

Three independent read-only agents received the same repository/images and raw requirements before sharing conclusions:

| Agent | Role | Initial proposal | Final synthesis vote |
|---|---|---|---|
| realism_council | Character generation/rendering | Anatomical base mesh, rig, UV, skin/eyes/hair and fitted clothing in Blender; MPFB2 preferred initial pilot | ACCEPT_WITH_CONDITIONS |
| reconstruction_council | Single-image reconstruction | Prefer anatomical MHR and optional SAM3DBody for shape/pose, with separate appearance construction; generative image-to3D as optional experiment | ACCEPT_WITH_CONDITIONS to MPFB2 as first appearance baseline; retain MHR/SAM as later fitting experiment |
| evaluation_council | Evaluation and acceptance | Stop treating custom SSIM/edge score as realism; compare geometry, appearance, pose and multiple views separately | ACCEPT_WITH_CONDITIONS |

Votes are advisory, not experimental proof. No pilot has been executed. Three-way agreement concerns the bounded pilot and conditions, not a claim that a specific generator is already proven best for this reference.

## Findings

- Current mesh assembly and anatomy are the principal bottleneck. Dense triangles do not supply anatomical topology, eyelids, realistic hands or physically plausible hair/cloth. Existing repairs improved continuity but not overall realism.
- Our70% RGB blockSSIM +30% edgeF1 minimum across regions is a custom image diagnostic. The80 threshold has not been calibrated against human judgments of realistic reconstruction. Background, lighting and framing affect it; it is not a percent identity/realism score.
- Preserve current metric/version/history rather than lower threshold or silently relabel success. Add any future geometric/perceptual evaluation as a separately documented contract.
- One image cannot reveal hidden body surfaces, backs or full garment geometry. Additional AI-generated views are proposed design references, not ground-truth photogrammetry.
- High-quality Blender render and web GLB are different deliverables; shader/export limitations must be tested rather than assuming matching appearance.

## Options and recommendation

| Option | Benefit | Cost / unresolved risk | Disposition |
|---|---|---|---|
| Continue manual Three.js loft/primitive anatomy | No new base assets, existing infrastructure | Poor anatomical foundation and diminishing returns | Retain historical stylized experiment, not recommended primary realism path |
| MPFB2/MakeHuman base + Blender Python | Human mesh, body parameters, rigs and appearance asset ecosystem, scriptable | Exact asset licenses/version compatibility, hair/clothing/face fitting and render quality still require validation | Preferred first bounded pilot |
| MHR + optional SAM3DBody | Parametric anatomical model; possible body/pose fitting from image | Appearance/clothing/hair are separate; checkpoint access/licenses and inference environment unverified | Later independent fitting experiment |
| TRELLIS.2 image-to3D | Textured/PBR static mesh generation candidate | Official local requirements Linux/NVIDIA24GB+; hidden surfaces, hand anatomy and animation topology unverified; dependency licenses separate | Optional later experiment, no resource purchase authorized |

Core MakeHuman/MPFB assets are declaredCC0 by their official license documentation; addon code has a separate GPL/AGPL licensing regime. Individual external skins/clothes/hair must be checked and recorded, never attributed as original project-generated assets. A base human generator alone does not guarantee photorealism or likeness.

## Proposed pilot and acceptance

1. Owner resolves scope: permit verified anatomical base meshes and appearance assets while keeping the final pipeline code-driven. Pin versions, provenance/hashes and applicable licenses.
2. Build one clothed character from the waist upward, including eyes/lids, hair and both hands. Prefer the simpler male reference first; do not begin with the full intertwined pair and dress.
3. Generate neutral clay and finished-material renders from reference/front,45°,90° and180°. Test anatomy independently of shading. Preserve actual3D geometry, no reference billboard substitution.
4. Export a self-contained GLB and verify the web view separately. Reuse existing headless Blender workflow patterns only after a compatibility test; do not change production main-only deployment.
5. Compare with the current prototype using fixed camera/pose, face and hand crops, silhouette/landmark diagnostics and visual owner review. A mask/landmark benchmark must be independently checked, not reused construction targets. Do not convert LPIPS into a claimed percent likeness.
6. Continue to the second character and contact pose only if the pilot clearly improves anatomy/materials and multi-view plausibility. No80% promise and no fabricated time/cost estimate.

Authority/owner: user decides the new asset constraint and whether to execute the pilot. Recommendation is reversible: keep current branch/checkpoints and run the pilot in isolation. Paid API/GPU purchases and external image uploads are not part of this discussion authorization.

## Actual capabilities and limitations

Repository already contains a hash-pinned Blender4.2 headless/Cycles robot workflow. Locally `blender` was not found in PATH; `nvidia-smi` was not available, which is not proof about all hardware. No usable inference/GPU environment or checkpoint entitlement was established. Scriptability was checked against official examples, not by executing an MPFB pilot. Existing tests/models/workflows were not changed during this council.

## Primary sources reviewed

- MPFB features and compatibility: https://extensions.blender.org/add-ons/mpfb/
- Official asset/code license distinction: https://static.makehumancommunity.org/about/license.html
- MPFB script examples (create mesh, shape targets, rig, skin, eyes/teeth): https://github.com/makehumancommunity/mpfb2/blob/master/script_samples/index.md
- MPFB code and headless testing structure: https://github.com/makehumancommunity/mpfb2/blob/master/docs/code-structure.md
- MHR: https://github.com/facebookresearch/MHR
- SAM3DBody: https://github.com/facebookresearch/sam-3d-body
- TRELLIS.2 features, requirements and model/code vs dependency licenses: https://github.com/microsoft/TRELLIS.2
- SSIM original research/documentation: https://www.cns.nyu.edu/~lcv/ssim/
- LPIPS research: https://richzhang.github.io/PerceptualSimilarity/

Scope note: adopting this proposal would supersede the earlier no-third-party-human-assets constraint only when the owner accepts that change. No assets or licenses are silently grandfathered into the current audit.
