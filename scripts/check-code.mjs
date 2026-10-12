import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';
import {pages,files,distArg,walk,attrs,content} from './check-links.mjs';

// Auditoria do código no HTML gerado: nenhum comando, caminho, flag ou identificador técnico
// fora de code (ou de tspan.code no SVG) na prosa visível. Independe do renderizador
// (src/lib/technical-text.mjs): lê o resultado, não a marcação.

// Executáveis citados no site. Nome de executável na prosa é código, sozinho ou com subcomando.
export const executables = ['orkmind','ork','pip','pip3','python','python3','npm','npx','git','pytest','ruff','mypy','uv','docker','psql','twine'];
// PascalCase composto que é nome de produto, não classe: fica em prosa.
export const productNames = ['OrkMind','OpenClaw','GitHub'];
// Prosa com cara de arquivo ou caminho, exata: nome de produto com sufixo e abreviação.
export const proseExceptions = ['Node.js','e/ou','y/o','and/or'];
const domain = /^(?:[\w-]+\.)+(?:com|org|net|io|dev|br)$/;

// Fronteiras por letra Unicode: "Documentação/Coleções" do breadcrumb não vira caminho.
const before = String.raw`(?<![\p{L}\p{N}_-])`, after = String.raw`(?![\p{L}\p{N}_])`;
export const patterns = [
 ['executable', new RegExp(String.raw`${before}(?:${executables.join('|')})(?![\p{L}\p{N}_]|\.[\p{L}])`, 'gu')],
 ['flag', new RegExp(String.raw`${before}--[a-z][\w-]*`, 'gu')],
 ['environment', new RegExp(String.raw`${before}(?:[A-Z][A-Z0-9]*_)+[A-Z0-9]+(?:=[^\s,;]+)?${after}`, 'gu')],
 ['snake_case', new RegExp(String.raw`${before}_?[a-z][a-z0-9]*(?:_[a-z0-9]+)+${after}|${before}_[a-z][a-z0-9]*${after}`, 'gu')],
 ['camelCase', new RegExp(String.raw`${before}[a-z][a-z0-9]*(?:[A-Z][a-z0-9]+)+${after}`, 'gu')],
 ['PascalCase', new RegExp(String.raw`${before}[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+${after}`, 'gu')],
 ['file', new RegExp(String.raw`${before}[\w.-]*\.(?:md|toml|py|json|jsonl|ya?ml|ts|js|mjs|cjs|sh|sql|txt|env|cfg|ini|lock|astro|css|html)${after}`, 'gu')],
 ['dotted', new RegExp(String.raw`${before}[a-z][\w-]*(?:\.(?:[a-z][\w-]*|\*))+(?:\/v\d+)?`, 'gu')],
 ['path', new RegExp(String.raw`(?:~\/|\.{1,2}\/|${before}\.?[a-z][a-z0-9_.-]*\/)(?:[\w.@*<>-]|\/)+`, 'gu')],
 ['placeholder', /<[a-z][\w-]*>/gu],
 ['wiki link', /\[\[[^\]\n]+\]\]/gu],
];
const ignored = (type, value) => proseExceptions.includes(value) || (type === 'PascalCase' && productNames.includes(value)) || ((type === 'dotted' || type === 'path') && domain.test(value));

// Trechos técnicos de um texto já sem o código, unidos quando se sobrepõem.
export function findings(text) {
 const ranges = [];
 for (const [type, pattern] of patterns) for (const m of text.matchAll(pattern)) {
  const value = m[0].replace(/[.,;:]+$/, '');
  if (!ignored(type, value)) ranges.push([m.index, m.index + value.length]);
 }
 ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
 const merged = [];
 for (const r of ranges) { const last = merged.at(-1); if (last && r[0] < last[1]) last[1] = Math.max(last[1], r[1]); else merged.push([...r]); }
 return merged.map(([s, e]) => text.slice(s, e));
}

const blocks = new Set(['address','article','aside','blockquote','br','div','dl','dt','dd','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','header','hr','li','main','nav','ol','p','section','svg','text','table','td','th','tr','ul','details','summary','fieldset','legend','option','select','textarea']);
const excluded = new Set(['head','script','style','template','code','pre','noscript']);
// Elementos que o layout separa (item de menu, rótulo de paginação, botão): fronteira de palavra.
const spaced = new Set(['a','small','button','label']);
const isCode = node => node.tagName === 'code' || (node.tagName === 'tspan' && (attrs(node).class || '').split(/\s+/).includes('code'));
// Prosa renderizada: blocos separam com \u0000, código vira \u0001. O title e o desc do SVG são
// texto acessível sem marcação possível (como o title da página); ficam fora.
export function prose(node, inSvg = false) {
 if (isCode(node)) return '\u0001';
 if (excluded.has(node.tagName) || (inSvg && ['title','desc'].includes(node.tagName))) return '\u0000';
 if (node.nodeName === '#text') return node.value;
 const svg = inSvg || node.tagName === 'svg';
 const value = (node.childNodes || []).map(child => prose(child, svg)).join('');
 if (blocks.has(node.tagName) || (svg && node.tagName === 'tspan' && 'x' in attrs(node))) return '\u0000' + value + '\u0000';
 return spaced.has(node.tagName) ? ' ' + value + ' ' : value;
}
export function violations(html) {
 const dom = typeof html === 'string' ? parse(html) : html;
 return [...new Set(prose(dom).split(/[\u0000\u0001]/).flatMap(findings))];
}
// Crase na prosa visível é marcação que vazou: o renderizador nunca emite crase. Pega o
// identificador de uma palavra (rule, get, pending) que a auditoria por padrão não vê.
export function backtickViolations(html) {
 const dom = typeof html === 'string' ? parse(html) : html;
 return prose(dom).split(/[\u0000\u0001]/).filter(text => text.includes('`')).map(text => text.trim().slice(0, 80));
}
// Código maior que a coluna estreita (mais de 30 caracteres, a largura de uma linha a 320 px)
// precisa de ponto de quebra (<wbr> ou espaço); sem ele, quebraria no meio da palavra.
export function breakPointViolations(html) {
 const dom = typeof html === 'string' ? parse(html) : html;
 return walk(dom).filter(n => n.tagName === 'code' && n.parentNode?.tagName !== 'pre').filter(code => {
  const text = content(code);
  return text.length > 30 && !/\s/.test(text) && !walk(code).some(n => n.tagName === 'wbr');
 }).map(code => content(code));
}

// Código com classe própria dentro de parágrafo fugiria da escala comum do bloco.
export function scaleViolations(html) {
 const dom = typeof html === 'string' ? parse(html) : html;
 return walk(dom).filter(n => n.tagName === 'p').flatMap(p => walk(p).filter(n => n.tagName === 'code' && attrs(n).class).map(n => `<code class="${attrs(n).class}">`));
}
// A unidade sem quebra não encolhe: colada a mais de 12 caracteres, estouraria a coluna estreita.
export function glueViolations(html) {
 const dom = typeof html === 'string' ? parse(html) : html;
 return walk(dom).filter(n => n.tagName === 'span' && (attrs(n).class || '').split(/\s+/).includes('code-unit')).flatMap(unit => {
  const glued = content(unit).length - walk(unit).filter(n => n.tagName === 'code').map(content).join('').length;
  return glued > 12 ? [content(unit)] : [];
 });
}
// Canários do CSS gerado: o chip atômico, a unidade sem quebra e o sublinhado do link no chip.
const rules = css => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({selectors: m[1].split(',').map(s => s.trim()), declarations: m[2]}));
export function cssCanaries(css) {
 const all = rules(css), has = (selector, ...declarations) => all.some(r => r.selectors.includes(selector) && declarations.every(d => d.test(r.declarations)));
 if (!has(':not(pre)>code', /display:\s*inline-block/, /max-width:\s*100%/)) throw Error('Inline code can split across lines: missing atomic chip rule');
 if (!has('.code-unit', /white-space:\s*nowrap/)) throw Error('Adjacent text can detach from inline code: missing .code-unit rule');
 if (!has('a .code-unit>code', /text-decoration:\s*inherit/) || !has('a>code', /text-decoration:\s*inherit/)) throw Error('Link underline can miss inline code: missing text-decoration rule');
 return true;
}

export function checkCode(dist = distArg()) {
 const all = pages(dist), errors = [], scaled = [], glued = [], leaked = [], unbreakable = [];
 for (const page of all) {
  for (const item of violations(page.dom)) errors.push(`${page.path}: ${item}`);
  for (const item of backtickViolations(page.dom)) leaked.push(`${page.path}: ${item}`);
  for (const item of breakPointViolations(page.dom)) unbreakable.push(`${page.path}: ${item}`);
  for (const item of scaleViolations(page.dom)) scaled.push(`${page.path}: ${item}`);
  for (const item of glueViolations(page.dom)) glued.push(`${page.path}: ${item}`);
 }
 if (errors.length) throw Error('Technical text outside code:\n' + errors.join('\n'));
 if (leaked.length) throw Error('Backtick leaked into visible text:\n' + leaked.join('\n'));
 if (unbreakable.length) throw Error('Long inline code without a break point:\n' + unbreakable.join('\n'));
 if (scaled.length) throw Error('Inline code with its own type scale:\n' + scaled.join('\n'));
 if (glued.length) throw Error('Inline code unit glues more than 12 characters:\n' + glued.join('\n'));
 const css = files(dist).filter(f => f.endsWith('.css')).map(f => readFileSync(f, 'utf8')).join('\n') + all.flatMap(p => p.nodes.filter(n => n.tagName === 'style').map(content)).join('\n');
 cssCanaries(css);
 const codes = all.reduce((sum, p) => sum + p.nodes.filter(isCode).length, 0);
 return {pages: all.length, inlineCodes: codes, unformatted: 0, leakedBackticks: 0, unbreakableCodes: 0, scaledInlineCode: 0, longCodeUnits: 0, proseExceptions: proseExceptions.length + productNames.length};
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { try { console.log(JSON.stringify(checkCode())); } catch (error) { console.error(error.message); process.exitCode = 1; } }
