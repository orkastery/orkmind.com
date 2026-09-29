import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { validate, hash, sourceHash } from './check-docs.mjs';
function fixture(run) {
 const root=mkdtempSync(resolve(tmpdir(),'docs-contract-'));
 const data=resolve(root,'src/data');mkdirSync(data,{recursive:true});
 const article={slug:'start',group:'start',sources:['docs/start.md'],translations:Object.fromEntries(['pt','en','es'].map(locale=>[locale,{title:locale,description:locale+' documentation',sections:[{id:'begin',title:locale,paragraphs:[locale+' content']}]}]))};
 const sources=[{path:'docs/start.md',sha256:hash('source'),category:'docs',treatment:'article',targets:['start']}];
 const snapshot={schemaVersion:1,product:'orkmind',sources,inventoryHash:hash(JSON.stringify(sources)),reviews:{start:{}}};
 for(const locale of ['pt','en','es']) snapshot.reviews.start[locale]={sourceHash:sourceHash(article,snapshot),contentHash:hash(JSON.stringify(article.translations[locale])),reviewer:'fixture',date:'2026-09-28'};
 const save=()=>{
  writeFileSync(resolve(data,'docs-catalog.ts'),'export default '+JSON.stringify({schemaVersion:1,modules:['docs-start.ts']})+';');
  writeFileSync(resolve(data,'docs-start.ts'),'export default '+JSON.stringify([article])+';');
  writeFileSync(resolve(data,'docs-sources.json'),JSON.stringify(snapshot));
 };
 save();try{run({root,article,snapshot,save});}finally{rmSync(root,{recursive:true,force:true});}
}
test('reviewed, translated content passes',()=>fixture(({root})=>assert.equal(validate(root).articles,1)));
test('missing translation fails even schema validation',()=>fixture(({root,article,save})=>{delete article.translations.es;save();assert.throws(()=>validate(root,{schemaOnly:true}),/locale/);}));
test('editing text invalidates editorial review',()=>fixture(({root,article,save})=>{article.translations.en.sections[0].paragraphs=['New unreviewed meaning'];save();assert.throws(()=>validate(root),/stale/);}));
test('source revision invalidates all affected translations',()=>fixture(({root,snapshot,save})=>{snapshot.sources[0].sha256=hash('changed');snapshot.inventoryHash=hash(JSON.stringify(snapshot.sources));save();assert.throws(()=>validate(root),/stale/);}));
test('snapshot corruption is detected',()=>fixture(({root,snapshot,save})=>{snapshot.sources[0].sha256='invalid';save();assert.throws(()=>validate(root),/integrity/);}));
test('new upstream document requires synchronization',()=>fixture(({root})=>{
 const source=resolve(root,'upstream');mkdirSync(resolve(source,'docs'),{recursive:true});
 writeFileSync(resolve(source,'docs/start.md'),'source');
 assert.equal(validate(root,{source}).sourceCompared,true);
 writeFileSync(resolve(source,'docs/new.md'),'new source');
 assert.throws(()=>validate(root,{source}),/upstream changed/);
}));
