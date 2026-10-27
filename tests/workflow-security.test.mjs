import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readWorkflows,checkPolicy,evaluateGate,ownerContext} from '../scripts/check-workflows.mjs';
const workflows=await readWorkflows();
const pins=JSON.parse(await readFile(new URL('../.github/action-pins.json',import.meta.url),'utf8'));
test('actual workflow guards deny external actors, forks, reruns and unexpected events',()=>{assert.equal(checkPolicy(workflows,pins),3);});
test('security regressions in YAML are caught before delivery',()=>{
 const mutations=[
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
