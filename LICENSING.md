# Licensing map

This repository has mixed licensing. Publishing source does not grant a blanket
open-source license for every file. No new license is granted by this document.

| Material | Existing terms |
| --- | --- |
| Files carrying `SPDX-License-Identifier: GPL-3.0-or-later` | GNU GPL version 3 or any later version. Full text: [GPL](experiments/dancing-robot/LICENSE). Preserve the SPDX notices and comply when distributing that code. |
| Procedural robot geometry, materials and preview in `published/robot/` and archived `experiments/dancing-robot/assets/rig-base.glb` | Existing CC BY 4.0 declaration, attribution **Neon Tinker by kpok**. See https://creativecommons.org/licenses/by/4.0/ . Preserve attribution, link to the license and identify modifications. |
| Owner-supplied ChatGPT concept image at `docs/images/robot-concept.jpg` | Published as a visual reference; no additional reuse license granted (`LicenseRef-All-Rights-Reserved`). The CC BY declaration for procedural robot outputs does not extend to this image. Ownership/exclusivity is not independently certified. |
| Three.js including the browser addons | MIT; the complete upstream notice is copied verbatim to `vendor/THREE-LICENSE.txt` in every site build. |
| Other npm dependencies | Exact version/license/integrity inventory in `.security/dependencies.json`. Build/test tooling is not automatically shipped to Pages. Upstream notices remain in installed packages. |
| Remaining project code, text, illustrations and original synthesized story music without a separate license | No additional reuse license has been granted; rights remain with their respective holders. Public viewing and source availability do not mean unrestricted redistribution. Contact the maintainer through GitHub before reuse. |

CC grants already issued are not withdrawn by this clarification. Neither GPL nor
CC grants rights to someone else's recording, composition, protected choreography,
trademark, likeness or other third-party material. Blender's license alone does not
determine the license of an output; incorporated material must also be considered.

The audit checks declared licenses, inventory changes and required notices. It
cannot establish ownership or legal clearance. Tool licenses (Blender, FFmpeg,
eSpeak NG, Gitleaks) apply to the tools; they are not bundled into the Pages site.
