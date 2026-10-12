import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync,readdirSync} from 'node:fs';
import {resolve,extname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
const args=process.argv.slice(2);
// --widths, --locales e --schemes recortam a matriz, para provar uma guarda contra uma mutação do
// dist. Valor desconhecido reprova: recorte vazio não pode passar como aprovado.
const list=(flag,all,valid)=>{if(!args.includes(flag))return all;const values=args[args.indexOf(flag)+1].split(',');const bad=values.filter(v=>!valid(v));if(bad.length||!values.length)throw Error(`Unknown ${flag} value: ${bad.join(',')||'(none)'}`);return values;};
const widths=list('--widths',['1440','1280','1024','768','390','320'],v=>/^\d+$/.test(v)&&Number(v)>=200&&Number(v)<=3000).map(Number),schemes=list('--schemes',['light','dark'],v=>['light','dark'].includes(v)),locales=list('--locales',['pt','en'],v=>['pt','en'].includes(v));
// Rotas com captura, teclado e interações; as guardas de código e de borda varrem todas as páginas.
const routes=['/','/docs/','/docs/arquitetura/','/docs/contribuir/'];
const checks=['overflow','keyboard','touchTargets','contrast','copy','menu','reducedMotion','diagramLabels','systemSelection','integrations','stageTabs','inlineCodeAtomic','adjacentTextWithCode','codeWithinColumn','codeBreaksAtSeparators','oneCodeScalePerBlock','linkUnderlineOnCode','oneContentEdge'];
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
 // Chip maior que a coluna quebra por dentro: cada quebra tem de cair depois de separador,
 // em espaço ou na corcova camelCase, nunca no meio da palavra.
 const wordBreaks=c=>{
  const r=document.createRange();r.selectNodeContents(c);
  if(new Set([...r.getClientRects()].filter(x=>x.width>0).map(x=>Math.round(x.top))).size<2)return [];
  const chars=[],walker=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode()))for(let i=0;i<node.nodeValue.length;i++){const g=document.createRange();g.setStart(node,i);g.setEnd(node,i+1);const box=[...g.getClientRects()].find(x=>x.width>0);chars.push({ch:node.nodeValue[i],top:box?box.top:null});}
  const found=[];let last=null;
  for(let i=0;i<chars.length;i++){
   if(chars[i].top===null)continue;
   if(last!==null&&chars[i].top>last+2){const before=chars[i-1].ch,after=chars[i].ch;if(!(/[\/._\-=:\s]/.test(before)||/\s/.test(after)||(/[\p{Ll}\p{N}]/u.test(before)&&/\p{Lu}/u.test(after))))found.push(c.textContent.trim()+' ('+before+'|'+after+')');}
   last=chars[i].top;
  }
  return found;
 };
 // Faixas da Partitura: cabeçalho, seções, noite, docs e rodapé começam na mesma borda (a calha).
 const fixed=['.cabecalho-linha','.container','.noite-grade','.rodape-grade','.rodape-base'];
 return {
  codes:codes.length,
  wordBreaks:codes.flatMap(wordBreaks),
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
// Contraste medido (regra dura 3 do kit): a cor de cada texto visível contra o fundo efetivo, com as
// transparências compostas sobre os ancestrais (color-mix e alfa inclusos). Texto grande (24 px, ou
// 18,66 px em negrito) pede 3:1; o resto, 4,5:1. Fica de fora o que está esmaecido de propósito pela
// rolagem (a noite antes de acender) e o que é decorativo (aria-hidden).
const contrastAudit=()=>{
 const parse=c=>{let m=c.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);return [p[0],p[1],p[2],p[3]??1];}
  m=c.match(/color\(srgb ([^)]+)\)/);if(m){const p=m[1].split(/[\s\/]+/).filter(Boolean).map(Number);return [p[0]*255,p[1]*255,p[2]*255,p[3]??1];}return null;};
 const over=(a,b)=>[0,1,2].map(i=>a[i]*a[3]+b[i]*(1-a[3])).concat(1);
 const backdrop=el=>{const layers=[];for(let x=el;x;x=x.parentElement){const c=parse(getComputedStyle(x).backgroundColor);if(c&&c[3]>0){layers.push(c);if(c[3]>=1)break;}}let base=[255,255,255,1];for(let i=layers.length-1;i>=0;i--)base=over(layers[i],base);return base;};
 const lum=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
 const opacity=el=>{let o=1;for(let x=el;x;x=x.parentElement)o*=Number(getComputedStyle(x).opacity);return o;};
 const failures=[];let measured=0,lowest=99;
 for(const el of document.querySelectorAll('body *')){
  if(![...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim()))continue;
  const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||el.closest('[hidden],[aria-hidden="true"],script,style'))continue;
  if(opacity(el)<0.99)continue;
  const color=parse(cs.color);if(!color)continue;
  const bg=backdrop(el),k=ratio(over(color,bg),bg);measured++;lowest=Math.min(lowest,k);
  const size=parseFloat(cs.fontSize),large=size>=24||(Number(cs.fontWeight)>=700&&size>=18.66);
  if(k<(large?3:4.5))failures.push(el.tagName.toLowerCase()+'.'+[...el.classList].join('.')+' "'+el.textContent.trim().slice(0,28)+'" '+k.toFixed(2));
 }
 return {measured,lowest:Number(lowest.toFixed(2)),failures};
};
// All responses come from dist; no request is allowed to reach a network.
const serve=(context,origin)=>context.route('**/*',async route=>{
 const url=new URL(route.request().url());if(url.origin!==origin)return route.abort('blockedbyclient');
 let file=resolve(dist,'.'+decodeURIComponent(url.pathname));
 if(file!==dist&&!file.startsWith(dist+'/'))return route.fulfill({status:403,body:''});
 if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
 if(!existsSync(file))return route.fulfill({status:404,body:'Missing local artifact'});
 const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json'};
 await route.fulfill({status:200,contentType:types[extname(file)]||'application/octet-stream',body:readFileSync(file)});
});
try{
 const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
 for(const locale of locales)for(const width of widths)for(const scheme of schemes){
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:scheme,locale:locale==='pt'?'pt-BR':locale,reducedMotion:'reduce',serviceWorkers:'block'});
  await serve(context,'http://docs.local');
  const auditCode=async(page,localized)=>{
   const grid=await page.evaluate(codeLayout);
   if(grid.split.length)throw Error('Inline code split across lines '+localized+' '+width+': '+grid.split.join(', '));
   if(grid.detached.length)throw Error('Adjacent text detached from inline code '+localized+' '+width+': '+grid.detached.join(', '));
   if(grid.column.length)throw Error('Inline code overflows its column '+localized+' '+width+': '+grid.column.join(', '));
   if(grid.wordBreaks.length)throw Error('Inline code breaks inside a word '+localized+' '+width+': '+grid.wordBreaks.join(', '));
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
   // No estreito, o seletor mora no painel do menu: o teclado abre o menu e segue até ele.
   let found=false;for(let i=0;i<40;i++){await page.keyboard.press('Tab');if(await page.locator('[data-language-selector] a:focus').count()){found=true;break;}if(await page.locator('[data-menu][aria-expanded="false"]:focus').count())await page.keyboard.press('Enter');}
   if(!found)throw Error('Language selector unreachable by keyboard');
   // Alvos de toque de 44 x 44 px (regra dura 5 do kit) em tudo o que não é link no meio do texto.
   const pequenos=await page.evaluate(()=>[...document.querySelectorAll('button,[role="tab"],.cabecalho a,.linguas a,.rodape a,.docs-navigation a,.docs-toc a,.docs-breadcrumb a,.docs-links a,.docs-sources a,.pular,.escala-link,.hero-falar,.publico-contato,.chamada-falar')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<43.5||r.height<43.5);}).map(el=>el.tagName+'.'+el.className+' '+el.textContent.trim().slice(0,24)));
   if(pequenos.length)throw Error('Touch targets below 44 px '+localized+' '+width+': '+pequenos.join(', '));
   await page.evaluate(()=>document.fonts.ready);
   await page.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   const auditLayout=async()=>{
   const diagram=await page.evaluate(()=>{
    const boxes=[...document.querySelectorAll('[data-no]')],problems=[];
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
   // O que rola dentro de uma região própria (terminal, matriz) não estoura a página; a região sim.
   const overflow=await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(el=>{
    if(el.closest('svg,pre,[hidden]')||!(el instanceof HTMLElement)||getComputedStyle(el).position==='fixed')return false;
    for(let a=el.parentElement;a&&a!==document.body;a=a.parentElement)if(['auto','scroll'].includes(getComputedStyle(a).overflowX))return false;
    const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left < -1);
   }).map(el=>el.tagName+'.'+el.className));
   if(overflow.length)throw Error('Overflow '+localized+' '+width+': '+overflow.join(', '));
   await auditCode(page,localized);
    return diagram;
   };
   await auditLayout();
   // Etapas do caminho: cada aba mostra o próprio par de cartões; a seta leva à próxima aba.
   for(const tab of await page.locator('[role="tab"][data-etapa]').all()) {
    await tab.click();
    if(await tab.getAttribute('aria-selected')!=='true')throw Error('Stage tab failed');
    const index=await tab.getAttribute('data-etapa');
    if(!await page.locator(`[data-detalhe="${index}"]`).isVisible())throw Error('Stage panel missing');
    await auditLayout();
   }
   if(path==='/'){
    await page.locator('[role="tab"][data-etapa="0"]').focus();await page.keyboard.press('ArrowRight');
    if(await page.locator('[role="tab"][data-etapa="1"]').getAttribute('aria-selected')!=='true')throw Error('Stage tabs ignore the arrow keys');
   }
   // Integrações: a linha escolhida fica pressionada e mostra os próprios cartões.
   for(const button of await page.locator('[data-integracao]').all()) {
    await button.click();
    const index=await button.getAttribute('data-integracao');
    if(await button.getAttribute('aria-pressed')!=='true'||!await page.locator(`[data-integracao-texto="${index}"]`).first().isVisible())throw Error('Integration panel missing');
    await auditLayout();
   }
   // Diagrama do sistema: cada nó abre e fecha a própria descrição.
   for(const node of await page.locator('[data-no-botao]').all()) {
    await node.click();const panel=await node.getAttribute('aria-controls');
    if(await node.getAttribute('aria-expanded')!=='true'||!await page.locator('#'+panel).isVisible())throw Error('System selection failed');
    await auditLayout();
    await node.click();
    if(await node.getAttribute('aria-expanded')!=='false'||await page.locator('#'+panel).isVisible())throw Error('System description does not close');
   }
   const diagram=await auditLayout();
   // A noite inteira acesa (o fim da seção na janela), para medir o contraste do texto dela também.
   await page.evaluate(()=>{const n=document.querySelector('[data-noite]');if(n)window.scrollTo({top:n.getBoundingClientRect().top+scrollY+n.offsetHeight-innerHeight+2,behavior:'instant'});});
   await page.waitForTimeout(150);
   const contrast=await page.evaluate(contrastAudit);
   if(contrast.failures.length)throw Error('Contrast below AA '+localized+' '+width+': '+contrast.failures.slice(0,8).join(', '));
   const shot=`${locale}-${path==='/'?'home':path.slice(1,-1).replaceAll('/','-')}-${width}-${scheme}.png`;
   // Página inteira a partir do topo: o link de pular é fixo e apareceria no meio da imagem.
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:resolve(output,shot),fullPage:true});
   if(errors.length)throw Error(errors.join('; '));
   results.push({path:localized,width,scheme,screenshot:shot,overflow:0,keyboard:true,touchTargets:true,contrastMeasured:contrast.measured,contrastLowest:contrast.lowest,diagramBoxes:diagram.boxes,labelsContained:true,inlineCodeAtomic:true,adjacentTextWithCode:true,codeWithinColumn:true,codeBreaksAtSeparators:true,oneCodeScalePerBlock:true,linkUnderlineOnCode:true,oneContentEdge:true});await page.close();
  }
  // Varredura das guardas de código e de borda em todas as páginas da língua, sem captura.
  const sweep=await context.newPage(),sweepErrors=[];sweep.on('pageerror',e=>sweepErrors.push(e.message));
  for(const path of allRoutes){
   const localized=(locale==='pt'?'':'/'+locale)+path;
   await sweep.goto('http://docs.local'+localized,{waitUntil:'networkidle'});await sweep.evaluate(()=>document.fonts.ready);
   await sweep.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   const grid=await auditCode(sweep,localized);
   results.push({path:localized,width,scheme,audit:'code-and-edge',inlineCodes:grid.codes,inlineCodeAtomic:true,adjacentTextWithCode:true,codeWithinColumn:true,codeBreaksAtSeparators:true,oneCodeScalePerBlock:true,linkUnderlineOnCode:true,oneContentEdge:true});
  }
  if(sweepErrors.length)throw Error(sweepErrors.join('; '));
  await sweep.close();
  await context.close();
 }
 // Interações da home que a matriz não cobre, uma vez por língua, a 1280 px (o menu, a 390): o
 // comando que copia (sucesso e recusa da área de transferência), o menu do estreito (abre, Esc
 // fecha e devolve o foco) e o movimento: com movimento reduzido nada roda sozinho (animações e
 // canvas); sem preferência, a borda de luz, os fluxos e o canvas andam. A origem é localhost, um
 // contexto seguro, para a área de transferência existir como no site publicado.
 if(routes.includes('/'))for(const locale of locales){
  const origin='http://localhost:4321',home=origin+(locale==='pt'?'/':'/en/');
  const open=async options=>{const ctx=await browser.newContext({viewport:{width:1280,height:900},locale:locale==='pt'?'pt-BR':locale,serviceWorkers:'block',reducedMotion:'reduce',...options});await serve(ctx,origin);const page=await ctx.newPage();await page.goto(home,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);return {ctx,page};};
  {const {ctx,page}=await open({permissions:['clipboard-read','clipboard-write']});
   const button=page.locator('.comando-hero [data-copiar]'),label=button.locator('[data-rotulo-visivel]');
   await button.click();
   const shown=await label.textContent(),copied=await page.evaluate(()=>navigator.clipboard.readText()),status=await page.locator('.comando-hero [data-status]').textContent();
   if(copied!=='pip install orkmind'||!shown.startsWith('✓')||!status.trim())throw Error('Copy failed '+locale+': '+shown+' / '+copied+' / '+status);
   await page.waitForTimeout(1700);
   if(await label.textContent()!==await button.getAttribute('data-rotulo'))throw Error('Copy label does not come back '+locale);
   await ctx.close();}
  {const {ctx,page}=await open({});
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('refused'))}}));
   const button=page.locator('.comando-hero [data-copiar]');await button.click();
   const shown=await button.locator('[data-rotulo-visivel]').textContent(),status=await page.locator('.comando-hero [data-status]').textContent();
   if(!/^× /.test(shown)||!/Ctrl\+C|⌘C/.test(shown)||!/Ctrl\+C|⌘C/.test(status))throw Error('Copy refusal not shown '+locale+': '+shown+' / '+status);
   await ctx.close();}
  {const {ctx,page}=await open({viewport:{width:390,height:844}});
   const button=page.locator('[data-menu]'),panel=page.locator('[data-painel]');
   if(await panel.isVisible())throw Error('Menu panel open on load '+locale);
   await button.click();
   if(await button.getAttribute('aria-expanded')!=='true'||!await panel.isVisible())throw Error('Menu does not open '+locale);
   await page.keyboard.press('Escape');
   if(await button.getAttribute('aria-expanded')!=='false'||await panel.isVisible()||!await button.evaluate(b=>b===document.activeElement))throw Error('Escape does not close the menu '+locale);
   await ctx.close();}
  const motion=async reduce=>{const {ctx,page}=await open({reducedMotion:reduce?'reduce':'no-preference'});
   const canvas=page.locator('[data-caminho]');await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(300);
   const frame=()=>canvas.evaluate(c=>c.toDataURL());const before=await frame();await page.waitForTimeout(1200);const after=await frame();
   const running=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
   await ctx.close();return {canvasMoved:before!==after,runningAnimations:running};};
  const reduced=await motion(true),free=await motion(false);
  if(reduced.canvasMoved||reduced.runningAnimations)throw Error('Reduced motion still moves '+locale+': '+JSON.stringify(reduced));
  if(!free.canvasMoved||!free.runningAnimations)throw Error('Motion missing without preference '+locale+': '+JSON.stringify(free));
  results.push({path:home.replace(origin,''),interactions:{copy:true,copyRefusal:true,menuEscape:true,reducedMotion:reduced,motion:free}});
 }
 const shots=results.filter(r=>r.screenshot).length,audits=results.filter(r=>r.audit).length;
 if(!audits||!shots)throw Error('Empty matrix: nothing was checked');
 writeFileSync(resolve(output,'report.json'),JSON.stringify({status:'passed',screenshots:shots,pageAudits:audits,results},null,2)+'\n');console.log(JSON.stringify({screenshots:shots,pageAudits:audits,status:'passed',output}));
}catch(e){writeFileSync(resolve(output,'report.json'),JSON.stringify({status:'blocked-or-failed',error:e.message,results},null,2)+'\n');console.error(e.message);process.exitCode=1;}
finally{if(browser)await browser.close();}
