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
 for(const locale of ['pt','en','es']) {
  const prefix=locale==='pt'?'':'/'+locale, home=all.find(p=>p.path===prefix+'/');
  if(!home)throw Error('Missing translated home: '+locale);
  const required={"pt": ["Um Company Brain governado", "Uma fonte de verdade para o sistema inteiro", "Governança acima do adaptador"], "en": ["A governed Company Brain", "A shared source of truth for the whole system", "Governance above the adapter"], "es": ["Un Company Brain gobernado", "Una fuente de verdad compartida para todo el sistema", "Gobernanza por encima del adaptador"]}[locale];
  for(const heading of required)if(!home.nodes.some(n=>n.tagName==='h2'&&content(n).includes(heading)))throw Error('Missing restored home section: '+locale);
  const labels=home.nodes.filter(n=>'data-node-label' in attrs(n)).map(n=>content(n).trim());
  if(labels.length!==8||new Set(labels).size!==8)throw Error('Missing system diagram labels: '+locale);
  const expected={pt:'Agentes temporários',en:'Temporary agents',es:'Agentes temporales'}[locale];
  if(!labels.includes(expected))throw Error('Untranslated system diagram: '+locale);
  const contribution=all.find(p=>p.path===prefix+'/docs/contribuir/');
  if(!contribution)throw Error('Missing contribution page: '+locale);
  for(const entry of [home,all.find(p=>p.path===prefix+'/docs/')])if(!entry?.nodes.some(n=>n.tagName==='a'&&attrs(n).href===prefix+'/docs/contribuir/'))throw Error('Missing contribution navigation: '+locale);
  if(!contribution.nodes.some(n=>n.tagName==='a'&&attrs(n).href?.endsWith('/discussions')))throw Error('Missing feature discussion link');
  if(!contribution.nodes.some(n=>n.tagName==='a'&&attrs(n).href?.endsWith('/CONTRIBUTING.md')))throw Error('Missing contribution source');
  const visible=content(home.nodes.find(n=>n.tagName==='main'));
  if(/OrkMind Web|Orkastery Web|Orkastery Board|pron[uú]ncia|pronunciation|pronunciación/.test(visible))throw Error('Excluded home content');
 }
 return {pages:all.length,accessibleDiagrams:diagrams,manualVisualReview:'required'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkContent()));}catch(e){console.error(e.message);process.exitCode=1;}}
