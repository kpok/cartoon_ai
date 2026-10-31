import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseDocument} from 'yaml';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function readWorkflows(directory=resolve(root,'.github/workflows')){
 const result={};for(const file of (await readdir(directory)).filter(f=>/\.ya?ml$/.test(f)).sort()){
  const doc=parseDocument(await readFile(resolve(directory,file),'utf8'),{uniqueKeys:true});if(doc.errors.length)throw doc.errors[0];result[file]=doc.toJS({maxAliasCount:0});
 }return result;
}
// Evaluate only the small documented expression subset used by authorization gates.
// Unknown syntax fails closed; missing context properties follow GitHub's empty-string behavior.
export function evaluateGate(expression,context){
 assert.equal(typeof expression,'string','Every job needs an authorization expression');
 const source=expression.trim().replace(/^\$\{\{\s*|\s*\}\}$/g,'');
 const tokens=source.match(/'[^']*'|[a-zA-Z_][a-zA-Z0-9_.]*|==|!=|&&|\|\||\(|\)/g)||[];
 assert.equal(tokens.join(''),source.replace(/\s+(?=(?:[^']*'[^']*')*[^']*$)/g,''),'Unsupported authorization syntax');
 let index=0;
 const value=()=>{const token=tokens[index++];assert.ok(token,'Incomplete authorization expression');if(token==='('){const result=or();assert.equal(tokens[index++],')');return result;}if(token.startsWith("'"))return token.slice(1,-1);assert.match(token,/^[a-zA-Z_][a-zA-Z0-9_.]*$/);return token.split('.').reduce((obj,key)=>obj?.[key],context)??'';};
 const comparison=()=>{const a=value(),operator=tokens[index];if(operator!=='=='&&operator!=='!=')return Boolean(a);index++;const b=value();const equal=typeof a==='string'&&typeof b==='string'?a.toLowerCase()===b.toLowerCase():a===b;return operator==='=='?equal:!equal;};
 const and=()=>{let result=comparison();while(tokens[index]==='&&'){index++;const next=comparison();result=result&&next;}return result;};
 const or=()=>{let result=and();while(tokens[index]==='||'){index++;const next=and();result=result||next;}return result;};
 const result=or();assert.equal(index,tokens.length,'Unexpected authorization tokens');return Boolean(result);
}
export function ownerContext(overrides={}){
 return {github:{repository:'kpok/cartoon_ai',repository_id:'1433681495',repository_owner_id:'10676481',actor_id:'10676481',actor:'kpok',triggering_actor:'kpok',ref:'refs/heads/main',ref_type:'branch',event_name:'push',...overrides},needs:{test:{result:'success'}},vars:{ENABLE_GITHUB_PAGES:'true'}};
}
export function checkPolicy(workflows,pins){
 assert.deepEqual(Object.keys(workflows).sort(),['ci.yml','export-mp4.yml','makehuman-pilot.yml','public-audit.yml','repo-diagnostics.yml','robot-model.yml','robot-mp4.yml','salsa-snapshot.yml'],'New or administrative workflows need a security policy review');
 const jobs=[];
 for(const [file,workflow] of Object.entries(workflows)){
  assert.deepEqual(workflow.permissions,{},`${file}: default token must have no permissions`);
  assert.equal(workflow.concurrency,undefined,'Authorization must happen before concurrency allocation');
  assert.deepEqual(Object.keys(workflow.on).sort(),['ci.yml','public-audit.yml','salsa-snapshot.yml','makehuman-pilot.yml'].includes(file)?['push','workflow_dispatch']:['workflow_dispatch'],'Unexpected public trigger');
  if(file==='ci.yml')assert.deepEqual(workflow.on.push,{branches:['main'],'paths-ignore':['**/*.md','docs/**']});
  if(['salsa-snapshot.yml','makehuman-pilot.yml'].includes(file))assert.deepEqual(workflow.on.push,{branches:['main','experiment/salsa-human-models']});
  if(file==='public-audit.yml')assert.deepEqual(workflow.on.push,{branches:['**'],tags:['**']});
  assert.deepEqual(Object.keys(workflow.jobs).sort(),file==='salsa-snapshot.yml'?['snapshot']:file==='ci.yml'?['deploy','regression','test']:file==='public-audit.yml'?['audit']:file==='repo-diagnostics.yml'?['actions-smoke','diagnostics']:['robot-model.yml','makehuman-pilot.yml'].includes(file)?['generate']:file==='robot-mp4.yml'?['render']:['export']);
  for(const [name,job] of Object.entries(workflow.jobs)){
   const label=`${file}/${name}`;jobs.push({file,name,job});
   assert.equal(job['runs-on'],['salsa-snapshot.yml','makehuman-pilot.yml'].includes(file)?'ubuntu-24.04':'ubuntu-latest',`${label}: hosted runner required`);
   assert.ok(Number.isInteger(job['timeout-minutes'])&&job['timeout-minutes']<=90,`${label}: bounded timeout required`);
   assert.equal(job.concurrency?.['cancel-in-progress'],false,`${label}: runs must not cancel trusted work`);
   assert.match(job.concurrency.group,/^[a-z-]+$/,`${label}: concurrency group must be fixed`);
   assert.equal(job.uses,undefined,'No implicit reusable workflow execution');assert.equal(job.secrets,undefined,'No job-wide secret inheritance');assert.equal(job.env,undefined,'No job-wide credentials');
   assert.deepEqual(job.permissions,name==='deploy'?{pages:'write','id-token':'write'}:{contents:'read'},`${label}: permissions exceed policy`);
   if(name==='deploy'){
    assert.equal(job.needs,'test');assert.equal(job.environment?.name,'github-pages');
    assert.deepEqual(job.steps.map(s=>s.uses),[`actions/configure-pages@${pins['actions/configure-pages']}`,`actions/deploy-pages@${pins['actions/deploy-pages']}`],'Deployment must not run project code or checkout');
   }
   for(const step of job.steps){
    if(step.env?.PRIVATE_TERMS){assert.equal(step.run,'bash scripts/run-public-audit.sh');assert.deepEqual(step.env,{PRIVATE_TERMS:'${{ secrets.PRIVATE_TERMS }}'});const copy={...step};delete copy.env;assert.doesNotMatch(JSON.stringify(copy),/secrets\.|secrets\[/,'Only private terms may be passed');}
    else assert.doesNotMatch(JSON.stringify(step),/secrets\.|secrets\[/,`${label}: unreviewed secrets`);
    if(step.run)assert.doesNotMatch(step.run,/\$\{\{/,`${label}: pass inputs through quoted environment variables`);
    if(step.uses){
     const [action,sha]=step.uses.split('@');assert.match(sha||'',/^[a-f0-9]{40}$/,`${label}: immutable action SHA required`);assert.equal(sha,pins[action],`${label}: unreviewed action pin`);
     if(action==='actions/checkout'){assert.equal(step.with?.['persist-credentials'],false);assert.equal(step.with?.ref,'${{ github.sha }}');assert.equal(step.with.repository,undefined);}
    }
   }
   if(file==='public-audit.yml'){assert.equal(evaluateGate(job.if,ownerContext({ref:'refs/heads/feature'})),true);assert.equal(evaluateGate(job.if,ownerContext({ref_type:'tag'})),true);}
   for(const event_name of ['push','workflow_dispatch']){
    assert.equal(evaluateGate(job.if,ownerContext({event_name})),['ci.yml','public-audit.yml','salsa-snapshot.yml','makehuman-pilot.yml'].includes(file)||event_name==='workflow_dispatch',`${label}: trusted owner event`);
   }
   const denied=[{repository:'attacker/cartoon_ai'},{repository_id:'999'},{repository_owner_id:'999'},{actor_id:'999'},{actor:'collaborator'},{triggering_actor:'collaborator'},{actor:'dependabot[bot]',actor_id:'49699333'},{ref:'refs/heads/feature'},{ref:'refs/tags/main',ref_type:'tag'}];
   for(const event_name of ['pull_request','pull_request_target','issue_comment','workflow_run','workflow_call','repository_dispatch','schedule','release'])denied.push({event_name});
   for(const key of ['repository','repository_id','repository_owner_id','actor_id','actor','triggering_actor','ref','event_name'])denied.push({[key]:undefined});
   for(const bad of denied.filter(b=>!(file==='public-audit.yml'&&(b.ref==='refs/heads/feature'||Object.hasOwn(b,'ref')&&b.ref===undefined||b.ref==='refs/tags/main'))))assert.equal(evaluateGate(job.if,ownerContext({...bad,event_name:bad.event_name??'workflow_dispatch',...bad})),false,`${label}: unauthorized context ${JSON.stringify(bad)}`);
   if(file==='makehuman-pilot.yml'){
    for(const event_name of ['push','workflow_dispatch'])assert.equal(evaluateGate(job.if,ownerContext({ref:'refs/heads/experiment/salsa-human-models',event_name})),true);
    const upload=job.steps.find(step=>step.uses?.startsWith('actions/upload-artifact@'));
    assert.equal(upload.if,"always() && steps.audit.outcome == 'success' && steps.generate.outcome == 'success'");
    assert.equal(upload.with['retention-days'],1);
    assert.equal(upload.with.path,'${{ runner.temp }}/makehuman-output/');
    const compare=job.steps.find(step=>step.id==='compare');
    assert.equal(compare.run,'"$RUNNER_TEMP/mpfb-comparison/bin/python" experiments/makehuman-pilot/compare.py --model-dir "$RUNNER_TEMP/makehuman-output" --output "$RUNNER_TEMP/makehuman-comparison" >> "$GITHUB_STEP_SUMMARY"');
    assert.equal(compare.if,undefined);assert.equal(compare['continue-on-error'],undefined);
    assert.ok(job.steps.indexOf(upload)<job.steps.indexOf(compare),'Model artifact must precede score gate');
    const report=job.steps.find(step=>step.id==='comparison_artifact');
    assert.equal(report.if,"always() && steps.audit.outcome == 'success' && steps.generate.outcome == 'success' && (steps.compare.outcome == 'success' || steps.compare.outcome == 'failure')");
    assert.equal(report.with.name,'makehuman-foreground-comparison');assert.equal(report.with['retention-days'],1);
    assert.deepEqual(report.with.path.trim().split('\n'),['metrics.json','summary.md','comparison.png','reference-annotation.png','reference-normalized.png','render-normalized.png','overlap.png','difference.png'].map(p=>'${{ runner.temp }}/makehuman-comparison/'+p));
    assert.ok(job.steps.indexOf(report)>job.steps.indexOf(compare));

   }
   if(file==='salsa-snapshot.yml'){
    for(const event_name of ['push','workflow_dispatch'])assert.equal(evaluateGate(job.if,ownerContext({ref:'refs/heads/experiment/salsa-human-models',event_name})),true,'Snapshot must accept the authorized experiment branch');
    const upload=job.steps.find(step=>step.uses?.startsWith('actions/upload-artifact@'));
    assert.equal(upload?.if,"always() && steps.audit.outcome == 'success' && steps.capture.outcome == 'success'");
    assert.equal(upload.with['retention-days'],1);assert.equal(upload.with.name,'salsa-fixed-camera-snapshot');
    assert.deepEqual(upload.with.path.trim().split('\n'),['experiments/salsa-human-models/output/render.png','experiments/salsa-human-models/output/capture.json']);
    assert.equal(job.steps.find(step=>step.id==='audit')?.run,'bash scripts/run-public-audit.sh');
    assert.equal(job.steps.find(step=>step.id==='capture')?.run,'node experiments/salsa-human-models/capture.mjs');
    const compare=job.steps.find(step=>step.id==='compare');
    assert.equal(compare?.run,'"$RUNNER_TEMP/salsa-image-comparison/bin/python" experiments/salsa-human-models/compare.py');
    assert.equal(compare.if,undefined);assert.equal(compare['continue-on-error'],undefined);assert.equal(job['continue-on-error'],undefined);
    const report=job.steps.find(step=>step.id==='comparison_artifact');
    assert.equal(report?.if,"always() && steps.audit.outcome == 'success' && steps.capture.outcome == 'success' && (steps.compare.outcome == 'success' || steps.compare.outcome == 'failure')");
    assert.equal(report.with.name,'salsa-reference-comparison');assert.equal(report.with['retention-days'],1);
    assert.deepEqual(report.with.path.trim().split('\n'),['reference-comparison.png','reference-cropped.png','render-cropped.png','difference.png','metrics.json','summary.md'].map(p=>'experiments/salsa-human-models/output/'+p));
    assert.ok(job.steps.indexOf(upload)<job.steps.indexOf(compare),'Snapshot must publish before comparison can fail');
    for(const step of job.steps.filter(step=>step.run?.includes('salsa-image-comparison')))assert.ok(job.steps.indexOf(upload)<job.steps.indexOf(step),'Snapshot must precede all metric prerequisites');
    assert.ok(job.steps.indexOf(report)>job.steps.indexOf(compare),'Comparison report must follow the gate');

   }
   if(name==='deploy')for(const status of ['failure','cancelled','skipped','']){const c=ownerContext();c.needs.test.result=status;assert.equal(evaluateGate(job.if,c),false,`${label}: failed build must not deploy`);}
   if(name==='deploy')for(const flag of ['false','',undefined]){const c=ownerContext();c.vars.ENABLE_GITHUB_PAGES=flag;assert.equal(evaluateGate(job.if,c),false,`${label}: disabled Pages must not deploy`);}
  }
 }
 assert.ok(workflows['ci.yml'].jobs.test.steps.some(s=>s.run==='npm run check:workflows'),'CI must enforce workflow policy');
 for(const file of ['ci.yml','export-mp4.yml','robot-model.yml','robot-mp4.yml','public-audit.yml','salsa-snapshot.yml','makehuman-pilot.yml']){
  const job=Object.values(workflows[file].jobs)[0];
  const auditIndex=job.steps.findIndex(s=>s.run==='bash scripts/run-public-audit.sh');assert.ok(auditIndex>=0,`${file}: publication requires public audit`);
  assert.equal(job.steps[auditIndex].if,undefined,'Audit cannot be conditional');assert.equal(job.steps[auditIndex]['continue-on-error'],undefined);assert.equal(job['continue-on-error'],undefined);
  assert.equal(job.steps.find(s=>s.uses?.startsWith('actions/checkout@')).with['fetch-depth'],0);
  assert.ok(job.steps.slice(0,auditIndex).every(s=>!s.uses?.startsWith('actions/upload-')),'No upload before audit');
 }
 return jobs.length;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const n=checkPolicy(await readWorkflows(),JSON.parse(await readFile(resolve(root,'.github/action-pins.json'),'utf8')));console.log(`Workflow security policy passed: ${n} owner-only jobs, adversarial events denied, immutable actions and minimal tokens.`);}catch(e){console.error(e.message);process.exitCode=1;}
}
