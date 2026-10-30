# Verification — Kalinka slime and kicks

Plan independently reviewed: PASS, costume-first checkpoint delivered before motion.
Initial newcostume+motion pass exposed conservative rotatedbootboundingbox collisions,
which lifted plantedfeet. Replaced floor guard with renderedvertex worldY measurement;
independent tests transform actualvertices through fullworldmatrix, not boxapproximations.
Old rightstance sample updated to new1.5Hzlegcycle, with explicitstance assertions.
Kick test exposed overlap of fold/extension; separated phases before nearstraight plateau.

Screenshots inspected: front0s, side4/8s, back6/18s and split11s. Back/head/torso/limbs now
carry glossycyan/pink drips; high leatherbootshafts are visible with old shin skins hidden.
No originalGLB, dependencies, externalimages, workflowpermissions or otheranimations changed.
Next: actual knee/contact/reach/loop/turn/framing tests -> focusedbrowser -> independentreview
-> fullregression -> finalevidence checkpoint -> merge -> mainCI/Pages/liveverification.


Current physical validation: all9targetedtests PASS, including truevertexfloorcontacts,
anchoredstances, nearstraightactualknees, costume/backcoverage, all4facingdirections,
longer20.7-unitroute and invisiblemovementbounds. Removedallnearstageposts/lamps so no
props suggest a movementenclosure. Tightenedthe kickendpointto1.675 for clear nearfullreach.
Finalsnapshot/checkpoint awaitingbrowser and independentreview evidence.


Contactpolish: raised deep-squat hipheight by.07 so the widecoats/slime do not force a
visible2.6cmrootcorrection. Measuredactualankle-targeterror now<.00153, with an independent
worldspace test asserting<.003 over the wholeloop. Groundtolerance itself is unchanged.


Finalruntime271367b: independentreviewPASS;9targetedgeometrytests independentlyrerun;
dense1mssweepcontinuous andrepeatableseeking; maxankle-targeterror.00149.
All55Node tests,26auditregressions(withGitleaks), build37-fileinventory, licensegate,
owner-onlyworkflowpolicy, publishedrobotvalidation andoriginaldancechecks PASS.
Full58-case desktop/mobilebrowserregressionPASS (3.3min). UIprose/docs-onlychanges afterruntime review;
no behaviorchanges. BranchpublicauditPASS at271367b.


## Follow-up CI evidence

PR7 merged asbf623d7; publicaudit,test andPagesdeploymentPASS. Live desktop/mobile source,
straightkick,slimeback,camera andoriginaldancechecksPASS. Mainbrowserjob found2timeouts
in the same monolithiccamera test (desktop/mobile); other56cases passed. Nofailedexpectation.
Follow-up splits that case into four focusedbehaviors with everyoriginal assertion retained:
renderedsplit,exactbackwardseek,manualoverride/originalnavigation,exactautorestoration.
Default30stesttimeoutunchanged; no retries,skips,workflowguard orruntimechanges.
Next: focusedlocal/browserreview, branchaudit, mergefollow-up, fullmainCIincludingexport.
