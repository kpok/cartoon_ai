# Kalinka energy and spatial stage

Baseline dcfe4382b915f06805bdb209cc729f14364890db. No AGENTS.md found.
Authorized: frequent branch checkpoints, separate PR, local/CI tests, merge, Pages verification.

Analysis: existing variant uses two-axis foot targets and block ushanka, no actual ground;
CSS backdrop is the only scenery. Actual boot geometry is not tested against any world floor.
Original robot GLB and other four animations must remain unchanged.

AC-001 rounded fitted ushanka, seam/soft trim details, unobstructed eyes, no box cap.
AC-002 brisk 24s loop with bouncing squat kicks, arm swings, hops and aerial straddle jump.
AC-003 actual boot sole geometry above a defined y=0 floor; contact and flight validated on GLB.
AC-004 seeded irregular travelling in a roughly 3x3m root area, repeatable seeking and loop.
AC-005 gentle automatic drone camera, toggle/manual orbit override and reduced-motion respect.
AC-006 3D foreground paving/shadows/props provides parallax; distant existing AI photo retained
as a matte backdrop. No promise of reconstructing unseen architecture from one photo.
AC-007 owner-only workflows, source GLB, original robot dance and five gallery tiles preserved.
AC-008 tests, independent reviews, branch audit, main CI/regression/deployment and live smoke.

Plan: establish stable ground coordinate and foot solver -> accessories/choreography checkpoint ->
spatial stage/camera checkpoint -> world-mesh tests and desktop/mobile visual inspection ->
independent review/fixes -> full regression, merge, Pages verification. No new MP4 or dependencies.
Decision DEC-K1: pending independent scene/camera opinion; prefer real foreground depth with a
far photo backdrop over multiple unrelated flat images or an unsupported full reconstruction.
Status: analysis READY_WITH_ASSUMPTIONS; user evaluates final visual result after deployment.
