import {spawnSync} from 'node:child_process';
const result=spawnSync('npm',['audit','--json'],{encoding:'utf8',maxBuffer:10*1024*1024,timeout:120000});
try{
 const report=JSON.parse(result.stdout);
 if(result.error||report.error||![0,1].includes(result.status)||!report.metadata?.vulnerabilities)throw Error();
 const v=report.metadata.vulnerabilities;
 if(!['info','low','moderate','high','critical','total'].every(k=>Number.isInteger(v[k])&&v[k]>=0))throw Error();
 if(v.high>0||v.critical>0)throw Error();
 console.log('Dependency advisory audit passed: no high/critical findings.');
}catch{console.error('Dependency advisory audit FAILED (high/critical finding or unavailable registry). Inspect locally.');process.exitCode=1;}
