import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {pages,files,root,distArg,walk,attrs,content} from './check-links.mjs';
import {verificar} from './partitura.mjs';

// Conferência da Partitura no site gerado (DESIGN.md do kit do dono, seção 3 e checklist): os tokens
// em sincronia com o JSON e a derivação da paleta (scripts/partitura.mjs), o jade só onde o kit
// deixa, foco por anel, só as três famílias do kit, nenhuma cor solta fora dos tokens, código e
// comando sempre noite, nenhum recurso de fora, a marca pelos arquivos dela e nenhuma palavra que o
// kit proíbe. Cada regra é uma função pura; os canários de scripts/design-check.test.mjs provam que
// cada uma reprova a mutação que deve pegar.

// Regras do CSS, sem o escopo do Astro no seletor. Pega também as regras dentro de @media.
export const regras=css=>[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m=>({seletor:m[1].trim().replace(/\[data-astro-cid-[a-z0-9]+\]/g,''),declaracoes:m[2]}));
const blocoDeTokens=s=>/^(?::root|\[data-tema=(?:"noite"|noite)\])$/.test(s);

// 1. O jade (acento único) só no que espera você e na luz do comando de instalação. Definir os
// semânticos nos blocos de tokens não é uso.
export const ACENTO=/var\(--(?:espera|espera-texto|jade|jade-tinta|luz-jade)\)/;
export const ACENTO_PERMITIDO=[/^\.comando$/,/^\.comando-hero$/,/^\.separador-fio span$/,/^\.hero-ponto-espera$/,/^\.chip-espera(?: \.chip-ponto)?$/];
export function acentoForaDoLugar(css){
 return regras(css).filter(r=>ACENTO.test(r.declaracoes)&&!blocoDeTokens(r.seletor)).flatMap(r=>r.seletor.split(',').map(s=>s.trim()).filter(s=>!ACENTO_PERMITIDO.some(p=>p.test(s))));
}

// 2. Foco visível: o anel do kit em :focus-visible, e nenhum outline:none sem o anel no lugar
// (fora o foco que não é de teclado e o main, que só recebe foco pelo link de pular).
export function focoSemAnel(css){
 const todas=regras(css),erros=[];
 if(!todas.some(r=>r.seletor.split(',').map(s=>s.trim()).includes(':focus-visible')&&/box-shadow:\s*var\(--anel-foco\)/.test(r.declaracoes)))erros.push(':focus-visible sem o anel do kit');
 for(const r of todas)if(/outline:\s*(?:none|0)\s*(?:;|$)/.test(r.declaracoes)&&!/box-shadow:\s*var\(--anel-foco\)/.test(r.declaracoes)&&!['main:focus',':focus:not(:focus-visible)'].includes(r.seletor))erros.push(r.seletor);
 return erros;
}

// 3. Só as famílias do kit: Geist nos títulos, Hanken Grotesk no texto, IBM Plex Mono na prova.
export const FAMILIAS=['Geist','Hanken Grotesk','IBM Plex Mono'];
const GENERICAS=['ui-sans-serif','system-ui','sans-serif','ui-monospace','SFMono-Regular','monospace','inherit'];
export function fontesForaDoKit(css){
 const erros=[];
 for(const r of regras(css))for(const m of r.declaracoes.matchAll(/font-family:\s*([^;]+)/g))for(const nome of m[1].split(',').map(n=>n.trim().replace(/^['"]|['"]$/g,'')))
  if(!nome.startsWith('var(')&&!FAMILIAS.includes(nome)&&!GENERICAS.includes(nome))erros.push(nome);
 for(const m of css.matchAll(/(?:^|[;{\s])font:\s*([^;}]+)/g))for(const nome of ['Clash Display','Geist Sans','Geist Mono','Inter','Roboto','Bricolage','Fraunces'])if(m[1].includes(nome))erros.push(nome);
 return [...new Set(erros)];
}

// 4. Nenhuma cor solta: hex, rgb e hsl só nos blocos de tokens (primitivos, sombras e a luz).
export function corSolta(css){
 return regras(css).filter(r=>!blocoDeTokens(r.seletor)&&/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/.test(r.declaracoes)).map(r=>r.seletor);
}
export function corSoltaNoHtml(dom){
 return walk(dom).filter(n=>/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/.test(attrs(n).style||'')).map(n=>n.tagName+'.'+(attrs(n).class||''));
}

// 5. Bloco de código e comando copiável são sempre noite: todo <pre> e todo terminal (região com
// rolagem de saída real) tem data-tema="noite" nele ou num ancestral; o botão de copiar mora no
// .comando, cujo fundo é noite-2 no CSS.
const noite=n=>{for(let x=n;x;x=x.parentNode)if(attrs(x)['data-tema']==='noite')return true;return false;};
export function codigoForaDaNoite(dom){
 return walk(dom).filter(n=>n.tagName==='pre'||(attrs(n).class||'').split(/\s+/).some(c=>c==='terminal'||c==='avisos')).filter(n=>!noite(n)).map(n=>n.tagName+'.'+(attrs(n).class||''));
}
export function comandoForaDaNoite(dom,css){
 const erros=walk(dom).filter(n=>'data-copiar' in attrs(n)).filter(n=>!/(?:^|\s)comando(?:\s|$)/.test(attrs(n.parentNode).class||'')).map(n=>attrs(n)['data-copiar']);
 if(!regras(css).some(r=>r.seletor==='.comando-botao'&&/background:\s*var\(--noite-2\)/.test(r.declaracoes)))erros.push('.comando-botao sem o fundo noite-2');
 return erros;
}

// 6. Nenhum recurso de fora: folha de estilo, script, fonte, imagem e ícone saem do próprio site.
const externo=v=>/^(?:https?:)?\/\//i.test(v||'');
export function recursosDeFora(dom,css){
 const erros=[];
 for(const n of walk(dom)){const a=attrs(n);
  if(n.tagName==='link'&&['stylesheet','preload','icon','apple-touch-icon','manifest','modulepreload'].some(r=>(a.rel||'').split(/\s+/).includes(r))&&externo(a.href))erros.push('link '+a.href);
  if(['script','img','source','iframe','video','audio'].includes(n.tagName)&&externo(a.src))erros.push(n.tagName+' '+a.src);
 }
 for(const m of css.matchAll(/url\(\s*['"]?([^'")]+)/g))if(externo(m[1]))erros.push('url '+m[1]);
 for(const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'");]+)/g))erros.push('@import '+m[1]);
 return erros;
}

// 7. A marca pelos arquivos dela: a assinatura para fundo claro no cabeçalho e a de fundo escuro no
// rodapé (que é noite); nenhuma imagem da marca fora de /marca/.
export function marcaFora(dom){
 const erros=[],imgs=walk(dom).filter(n=>n.tagName==='img');
 const dentro=(n,tag)=>{for(let x=n;x;x=x.parentNode)if(x.tagName===tag)return true;return false;};
 for(const n of imgs){const src=attrs(n).src||'';
  if(/assinatura|simbolo/.test(src)&&!/\/marca\/(?:assinatura|simbolo)-fundo-(?:claro|escuro)\.svg$/.test(src))erros.push(src);
  if(/fundo-claro/.test(src)&&noite(n))erros.push('fundo claro no tema noite: '+src);
  if(/fundo-escuro/.test(src)&&!noite(n))erros.push('fundo escuro no tema dia: '+src);
  if(dentro(n,'header')&&!/assinatura-fundo-claro\.svg$/.test(src))erros.push('cabeçalho: '+src);
  if(dentro(n,'footer')&&!/assinatura-fundo-escuro\.svg$/.test(src))erros.push('rodapé: '+src);
 }
 return erros;
}

// 8. Voz do kit: nenhum termo proibido no texto visível (e "pausa" fica de fora em qualquer
// sentido, porque o kit pede "ponto de HITL" no lugar) e nenhum travessão.
export const PROIBIDAS=/\b(?:afrouxar|afrouxa|afrouxam|batuta|metr[ôo]nomo|bernstein|disruptiv[oa]s?|pausas?|pauses?|paused)\b/iu;
export function vozForaDoKit(texto){
 const erros=[];
 const m=texto.match(PROIBIDAS);if(m)erros.push('termo proibido: '+m[0]);
 if(/[‒-―]/.test(texto))erros.push('travessão');
 return erros;
}
const visivel=dom=>{const corpo=walk(dom).find(n=>n.tagName==='body');return corpo?content(corpo):'';};

// 9. As licenças das fontes servidas acompanham o site.
export function licencasFaltando(publico=resolve(root,'public')){
 return ['geist','hanken-grotesk','ibm-plex-mono'].filter(n=>{const f=resolve(publico,'licenses',n+'.txt');return !existsSync(f)||!/SIL Open Font License/i.test(readFileSync(f,'utf8'));});
}

export function checkDesign(dist=distArg()){
 const {medidas,...partitura}=verificar();
 const todas=pages(dist).filter(p=>p.redirecionamento===null);
 const css=files(dist).filter(f=>f.endsWith('.css')).map(f=>readFileSync(f,'utf8')).join('\n')+todas.flatMap(p=>p.nodes.filter(n=>n.tagName==='style').map(content)).join('\n');
 const falhas=[];
 const juntar=(nome,lista)=>{if(lista.length)falhas.push(nome+': '+[...new Set(lista)].slice(0,8).join(', '));};
 juntar('jade fora do lugar',acentoForaDoLugar(css));
 juntar('foco sem anel',focoSemAnel(css));
 juntar('fonte fora do kit',fontesForaDoKit(css));
 juntar('cor solta no CSS',corSolta(css));
 juntar('licença de fonte',licencasFaltando());
 for(const p of todas){
  juntar('cor solta no HTML '+p.path,corSoltaNoHtml(p.dom));
  juntar('código fora da noite '+p.path,codigoForaDaNoite(p.dom));
  juntar('comando fora da noite '+p.path,comandoForaDaNoite(p.dom,css));
  juntar('recurso de fora '+p.path,recursosDeFora(p.dom,css));
  juntar('marca '+p.path,marcaFora(p.dom));
  juntar('voz '+p.path,vozForaDoKit(visivel(p.dom)));
 }
 if(falhas.length)throw Error('Partitura violada:\n'+falhas.join('\n'));
 return {pages:todas.length,partitura,acento:'jade',familias:FAMILIAS.length,regras:['acento','foco','fontes','cor-solta','codigo-noite','comando-noite','recursos-de-fora','marca','voz','licencas']};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(checkDesign()));}catch(e){console.error(e.message);process.exitCode=1;}}
