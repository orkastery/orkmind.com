// Canários do check:design: cada regra da Partitura passa no caso certo e reprova a mutação que
// deve pegar (jade fora do lugar, foco sem anel, fonte fora do kit, cor solta, código fora da
// noite, recurso de fora, marca trocada, termo proibido e licença faltando).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parse} from 'parse5';
import {acentoForaDoLugar,jadeInlineForaDoLugar,focoSemAnel,fontesForaDoKit,corSolta,corSoltaNoHtml,codigoForaDaNoite,comandoForaDaNoite,recursosDeFora,marcaFora,vozForaDoKit,licencasFaltando,regras} from './check-design.mjs';

const doc=corpo=>parse(`<!doctype html><html><head></head><body>${corpo}</body></html>`);

test('regras: lê o seletor sem o escopo do Astro, também dentro de @media',()=>{
 assert.deepEqual(regras('.a[data-astro-cid-x1]{color:red}@media (max-width:9px){.b{color:blue}}').map(r=>r.seletor),['.a','.b']);
});

test('jade: só no comando de instalação, no separador, no ponto que espera e no chip de espera',()=>{
 assert.deepEqual(acentoForaDoLugar('.etapa{color:var( --jade-tinta )}.aba{border-color:var(--espera,var(--texto))}'),['.etapa','.aba'],'grafias com espaço e reserva no CSS');
 const certo=':root{--espera:var(--jade)}[data-tema=noite]{--espera-texto:var(--jade)}.comando{box-shadow:var(--luz-jade)}.separador-fio span{background:var(--espera)}.chip-espera{color:var(--espera-texto)}.chip-espera .chip-ponto{background:var(--espera)}';
 assert.deepEqual(acentoForaDoLugar(certo),[]);
 assert.deepEqual(acentoForaDoLugar(certo+'.cabecalho-nav a[aria-current]{color:var(--espera-texto)}'),['.cabecalho-nav a[aria-current]']);
 assert.deepEqual(acentoForaDoLugar('.etapa,.comando{border-color:var(--jade)}'),['.etapa']);
});

test('jade inline: só dentro do que espera você (data-espera na linha ou no evento)',()=>{
 assert.deepEqual(jadeInlineForaDoLugar(doc('<div data-entrada="2" data-espera><span style="background:var(--espera)"></span></div><li data-noite-evento="4" data-espera style="border-color:var(--espera)"></li>')),[]);
 assert.deepEqual(jadeInlineForaDoLugar(doc('<main data-espera><h1 class="t" style="color:var(--espera)">x</h1></main>')),['h1.t'],'marcador num ancestral qualquer não libera');
 assert.deepEqual(jadeInlineForaDoLugar(doc('<p class="a" style="color:var( --espera )">x</p><p class="b" style="color:var(--jade,var(--texto))">y</p>')),['p.a','p.b'],'grafias com espaço e reserva');
 assert.deepEqual(jadeInlineForaDoLugar(doc('<h1 class="hero-titulo" style="color:var(--espera);background:var(--jade)">x</h1>')),['h1.hero-titulo']);
 assert.deepEqual(jadeInlineForaDoLugar(doc('<div data-entrada="0"><span class="b" style="color:var(--espera-texto)"></span></div>')),['span.b']);
});

test('foco: o anel do kit em :focus-visible e nenhum outline:none sem anel',()=>{
 const certo=':focus-visible{outline:2px solid transparent;box-shadow:var(--anel-foco)}:focus:not(:focus-visible){outline:none}main:focus{outline:none;box-shadow:none}';
 assert.deepEqual(focoSemAnel(certo),[]);
 assert.deepEqual(focoSemAnel(certo+'.botao:focus{outline:none}'),['.botao:focus']);
 assert.deepEqual(focoSemAnel('a:focus-visible{outline:2px solid blue}'),[':focus-visible sem o anel do kit']);
});

test('fontes: só Geist, Hanken Grotesk e IBM Plex Mono (com as genéricas de reserva)',()=>{
 assert.deepEqual(fontesForaDoKit("@font-face{font-family:Geist}h1{font-family:var(--f-titulo)}code{font-family:'IBM Plex Mono',ui-monospace,monospace}"),[]);
 assert.deepEqual(fontesForaDoKit("h1{font-family:'Clash Display',sans-serif}"),['Clash Display']);
 assert.deepEqual(fontesForaDoKit('p{font:400 17px/1.5 Inter,sans-serif}'),['Inter']);
});

test('cor solta: hex e rgba só nos blocos de tokens; no HTML, nenhuma no atributo style',()=>{
 assert.deepEqual(corSolta(':root{--tinta:#12161C;--sombra-1:0 1px 2px rgba(18,22,28,.05)}[data-tema="noite"]{--linha-forte:#343B46}.a{color:var(--texto)}'),[]);
 assert.deepEqual(corSolta('.cartao{background:#fff}'),['.cartao']);
 assert.deepEqual(corSolta('.cartao{box-shadow:0 1px 2px rgba(0,0,0,.2)}'),['.cartao']);
 assert.deepEqual(corSoltaNoHtml(doc('<span style="background:var(--espera)"></span>')),[]);
 assert.deepEqual(corSoltaNoHtml(doc('<span class="x" style="color:#E0B264"></span>')),['span.x']);
});

test('código e comando sempre noite',()=>{
 assert.deepEqual(codigoForaDaNoite(doc('<div data-tema="noite"><pre><code>x</code></pre></div><pre data-tema="noite">y</pre><div class="terminal" data-tema="noite"></div>')),[]);
 assert.deepEqual(codigoForaDaNoite(doc('<section><pre><code>x</code></pre></section>')),['pre.']);
 assert.deepEqual(codigoForaDaNoite(doc('<div class="avisos"></div>')),['div.avisos']);
 const css='.comando-botao{background:var(--noite-2)}';
 assert.deepEqual(comandoForaDaNoite(doc('<span class="comando comando-hero"><button data-copiar="pip install orkmind"></button></span>'),css),[]);
 assert.deepEqual(comandoForaDaNoite(doc('<div><button data-copiar="pip install orkmind"></button></div>'),css),['pip install orkmind']);
 assert.deepEqual(comandoForaDaNoite(doc('<span class="comando"><button data-copiar="x"></button></span>'),'.comando-botao{background:var(--superficie)}'),['.comando-botao sem o fundo noite-2']);
});

test('recursos: nada de fora (folha, script, imagem, fonte, @import)',()=>{
 assert.deepEqual(recursosDeFora(doc('<link rel="stylesheet" href="/_astro/a.css"><img src="/marca/x.svg"><a href="https://github.com/orkastery/orkmind">GitHub</a>'),'@font-face{src:url(/_astro/g.woff2)}'),[]);
 assert.deepEqual(recursosDeFora(doc('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">'),''),['link https://fonts.googleapis.com/css2?family=Inter']);
 assert.deepEqual(recursosDeFora(doc('<script src="//cdn.example/x.js"></script>'),''),['script //cdn.example/x.js']);
 assert.deepEqual(recursosDeFora(doc(''),'@font-face{src:url(https://cdn.example/f.woff2)}'),['url https://cdn.example/f.woff2']);
});

test('marca: assinatura clara no cabeçalho, escura no rodapé noite, só arquivos de /marca/',()=>{
 const certo='<header><img src="/marca/assinatura-fundo-claro.svg"></header><footer data-tema="noite"><img src="/marca/assinatura-fundo-escuro.svg"></footer><section data-tema="noite"><img src="/marca/simbolo-fundo-escuro.svg"></section>';
 assert.deepEqual(marcaFora(doc(certo)),[]);
 assert.ok(marcaFora(doc('<header><img src="/marca/assinatura-fundo-escuro.svg"></header>')).length>0,'assinatura escura no cabeçalho claro');
 assert.ok(marcaFora(doc('<footer data-tema="noite"><img src="/marca/assinatura-fundo-claro.svg"></footer>')).length>0,'assinatura clara no rodapé noite');
 assert.deepEqual(marcaFora(doc('<img src="/img/simbolo-recolorido.svg">')),['/img/simbolo-recolorido.svg']);
});

test('voz: nenhum termo proibido pelo kit e nenhum travessão',()=>{
 assert.deepEqual(vozForaDoKit('Agentes vêm e vão. A memória fica; a regra espera você.'),[]);
 for(const frase of ['nenhum backend consegue afrouxar as garantias','o backend afrouxou a regra','afrouxe a regra','a batuta da orquestra','no ritmo do metrônomo','Metrônomos','como Bernstein regia','um produto disruptivo','a thread entra em pausa','pausaram a fila','no backend loosens the guarantees','a metronome','the baton','a disruptive product','the thread pauses','paused for approval'])assert.ok(vozForaDoKit(frase).length>0,'não pegou: '+frase);
 for(const frase of ['a regra espera você','o despacho segue','paus de selfie não existem'])assert.deepEqual(vozForaDoKit(frase),[],'falso positivo: '+frase);
 assert.deepEqual(vozForaDoKit('memória — governada'),['travessão']);
});

test('licenças: as três fontes servidas com a OFL ao lado',()=>{
 const pasta=mkdtempSync(join(tmpdir(),'licencas-'));
 try{
  mkdirSync(join(pasta,'licenses'));
  for(const n of ['geist','hanken-grotesk','ibm-plex-mono'])writeFileSync(join(pasta,'licenses',n+'.txt'),'SIL Open Font License, Version 1.1');
  assert.deepEqual(licencasFaltando(pasta),[]);
  writeFileSync(join(pasta,'licenses','geist.txt'),'sem licença');
  assert.deepEqual(licencasFaltando(pasta),['geist']);
 }finally{rmSync(pasta,{recursive:true,force:true});}
});
