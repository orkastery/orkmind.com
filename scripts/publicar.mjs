// Publicação composta do site: a raiz é a build da última tag producao-AAAAMMDD-HHMM (a produção
// aprovada) e cada tag validacao-<release> ativa vira releasevalidation/<release>/, compilada com o
// base da prévia (src/lib/previa.mjs). Este módulo monta a árvore e a confere antes de publicar.
import {cpSync,existsSync,readdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,relative,resolve,sep} from 'node:path';
import {files,checkLinks} from './check-links.mjs';
import {checkPrevia} from './check-previa.mjs';
import {PREFIXO_DA_PREVIA,ROBOTS_DA_RAIZ,baseDaRelease,temRegraDoRobots} from '../src/lib/previa.mjs';

export const PASTA_DAS_PREVIAS=PREFIXO_DA_PREVIA.slice(1,-1);

/** sha256 de cada arquivo da árvore, pelo caminho relativo; excluir lista pastas relativas a dir. */
export function hashesDe(dir,excluir=[]){
 const mapa=new Map();
 for(const file of files(dir,excluir.map(e=>resolve(dir,e))))mapa.set(relative(dir,file).split(sep).join('/'),createHash('sha256').update(readFileSync(file)).digest('hex'));
 return mapa;
}

/**
 * Monta a publicação numa pasta nova: a build de produção na raiz e cada prévia em
 * releasevalidation/<release>/. A raiz sem robots.txt (tag anterior a esta regra) ganha o da regra;
 * com robots.txt sem a regra, a montagem reprova. CNAME e robots.txt só valem na raiz do domínio
 * e saem das cópias das prévias.
 */
export function comporPublicacao({producao,previas=[],saida}){
 if(existsSync(saida)){
  if(readdirSync(saida).length)throw Error('A pasta da publicação já existe e não está vazia: '+saida);
  rmSync(saida,{recursive:true});
 }
 cpSync(producao,saida,{recursive:true});
 if(existsSync(join(saida,PASTA_DAS_PREVIAS)))throw Error('A build de produção já tem '+PASTA_DAS_PREVIAS+'/');
 const robots=join(saida,'robots.txt');let robotsCriado=false;
 if(!existsSync(robots)){writeFileSync(robots,ROBOTS_DA_RAIZ);robotsCriado=true;}
 else if(!temRegraDoRobots(readFileSync(robots,'utf8')))throw Error('O robots.txt da produção não bloqueia '+PREFIXO_DA_PREVIA);
 const vistas=new Set();
 for(const {release,dist} of previas){
  baseDaRelease(release);
  if(vistas.has(release))throw Error('Prévia repetida: '+release);
  vistas.add(release);
  const destino=join(saida,PASTA_DAS_PREVIAS,release);
  cpSync(dist,destino,{recursive:true});
  for(const nome of ['CNAME','robots.txt'])rmSync(join(destino,nome),{force:true});
 }
 return {robotsCriado};
}

/**
 * Confere a publicação montada. Raiz: versao.json da produção esperada, nenhuma página fora do índice
 * nem com faixa, robots.txt com a regra, nenhum sitemap citando prévia e, com os hashes da build de
 * produção, os mesmos arquivos com o mesmo conteúdo. Prévias: exatamente as esperadas, cada uma com
 * noindex, faixa, versao.json com release e o SHA da tag, links dentro do base e sem CNAME nem robots.txt.
 */
export function verificarPublicacao(saida,{producao,previas=[],hashesDaProducao=null,robotsCriado=false}){
 const pasta=join(saida,PASTA_DAS_PREVIAS);
 const versao=JSON.parse(readFileSync(join(saida,'versao.json'),'utf8'));
 if(versao.sha!==producao.sha)throw Error('A raiz não é a produção esperada: versao.json diz '+versao.sha+', a tag aponta '+producao.sha);
 checkPrevia(saida,'',{excluir:[pasta]});
 for(const nome of readdirSync(saida).filter(n=>/^sitemap.*\.xml$/i.test(n)))if(readFileSync(join(saida,nome),'utf8').includes(PREFIXO_DA_PREVIA))throw Error('O sitemap da raiz cita uma prévia: '+nome);
 if(hashesDaProducao){
  const atuais=hashesDe(saida,[PASTA_DAS_PREVIAS]);
  if(robotsCriado)atuais.delete('robots.txt');
  const diferentes=[...new Set([...atuais.keys(),...hashesDaProducao.keys()])].filter(k=>atuais.get(k)!==hashesDaProducao.get(k));
  if(diferentes.length)throw Error('A raiz difere da build de produção: '+diferentes.slice(0,5).join(', '));
 }
 const esperadas=previas.map(p=>p.release).sort(),presentes=existsSync(pasta)?readdirSync(pasta).sort():[];
 if(JSON.stringify(presentes)!==JSON.stringify(esperadas))throw Error('As prévias da publicação ('+(presentes.join(', ')||'nenhuma')+') diferem das esperadas ('+(esperadas.join(', ')||'nenhuma')+')');
 for(const {release,sha} of previas){
  const dir=join(pasta,release),base=baseDaRelease(release).slice(0,-1);
  for(const nome of ['CNAME','robots.txt'])if(existsSync(join(dir,nome)))throw Error(nome+' dentro da prévia '+release);
  const conferida=checkPrevia(dir,base);
  if(conferida.sha!==sha)throw Error('A prévia '+release+' não é o commit da tag: versao.json diz '+conferida.sha+', a tag aponta '+sha);
  checkLinks(dir,base);
 }
 return {raiz:producao.sha,previas:previas.map(p=>p.release)};
}
