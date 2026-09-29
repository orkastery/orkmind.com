import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, read, hash, articles, inventory, sourceHash } from './check-docs.mjs';
const args=process.argv.slice(2), arg=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;
const source=arg('--source');
if(!source) throw Error('Usage: node scripts/sync-docs.mjs --source LOCAL_REPOSITORY [--review pt,en,es --reviewer NAME]');
const catalog=read(resolve(root,'src/data/docs-catalog.ts')), product=catalog.repository.split('/').at(-1);
const file=resolve(root,'src/data/docs-sources.json'), previous=existsSync(file)?read(file):{reviews:{}};
const all=articles(), sources=inventory(resolve(source),product).map(s=>{
 const special=s.path.includes('/roadmap/')?'roadmap':s.path.includes('/assets/')?'brand':s.path.includes('/_modelo')?'template':s.path.endsWith('README.md')&&s.path!=='README.md'?'index':'article';
 const targets=all.filter(a=>a.sources.includes(s.path)).map(a=>a.slug);
 if(!targets.length && special!=='article') targets.push(special==='roadmap'?'roadmap':'padroes');
 return {...s,category:s.path.split('/')[1]||'root',treatment:special,targets};
});
const snapshot={schemaVersion:1,product,sources,inventoryHash:hash(JSON.stringify(sources)),reviews:previous.reviews||{}};
// Synchronization never approves a translation. --review is an explicit editorial action.
if(arg('--review')) {
 const reviewer=arg('--reviewer');if(!reviewer) throw Error('An explicit reviewer is required');
 for(const locale of arg('--review').split(',')) {
  if(!['pt','en','es'].includes(locale)) throw Error('Invalid review locale');
  for(const a of all) {
   snapshot.reviews[a.slug]??={};
   snapshot.reviews[a.slug][locale]={sourceHash:sourceHash(a,snapshot),contentHash:hash(JSON.stringify(a.translations[locale])),reviewer,date:new Date().toISOString().slice(0,10)};
  }
 }
}
writeFileSync(file,JSON.stringify(snapshot,null,2)+'\n');
console.log(JSON.stringify({sources:sources.length,uncovered:sources.filter(s=>!s.targets.length).map(s=>s.path),reviewedLocales:arg('--review')||'none; previous reviews retained and revalidated by docs:check'}));
