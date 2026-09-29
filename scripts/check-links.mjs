import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';
export const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
export const distArg=()=>process.argv.includes('--dist')?resolve(process.argv[process.argv.indexOf('--dist')+1]):resolve(root,'dist');
export const attrs=node=>Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));
export function walk(node){return [node,...(node.childNodes||[]).flatMap(walk)];}
export const content=node=>node.nodeName==='#text'?node.value:(node.childNodes||[]).filter(n=>!['script','style'].includes(n.tagName)).map(content).join('');
export function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(resolve(dir,e.name)):[resolve(dir,e.name)]);}
export function pages(dist=distArg()) {
 const list=files(dist).filter(f=>f.endsWith('.html')).map(file=>{
  const source=readFileSync(file,'utf8'),dom=parse(source),nodes=walk(dom),path='/'+relative(dist,file).replaceAll('\\','/').replace(/index\.html$/,'');
  return {file,path,source,dom,nodes,ids:nodes.map(n=>attrs(n).id).filter(Boolean)};
 });
 if(!list.length)throw Error('No built HTML pages');return list;
}
export function checkLinks(dist=distArg()) {
 const all=pages(dist),byFile=new Map(all.map(p=>[p.file,p]));let checked=0,external=0;
 const catalog=JSON.parse(readFileSync(resolve(root,'src/data/docs-catalog.ts'),'utf8').replace(/^export default /,'').replace(/;\s*$/,''));
 const origin='https://'+catalog.repository.split('/').at(-1)+'.com';
 function target(raw,base) {
  if(!raw||/^(mailto:|tel:|data:|javascript:)/.test(raw)){if(raw?.startsWith('javascript:'))throw Error('Executable URL');return;}
  const url=new URL(raw,origin+base);
  if(url.origin!==origin){external++;return;}
  let path=decodeURIComponent(url.pathname),file=resolve(dist,'.'+path);
  if(file!==resolve(dist)&&!file.startsWith(resolve(dist)+'/'))throw Error('Path escapes output');
  if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
  if(!existsSync(file))throw Error('Missing target: '+base+' → '+raw);
  if(url.hash&&byFile.has(file)&&!byFile.get(file).ids.includes(decodeURIComponent(url.hash.slice(1))))throw Error('Missing fragment: '+base+' → '+raw);
  checked++;
 }
 for(const p of all) {
  if(new Set(p.ids).size!==p.ids.length)throw Error('Duplicate ID: '+p.path);
  for(const n of p.nodes){const a=attrs(n);for(const key of ['href','src','poster'])if(a[key])target(a[key],p.path);
   if(a.srcset)for(const item of a.srcset.split(','))target(item.trim().split(/\s+/)[0],p.path);
  }
 }
 for(const file of files(dist).filter(f=>f.endsWith('.css')))for(const match of readFileSync(file,'utf8').matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/g)) target(match[1]??match[2]??match[3],'/'+relative(dist,file).replaceAll('\\','/'));
 return {pages:all.length,checked,externalUnchecked:external};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkLinks()));}catch(e){console.error(e.message);process.exitCode=1;}}
