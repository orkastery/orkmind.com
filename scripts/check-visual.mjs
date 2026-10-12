import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync,readdirSync} from 'node:fs';
import {resolve,extname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
const args=process.argv.slice(2),list=(flag,all)=>args.includes(flag)?args[args.indexOf(flag)+1].split(',').filter(v=>all.includes(v)):all;
// --widths, --locales e --schemes recortam a matriz, para provar uma guarda contra uma mutação do dist.
const widths=list('--widths',['1280','700','390','320']).map(Number),schemes=list('--schemes',['light','dark']),locales=list('--locales',['pt','en','es']);
// Rotas com captura, teclado e interações; as guardas de código e de borda varrem todas as páginas.
const routes=['/','/docs/','/docs/arquitetura/','/docs/contribuir/'];
const checks=['overflow','keyboard','diagramLabels','systemSelection','inlineCodeAtomic','adjacentTextWithCode','codeWithinColumn','oneCodeScalePerBlock','linkUnderlineOnCode','oneContentEdge'];
const dist=resolve(args.includes('--dist')?args[args.indexOf('--dist')+1]:'dist');
const htmlFiles=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?htmlFiles(resolve(dir,e.name)):e.name==='index.html'?[resolve(dir,e.name)]:[]);
const allRoutes=existsSync(dist)?htmlFiles(dist).map(f=>'/'+relative(dist,f).replace(/index\.html$/,'')).filter(p=>!/^\/(en|es)\//.test(p)).sort():[];
if(args.includes('--plan')){console.log(JSON.stringify({locales,widths,themes:schemes,routes,codeAndEdgeRoutes:allRoutes.length,screenshots:locales.length*widths.length*schemes.length*routes.length,pageAudits:locales.length*widths.length*schemes.length*allRoutes.length,checks,network:'blocked',requires:['PLAYWRIGHT_MODULE','CHROMIUM_EXECUTABLE','--output']},null,2));process.exit(0);}
const output=args.includes('--output')?resolve(args[args.indexOf('--output')+1]):null;
if(!output||!process.env.PLAYWRIGHT_MODULE||!process.env.CHROMIUM_EXECUTABLE)throw Error('Set PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE, then pass --output PRIVATE_DIRECTORY');
if(output===resolve('.')||output.startsWith(resolve('.')+'/'))throw Error('Screenshots must stay outside public output');
mkdirSync(output,{recursive:true});
const results=[];let browser;
// Guardas de layout do código inline e da grade, rodadas no navegador. Código atômico (não se
// parte entre linhas), colado ao que encosta nele, dentro da coluna, numa escala por bloco e com o
// sublinhado do link; cabeçalho, conteúdo, contato e rodapé na mesma borda esquerda.
const codeLayout=()=>{
 const visible=el=>el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
 const codes=[...document.querySelectorAll('code')].filter(c=>!c.closest('pre')&&visible(c));
 const inline=el=>!!el&&el.nodeType===1&&['inline','contents'].includes(getComputedStyle(el).display);
 // A escala se compara entre os códigos do mesmo bloco, atravessando a unidade e outros inline.
 const block=c=>{let p=c.parentElement;while(inline(p))p=p.parentElement;return p;};
 const blocks=new Map();
 for(const c of codes){const b=block(c);blocks.set(b,[...(blocks.get(b)||[]),getComputedStyle(c).fontSize]);}
 // Caractere vizinho no fluxo, atravessando elementos inline: o centro dele cai dentro da altura do chip.
 const glyph=(node,index)=>{const r=document.createRange();r.setStart(node,index);r.setEnd(node,index+1);return r.getClientRects()[0];};
 const sameLine=(g,box)=>!g||(g.top+g.bottom)/2>=box.top-1&&(g.top+g.bottom)/2<=box.bottom+1;
 const edgeText=(node,last)=>{
  if(!node)return null;if(node.nodeType===3)return node.nodeValue.length?node:null;
  if(!inline(node)&&node.tagName!=='CODE')return null;
  const kids=[...node.childNodes];for(const k of last?kids.reverse():kids){const t=edgeText(k,last);if(t)return t;}return null;
 };
 const neighbour=(c,before)=>{for(let n=c;n;n=n.parentElement){const s=before?n.previousSibling:n.nextSibling;if(s)return edgeText(s,before);if(!inline(n.parentElement))return null;}return null;};
 // Coluna: a caixa de conteúdo do bloco do código; a unidade sem quebra conta com o que colou.
 // O texto também conta: um chip sem quebra cabe no max-width, mas o texto vaza dele.
 const column=c=>{const b=block(c),cs=getComputedStyle(b),r=b.getBoundingClientRect();return {left:r.left+parseFloat(cs.paddingLeft)+parseFloat(cs.borderLeftWidth),right:r.right-parseFloat(cs.paddingRight)-parseFloat(cs.borderRightWidth)};};
 const beyond=c=>{const col=column(c),r=(c.closest('.code-unit')||c).getBoundingClientRect(),text=document.createRange();text.selectNodeContents(c);return r.right>col.right+1||r.left<col.left-1||c.scrollWidth>c.clientWidth+1||[...text.getClientRects()].some(t=>t.right>col.right+1);};
 const fixed=['.site-header-inner','.editorial-hero > div','.home-main','.secao > .container','.docs-shell','.contact-inner','.footer-inner'];
 return {
  codes:codes.length,
  split:codes.filter(c=>c.getClientRects().length>1).map(c=>c.textContent.trim()),
  detached:codes.flatMap(c=>{
   const box=c.getBoundingClientRect(),t=c.textContent.trim(),p=neighbour(c,true),n=neighbour(c,false),found=[];
   if(p&&/\S$/.test(p.nodeValue)&&!sameLine(glyph(p,p.nodeValue.length-1),box))found.push(p.nodeValue.at(-1)+t);
   if(n&&/^\S/.test(n.nodeValue)&&!sameLine(glyph(n,0),box))found.push(t+n.nodeValue[0]);
   return found;
  }),
  column:codes.filter(beyond).map(c=>c.textContent.trim()),
  scales:[...blocks].filter(([,sizes])=>new Set(sizes).size>1).map(([b])=>b.tagName.toLowerCase()+'.'+[...b.classList].join('.')),
  underline:codes.filter(c=>c.closest('a')&&getComputedStyle(c).textDecorationLine!==getComputedStyle(c.closest('a')).textDecorationLine).map(c=>c.textContent.trim()),
  // Borda do conteúdo, não da caixa: calha lateral local também conta. Cada faixa tem seletor próprio.
  edges:[...new Set(fixed.flatMap(sel=>[...document.querySelectorAll(sel)]).filter(visible).map(el=>{const cs=getComputedStyle(el);return Math.round(el.getBoundingClientRect().left+parseFloat(cs.paddingLeft)+parseFloat(cs.borderLeftWidth));}))]
 };
};
try{
 const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
 for(const locale of locales)for(const width of widths)for(const scheme of schemes){
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:scheme,locale:locale==='pt'?'pt-BR':locale,reducedMotion:'reduce',serviceWorkers:'block'});
  // All responses come from dist; no request is allowed to reach a network.
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.origin!=='http://docs.local')return route.abort('blockedbyclient');
   let file=resolve(dist,'.'+decodeURIComponent(url.pathname));
   if(file!==dist&&!file.startsWith(dist+'/'))return route.fulfill({status:403,body:''});
   if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
   if(!existsSync(file))return route.fulfill({status:404,body:'Missing local artifact'});
   const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json'};
   await route.fulfill({status:200,contentType:types[extname(file)]||'application/octet-stream',body:readFileSync(file)});
  });
  const auditCode=async(page,localized)=>{
   const grid=await page.evaluate(codeLayout);
   if(grid.split.length)throw Error('Inline code split across lines '+localized+' '+width+': '+grid.split.join(', '));
   if(grid.detached.length)throw Error('Adjacent text detached from inline code '+localized+' '+width+': '+grid.detached.join(', '));
   if(grid.column.length)throw Error('Inline code overflows its column '+localized+' '+width+': '+grid.column.join(', '));
   if(grid.scales.length)throw Error('Inline code sizes differ within a block '+localized+' '+width+': '+grid.scales.join(', '));
   if(grid.underline.length)throw Error('Link underline missing on inline code '+localized+' '+width+': '+grid.underline.join(', '));
   if(grid.edges.length!==1)throw Error('Content edges differ '+localized+' '+width+': '+grid.edges.join(', '));
   return grid;
  };
  for(const path of routes){
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const localized=(locale==='pt'?'':'/'+locale)+path;
   await page.goto('http://docs.local'+localized,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   await page.keyboard.press('Tab');
   if(await page.locator(':focus').getAttribute('href')!=='#conteudo')throw Error('Skip link not first in keyboard order');
   // A URL que o Playwright guarda chega por evento e pode atrasar depois do Enter; o destino se confere na própria página.
   await page.keyboard.press('Enter');
   if(!await page.waitForFunction(()=>location.hash==='#conteudo',null,{timeout:3000}).then(()=>true,()=>false))throw Error('Skip target failed: '+await page.evaluate(()=>location.hash)+' '+page.url());
   await page.goto('http://docs.local'+localized,{waitUntil:'networkidle'});
   let found=false;for(let i=0;i<30;i++){await page.keyboard.press('Tab');if(await page.locator('[data-language-selector] a:focus').count()){found=true;break;}}
   if(!found)throw Error('Language selector unreachable by keyboard');
   await page.evaluate(()=>document.fonts.ready);
   await page.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   const auditLayout=async()=>{
   const diagram=await page.evaluate(()=>{
    const boxes=[...document.querySelectorAll('[data-diagram-box]')],problems=[];
    for(const box of boxes){
     const label=box.querySelector('[data-node-label]');
     if(!label){problems.push('missing label');continue;}
     const b=box.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(label);
     if(!b.width||!b.height||[...range.getClientRects()].some(r=>r.left<b.left+1||r.right>b.right-1||r.top<b.top+1||r.bottom>b.bottom-1))problems.push(box.getAttribute('data-no'));
    }
    return {boxes:boxes.length,problems};
   });
   if(path==='/'&&diagram.boxes!==8)throw Error('Missing system diagram boxes');
   if(diagram.problems.length)throw Error('Diagram labels outside boxes '+localized+' '+width+': '+diagram.problems.join(', '));
   const overflow=await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(el=>{
    if(el.closest('svg,pre,[hidden]')||!(el instanceof HTMLElement)||getComputedStyle(el).position==='fixed')return false;
    const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left < -1);
   }).map(el=>el.tagName+'.'+el.className));
   if(overflow.length)throw Error('Overflow '+localized+' '+width+': '+overflow.join(', '));
   await auditCode(page,localized);
    return diagram;
   };
   await auditLayout();
   for(const tab of await page.locator('[data-ciclo] [role="tab"]').all()) {
    await tab.click();
    if(await tab.getAttribute('aria-selected')!=='true')throw Error('Cycle tab failed');
    const index=await tab.getAttribute('data-fase');
    if(!await page.locator(`[data-detalhe="${index}"]`).isVisible())throw Error('Cycle panel missing');
    await auditLayout();
   }
   for(const button of await page.locator('[data-modo-linha]').all()) {
    await button.click();
    const panel=await button.getAttribute('aria-controls');
    if(await button.getAttribute('aria-expanded')!=='true'||!await page.locator('#'+panel).isVisible())throw Error('Mode panel missing');
    await auditLayout();
   }
   for(const node of await page.locator('[data-diagram-box]').all()) {
    await node.click();const id=await node.getAttribute('data-no');
    if(await node.getAttribute('aria-pressed')!=='true'||!await page.locator(`[data-painel="${id}"]`).isVisible())throw Error('System selection failed');
    await auditLayout();
   }
   const diagram=await auditLayout();
   const shot=`${locale}-${path==='/'?'home':path.slice(1,-1).replaceAll('/','-')}-${width}-${scheme}.png`;
   // Página inteira a partir do topo: o link de pular é fixo e apareceria no meio da imagem.
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:resolve(output,shot),fullPage:true});
   if(errors.length)throw Error(errors.join('; '));
   results.push({path:localized,width,scheme,screenshot:shot,overflow:0,keyboard:true,diagramBoxes:diagram.boxes,labelsContained:true,inlineCodeAtomic:true,adjacentTextWithCode:true,codeWithinColumn:true,oneCodeScalePerBlock:true,linkUnderlineOnCode:true,oneContentEdge:true});await page.close();
  }
  // Varredura das guardas de código e de borda em todas as páginas da língua, sem captura.
  const sweep=await context.newPage(),sweepErrors=[];sweep.on('pageerror',e=>sweepErrors.push(e.message));
  for(const path of allRoutes){
   const localized=(locale==='pt'?'':'/'+locale)+path;
   await sweep.goto('http://docs.local'+localized,{waitUntil:'networkidle'});await sweep.evaluate(()=>document.fonts.ready);
   await sweep.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   const grid=await auditCode(sweep,localized);
   results.push({path:localized,width,scheme,audit:'code-and-edge',inlineCodes:grid.codes,inlineCodeAtomic:true,adjacentTextWithCode:true,codeWithinColumn:true,oneCodeScalePerBlock:true,linkUnderlineOnCode:true,oneContentEdge:true});
  }
  if(sweepErrors.length)throw Error(sweepErrors.join('; '));
  await sweep.close();
  await context.close();
 }
 const shots=results.filter(r=>r.screenshot).length,audits=results.filter(r=>r.audit).length;
 writeFileSync(resolve(output,'report.json'),JSON.stringify({status:'passed',screenshots:shots,pageAudits:audits,results},null,2)+'\n');console.log(JSON.stringify({screenshots:shots,pageAudits:audits,status:'passed',output}));
}catch(e){writeFileSync(resolve(output,'report.json'),JSON.stringify({status:'blocked-or-failed',error:e.message,results},null,2)+'\n');console.error(e.message);process.exitCode=1;}
finally{if(browser)await browser.close();}
