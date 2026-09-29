import {fileURLToPath} from 'node:url';
import {pages,attrs,content,distArg} from './check-links.mjs';
export function checkI18n(dist=distArg()){
 const all=pages(dist),map=new Map(all.map(p=>[p.path,p]));const tags={pt:'pt-BR',en:'en',es:'es'};
 const unlocalize=path=>path.replace(/^\/(en|es)(?=\/)/,'');let groups=0;
 for(const p of all){
  const locale=p.path.match(/^\/(en|es)\//)?.[1]||'pt';
  if(attrs(p.nodes.find(n=>n.tagName==='html')).lang!==tags[locale])throw Error('Wrong html language: '+p.path);
  const canon=p.nodes.filter(n=>n.tagName==='link'&&attrs(n).rel==='canonical');
  if(canon.length!==1||new URL(attrs(canon[0]).href).pathname!==p.path)throw Error('Wrong canonical: '+p.path);
  const canonical=attrs(canon[0]).href;
  const defaults=p.nodes.filter(n=>n.tagName==='link'&&attrs(n).rel==='alternate'&&attrs(n).hreflang==='x-default');
  if(defaults.length!==1||attrs(defaults[0]).href!==new URL(unlocalize(p.path),canonical).href)throw Error('Wrong default alternate: '+p.path);
  for(const n of p.nodes.filter(n=>n.tagName==='a'&&attrs(n).href)){
   const url=new URL(attrs(n).href,canonical);
   if(url.origin===new URL(canonical).origin&&map.has(url.pathname)&&(url.pathname.match(/^\/(en|es)\//)?.[1]||'pt')!==locale&&!('hreflang' in attrs(n)))throw Error('Navigation loses locale: '+p.path);
  }
  const selector=p.nodes.find(n=>n.tagName==='nav'&&'data-language-selector' in attrs(n));
  if(!selector)throw Error('Missing language selector: '+p.path);
  const anchors=(awaitNodes(selector)).filter(n=>n.tagName==='a');
  if(anchors.length!==3)throw Error('Incomplete language selector: '+p.path);
  for(const [other,tag] of Object.entries(tags)){
   const expected=(other==='pt'?'':'/'+other)+unlocalize(p.path),peer=map.get(expected);
   if(!peer)throw Error('Missing translated route: '+expected);
   const alternate=p.nodes.filter(n=>n.tagName==='link'&&attrs(n).rel==='alternate'&&attrs(n).hreflang===tag);
   if(alternate.length!==1||attrs(alternate[0]).href!==new URL(expected,canonical).href)throw Error('Wrong hreflang: '+p.path);
   const link=anchors.find(n=>attrs(n).hreflang===tag);
   if(!link||attrs(link).href!==expected||attrs(link).lang!==tag)throw Error('Wrong equivalent language link: '+p.path);
   if(other===locale&&attrs(link)['aria-current']!=='page')throw Error('Missing current language');
  }
  const title=p.nodes.find(n=>n.tagName==='title'),desc=p.nodes.find(n=>n.tagName==='meta'&&attrs(n).name==='description');
  if(!title||!content(title).trim()||!desc||!attrs(desc).content)throw Error('Missing localized metadata');
  if(locale!=='pt'){
   const pt=map.get(unlocalize(p.path));
   const ptTitle=content(pt.nodes.find(n=>n.tagName==='title'));
   if(content(title)===ptTitle||attrs(desc).content===attrs(pt.nodes.find(n=>n.tagName==='meta'&&attrs(n).name==='description')).content)throw Error('Untranslated metadata: '+p.path);
   const h1=p.nodes.find(n=>n.tagName==='h1'),ph1=pt.nodes.find(n=>n.tagName==='h1');
   // Product names, technical identifiers and NativeMemoryProvider may be identical.
   if(content(h1)===content(ph1)&&!/^NativeMemoryProvider$/.test(content(h1)))throw Error('Untranslated heading: '+p.path);
   const body=p.nodes.find(n=>n.tagName==='body');
   const visible=content(body).replace(/\s+/g,' ');
   if(/Pular para o conteúdo|Nesta página|Próxima revisão|Seu nome|Enviar mensagem|Fontes desta página/.test(visible))throw Error('Portuguese interface leaked: '+p.path);
  }else groups++;
 }
 return {pages:all.length,equivalentGroups:groups,locales:3,editorialReview:'required separately; structural parity is not language quality'};
}
function awaitNodes(n){return [n,...(n.childNodes||[]).flatMap(awaitNodes)];}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkI18n()));}catch(e){console.error(e.message);process.exitCode=1;}}
