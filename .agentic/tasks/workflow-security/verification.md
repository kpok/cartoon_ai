# Verification and delivery evidence

Source baseline remote c1a0a621021c00a5ebb4cc389a61b214bfa3160f, local same-source e02b303. Scope: owner-only workflows in kpok/cartoon_ai; no changes to other repositories or cloud accounts.

Independent participants: workflow_security_council and workflow_delivery_council supplied separate initial security/reliability opinions; workflow_security_plan_review PASS with preservation conditions; workflow_security_code_review PASS, independently ran28Nodechecks and policychecker. Minor helper read-back recommendation implemented with effective environmentpolicyreadback and fullsuccessfulmock--apply test; final29Nodechecks pass. Reviewer rechecked the corrected helper/readback and independently ran all3 helpertests:PASS. No substantiated open source-code blocker.

Implemented AC1–AC4: PRtriggerremoved, all3jobguards before runner; owneroriginal/rerunidentity, immutable repoID+ownerID, mainref+eventallowlist; leastprivilege tokens, no persistedcheckoutcredentials, explicit triggeringcommitcheckout; no remaining contentswrite or historyrewritejob. AutomaticmainPages retains same-runtestedartifact and explicit needs.test success. ActionsfullSHAresolvedviaofficialGitHubrefs; configure-pageskeepsv5, otheractionskeepv4. upload-pages-artifact composite inspected: nestedupload-artifactreferencealsopinned.

Commands on final source workingtree:
- npm run check:workflows:PASS (actualYAMLparsed,3jobgates evaluatedagainstvalid/hostile/missingcontexts).
- npm test:PASS29 tests, includingpolicy mutationchecks andadminhelperdryrun/preflight/successfulapply mocks.
- npm run build:PASS standalonewebsitebuilt.
- actionlint1.7.12:PASS bothremainingworkflowfiles, no syntax/expression errors. Binarydownloadedfromofficialrhysd/actionlintrelease; archivechecksumverifiedagainstofficialreleasechecksums. Notcommitted.
- git diff --check:PASS.

No full browser suite repeated locally because this change does not alter rendering/player/audio; existingCIrunsbrowser+exportintegration andwillprovide deliveryevidenceafterpush. Hostileeventtestsareoffline simulations againstactualYAML, notliveexternalPR/forkaccounts. Noattackcodeexecuted.

AC5administration boundary: GitHubconnectorhas no administrative mutation capability anddoesnotallowActionspermissions/environmentendpointreads. GitHubSettingsbrowserwasloggedout404/sign-in. NoActionsdefaultsettings, branchrules, collaborators, Pagesenvironmentrestrictionsoroldworkflowregistrychangeswereappliedorverified. SECURITY.md hasexactUIsteps; helperusesexistinglocallyauthenticatedownerghsession, defaultsread-only, refusesunfamiliarPagesprotectionrulesbeforewrites, verifiesrequestedsettingsafterapply. HelpertestedwithfakeAPIonly, neverrunwithliveadministrativecredentials. NoAPIsecretsintroducedorread.

Historicalrunrerunsuseolddefinitions; newguardsnotretroactive. Forkownerscanmodifytheirowncopies. Writers/adminswho canchangemaincanalterguards. CODEOWNERSroutingdoesnotclaimbranchprotection. These limitsareexplicitinSECURITY.md; noabsoluteclaimthatpublicsourcecannotberunelsewhere.
