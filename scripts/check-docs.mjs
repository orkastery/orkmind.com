import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const hash = value => createHash('sha256').update(value).digest('hex');
export const read = file => JSON.parse(readFileSync(file, 'utf8').replace(/^export default /, '').replace(/;\s*$/, ''));
export function articles(dir = root) {
 const c = read(resolve(dir, 'src/data/docs-catalog.ts'));
 if (c.schemaVersion !== 1 || !Array.isArray(c.modules) || new Set(c.modules).size !== c.modules.length) throw Error('invalid catalog');
 return c.modules.flatMap(file => {
  if (!/^docs-[a-z]+\.ts$/.test(file)) throw Error('invalid module path');
  return read(resolve(dir, 'src/data', file));
 });
}
export function inventory(source, product) {
 const files = [];
 function walk(dir) {
  for (const e of readdirSync(dir, {withFileTypes:true})) {
   const full = resolve(dir,e.name);
   if (e.isDirectory()) walk(full);
   else if (e.isFile() && /\.(md|json)$/.test(e.name)) files.push(full);
  }
 }
 walk(resolve(source,'docs'));
 for(const file of product==='orkastery' ? ['README.md','CONTRIBUTING.md','core/package.json'] : ['README.md','README.pt-BR.md','CONTRIBUTING.md','pyproject.toml']) {
  if(existsSync(resolve(source,file))) files.push(resolve(source,file));
 }
 return files.sort().map(file=>({path:relative(source,file).replaceAll('\\','/'),sha256:hash(readFileSync(file))}));
}
export const sourceHash = (a,snapshot) => hash(JSON.stringify(a.sources.map(p=>{
 const entry=snapshot.sources.find(s=>s.path===p);
 if(!entry) throw Error('missing source: '+p);
 return [p,entry.sha256];
})));
export function reviewArticles(all, snapshot, {slugs, locales, reviewer}) {
 if(!reviewer?.trim()) throw Error('An explicit reviewer is required');
 if(!slugs?.length || slugs.some(slug=>!all.some(a=>a.slug===slug))) throw Error('Select existing article slugs with --articles');
 if(!locales?.length || locales.some(locale=>!['pt','en','es'].includes(locale))) throw Error('Invalid review locale');
 for(const a of all.filter(a=>slugs.includes(a.slug))) for(const locale of locales) {
  snapshot.reviews[a.slug]??={};
  snapshot.reviews[a.slug][locale]={sourceHash:sourceHash(a,snapshot),contentHash:hash(JSON.stringify(a.translations[locale])),reviewer,date:new Date().toISOString().slice(0,10)};
 }
}
export function validate(dir=root,{schemaOnly=false,section,source}={}) {
 const all=articles(dir), selected=section ? all.filter(a=>a.group===section) : all;
 const snapshot=read(resolve(dir,'src/data/docs-sources.json'));
 if(snapshot.schemaVersion!==1 || !Array.isArray(snapshot.sources)) throw Error('invalid snapshot');
 if(hash(JSON.stringify(snapshot.sources))!==snapshot.inventoryHash) throw Error('snapshot integrity mismatch');
 const seen=new Set();
 for(const s of snapshot.sources) {
  if(seen.has(s.path) || !/^[a-f0-9]{64}$/.test(s.sha256) || s.path.startsWith('/') || s.path.split('/').includes('..')) throw Error('invalid source record');
  seen.add(s.path);
  if(!s.category || !['article','index','template','brand','roadmap'].includes(s.treatment)) throw Error('unclassified source');
 }
 const slugs=new Set();
 for(const a of all) {
  if(!/^[a-z0-9-]+$/.test(a.slug) || slugs.has(a.slug)) throw Error('invalid or duplicate slug');
  slugs.add(a.slug);
  if(!a.group || !a.sources?.length) throw Error('article without provenance');
  if(Object.keys(a.translations).sort().join(',')!=='en,es,pt') throw Error('missing locale');
  let ids;
  for(const locale of ['pt','en','es']) {
   const t=a.translations[locale];
   if(!t.title?.trim() || !t.description?.trim() || !t.sections?.length) throw Error('missing text');
   const current=t.sections.map(s=>s.id);
   if(new Set(current).size!==current.length || current.some(id=>!/^[-a-z0-9]+$/.test(id))) throw Error('invalid section IDs');
   if(ids && JSON.stringify(ids)!==JSON.stringify(current)) throw Error('section parity');
   ids=current;
   for(const s of t.sections) if(!s.title?.trim() || !s.paragraphs?.length || s.paragraphs.some(x=>typeof x!=='string'||!x.trim())) throw Error('empty section');
   if(!schemaOnly && selected.includes(a)) {
    const review=snapshot.reviews?.[a.slug]?.[locale];
    if(!review?.reviewer || !review?.date || review.sourceHash!==sourceHash(a,snapshot) || review.contentHash!==hash(JSON.stringify(t))) throw Error('stale editorial review: '+a.slug+'/'+locale);
   }
  }
  if(new Set(Object.values(a.translations).map(t=>t.description)).size!==3) throw Error('untranslated description');
 }
 if(!schemaOnly && !section) for(const s of snapshot.sources) {
  if(!s.targets?.length || s.targets.some(t=>!slugs.has(t))) throw Error('uncovered source: '+s.path);
  if(s.treatment==='article' && s.targets.some(t=>!all.find(a=>a.slug===t).sources.includes(s.path))) throw Error('false coverage: '+s.path);
 }
 if(source) {
  const live=inventory(source,snapshot.product);
  if(JSON.stringify(live)!==JSON.stringify(snapshot.sources.map(({path,sha256})=>({path,sha256})))) throw Error('upstream changed: synchronize and review');
 }
 return {articles:selected.length,sources:snapshot.sources.length,locales:3,sourceCompared:Boolean(source),schemaOnly};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 try {const args=process.argv.slice(2);console.log(JSON.stringify(validate(root,{schemaOnly:args.includes('--validate-schema'),section:args[args.indexOf('--section')+1] && args.includes('--section')?args[args.indexOf('--section')+1]:undefined,source:args.includes('--source')?args[args.indexOf('--source')+1]:undefined})));}
 catch(e){console.error(e.message);process.exitCode=1;}
}
