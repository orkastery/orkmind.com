// O espanhol saiu do site por decisão do dono: ficam PT-BR em / e inglês em /en/. Cada URL /es/ que
// existia vira uma página estática de redirecionamento para a mesma página em inglês
// (src/layouts/Redirecionamento.astro). Esta checagem confere, no build:
//  1. cada URL /es/ antiga (a home, o índice das docs e cada artigo do catálogo) tem a página;
//  2. a página leva ao equivalente em /en/ dentro do base da build: meta refresh 0 com a URL, canonical
//     absoluto na mesma URL, link visível e o script que mantém o fragmento; a língua é en;
//  3. fica fora do índice: noindex (e nofollow, na prévia);
//  4. nenhuma outra página mora em /es/ e nenhuma página de conteúdo aponta para /es/ ou anuncia es.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {root,pages,attrs,distArg,siteBase} from './check-links.mjs';
import {releaseDaBase} from '../src/lib/previa.mjs';

const ler=arquivo=>JSON.parse(readFileSync(arquivo,'utf8').replace(/^export default /,'').replace(/;\s*$/,''));
// As rotas lógicas que existiam em /es/: a home, o índice das docs e um artigo por slug do catálogo.
export function rotasAntigas(dir=root){
 const catalogo=ler(resolve(dir,'src/data/docs-catalog.ts'));
 const slugs=catalogo.modules.flatMap(m=>ler(resolve(dir,'src/data',m)).map(a=>a.slug));
 return ['/','/docs/',...slugs.map(s=>'/docs/'+s+'/')];
}
const ORIGEM='https://orkmind.com';

export function checkRedirecionamentos(dist=distArg(),base=siteBase(),dir=root){
 const release=releaseDaBase(base||'/'),todas=pages(dist),porCaminho=new Map(todas.map(p=>[p.path,p]));
 const rotas=rotasAntigas(dir),esperadas=new Set(rotas.map(r=>'/es'+r));
 for(const rota of rotas){
  const de='/es'+rota,para=base+'/en'+rota,p=porCaminho.get(de);
  if(!p)throw Error('Missing redirect for the old Spanish URL: '+de);
  if(p.redirecionamento!==para)throw Error(`Redirect ${de} goes to ${p.redirecionamento}, expected ${para}`);
  const refresh=p.nodes.find(n=>n.tagName==='meta'&&(attrs(n)['http-equiv']||'').toLowerCase()==='refresh');
  if(!/^0\s*;/.test(attrs(refresh).content||''))throw Error('Redirect must be immediate (refresh 0): '+de);
  const canonicos=p.nodes.filter(n=>n.tagName==='link'&&attrs(n).rel==='canonical');
  if(canonicos.length!==1||attrs(canonicos[0]).href!==ORIGEM+para)throw Error('Redirect canonical must be the English page: '+de);
  const robots=p.nodes.filter(n=>n.tagName==='meta'&&(attrs(n).name||'').toLowerCase()==='robots').map(n=>(attrs(n).content||'').toLowerCase().split(',').map(d=>d.trim()));
  if(robots.length!==1||!robots[0].includes('noindex')||(release&&!robots[0].includes('nofollow')))throw Error('Redirect must stay out of search indexes: '+de);
  if(!p.nodes.some(n=>n.tagName==='a'&&attrs(n).href===para))throw Error('Redirect without a visible link to the English page: '+de);
  const scripts=p.nodes.filter(n=>n.tagName==='script').map(n=>(n.childNodes||[]).map(c=>c.value||'').join(''));
  if(!scripts.some(s=>/location\.replace\(/.test(s)&&s.includes('location.hash')))throw Error('Redirect without the script that keeps the fragment: '+de);
  if(attrs(p.nodes.find(n=>n.tagName==='html')).lang!=='en')throw Error('Redirect page language must be en: '+de);
 }
 for(const p of todas){
  if(p.path.startsWith('/es/')&&!esperadas.has(p.path))throw Error('Spanish page left in the build: '+p.path);
  if(p.redirecionamento!==null&&!esperadas.has(p.path))throw Error('Unexpected redirect page: '+p.path);
  if(p.redirecionamento!==null)continue;
  for(const n of p.nodes){
   const a=attrs(n);
   if(a.hreflang==='es')throw Error('Content page still announces Spanish: '+p.path);
   if(n.tagName==='a'&&a.href&&(a.href===base+'/es/'||a.href.startsWith(base+'/es/')))throw Error('Content page links to the old Spanish URL: '+p.path);
  }
 }
 return {redirects:rotas.length,base:base||'/',target:'/en/',noindex:true};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkRedirecionamentos()));}catch(e){console.error(e.message);process.exitCode=1;}}
