import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
const args=process.argv.slice(2),output=args.includes('--output')?resolve(args[args.indexOf('--output')+1]):null;
if(!output||!process.env.PLAYWRIGHT_MODULE||!process.env.CHROMIUM_EXECUTABLE)throw Error('Set PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE, then pass --output PRIVATE_DIRECTORY');
const dist=resolve('dist');
if(output===resolve('.')||output.startsWith(resolve('.')+'/'))throw Error('Screenshots must stay outside public output');
mkdirSync(output,{recursive:true});
const results=[];let browser;
try{
 const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
 for(const locale of ['pt','en','es'])for(const width of [1280,700,390])for(const scheme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:scheme,locale:locale==='pt'?'pt-BR':locale,reducedMotion:'reduce',serviceWorkers:'block'});
  // All responses come from dist; no request is allowed to reach a network.
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.origin!=='http://docs.local')return route.abort('blockedbyclient');
   let file=resolve(dist,'.'+decodeURIComponent(url.pathname));
   if(file!==dist&&!file.startsWith(dist+'/'))return route.fulfill({status:403,body:''});
   if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
   if(!existsSync(file))return route.fulfill({status:404,body:'Missing local artifact'});
   const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json'};
   await route.fulfill({status:200,contentType:types[extname(file)]||'application/octet-stream',body:readFileSync(file)});
  });
  for(const path of ['/','/docs/','/docs/arquitetura/','/docs/contribuir/']){
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const localized=(locale==='pt'?'':'/'+locale)+path;
   await page.goto('http://docs.local'+localized,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   await page.keyboard.press('Tab');
   if(await page.locator(':focus').getAttribute('href')!=='#conteudo')throw Error('Skip link not first in keyboard order');
   await page.keyboard.press('Enter');if(!page.url().endsWith('#conteudo'))throw Error('Skip target failed');
   await page.goto('http://docs.local'+localized,{waitUntil:'networkidle'});
   let found=false;for(let i=0;i<30;i++){await page.keyboard.press('Tab');if(await page.locator('[data-language-selector] a:focus').count()){found=true;break;}}
   if(!found)throw Error('Language selector unreachable by keyboard');
   await page.evaluate(()=>document.fonts.ready);
   await page.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   for(const tab of await page.locator('[data-ciclo] [role="tab"]').all()) {
    await tab.click();
    if(await tab.getAttribute('aria-selected')!=='true')throw Error('Cycle tab failed');
    const index=await tab.getAttribute('data-fase');
    if(!await page.locator(`[data-detalhe="${index}"]`).isVisible())throw Error('Cycle panel missing');
   }
   for(const button of await page.locator('[data-modo-linha]').all()) {
    await button.click();
    const panel=await button.getAttribute('aria-controls');
    if(await button.getAttribute('aria-expanded')!=='true'||!await page.locator('#'+panel).isVisible())throw Error('Mode panel missing');
   }
   for(const node of await page.locator('[data-diagram-box]').all()) {
    await node.click();const id=await node.getAttribute('data-no');
    if(await node.getAttribute('aria-pressed')!=='true'||!await page.locator(`[data-painel="${id}"]`).isVisible())throw Error('System selection failed');
   }
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
    if(el.closest('svg,pre')||!(el instanceof HTMLElement)||getComputedStyle(el).position==='fixed')return false;
    const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left < -1);
   }).map(el=>el.tagName+'.'+el.className));
   if(overflow.length)throw Error('Overflow '+localized+' '+width+': '+overflow.join(', '));
   const shot=`${locale}-${path.replaceAll('/','-')||'home'}-${width}-${scheme}.png`;
   await page.screenshot({path:resolve(output,shot),fullPage:true});
   if(errors.length)throw Error(errors.join('; '));
   results.push({path:localized,width,scheme,screenshot:shot,overflow:0,keyboard:true,diagramBoxes:diagram.boxes,labelsContained:true});await page.close();
  }
  await context.close();
 }
 writeFileSync(resolve(output,'report.json'),JSON.stringify({status:'passed',results},null,2)+'\n');console.log(JSON.stringify({screenshots:results.length,status:'passed',output}));
}catch(e){writeFileSync(resolve(output,'report.json'),JSON.stringify({status:'blocked-or-failed',error:e.message,results},null,2)+'\n');console.error(e.message);process.exitCode=1;}
finally{if(browser)await browser.close();}
