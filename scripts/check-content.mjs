import {fileURLToPath} from 'node:url';
import {pages,attrs,content,distArg} from './check-links.mjs';
export function checkContent(dist=distArg()){
 const all=pages(dist);let diagrams=0;
 for(const p of all){
  if(p.nodes.filter(n=>n.tagName==='main').length!==1||p.nodes.filter(n=>n.tagName==='h1').length!==1)throw Error('Expected one main and h1: '+p.path);
  for(const n of p.nodes){const a=attrs(n);
   if(n.tagName==='img'&&!('alt' in a))throw Error('Missing alt: '+p.path);
   if(n.tagName==='svg'&&a.role==='img'){
    const ids=(a['aria-labelledby']||'').split(/\s+/);
    if(ids.length<2||ids.some(id=>!p.nodes.some(x=>attrs(x).id===id&&['title','desc'].includes(x.tagName)&&content(x).trim())))throw Error('Inaccessible diagram: '+p.path);
    diagrams++;
   }
   if(/^h[1-6]$/.test(n.tagName||'')){
    const value=content(n).replace(/\b(?:GOAL|PLAN|GO|CHECK|SHIP|MASTER|CLI|MCP|SVG|PT|EN|ES|MIT|DAG|PLAT|SYS|MOD|FEAT)\b/g,'').trim();
    if(/[A-ZÀ-Ý]{4,}/.test(value))throw Error('All-caps heading: '+p.path);
   }
  }
 }
 return {pages:all.length,accessibleDiagrams:diagrams,manualVisualReview:'required'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkContent()));}catch(e){console.error(e.message);process.exitCode=1;}}
