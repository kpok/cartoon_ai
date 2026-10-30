import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readWorkflows,checkPolicy,evaluateGate,ownerContext} from '../scripts/check-workflows.mjs';
const workflows=await readWorkflows();
const pins=JSON.parse(await readFile(new URL('../.github/action-pins.json',import.meta.url),'utf8'));
test('actual workflow guards deny external actors, forks, reruns and unexpected events',()=>{assert.equal(checkPolicy(workflows,pins),10);});
test('security regressions in YAML are caught before delivery',()=>{
 const mutations=[
  w=>{w['salsa-snapshot.yml'].jobs.snapshot['runs-on']='ubuntu-latest';},
  w=>{w['salsa-snapshot.yml'].on.push.branches.push('**');},
  w=>{w['salsa-snapshot.yml'].on.pull_request_target={};},
  w=>{w['salsa-snapshot.yml'].jobs.snapshot.steps.find(s=>s.id==='artifact').if='always()';},
  w=>{w['salsa-snapshot.yml'].jobs.snapshot.steps.find(s=>s.id==='artifact').with.path='experiments/salsa-human-models/output/';},
  w=>{w['salsa-snapshot.yml'].jobs.snapshot.if=w['salsa-snapshot.yml'].jobs.snapshot.if.replace("github.actor_id == '10676481' &&",'');},
  w=>{w["public-audit.yml"].on.push["paths-ignore"]=["docs/**"];},
  w=>{w["ci.yml"].jobs.test.steps=w["ci.yml"].jobs.test.steps.filter(s=>s.run!=="bash scripts/run-public-audit.sh");},
  w=>{w["robot-mp4.yml"].jobs.render.steps.find(s=>s.run==="bash scripts/run-public-audit.sh")["continue-on-error"]=true;},
  w=>{w['robot-mp4.yml'].on.push={branches:['main'],paths:['**']};},
  w=>{w['robot-mp4.yml'].on.push={branches:['**']};},
  w=>{w['robot-mp4.yml'].jobs.render.if=w['robot-mp4.yml'].jobs.render.if.replace("github.actor_id == '10676481' &&",'');},
  w=>{w['ci.yml'].on.push['paths-ignore'].push('src/**');},
  w=>{w['repo-diagnostics.yml'].on.push={branches:['main']};},
  w=>{w['repo-diagnostics.yml'].jobs.diagnostics.if="github.ref == 'refs/heads/main'";},
  w=>{w['repo-diagnostics.yml'].jobs['actions-smoke'].permissions.contents='write';},
  w=>{w['ci.yml'].on.pull_request={};},
  w=>{w['ci.yml'].jobs.test.if="github.ref == 'refs/heads/main'";},
  w=>{w['ci.yml'].jobs.deploy.if=w['ci.yml'].jobs.test.if;},
  w=>{w['export-mp4.yml'].jobs.export.if=w['export-mp4.yml'].jobs.export.if.replace("github.triggering_actor == 'kpok' &&",'');},
  w=>{w['ci.yml'].jobs.test.steps[0].with['persist-credentials']=true;},
  w=>{w['ci.yml'].jobs.test.steps[0].uses='actions/checkout@v4';},
  w=>{w['ci.yml'].jobs.test.permissions.contents='write';},
  w=>{w['ci.yml'].concurrency={group:'trusted-film-checks','cancel-in-progress':true};},
  w=>{w['ci.yml'].jobs.test['runs-on']=['self-hosted'];},
  w=>{w['export-mp4.yml'].jobs.export.env={OPENAI_API_KEY:'${{ secrets.OPENAI_API_KEY }}'};},
  w=>{w['sanitize-history.yml']={on:{workflow_dispatch:{}},jobs:{}};},
 ];
 for(const change of mutations){const copy=structuredClone(workflows);change(copy);assert.throws(()=>checkPolicy(copy,pins));}
});
test('gate evaluator fails closed on unsupported syntax and missing identities',()=>{
 assert.equal(evaluateGate("github.actor_id == '10676481' && github.triggering_actor == 'kpok'",ownerContext()),true);
 assert.equal(evaluateGate("github.actor_id == '10676481'",{}),false);
 assert.throws(()=>evaluateGate('always() || true',ownerContext()));
 assert.throws(()=>evaluateGate('github.actor_id ==',ownerContext()));
});
