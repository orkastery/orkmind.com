import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
const args=process.argv.slice(2),output=args.includes('--output')?resolve(args[args.indexOf('--output')+1]):null;
if(!output||!process.env.PLAYWRIGHT_MODULE||!process.env.CHROMIUM_EXECUTABLE)throw Error('Set PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE, then pass --output PRIVATE_DIRECTORY');
const dist=resolve('dist');
if(output===dist||output.startsWith(dist+'/')||output.startsWith(resolve('src')+'/'))throw Error('Screenshots must stay outside public output');
mkdirSync(output,{recursive:true});
const results=[];let browser;
try{
 const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
 for(const locale of ['pt','en','es'])for(const width of [1280,390])for(const scheme of ['light','dark']){
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
  for(const path of ['/','/docs/','/docs/arquitetura/']){
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const localized=(locale==='pt'?'':'/'+locale)+path;
   await page.goto('http://docs.local'+localized,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   const overflow=await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(el=>{
    if(el.closest('svg,pre')||!(el instanceof HTMLElement)||getComputedStyle(el).position==='fixed')return false;
    const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left < -1);
   }).map(el=>el.tagName+'.'+el.className));
   if(overflow.length)throw Error('Overflow '+localized+' '+width+': '+overflow.join(', '));
   await page.keyboard.press('Tab');
   if(await page.locator(':focus').getAttribute('href')!=='#conteudo')throw Error('Skip link not first in keyboard order');
   await page.keyboard.press('Enter');if(!page.url().endsWith('#conteudo'))throw Error('Skip target failed');
   await page.goto('http://docs.local'+localized,{waitUntil:'networkidle'});
   let found=false;for(let i=0;i<30;i++){await page.keyboard.press('Tab');if(await page.locator('[data-language-selector] a:focus').count()){found=true;break;}}
   if(!found)throw Error('Language selector unreachable by keyboard');
   const shot=`${locale}-${path.replaceAll('/','-')||'home'}-${width}-${scheme}.png`;
   await page.screenshot({path:resolve(output,shot),fullPage:true});
   if(errors.length)throw Error(errors.join('; '));
   results.push({path:localized,width,scheme,screenshot:shot,overflow:0,keyboard:true});await page.close();
  }
  await context.close();
 }
 writeFileSync(resolve(output,'report.json'),JSON.stringify({status:'passed',results},null,2)+'\n');console.log(JSON.stringify({screenshots:results.length,status:'passed',output}));
}catch(e){writeFileSync(resolve(output,'report.json'),JSON.stringify({status:'blocked-or-failed',error:e.message,results},null,2)+'\n');console.error(e.message);process.exitCode=1;}
finally{if(browser)await browser.close();}
