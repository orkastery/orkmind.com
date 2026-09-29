import {readFileSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {files,root,distArg} from './check-links.mjs';
export function checkPublic(dist=distArg()){
 const selected=[...files(dist),...files(resolve(root,'src'))].filter(f=>/\.(html|js|css|ts|astro|json|svg|webmanifest|txt)$/.test(f));
 const rules=[['legacy personal example',/\b(?:julio|tomas|alice)\b/i],['personal path',/\/(?:home|Users)\/[a-zA-Z][a-zA-Z0-9._-]*\//],['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['credential URL',/(?:postgres(?:ql)?|https?):\/\/[^\s/:"<>]+:[^\s@"<>]+@/],['access token',/\b(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_]{16,}/],['personal identifier',/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/]];
 let checked=0;
 for(const file of selected){const source=readFileSync(file,'utf8');for(const [name,re] of rules)if(re.test(source))throw Error(name+' detected in '+relative(root,file)+' (value suppressed)');
  for(const m of source.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g))if(m[0]!=='maestro@orkastery.com')throw Error('Unreviewed email in '+relative(root,file)+' (value suppressed)');
  checked++;
 }
 return {files:checked,findings:0,scope:'deterministic patterns; contextual review remains required',allowedCorporateEmail:'maestro@orkastery.com'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkPublic()));}catch(e){console.error(e.message);process.exitCode=1;}}
