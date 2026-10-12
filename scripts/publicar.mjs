// Publicação composta do site: a raiz é a build da última tag producao-AAAAMMDD-HHMM (a produção
// aprovada) e cada tag validacao-<release> ativa vira releasevalidation/<release>/, compilada com o
// base da prévia (src/lib/previa.mjs). Este módulo resolve as tags, compila cada commit, monta a
// árvore e a confere antes de publicar; o workflow .github/workflows/publicar.yml só o chama.
//
//   node scripts/publicar.mjs --saida <pasta> [--repo <clone>] [--maximo <n>] [--cache <pasta>] [--resumo <arquivo>]
//   node scripts/publicar.mjs --ensaio [--repo <clone>] [--maximo <n>]   (só mostra o que publicaria)
//   --tag-do-disparo <tag>: no push de uma tag, reprova se ela não entrar na publicação
import {appendFileSync,closeSync,cpSync,existsSync,lstatSync,mkdirSync,mkdtempSync,openSync,readdirSync,readFileSync,readlinkSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {dirname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {root,files,checkLinks} from './check-links.mjs';
import {checkPrevia} from './check-previa.mjs';
import {PREFIXO_DA_PREVIA,ROBOTS_DA_RAIZ,baseDaRelease,releaseDaBase,releaseValida,temRegraDoRobots} from '../src/lib/previa.mjs';

export const PASTA_DAS_PREVIAS=PREFIXO_DA_PREVIA.slice(1,-1);
export const TAG_DE_PRODUCAO=/^producao-[0-9]{8}-[0-9]{4}$/;
export const PREFIXO_DA_TAG_DE_PREVIA='validacao-';
export const PREVIAS_MAXIMO=5;
const MARCADOR_DE_BUILD='.publicar-build-ok';

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
  // O texto da faixa é conferido pela build do próprio commit (check:previa); aqui vale a estrutura, para
  // que uma mudança futura no texto não reprove as prévias antigas que continuam no ar.
  const conferida=checkPrevia(dir,base,{texto:false});
  if(conferida.sha!==sha)throw Error('A prévia '+release+' não é o commit da tag: versao.json diz '+conferida.sha+', a tag aponta '+sha);
  checkLinks(dir,base);
 }
 return {raiz:producao.sha,previas:previas.map(p=>p.release)};
}

/**
 * Roda um comando e devolve o código, o stdout e o stderr. A saída vai para arquivos temporários, não
 * para pipes: o sandbox do verificador do núcleo nega o pipe do spawnSync (EPERM, com o filho rodando
 * mesmo assim), e o arquivo funciona igual lá, no Actions e na máquina de quem desenvolve.
 */
export function executar(comando,args,{cwd,env}={}){
 const dir=mkdtempSync(join(tmpdir(),'executar-')),saida=join(dir,'saida'),erros=join(dir,'erros');
 const fdSaida=openSync(saida,'w'),fdErros=openSync(erros,'w');
 let r;
 try{r=spawnSync(comando,args,{cwd,env,stdio:['ignore',fdSaida,fdErros]});}
 finally{closeSync(fdSaida);closeSync(fdErros);}
 const resultado={status:r.error?null:r.status,erro:r.error??null,saida:readFileSync(saida,'utf8'),erros:readFileSync(erros,'utf8')};
 rmSync(dir,{recursive:true,force:true});
 return resultado;
}

const FORA_DA_COPIA=/^(node_modules|dist|\.astro|\.git)(\/|$)/;

/**
 * Copia a árvore de trabalho (arquivos versionados e os novos não ignorados, como estão no disco) para
 * destino, sem dependências, build nem .git, preservando links simbólicos. Sem git, copia a pasta inteira
 * com o mesmo filtro. Os testes compilam a partir desta cópia.
 */
export function copiarArvoreDeTrabalho(origem,destino){
 const lista=executar('git',['ls-files','-z','--cached','--others','--exclude-standard'],{cwd:origem});
 mkdirSync(destino,{recursive:true});
 if(lista.status!==0){cpSync(origem,destino,{recursive:true,filter:f=>!FORA_DA_COPIA.test(relative(origem,f).split(sep).join('/'))});return destino;}
 for(const rel of lista.saida.split(String.fromCharCode(0)).filter(Boolean)){
  const de=join(origem,rel),para=join(destino,rel);
  if(FORA_DA_COPIA.test(rel)||!existsSync(de))continue;
  const tipo=lstatSync(de);
  if(tipo.isDirectory())continue;
  mkdirSync(dirname(para),{recursive:true});
  if(tipo.isSymbolicLink())symlinkSync(readlinkSync(de),para);else cpSync(de,para);
 }
 return destino;
}

function git(repo,args){
 const r=executar('git',['-C',repo,...args]);
 if(r.status!==0)throw Error('git '+args.join(' ')+' falhou: '+(r.erro?.code??(r.erros.trim()||'código '+r.status)));
 return r.saida.trim();
}
const linhas=texto=>texto.split('\n').map(l=>l.trim()).filter(Boolean);
const commitDa=(repo,tag)=>git(repo,['rev-parse',tag+'^{commit}']);
const temArquivo=(repo,sha,caminho)=>executar('git',['-C',repo,'cat-file','-e',sha+':'+caminho]).status===0;

/**
 * O que a publicação leva. Raiz: a maior tag producao-AAAAMMDD-HHMM pelo nome (as fora do padrão
 * ficam de fora, com aviso). Prévias: as tags validacao-<release>, em ordem de versão decrescente
 * (git tag --sort=-v:refname), até o teto; as demais ficam fora do ar. Release inválida e commit de
 * prévia sem suporte (sem src/lib/previa.mjs) reprovam antes de qualquer build.
 */
export function resolverTags(repo,{maximo=PREVIAS_MAXIMO}={}){
 if(!Number.isInteger(maximo)||maximo<0)throw Error('O teto de prévias precisa ser um inteiro maior ou igual a zero: '+maximo);
 const deProducao=linhas(git(repo,['tag','--list','producao-*']));
 const candidatas=deProducao.filter(t=>TAG_DE_PRODUCAO.test(t)).sort(),ignoradas=deProducao.filter(t=>!TAG_DE_PRODUCAO.test(t));
 if(!candidatas.length)throw Error('Nenhuma tag producao-AAAAMMDD-HHMM: não há produção aprovada para a raiz.');
 const tagDaRaiz=candidatas.at(-1);
 // versionsort.suffix=- põe 1.0.0-rc.1 antes de 1.0.0, qualquer que seja a configuração de quem roda.
 const dePrevia=linhas(git(repo,['-c','versionsort.suffix=-','tag','--list',PREFIXO_DA_TAG_DE_PREVIA+'*','--sort=-v:refname']));
 const invalidas=dePrevia.filter(t=>!releaseValida(t.slice(PREFIXO_DA_TAG_DE_PREVIA.length)));
 if(invalidas.length)throw Error('Tag de prévia com release inválida: '+invalidas.join(', ')+'. A release aceita letras, números, ponto, sublinhado e hífen, começando por letra ou número; apague a tag e crie outra.');
 const previas=dePrevia.slice(0,maximo).map(tag=>({tag,release:tag.slice(PREFIXO_DA_TAG_DE_PREVIA.length),sha:commitDa(repo,tag)}));
 const semSuporte=previas.filter(p=>!temArquivo(repo,p.sha,'src/lib/previa.mjs'));
 if(semSuporte.length)throw Error('Commit de prévia sem suporte ao base (src/lib/previa.mjs ausente): '+semSuporte.map(p=>p.tag+' em '+p.sha.slice(0,7)).join(', ')+'. Marque um commit que já tenha a prévia de release.');
 return {raiz:{tag:tagDaRaiz,sha:commitDa(repo,tagDaRaiz)},previas,foraDoTeto:dePrevia.slice(maximo),ignoradas};
}

function extrair(repo,sha,dir){
 const pasta=mkdtempSync(join(tmpdir(),'arquivo-')),arquivo=join(pasta,'commit.tar');
 try{
  git(repo,['archive','--format=tar','--output='+arquivo,sha]);
  const r=executar('tar',['-x','-f',arquivo,'-C',dir]);
  if(r.status!==0)throw Error('tar falhou ao extrair '+sha+': '+(r.erro?.code??r.erros.trim()));
 }finally{rmSync(pasta,{recursive:true,force:true});}
}

/** node_modules do checkout por link quando o lockfile do commit é idêntico; senão, npm ci no commit. */
function prepararDependencias(dir,log){
 const lock=join(dir,'package-lock.json'),nosso=join(root,'package-lock.json'),modulos=join(root,'node_modules');
 if(existsSync(lock)&&existsSync(nosso)&&existsSync(modulos)&&readFileSync(lock).equals(readFileSync(nosso))){symlinkSync(modulos,join(dir,'node_modules'),'dir');return;}
 log('npm ci em '+dir+': o package-lock.json deste commit difere do checkout');
 const r=spawnSync('npm',['ci','--no-audit','--no-fund'],{cwd:dir,stdio:'inherit'});
 if(r.status!==0)throw Error('npm ci falhou em '+dir+'; nada foi publicado.');
}

function conferirVersao(dist,sha,release){
 const versao=JSON.parse(readFileSync(join(dist,'versao.json'),'utf8'));
 if(versao.sha!==sha)throw Error('dist/versao.json diz '+versao.sha+', mas o commit compilado é '+sha);
 if(release&&versao.release!==release)throw Error('dist/versao.json da prévia diz a release '+versao.release+', esperada '+release);
}

/**
 * Compila um commit, extraído por git archive numa pasta própria, com SITE_SHA, SITE_DATA e
 * SITE_BASE; confere o versao.json e devolve o dist. Com cache, reaproveita a build do mesmo commit
 * no mesmo base (o ensaio local usa isto; o workflow compila tudo de novo).
 */
export function compilar(repo,{sha,base='/',cache=null,temporarias=[],log=console.log}){
 const release=releaseDaBase(base),chave=sha+'-'+(release??'raiz');
 // O cache só reaproveita build que passou inteira (postbuild e versao.json): o marcador vem por último.
 if(cache&&existsSync(join(cache,chave,MARCADOR_DE_BUILD))){
  log('build reaproveitada: '+chave);
  conferirVersao(join(cache,chave,'dist'),sha,release);
  return join(cache,chave,'dist');
 }
 let dir;
 if(cache){dir=join(cache,chave);rmSync(dir,{recursive:true,force:true});mkdirSync(dir,{recursive:true});}
 else{dir=mkdtempSync(join(tmpdir(),'publicar-'));temporarias.push(dir);}
 extrair(repo,sha,dir);
 if(release&&!existsSync(join(dir,'src/lib/previa.mjs')))throw Error('O commit '+sha+' não tem suporte à prévia.');
 prepararDependencias(dir,log);
 log('build de '+sha.slice(0,7)+(release?' como prévia '+release:' como raiz'));
 const env={...process.env,SITE_SHA:sha,SITE_DATA:git(repo,['log','-1','--format=%cI',sha]),SITE_BASE:base,SITE_TESTE_PREVIA:'0'};
 const r=spawnSync('npm',['run','build'],{cwd:dir,stdio:'inherit',env});
 if(r.status!==0){
  if(cache)rmSync(dir,{recursive:true,force:true});
  throw Error('A build de '+sha.slice(0,7)+' ('+(release?'prévia '+release:'raiz')+') falhou; nada foi publicado.');
 }
 conferirVersao(join(dir,'dist'),sha,release);
 if(cache)writeFileSync(join(dir,MARCADOR_DE_BUILD),sha+'\n');
 return join(dir,'dist');
}

/**
 * A publicação inteira: resolve as tags, compila a raiz primeiro (e guarda os hashes dela), depois
 * cada prévia, monta a árvore em saida e a confere. Qualquer falha para tudo: nada é publicado e o
 * site no ar fica como estava. Com ensaio, só resolve e devolve o plano.
 */
export function publicar({repo=root,saida=null,maximo=PREVIAS_MAXIMO,cache=null,ensaio=false,tagDoDisparo=null,log=console.log}={}){
 const plano=resolverTags(repo,{maximo});
 conferirTagDoDisparo(plano,tagDoDisparo,maximo);
 log('Raiz: '+plano.raiz.tag+' ('+plano.raiz.sha.slice(0,7)+')');
 for(const p of plano.previas)log('Prévia: '+p.tag+' ('+p.sha.slice(0,7)+') em '+PREFIXO_DA_PREVIA+p.release+'/');
 if(plano.foraDoTeto.length)log('Fora do teto de '+maximo+', ficam fora do ar: '+plano.foraDoTeto.join(', '));
 if(plano.ignoradas.length)log('Tags producao-* fora do padrão AAAAMMDD-HHMM, ignoradas: '+plano.ignoradas.join(', '));
 if(ensaio)return {...plano,ensaio:true};
 if(!saida)throw Error('Falta a pasta da publicação (--saida).');
 if(existsSync(saida)&&readdirSync(saida).length)throw Error('A pasta da publicação já existe e não está vazia: '+saida);
 const temporarias=[];
 try{
  const producao=compilar(repo,{sha:plano.raiz.sha,base:'/',cache,temporarias,log});
  const hashesDaProducao=hashesDe(producao);
  const previas=plano.previas.map(p=>({...p,dist:compilar(repo,{sha:p.sha,base:baseDaRelease(p.release),cache,temporarias,log})}));
  const {robotsCriado}=comporPublicacao({producao,previas,saida});
  verificarPublicacao(saida,{producao:plano.raiz,previas,hashesDaProducao,robotsCriado});
  log('Publicação montada e conferida em '+saida+(robotsCriado?' (robots.txt da raiz criado pela regra)':''));
  return {...plano,robotsCriado};
 }finally{
  for(const dir of temporarias)rmSync(dir,{recursive:true,force:true});
 }
}

/**
 * No push de uma tag, ela precisa entrar na publicação: a promoção vira a raiz e a prévia cabe no teto.
 * Senão a execução reprova, em vez de passar verde sem mudar nada no ar.
 */
export function conferirTagDoDisparo(plano,tag,maximo){
 if(!tag)return;
 if(tag.startsWith('producao-')&&tag!==plano.raiz.tag)throw Error('A tag '+tag+' não vira a raiz: a raiz é a maior tag producao-AAAAMMDD-HHMM pelo nome, hoje '+plano.raiz.tag+(TAG_DE_PRODUCAO.test(tag)?'':', e esta tag está fora do padrão')+'. Nada foi publicado.');
 if(tag.startsWith(PREFIXO_DA_TAG_DE_PREVIA)&&!plano.previas.some(p=>p.tag===tag))throw Error('A prévia '+tag+' fica fora do teto de '+maximo+' prévias pela ordem de versão. Apague uma prévia antiga ou suba PREVIAS_MAXIMO. Nada foi publicado.');
}

function resumoEmMarkdown(resultado){
 const catalogo=JSON.parse(readFileSync(resolve(root,'src/data/docs-catalog.ts'),'utf8').replace(/^export default /,'').replace(/;\s*$/,''));
 const origem='https://'+catalogo.repository.split('/').at(-1)+'.com';
 const itens=['## Publicação composta','','- Raiz: `'+resultado.raiz.tag+'` em `'+resultado.raiz.sha.slice(0,7)+'`'];
 for(const p of resultado.previas)itens.push('- Prévia `'+p.release+'`: `'+p.tag+'` em `'+p.sha.slice(0,7)+'`, '+origem+PREFIXO_DA_PREVIA+p.release+'/');
 if(!resultado.previas.length)itens.push('- Nenhuma prévia ativa');
 if(resultado.foraDoTeto.length)itens.push('- Fora do teto, fora do ar: '+resultado.foraDoTeto.map(t=>'`'+t+'`').join(', '));
 if(resultado.ignoradas.length)itens.push('- Tags producao-* fora do padrão, ignoradas: '+resultado.ignoradas.map(t=>'`'+t+'`').join(', '));
 return itens.join('\n')+'\n';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const valor=nome=>{const i=process.argv.indexOf(nome);return i<0?undefined:process.argv[i+1];};
 try{
  const maximo=valor('--maximo')??String(PREVIAS_MAXIMO);
  if(!/^[0-9]{1,2}$/.test(maximo))throw Error('--maximo precisa ser um número de 0 a 99, recebido '+maximo);
  const resultado=publicar({
   repo:valor('--repo')?resolve(valor('--repo')):root,
   saida:valor('--saida')?resolve(valor('--saida')):null,
   maximo:Number(maximo),
   cache:valor('--cache')?resolve(valor('--cache')):null,
   ensaio:process.argv.includes('--ensaio'),
   tagDoDisparo:valor('--tag-do-disparo')??null
  });
  const json=JSON.stringify(resultado,null,2);
  if(valor('--resumo'))writeFileSync(resolve(valor('--resumo')),json+'\n');
  console.log(json);
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,resumoEmMarkdown(resultado));
 }catch(e){console.error(e.message);process.exitCode=1;}
}
