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
 return {github:{repository:'kpok/cartoon_ai',repository_id:'1433681495',repository_owner_id:'10676481',actor_id:'10676481',actor:'kpok',triggering_actor:'kpok',ref:'refs/heads/main',event_name:'push',...overrides},needs:{test:{result:'success'}},vars:{ENABLE_GITHUB_PAGES:'true'}};
}
export function checkPolicy(workflows,pins){
 assert.deepEqual(Object.keys(workflows).sort(),['ci.yml','export-mp4.yml','repo-diagnostics.yml','robot-model.yml'],'New or administrative workflows need a security policy review');
 const jobs=[];
 for(const [file,workflow] of Object.entries(workflows)){
  assert.deepEqual(workflow.permissions,{},`${file}: default token must have no permissions`);
  assert.equal(workflow.concurrency,undefined,'Authorization must happen before concurrency allocation');
  assert.deepEqual(Object.keys(workflow.on).sort(),file==='ci.yml'?['push','workflow_dispatch']:['workflow_dispatch'],'Unexpected public trigger');
  if(file==='ci.yml')assert.deepEqual(workflow.on.push,{branches:['main'],'paths-ignore':['**/*.md','docs/**']});
  assert.deepEqual(Object.keys(workflow.jobs).sort(),file==='ci.yml'?['deploy','regression','test']:file==='repo-diagnostics.yml'?['actions-smoke','diagnostics']:file==='robot-model.yml'?['generate']:['export']);
  for(const [name,job] of Object.entries(workflow.jobs)){
   const label=`${file}/${name}`;jobs.push({file,name,job});
   assert.equal(job['runs-on'],'ubuntu-latest',`${label}: hosted runner required`);
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
    assert.doesNotMatch(JSON.stringify(step),/secrets\.|secrets\[/,`${label}: secrets need a separate reviewed generation job`);
    if(step.run)assert.doesNotMatch(step.run,/\$\{\{/,`${label}: pass inputs through quoted environment variables`);
    if(step.uses){
     const [action,sha]=step.uses.split('@');assert.match(sha||'',/^[a-f0-9]{40}$/,`${label}: immutable action SHA required`);assert.equal(sha,pins[action],`${label}: unreviewed action pin`);
     if(action==='actions/checkout'){assert.equal(step.with?.['persist-credentials'],false);assert.equal(step.with?.ref,'${{ github.sha }}');assert.equal(step.with.repository,undefined);}
    }
   }
   for(const event_name of ['push','workflow_dispatch']){
    assert.equal(evaluateGate(job.if,ownerContext({event_name})),file==='ci.yml'||event_name==='workflow_dispatch',`${label}: trusted owner event`);
   }
   const denied=[{repository:'attacker/cartoon_ai'},{repository_id:'999'},{repository_owner_id:'999'},{actor_id:'999'},{actor:'collaborator'},{triggering_actor:'collaborator'},{actor:'dependabot[bot]',actor_id:'49699333'},{ref:'refs/heads/feature'},{ref:'refs/tags/main'}];
   for(const event_name of ['pull_request','pull_request_target','issue_comment','workflow_run','workflow_call','repository_dispatch','schedule','release'])denied.push({event_name});
   for(const key of ['repository','repository_id','repository_owner_id','actor_id','actor','triggering_actor','ref','event_name'])denied.push({[key]:undefined});
   for(const bad of denied)assert.equal(evaluateGate(job.if,ownerContext({...bad,event_name:bad.event_name??'workflow_dispatch',...bad})),false,`${label}: unauthorized context ${JSON.stringify(bad)}`);
   if(name==='deploy')for(const status of ['failure','cancelled','skipped','']){const c=ownerContext();c.needs.test.result=status;assert.equal(evaluateGate(job.if,c),false,`${label}: failed build must not deploy`);}
   if(name==='deploy')for(const flag of ['false','',undefined]){const c=ownerContext();c.vars.ENABLE_GITHUB_PAGES=flag;assert.equal(evaluateGate(job.if,c),false,`${label}: disabled Pages must not deploy`);}
  }
 }
 assert.ok(workflows['ci.yml'].jobs.test.steps.some(s=>s.run==='npm run check:workflows'),'CI must enforce workflow policy');
 return jobs.length;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const n=checkPolicy(await readWorkflows(),JSON.parse(await readFile(resolve(root,'.github/action-pins.json'),'utf8')));console.log(`Workflow security policy passed: ${n} owner-only jobs, adversarial events denied, immutable actions and minimal tokens.`);}catch(e){console.error(e.message);process.exitCode=1;}
}
