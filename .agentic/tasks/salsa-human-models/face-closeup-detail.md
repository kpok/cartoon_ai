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
