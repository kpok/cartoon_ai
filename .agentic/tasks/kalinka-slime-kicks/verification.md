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
