import {fileURLToPath} from 'node:url';
import {pages,attrs,content,distArg,siteBase} from './check-links.mjs';
export function checkContent(dist=distArg(),base=siteBase()){
 const all=pages(dist).filter(p=>p.redirecionamento===null);let diagrams=0;
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
 for(const locale of ['pt','en']) {
  const prefix=locale==='pt'?'':'/'+locale, home=all.find(p=>p.path===prefix+'/');
  if(!home)throw Error('Missing translated home: '+locale);
  const required={"pt": ["Um Company Brain governado", "Uma fonte de verdade para o sistema inteiro", "Governança acima do adaptador"], "en": ["A governed Company Brain", "A shared source of truth for the whole system", "Governance above the adapter"]}[locale];
  for(const heading of required)if(!home.nodes.some(n=>n.tagName==='h2'&&content(n).includes(heading)))throw Error('Missing restored home section: '+locale);
  const labels=home.nodes.filter(n=>'data-node-label' in attrs(n)).map(n=>content(n).trim());
  if(labels.length!==8||new Set(labels).size!==8)throw Error('Missing system diagram labels: '+locale);
  const expected={pt:'Agentes temporários',en:'Temporary agents'}[locale];
  if(!labels.includes(expected))throw Error('Untranslated system diagram: '+locale);
  // A home do design: as seções na ordem da página (as âncoras da navegação entre elas), o cartão
  // vivo com descrição acessível e o comando que copia.
  const secoes=['topo','sistema','problema','contato','integracoes','governanca','noite','caminho','prova'];
  const ids=home.nodes.filter(n=>n.tagName==='section').map(n=>attrs(n).id).filter(id=>secoes.includes(id));
  if(ids.join()!==secoes.join())throw Error('Home sections missing or out of order: '+locale+' ('+ids.join()+')');
  const canvas=home.nodes.find(n=>n.tagName==='canvas'&&'data-caminho' in attrs(n));
  if(!canvas||attrs(canvas).role!=='img'||!attrs(canvas)['aria-label'])throw Error('Hero canvas without accessible description: '+locale);
  if(!home.nodes.some(n=>attrs(n)['data-copiar']==='pip install orkmind'))throw Error('Missing copy command: '+locale);
  const contribution=all.find(p=>p.path===prefix+'/docs/contribuir/');
  if(!contribution)throw Error('Missing contribution page: '+locale);
  for(const entry of [home,all.find(p=>p.path===prefix+'/docs/')])if(!entry?.nodes.some(n=>n.tagName==='a'&&attrs(n).href===base+prefix+'/docs/contribuir/'))throw Error('Missing contribution navigation: '+locale);
  if(!contribution.nodes.some(n=>n.tagName==='a'&&attrs(n).href?.endsWith('/discussions')))throw Error('Missing feature discussion link');
  if(!contribution.nodes.some(n=>n.tagName==='a'&&attrs(n).href?.endsWith('/CONTRIBUTING.md')))throw Error('Missing contribution source');
  const visible=content(home.nodes.find(n=>n.tagName==='main'));
  if(/OrkMind Web|Orkastery Web|Orkastery Board|pron[uú]ncia|pronunciation|pronunciación/.test(visible))throw Error('Excluded home content');
 }
 return {pages:all.length,accessibleDiagrams:diagrams,manualVisualReview:'required'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkContent()));}catch(e){console.error(e.message);process.exitCode=1;}}
