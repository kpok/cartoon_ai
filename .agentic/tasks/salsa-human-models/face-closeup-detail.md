# Separate face inspection and denser anatomical surface

Baseline16a732b. User authorized original-face closeups, separateper-personfaceanalysis and moredetailedcode-generatedmodels; expertcouncil, agentic-deliver andfrequentremotebranchcommits. No merge/deploy, imagegenerationAPI, referencephotoprojection or paidservices.

Analysis: wholepair metricmpfb-foreground-v1 uses208x336 andfixedfaceROIs; ROIscore includesglobalposemisalignment. Originalface crops ~136x140/137x149 mustretainnativepixels, no generativeupscaling. Existing body19158sourceverts withsmoothnormals butnoSubdivision; eyes/hairassets haveSubdivision1. PinnedBlender4.2export_applyFalse canomitdensemodifiergeometryfromGLB. Hairangularbands are aseparateasset; skinrefinementaloneisnotidentitymatching.

DEC-FACE-DENSITY accepted withconditions from independentface_density_council: onebodyCatmullClarklevel only; MASK->SUBSURF->ARMATURE. Keepeditableblendprofiles/rig/modifier; bakeonlybodycurrentmorph+subdivisionfortexturedGLB, retainingarmature. Fitdress/stubbletosmoothedrestsurfacebeforepose. Actualcouncilsmoke visiblebodyverts11134->44496woman,7840->31177man, head4069->16275each;0.5–0.7sevaluation/head. NoL2orheadcuts. Exportsmoke preservedrig/headsurfacewithinold0.002heighttolerance. Hairunchangedunlessaseparatevalidatedfix.

DEC-FACE-EVAL accepted from independentface_evaluation_council: newindependentmpfb-face-v1 report. Nativeoriginalfacecrops+portraitmodel; sourceeyeanchorsmanual/frozen, modelanchorsprojectedrigeye-globecentresfromsameportraitcamera. Analytical2anchorrotation+uniformscale+translationonly, noaffine/nonrigid/colorfit/search. Canonical160x192, fixedinnerfaceoval,100maskedRGBSSIMperperson; edge/colorMAE diagnostics, pose/lighting/expression/yawlimitations explicit. Noface80gate, noidentityprobability. Wholepairmetric/config/baselineunchanged.

Acceptance:
- FACE-001: codeextractsnativereferencefacecropswithSHA/coords/anchors, independentanchoroverlayreviewbeforefirstface-onlymeasurement.
- FACE-002: portraitcamera/eyeprojections recorded; similarityalignment frozen, errorsforbad/reversed/missinganchors/clipping/hash; perpersonfaceJSON/MD/sidebysideoriginal/model/aligned/difference.
- FACE-003: boundedbodyL1withrealcontrol/evaluatedbody/headcounts, samecameraclayL0/L1controlviews. Existingfaceprofiles retained; novertexcount-as-likenessclaim.
- FACE-004: editableblend+actualdenseGLB, actualbodyPOSITIONcountandheadsurfacereimportvalidatedwithinunchangedtolerance; eyes/lips/stubblerootsinspected.
- FACE-005: facebehaviorregressions(self100,invariancetotwowarpanchors,corruptcolor/blur/featuresdegrade,invalidanchors/hash/clippederror), independentplan/code/visualreview,bounded3rounds.
- FACE-006: existingowner-onlyauditedCPUCIpublishesseparatefaceartifact/Summaryevenwhenglobal80gatefails. Originalwholepairreport remainsversionedunchanged.

Plan: sourcecrops/anchorconfig+checkpoint; planreview; implementdenserbody/exportandprojectedeyes+claycontrol;checkpoint; faceanalysis+tests+CI; freeze sourceanchoroverlay beforefirstface-onlyscore; localrenders/GLB/headcounts; independentreview/fixes; actualCIartifacts andfirstfacebaseline. CPU45mincap maintained; no globalmetricretuning.


Independent face_stage_plan_review PASS: sourceirisanchors checkedwithin~1pixel; inversecanonicaloval fullyinsidefixednativecrops forbothpeople. Configuration frozenbeforefirstface-onlymeasurement. Currentdensityslice recordscontrol/evaluatedheadcounts, retainseditableblend, andbakesonlybodyforexport; proofpendingactualgeneration. Hairassets remainunchanged perboundedbody-onlycouncilrecommendation.

## Local and independent verification
- Actualdensitypipeline6d87056 raninGitHub41198317952: generation/modelvalidation/modelartifact succeeded; onlyexistingglobal80 gate failed. Downloadedactual24samplemodelartifact13041393186 forlocalfaceanalysis.
- Newface8regression testsPASS. Separate firstface-onlyindices fromactualCIportraits: woman27.1889%,man36.0663%. Frozenanchors/configprecedemeasurement; no scorefitting or newfacegate. Nativecrops160x164/161x173 exactlymatchsourcepixels.
- Headcounts4069->16275both. Bodycontrol/evaluated/baked: woman11134/44496/44496,man7840/31177/31177. ActualGLBuniquePOSITIONcounts58777/41930afterUV/materialsplits; 11modeltestsandactualdenseGLBvalidatorPASS, includingrender-only/lowpolyexportnegativecases. Roundtripfaceerror0.0010365065 withinunchanged0.002height tolerance.
- Independentface_stage_code_review PASS: eye/lip/stubblerootandclayL0/L1viewsinspected; no blockinggeometry/facefinding. 8facetests+11modeltests independentlypassed, workflowguards/whitelist/11jobpolicychecked. Hairangularity andgenericexpression/likenessremainartisticlimitations.
- Final58f62e5CIintegration addsfaceartifact/Summary afterglobalFAILwithauth/dependency/validationguards, strictfilewhitelistandone-dayretention. Actualnewfaceartifactpublicationstillpendingatthischeckpoint.


## Verified delivery (2026-10-31)
Tested implementation58f62e5920d38d8d73d9c9ea8803c9657f689ba6. Real GitHub run41203907454: generation, dense GLB validation/11model tests,13global metric tests,8face metric tests, separate face analysis and all three artifact uploads succeeded. Only the existing global80 target failed. The face report ran and published successfully after that failure.

Artifacts: model13044545556 (40,532,265bytes), global13044545565, separateface13043876895 (3,701,749bytes). Downloaded and inspected actual face ZIP: all20expectedfiles present; algorithm/config hashes match local code, native source crops exactly match original image pixels. Actual CI face indices: woman27.189560176032334%, man36.06669415227782%; no pass threshold or identity interpretation. First separate baseline saved in face-comparison-baseline.json.

All32Python tests and60Node tests passed locally; production37-file build, license/provenance gate,11-job workflow policy and adversarial workflow tests passed. Independent plan/source-anchor review and code/visual/dense-export review PASS. No blocking review findings. Global compare.py SHA03473e05fe497a10d21587eca85a88fc546079d6e33fb0f28a036003a3323b0f and comparison.json SHAdd1dd371c11ad5f402942a31fffc2731c84c1b34bb488da61f720c3d7747be73 unchanged.

A temporary local executor outage occurred during final ZIP inspection; execution recovered and the actual ZIP inspection then passed. No source progress was lost; implementation was already on the remote branch. FACE-001..006 complete for this bounded surface/inspection scope. Hair bands, facial expression and generic likeness remain limitations; no claim that increased vertices alone improved likeness. No merge/deployment.
