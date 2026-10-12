// Canários da saída do espanhol: cada URL /es/ antiga leva à mesma página em inglês, fora do índice,
// e nenhuma página de conteúdo volta a apontar para /es/. Roda sobre uma cópia do dist do build.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cpSync,mkdtempSync,readFileSync,rmSync,writeFileSync,mkdirSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {root,siteBase} from './check-links.mjs';
import {checkRedirecionamentos,rotasAntigas} from './check-redirecionamentos.mjs';
const B=siteBase();
function copia(run){
 const dir=mkdtempSync(resolve(tmpdir(),'redirecionamentos-'));
 try{cpSync(resolve(root,'dist'),dir,{recursive:true});run(dir);}finally{rmSync(dir,{recursive:true,force:true});}
}
const editar=(dir,caminho,mudar)=>{const f=resolve(dir,caminho);writeFileSync(f,mudar(readFileSync(f,'utf8')));};

test('as URLs /es/ antigas são a home, o índice das docs e os 12 artigos',()=>{
 const rotas=rotasAntigas();
 assert.equal(rotas.length,14);
 assert.deepEqual(rotas.slice(0,2),['/','/docs/']);
 assert.ok(rotas.includes('/docs/contribuir/')&&rotas.includes('/docs/company-brain/'));
});
test('o build tem um redirecionamento para cada URL /es/ antiga',()=>{
 assert.equal(checkRedirecionamentos().redirects,14);
});
test('redirecionamento que falta reprova',()=>copia(dir=>{
 unlinkSync(resolve(dir,'es/docs/comecar/index.html'));
 assert.throws(()=>checkRedirecionamentos(dir),/Missing redirect for the old Spanish URL: \/es\/docs\/comecar\//);
}));
test('destino errado reprova',()=>copia(dir=>{
 editar(dir,'es/docs/governanca/index.html',s=>s.replace('url='+B+'/en/docs/governanca/','url='+B+'/docs/governanca/'));
 assert.throws(()=>checkRedirecionamentos(dir),/goes to/);
}));
test('canonical fora da página em inglês reprova',()=>copia(dir=>{
 editar(dir,'es/index.html',s=>s.replace('rel="canonical" href="https://orkmind.com'+B+'/en/"','rel="canonical" href="https://orkmind.com'+B+'/es/"'));
 assert.throws(()=>checkRedirecionamentos(dir),/canonical/);
}));
test('redirecionamento sem noindex reprova',()=>copia(dir=>{
 editar(dir,'es/docs/index.html',s=>s.replace(/<meta name="robots" content="[^"]*"/,'<meta name="robots" content="index"'));
 assert.throws(()=>checkRedirecionamentos(dir),/out of search indexes/);
}));
test('redirecionamento sem o script do fragmento reprova',()=>copia(dir=>{
 editar(dir,'es/docs/arquitetura/index.html',s=>s.replace(/location\.replace\(/g,'void('));
 assert.throws(()=>checkRedirecionamentos(dir),/fragment/);
}));
test('página de conteúdo que sobra em /es/ reprova',()=>copia(dir=>{
 mkdirSync(resolve(dir,'es/sobra'),{recursive:true});
 writeFileSync(resolve(dir,'es/sobra/index.html'),'<!doctype html><html lang="es"><head><title>Sobra</title></head><body><main><h1>Sobra</h1></main></body></html>');
 assert.throws(()=>checkRedirecionamentos(dir),/Spanish page left/);
}));
test('link de conteúdo para /es/ reprova',()=>copia(dir=>{
 editar(dir,'en/index.html',s=>s.replace('</main>','<a href="'+B+'/es/">Español</a></main>'));
 assert.throws(()=>checkRedirecionamentos(dir),/links to the old Spanish URL/);
}));
test('hreflang es numa página de conteúdo reprova',()=>copia(dir=>{
 editar(dir,'index.html',s=>s.replace('</head>','<link rel="alternate" hreflang="es" href="https://orkmind.com'+B+'/es/" /></head>'));
 assert.throws(()=>checkRedirecionamentos(dir),/announces Spanish/);
}));
