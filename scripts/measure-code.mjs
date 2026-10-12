// Medida do código inline num dist, com navegador e sem rede, por largura: código partido entre
// linhas, código quebrado dentro do próprio chip (maior que a coluna), junção solta (o que encosta
// no chip ficou noutra linha), código além da coluna, estouro da janela e identificadores técnicos
// fora de code na prosa visível (padrões do check:code). Serve para comparar o antes e o depois.
//
// PLAYWRIGHT_MODULE=... CHROMIUM_EXECUTABLE=... node scripts/measure-code.mjs --dist DIR
//   [--widths 320,390,700,1280 | --from 320 --to 1280 --step 10] [--scheme dark|light] [--output arquivo.json]
import {readFileSync,writeFileSync,existsSync,statSync,readdirSync} from 'node:fs';
import {resolve,extname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {findings} from './check-code.mjs';

const args=process.argv.slice(2),arg=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;
const dist=resolve(arg('--dist')||'dist');
const widths=arg('--widths')?arg('--widths').split(',').map(Number):(()=>{const from=Number(arg('--from')||320),to=Number(arg('--to')||1280),step=Number(arg('--step')||10),list=[];for(let w=from;w<=to;w+=step)list.push(w);return list;})();
const scheme=arg('--scheme')||'dark';
if(!process.env.PLAYWRIGHT_MODULE||!process.env.CHROMIUM_EXECUTABLE)throw Error('Set PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE');
const htmlFiles=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?htmlFiles(resolve(dir,e.name)):e.name==='index.html'?[resolve(dir,e.name)]:[]);
const routes=htmlFiles(dist).map(f=>'/'+relative(dist,f).replace(/index\.html$/,'')).sort();

// Roda na página: medidas de layout do código e a prosa visível, com o código trocado por \u0001.
const measure=()=>{
 const visible=el=>el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
 const codes=[...document.querySelectorAll('code')].filter(c=>!c.closest('pre')&&visible(c));
 const inline=el=>!!el&&el.nodeType===1&&['inline','contents'].includes(getComputedStyle(el).display);
 const block=c=>{let p=c.parentElement;while(inline(p))p=p.parentElement;return p;};
 const lines=c=>{const r=document.createRange();r.selectNodeContents(c);return new Set([...r.getClientRects()].filter(x=>x.width>0).map(x=>Math.round(x.top))).size;};
 const glyph=(node,i)=>{const r=document.createRange();r.setStart(node,i);r.setEnd(node,i+1);return r.getClientRects()[0];};
 const sameLine=(g,box)=>!g||(g.top+g.bottom)/2>=box.top-1&&(g.top+g.bottom)/2<=box.bottom+1;
 const edgeText=(node,last)=>{if(!node)return null;if(node.nodeType===3)return node.nodeValue.length?node:null;if(!inline(node)&&node.tagName!=='CODE')return null;const kids=[...node.childNodes];for(const k of last?kids.reverse():kids){const t=edgeText(k,last);if(t)return t;}return null;};
 const neighbour=(c,before)=>{for(let n=c;n;n=n.parentElement){const s=before?n.previousSibling:n.nextSibling;if(s)return edgeText(s,before);if(!inline(n.parentElement))return null;}return null;};
 const split=[],wrapped=[],detached=[],column=[];
 for(const c of codes){
  const box=c.getBoundingClientRect(),t=c.textContent.trim();
  if(c.getClientRects().length>1)split.push(t);else if(lines(c)>1)wrapped.push(t);
  const p=neighbour(c,true),n=neighbour(c,false);
  if(p&&/\S$/.test(p.nodeValue)&&!sameLine(glyph(p,p.nodeValue.length-1),box))detached.push(p.nodeValue.at(-1)+t);
  if(n&&/^\S/.test(n.nodeValue)&&!sameLine(glyph(n,0),box))detached.push(t+n.nodeValue[0]);
  const b=block(c),cs=getComputedStyle(b),br=b.getBoundingClientRect(),right=br.right-parseFloat(cs.paddingRight)-parseFloat(cs.borderRightWidth),left=br.left+parseFloat(cs.paddingLeft)+parseFloat(cs.borderLeftWidth);
  const r=(c.closest('.code-unit')||c).getBoundingClientRect(),text=document.createRange();text.selectNodeContents(c);
  if(r.right>right+1||r.left<left-1||c.scrollWidth>c.clientWidth+1||[...text.getClientRects()].some(x=>x.right>right+1))column.push(t);
 }
 const viewport=[...document.querySelectorAll('body *')].filter(el=>{if(el.closest('svg,pre,[hidden]')||!(el instanceof HTMLElement)||getComputedStyle(el).position==='fixed')return false;const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left<-1);}).length;
 // Prosa visível: innerText respeita display (bloco e flex viram quebra). O SVG vira linhas de
 // texto, com tspan.code como código; title e desc do SVG não aparecem na tela.
 const clone=document.body.cloneNode(true);
 const svgText=node=>node.nodeType===3?node.nodeValue:node.matches?.('tspan.code')?' \u0001 ':[...node.childNodes].map(svgText).join('');
 for(const svg of clone.querySelectorAll('svg')){
  const out=[];for(const text of svg.querySelectorAll('text')){let line='';for(const n of text.childNodes){if(n.nodeType===1&&n.hasAttribute('x')&&line){out.push(line);line='';}line+=svgText(n);}out.push(line);}
  const div=document.createElement('div');div.style.whiteSpace='pre-line';div.textContent=out.join('\n');svg.replaceWith(div);
 }
 for(const el of clone.querySelectorAll('code,pre,script,style,template'))el.replaceWith(document.createTextNode(el.tagName==='CODE'?' \u0001 ':'\n'));
 clone.style.cssText=`position:absolute;left:-99999px;top:0;width:${innerWidth}px`;
 document.body.append(clone);const prose=clone.innerText;clone.remove();
 return {codes:codes.length,split,wrapped,detached,column,viewport,prose};
};

const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
const report={dist,scheme,widths,pages:routes.length,byWidth:{},examples:{}};
try{
 const context=await browser.newContext({viewport:{width:widths[0],height:900},colorScheme:scheme,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.origin!=='http://docs.local')return route.abort('blockedbyclient');
  let file=resolve(dist,'.'+decodeURIComponent(url.pathname));
  if(file!==dist&&!file.startsWith(dist+'/'))return route.fulfill({status:403,body:''});
  if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
  if(!existsSync(file))return route.fulfill({status:404,body:''});
  const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json'};
  await route.fulfill({status:200,contentType:types[extname(file)]||'application/octet-stream',body:readFileSync(file)});
 });
 const page=await context.newPage();
 for(const w of widths)report.byWidth[w]={inlineCodes:0,split:0,wrappedInsideChip:0,detached:0,beyondColumn:0,viewportOverflow:0,outsideCode:0,pagesWithSplit:0};
 for(const route of routes){
  await page.setViewportSize({width:widths[0],height:900});
  await page.goto('http://docs.local'+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  // Painéis e menus abertos, como na checagem visual: o que pode aparecer é medido.
  await page.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
  for(const w of widths){
   await page.setViewportSize({width:w,height:900});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const m=await page.evaluate(measure);
   const outside=m.prose.split(/[\u0000\u0001]/).flatMap(findings);
   const row=report.byWidth[w];
   row.inlineCodes+=m.codes;row.split+=m.split.length;row.wrappedInsideChip+=m.wrapped.length;row.detached+=m.detached.length;row.beyondColumn+=m.column.length;row.viewportOverflow+=m.viewport;row.outsideCode+=outside.length;if(m.split.length)row.pagesWithSplit++;
   const ex=report.examples[w]??={split:[],wrappedInsideChip:[],detached:[],beyondColumn:[],outsideCode:[]};
   for(const [k,v] of [['split',m.split],['wrappedInsideChip',m.wrapped],['detached',m.detached],['beyondColumn',m.column],['outsideCode',outside]])for(const x of v)if(ex[k].length<15&&!ex[k].includes(route+' '+x))ex[k].push(route+' '+x);
  }
 }
}finally{await browser.close();}
if(arg('--output'))writeFileSync(arg('--output'),JSON.stringify(report,null,1)+'\n');
const rows=Object.entries(report.byWidth).map(([w,r])=>({width:Number(w),...r}));
const total=rows.reduce((s,r)=>{for(const k of ['split','wrappedInsideChip','detached','beyondColumn','viewportOverflow','outsideCode'])s[k]=(s[k]||0)+r[k];return s;},{});
console.log(JSON.stringify({pages:report.pages,scheme,widths:widths.length,renders:report.pages*widths.length,total}));
for(const r of rows)if(rows.length<=12||[320,360,390,700,1280].includes(r.width))console.log(JSON.stringify(r));
