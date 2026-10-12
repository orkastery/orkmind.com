// Confere a build contra o modo dela (src/lib/previa.mjs). Na prévia (SITE_BASE em
// /releasevalidation/<release>/), toda página tem noindex, nofollow e a faixa da release com o SHA,
// e o versao.json leva a release e o SHA. Na produção, nenhuma página sai do índice nem mostra a
// faixa, o versao.json não leva release e o robots.txt bloqueia /releasevalidation/.
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {pages,attrs,content,distArg,siteBase} from './check-links.mjs';
import {releaseDaBase,textoDaFaixa,temRegraDoRobots} from '../src/lib/previa.mjs';
export function checkPrevia(dist=distArg(),base=siteBase(),{excluir=[],robots=true}={}){
 const release=releaseDaBase(base||'/');
 const versao=JSON.parse(readFileSync(resolve(dist,'versao.json'),'utf8'));
 if(release){
  if(versao.release!==release)throw Error('versao.json da prévia sem a release '+release);
  if(!/^[0-9a-f]{40}$/.test(versao.sha||''))throw Error('versao.json da prévia sem o SHA do commit');
 }else if('release' in versao)throw Error('versao.json da produção com release');
 const all=pages(dist,excluir);
 for(const p of all){
  const metas=p.nodes.filter(n=>n.tagName==='meta'&&(attrs(n).name||'').toLowerCase()==='robots');
  const faixas=p.nodes.filter(n=>'data-previa' in attrs(n));
  if(release){
   if(metas.length!==1||attrs(metas[0]).content!=='noindex, nofollow')throw Error('Página da prévia sem noindex, nofollow: '+p.path);
   const faixa=faixas[0],texto=faixa?content(faixa).replace(/\s+/g,' '):'';
   if(faixas.length!==1||attrs(faixa)['data-previa']!==release||attrs(faixa)['data-sha']!==versao.sha||!texto.includes(textoDaFaixa(release))||!texto.includes(versao.sha.slice(0,7)))throw Error('Página da prévia sem a faixa da release com o SHA: '+p.path);
  }else{
   if(metas.some(n=>/noindex|nofollow|none/i.test(attrs(n).content||'')))throw Error('Página da produção fora do índice: '+p.path);
   if(faixas.length)throw Error('Faixa de prévia na produção: '+p.path);
  }
 }
 if(!release&&robots){
  const arquivo=resolve(dist,'robots.txt');
  if(!existsSync(arquivo)||!temRegraDoRobots(readFileSync(arquivo,'utf8')))throw Error('robots.txt da raiz sem Disallow: /releasevalidation/');
 }
 return {pages:all.length,modo:release?'prévia':'produção',release,sha:versao.sha};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkPrevia()));}catch(e){console.error(e.message);process.exitCode=1;}}
