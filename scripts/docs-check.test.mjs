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

import {cpSync,readFileSync} from 'node:fs';
import {checkLinks,root as siteRoot} from './check-links.mjs';
import {checkI18n} from './check-i18n.mjs';
import {checkPublic} from './check-public.mjs';
import {checkContent} from './check-content.mjs';
function outputFixture(run){
 const dir=mkdtempSync(resolve(tmpdir(),'docs-output-canary-'));
 try{cpSync(resolve(siteRoot,'dist'),dir,{recursive:true});run(dir);}finally{rmSync(dir,{recursive:true,force:true});}
}
function edit(dir,path,change){const file=resolve(dir,path);writeFileSync(file,change(readFileSync(file,'utf8')));}
test('built output passes links, locale, content and public checks',()=>{
 assert.ok(checkLinks().checked>0);assert.equal(checkI18n().locales,3);assert.equal(checkPublic().findings,0);assert.ok(checkContent().accessibleDiagrams>0);
});
test('missing internal destination fails',()=>outputFixture(dir=>{
 edit(dir,'index.html',s=>s.replace('</main>','<a href="/missing-canary/">Broken</a></main>'));
 assert.throws(()=>checkLinks(dir),/Missing target/);
}));
test('missing fragment fails',()=>outputFixture(dir=>{
 edit(dir,'index.html',s=>s.replace('</main>','<a href="#missing-canary">Broken</a></main>'));
 assert.throws(()=>checkLinks(dir),/Missing fragment/);
}));
test('duplicate IDs fail',()=>outputFixture(dir=>{
 edit(dir,'index.html',s=>s.replace('</main>','<span id="conteudo"></span></main>'));
 assert.throws(()=>checkLinks(dir),/Duplicate ID/);
}));
test('wrong language fails',()=>outputFixture(dir=>{
 edit(dir,'en/index.html',s=>s.replace('lang="en"','lang="pt-BR"'));
 assert.throws(()=>checkI18n(dir),/Wrong html language/);
}));
test('missing selector fails',()=>outputFixture(dir=>{
 edit(dir,'es/index.html',s=>s.replace('data-language-selector','data-missing-selector'));
 assert.throws(()=>checkI18n(dir),/Missing language selector/);
}));
test('personal data canary is rejected without printing its value',()=>outputFixture(dir=>{
 edit(dir,'index.html',s=>s.replace('</main>','<p>sample.person@example.invalid</p></main>'));
 assert.throws(()=>checkPublic(dir),e=>/Unreviewed email/.test(e.message)&&!e.message.includes('sample.person'));
}));
test('unlinked SVG description fails',()=>outputFixture(dir=>{
 edit(dir,'docs/arquitetura/index.html',s=>s.replace('<desc id="diagram-','<desc id="unlinked-diagram-'));
 assert.throws(()=>checkContent(dir),/Inaccessible diagram/);
}));
