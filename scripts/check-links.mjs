import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';
import {baseDoAmbiente,PREFIXO_DA_PREVIA} from '../src/lib/previa.mjs';
export const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
export const distArg=()=>process.argv.includes('--dist')?resolve(process.argv[process.argv.indexOf('--dist')+1]):resolve(root,'dist');
// O base da build conferida, sem a barra final: '' na produção e /releasevalidation/<release> na prévia (SITE_BASE).
export const siteBase=()=>baseDoAmbiente().replace(/\/$/,'');
export const attrs=node=>Object.fromEntries((node.attrs||[]).map(a=>[a.name,a.value]));
export function walk(node){return [node,...(node.childNodes||[]).flatMap(walk)];}
export const content=node=>node.nodeName==='#text'?node.value:(node.childNodes||[]).filter(n=>!['script','style'].includes(n.tagName)).map(content).join('');
export function files(dir,excluir=[]){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const file=resolve(dir,e.name);return excluir.includes(file)?[]:e.isDirectory()?files(file,excluir):[file];});}
export function pages(dist=distArg(),excluir=[]) {
 const list=files(dist,excluir).filter(f=>f.endsWith('.html')).map(file=>{
  const source=readFileSync(file,'utf8'),dom=parse(source),nodes=walk(dom),path='/'+relative(dist,file).replaceAll('\\','/').replace(/index\.html$/,'');
  // Página de redirecionamento (as URLs /es/ antigas): o destino do meta refresh, ou null.
  const refresh=nodes.find(n=>n.tagName==='meta'&&(attrs(n)['http-equiv']||'').toLowerCase()==='refresh');
  const redirecionamento=refresh?((attrs(refresh).content||'').match(/url=(.+)$/i)?.[1]?.trim()||''):null;
  return {file,path,source,dom,nodes,ids:nodes.map(n=>attrs(n).id).filter(Boolean),redirecionamento};
 });
 if(!list.length)throw Error('No built HTML pages');return list;
}
export function checkLinks(dist=distArg(),base=siteBase()) {
 const all=pages(dist),byFile=new Map(all.map(p=>[p.file,p]));let checked=0,external=0,peerChecked=0;
 const catalog=JSON.parse(readFileSync(resolve(root,'src/data/docs-catalog.ts'),'utf8').replace(/^export default /,'').replace(/;\s*$/,''));
 const origin='https://'+catalog.repository.split('/').at(-1)+'.com';
 const peerDomain=origin.includes('orkastery.com')?'orkmind.com':'orkastery.com',peerDist=resolve(root,'..',peerDomain,'dist');
 const peerPages=existsSync(peerDist)?new Map(pages(peerDist).map(p=>[p.file,p])):null;
 function target(raw,page) {
  if(!raw||/^(mailto:|tel:|data:|javascript:)/.test(raw)){if(raw?.startsWith('javascript:'))throw Error('Executable URL');return;}
  const url=new URL(raw,origin+base+page);
  let targetRoot=dist,targetPages=byFile;
  if(url.origin!==origin){
   // O outro site não tem esta release: nenhuma página aponta para uma prévia dele, só para a produção.
   if(url.origin==='https://'+peerDomain&&url.pathname.startsWith(PREFIXO_DA_PREVIA))throw Error('Link para o outro site com caminho de prévia: '+base+page+' → '+raw);
   if(url.origin==='https://'+peerDomain&&peerPages){targetRoot=peerDist;targetPages=peerPages;peerChecked++;}
   else{external++;return;}
  }
  let path=decodeURIComponent(url.pathname);
  if(targetRoot===dist){
   // Na prévia, todo link deste site fica dentro do base; na produção, nenhum aponta para uma prévia.
   if(base){if(path!==base&&!path.startsWith(base+'/'))throw Error('Fora da prévia: '+base+page+' → '+raw);path=path.slice(base.length)||'/';}
   else if(path.startsWith(PREFIXO_DA_PREVIA))throw Error('A produção aponta para uma prévia: '+page+' → '+raw);
  }
  let file=resolve(targetRoot,'.'+path);
  if(file!==resolve(targetRoot)&&!file.startsWith(resolve(targetRoot)+'/'))throw Error('Path escapes output');
  if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
  if(!existsSync(file))throw Error('Missing target: '+base+page+' → '+raw);
  if(url.hash&&targetPages.has(file)&&!targetPages.get(file).ids.includes(decodeURIComponent(url.hash.slice(1))))throw Error('Missing fragment: '+base+page+' → '+raw);
  checked++;
 }
 for(const p of all) {
  if(new Set(p.ids).size!==p.ids.length)throw Error('Duplicate ID: '+p.path);
  for(const n of p.nodes){const a=attrs(n);for(const key of ['href','src','poster'])if(a[key])target(a[key],p.path);
   if(a.srcset)for(const item of a.srcset.split(','))target(item.trim().split(/\s+/)[0],p.path);
   if(n.tagName==='meta'&&['og:url','og:image'].includes(a.property)&&a.content)target(a.content,p.path);
  }
 }
 for(const file of files(dist).filter(f=>f.endsWith('.css')))for(const match of readFileSync(file,'utf8').matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/g)) target(match[1]??match[2]??match[3],'/'+relative(dist,file).replaceAll('\\','/'));
 const manifest=resolve(dist,'site.webmanifest');
 if(existsSync(manifest))for(const icon of JSON.parse(readFileSync(manifest,'utf8')).icons||[])target(icon.src,'/site.webmanifest');
 return {pages:all.length,checked,peerChecked,externalUnchecked:external,base:base||'/'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkLinks()));}catch(e){console.error(e.message);process.exitCode=1;}}
