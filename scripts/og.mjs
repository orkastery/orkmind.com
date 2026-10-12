// Imagem de compartilhamento (1200 x 630) nas duas línguas, desenhada com a Partitura do próprio
// build: o CSS e as fontes de dist/, a assinatura da marca e o título do hero da home (src/data/
// home.ts). Grava public/og.png (PT-BR) e public/og-en.png (inglês). Precisa do Chromium do
// Playwright, como o check:visual:
//   PLAYWRIGHT_MODULE=... CHROMIUM_EXECUTABLE=... node scripts/og.mjs [--dist dist]
// Rode depois de npm run build e confira as imagens antes de versionar.
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import home from '../src/data/home.ts';
import {pacote,versao,estagio} from '../src/data/release.mjs';

const args=process.argv.slice(2);
const dist=resolve(args.includes('--dist')?args[args.indexOf('--dist')+1]:'dist');
if(!process.env.PLAYWRIGHT_MODULE||!process.env.CHROMIUM_EXECUTABLE)throw Error('Set PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE');
if(!existsSync(resolve(dist,'index.html')))throw Error('Run npm run build first: missing '+dist+'/index.html');
const escapar=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
// O <head> da home traz o CSS do build (tokens, fontes e base); o corpo é só a composição.
const cabeca=readFileSync(resolve(dist,'index.html'),'utf8').match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<script[\s\S]*?<\/script>/g,'');
const pagina=(t,lang)=>`<!doctype html><html lang="${lang}"><head>${cabeca}</head><body style="margin:0">
<div style="position:relative;width:1200px;height:630px;overflow:hidden;background:var(--chao);color:var(--texto);box-sizing:border-box;padding:64px 72px">
 <div style="position:absolute;inset:0;background-image:radial-gradient(color-mix(in srgb,var(--texto) 10%,transparent) 1px,transparent 1.3px);background-size:24px 24px;-webkit-mask-image:radial-gradient(70% 70% at 30% 30%,var(--texto) 15%,transparent 75%);mask-image:radial-gradient(70% 70% at 30% 30%,var(--texto) 15%,transparent 75%)"></div>
 <div style="position:relative;display:flex;flex-direction:column;height:100%">
  <img src="/marca/assinatura-fundo-claro.svg" alt="" width="166" height="34" style="display:block">
  <div style="margin-top:56px;display:inline-flex;align-self:flex-start;align-items:center;gap:12px;height:36px;padding:0 16px;border-radius:999px;background:var(--superficie);border:1px solid var(--linha);font:500 15px/1 var(--f-mono);color:var(--texto-2)">
   <span style="width:8px;height:8px;border-radius:50%;background:var(--verificado)"></span>${escapar(t.hero.badge)}<span style="color:var(--linha-forte)">/</span>${pacote} ${versao} ${estagio}<span style="color:var(--linha-forte)">/</span>${escapar(t.hero.license)}
  </div>
  <div style="margin-top:28px;font:600 92px/1 var(--f-titulo);letter-spacing:-0.035em">${escapar(t.hero.title)}<br><span style="color:var(--texto-3)">${escapar(t.hero.titleMuted)}</span></div>
  <div style="margin-top:auto;display:inline-flex;align-self:flex-start;align-items:center;gap:14px;padding:16px 22px;border-radius:var(--raio-botao);background:var(--noite-2);box-shadow:var(--luz-jade);font:400 22px/1 var(--f-mono);color:var(--luar)"><span style="color:var(--luar-2)">$</span>pip install orkmind</div>
 </div>
</div></body></html>`;

const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
try{
 const context=await browser.newContext({viewport:{width:1200,height:630},deviceScaleFactor:1,reducedMotion:'reduce'});
 // Só o dist responde: a imagem não depende de rede.
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.origin!=='http://og.local')return route.abort('blockedbyclient');
  if(u.pathname==='/og')return route.fulfill({status:200,contentType:'text/html',body:pagina(home[u.searchParams.get('l')],u.searchParams.get('l')==='en'?'en':'pt-BR')});
  let file=resolve(dist,'.'+decodeURIComponent(u.pathname));
  if(file!==dist&&!file.startsWith(dist+'/'))return route.fulfill({status:403,body:''});
  if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
  if(!existsSync(file))return route.fulfill({status:404,body:''});
  const types={'.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'};
  return route.fulfill({status:200,contentType:types[extname(file)]||'application/octet-stream',body:readFileSync(file)});
 });
 const page=await context.newPage();
 for(const [locale,arquivo] of [['pt','og.png'],['en','og-en.png']]){
  await page.goto('http://og.local/og?l='+locale,{waitUntil:'load'});
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:resolve('public',arquivo),clip:{x:0,y:0,width:1200,height:630}});
  console.log(JSON.stringify({locale,arquivo:'public/'+arquivo}));
 }
}finally{await browser.close();}
