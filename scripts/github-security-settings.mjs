import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const repo='repos/kpok/cartoon_ai',ownerId=10676481,repoId=1433681495;
export function ghApi(method,path,body){
 return new Promise((ok,fail)=>{
  const args=['api','--hostname','github.com','--method',method,path,'-H','Accept: application/vnd.github+json','-H','X-GitHub-Api-Version: 2026-03-10'];
  if(body!==undefined)args.push('--input','-');
  const child=spawn('gh',args,{stdio:['pipe','pipe','pipe']});let output='',error='';child.on('error',fail);child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>error=(error+b).slice(-3000));child.stdin.on('error',()=>{});child.on('close',code=>{if(code!==0)return fail(new Error(`GitHub administration request failed (${method} ${path}): ${error}`));try{ok(output.trim()?JSON.parse(output):null);}catch(e){fail(e);}});child.stdin.end(body===undefined?undefined:JSON.stringify(body));
 });
}
export function environmentChange(environment,policies){
 // Environment PUT semantics can reset omitted protections. Stop rather than weaken an unfamiliar rule.
 if(!environment||environment.name!=='github-pages')throw new Error('The existing github-pages environment must be inspected first');
 if((environment.protection_rules||[]).some(r=>r.type!=='branch_policy'))throw new Error('Pages has reviewer/timer/custom protections: configure main-only branches in GitHub UI without changing those rules');
 if(environment.prevent_self_review||environment.can_admins_bypass===false)throw new Error('Pages has additional protections: preserve them manually in GitHub UI');
 if(environment.deployment_branch_policy?.protected_branches)throw new Error('Pages uses protected-branch rules: configure main-only branches manually while retaining branch protection');
 if(policies.total_count>100)throw new Error('Too many existing branch policies; inspect all of them manually');
 if((policies.branch_policies||[]).some(p=>!Number.isInteger(p.id)||!['branch','tag'].includes(p.type)))throw new Error('Unrecognized branch policy; no settings will be changed');
 return {environment:{deployment_branch_policy:{protected_branches:false,custom_branch_policies:true}},remove:policies.branch_policies.filter(p=>p.name!=='main'||p.type!=='branch').map(p=>p.id),create:!policies.branch_policies.some(p=>p.name==='main'&&p.type==='branch')};
}
export async function hardenSettings({apply=false,api=ghApi,log=console.log}={}){
 const user=await api('GET','user');if(user.id!==ownerId)throw new Error('Authenticate GitHub CLI as repository owner kpok');
 const metadata=await api('GET',repo);if(metadata.id!==repoId||metadata.owner?.id!==ownerId||!metadata.permissions?.admin)throw new Error('Canonical repository identity and administration permission are required');
 const permissions=await api('GET',`${repo}/actions/permissions`);
 const defaults=await api('GET',`${repo}/actions/permissions/workflow`);
 const approvals=await api('GET',`${repo}/actions/permissions/fork-pr-contributor-approval`);
 const environment=await api('GET',`${repo}/environments/github-pages`);
 const policies=environment.deployment_branch_policy?.custom_branch_policies?await api('GET',`${repo}/environments/github-pages/deployment-branch-policies?per_page=100`):{total_count:0,branch_policies:[]};
 log(JSON.stringify({repository:'kpok/cartoon_ai',mode:apply?'apply':'audit',actions:permissions,workflowDefaults:defaults,forkApproval:approvals,pagesBranchPolicy:environment.deployment_branch_policy,pagesProtectionTypes:(environment.protection_rules||[]).map(r=>r.type),pagesBranches:policies.branch_policies.map(p=>({name:p.name,type:p.type}))},null,2));
 if(!apply){log('Read-only audit. Use --apply only after reviewing SECURITY.md. No settings changed.');return;}
 // Complete all preservation checks before the first mutation.
 const change=environmentChange(environment,policies);
 const pins=JSON.parse(await readFile(new URL('../.github/action-pins.json',import.meta.url),'utf8'));
 await api('PUT',`${repo}/actions/permissions`,{enabled:true,allowed_actions:'selected',sha_pinning_required:true});
 await api('PUT',`${repo}/actions/permissions/selected-actions`,{github_owned_allowed:false,verified_allowed:false,patterns_allowed:Object.entries(pins).map(([action,sha])=>`${action}@${sha}`)});
 await api('PUT',`${repo}/actions/permissions/workflow`,{default_workflow_permissions:'read',can_approve_pull_request_reviews:false});
 await api('PUT',`${repo}/actions/permissions/fork-pr-contributor-approval`,{approval_policy:'all_external_contributors'});
 await api('PUT',`${repo}/environments/github-pages`,change.environment);
 // Remove wider policies before adding the exact main branch. Temporary denial is safer than extra access.
 for(const id of change.remove)await api('DELETE',`${repo}/environments/github-pages/deployment-branch-policies/${id}`);
 if(change.create)await api('POST',`${repo}/environments/github-pages/deployment-branch-policies`,{name:'main',type:'branch'});
 const finalEnvironment=await api('GET',`${repo}/environments/github-pages`);
 if(finalEnvironment.deployment_branch_policy?.custom_branch_policies!==true||finalEnvironment.deployment_branch_policy?.protected_branches!==false)throw new Error('Pages environment restriction read-back differs from main-only custom policy');
 const finalSelected=await api('GET',`${repo}/actions/permissions/selected-actions`);
 const expectedPatterns=Object.entries(pins).map(([action,sha])=>`${action}@${sha}`).sort();
 if(finalSelected.github_owned_allowed!==false||finalSelected.verified_allowed!==false||JSON.stringify([...(finalSelected.patterns_allowed||[])].sort())!==JSON.stringify(expectedPatterns))throw new Error('Action allowlist read-back differs from reviewed pins');
 const finalPermissions=await api('GET',`${repo}/actions/permissions`),finalDefaults=await api('GET',`${repo}/actions/permissions/workflow`),finalApprovals=await api('GET',`${repo}/actions/permissions/fork-pr-contributor-approval`),finalPolicies=await api('GET',`${repo}/environments/github-pages/deployment-branch-policies?per_page=100`);
 if(finalPermissions.allowed_actions!=='selected'||!finalPermissions.sha_pinning_required||finalDefaults.default_workflow_permissions!=='read'||finalDefaults.can_approve_pull_request_reviews!==false||finalApprovals.approval_policy!=='all_external_contributors'||finalPolicies.total_count!==1||finalPolicies.branch_policies[0]?.name!=='main'||finalPolicies.branch_policies[0]?.type!=='branch')throw new Error('Settings read-back did not match requested policy; inspect GitHub UI before further changes');
 log('Settings applied and read back. Check collaborators, branch rules and historical workflow runs separately as documented in SECURITY.md.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{if(process.argv.slice(2).some(a=>a!=='--apply'))throw new Error('Usage: node scripts/github-security-settings.mjs [--apply]');await hardenSettings({apply:process.argv.includes('--apply')});}catch(e){console.error(e.message);process.exitCode=1;}
}
