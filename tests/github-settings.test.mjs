import test from 'node:test';
import assert from 'node:assert/strict';
import {environmentChange,hardenSettings} from '../scripts/github-security-settings.mjs';
const environment={name:'github-pages',protection_rules:[],deployment_branch_policy:null};
test('Pages hardening narrows branch/tag patterns and refuses unfamiliar protections',()=>{
 assert.deepEqual(environmentChange(environment,{total_count:0,branch_policies:[]}),{environment:{deployment_branch_policy:{protected_branches:false,custom_branch_policies:true}},remove:[],create:true});
 const policies={total_count:3,branch_policies:[{id:1,name:'main',type:'branch'},{id:2,name:'*',type:'branch'},{id:3,name:'main',type:'tag'}]};
 const changes=environmentChange(environment,policies);assert.deepEqual(changes.remove,[2,3]);assert.equal(changes.create,false);
 for(const type of ['required_reviewers','wait_timer','custom_rule'])assert.throws(()=>environmentChange({...environment,protection_rules:[{type}]},policies));
 assert.throws(()=>environmentChange({...environment,deployment_branch_policy:{protected_branches:true}},policies));
 assert.throws(()=>environmentChange(environment,{total_count:101,branch_policies:[]}));
});
test('administration helper audits without writes and fails before mutations for unknown protections',async()=>{
 const calls=[];
 const api=async(method,path)=>{calls.push([method,path]);if(path==='user')return {id:10676481};if(path==='repos/kpok/cartoon_ai')return {id:1433681495,owner:{id:10676481},permissions:{admin:true}};if(path.endsWith('/environments/github-pages'))return environment;return {};};
 await hardenSettings({api,log:()=>{}});assert.ok(calls.every(([method])=>method==='GET'));
 calls.length=0;
 await assert.rejects(hardenSettings({apply:true,log:()=>{},api:async(method,path)=>path.endsWith('/environments/github-pages')?{...environment,protection_rules:[{type:'required_reviewers'}]}:api(method,path)}),/protections/);
 assert.ok(calls.every(([method])=>method==='GET'));
 const wrong=[];await assert.rejects(hardenSettings({apply:true,log:()=>{},api:async(method,path)=>{wrong.push([method,path]);return {id:123};}}),/owner/);assert.deepEqual(wrong,[['GET','user']]);
});

test('apply is fixed-repository only and verifies settings and effective Pages policy',async()=>{
 const requests=[],state={environment:{...environment},policies:{total_count:0,branch_policies:[]}};
 const base='repos/kpok/cartoon_ai';
 const api=async(method,path,body)=>{
  requests.push({method,path,body});
  if(path==='user')return {id:10676481};if(path===base)return {id:1433681495,owner:{id:10676481},permissions:{admin:true}};
  const suffix=path.slice(base.length);assert.ok(path.startsWith(base+'/'));
  if(method==='GET'){if(suffix==='/environments/github-pages')return state.environment;if(suffix.includes('/deployment-branch-policies'))return state.policies;return state[suffix]||{};}
  if(suffix==='/environments/github-pages')state.environment={...state.environment,...body};
  else if(suffix.endsWith('/deployment-branch-policies'))state.policies={total_count:1,branch_policies:[{id:9,...body}]};
  else state[suffix]=body;
  return null;
 };
 await hardenSettings({apply:true,api,log:()=>{}});
 assert.ok(requests.some(r=>r.method==='PUT'&&r.path.endsWith('/selected-actions')));
 assert.equal(state['/actions/permissions'].sha_pinning_required,true);assert.equal(state['/actions/permissions/workflow'].default_workflow_permissions,'read');
 assert.equal(state.policies.branch_policies[0].name,'main');
 assert.equal(requests.filter(r=>r.method==='GET'&&r.path===base+'/environments/github-pages').length,2);
});
