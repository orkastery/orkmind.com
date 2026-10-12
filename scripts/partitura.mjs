// A Partitura do OrkMind: o design system do kit do dono (Claude Design), com a mesma estrutura de
// tokens e a paleta do OrkMind. partitura/partitura.json é a fonte; este script gera
// partitura/partitura.css no mesmo formato do kit e confere o que o kit exige.
//   node scripts/partitura.mjs              grava partitura/partitura.css a partir do JSON
//   node scripts/partitura.mjs --verificar  sai 1 se algo abaixo falhar:
//     1. o CSS gravado é o que o JSON gera;
//     2. o gerador reproduz, byte a byte, o partitura.css da família a partir do partitura.json da
//        família (partitura/familia/): é a prova de que a estrutura é a mesma do kit;
//     3. o JSON do OrkMind tem as chaves da família, com tipografia, espaço, raio, movimento e
//        breakpoints iguais aos dela; só a cor e o nome da luz do acento mudam;
//     4. contraste (WCAG): texto a 4,5:1 nos dois temas; cada variante -tinta a 4,5:1 em papel e
//        névoa; no tema noite, os preenchimentos de espera, verificado e falha a 4,5:1 (escrevem
//        como texto) e o executando em luar, porque o preenchimento não passa; anel de foco a 3:1;
//     5. acento único: só --espera e a luz do comando usam o primitivo do acento;
//     6. derivação: cada cor marcada em derivacao.cores é a que o método dá.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const arquivos = {
 json: resolve(root, 'partitura/partitura.json'),
 css: resolve(root, 'partitura/partitura.css'),
 familiaJson: resolve(root, 'partitura/familia/orkastery.partitura.json'),
 familiaCss: resolve(root, 'partitura/familia/orkastery.partitura.css')
};
export const ler = arquivo => JSON.parse(readFileSync(arquivo, 'utf8'));
export const sha256 = texto => createHash('sha256').update(texto).digest('hex');

// ---------- Cor: luminância, contraste e OKLCH ----------
const rgb = hex => {
 if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw Error('Cor fora do formato #RRGGBB: ' + hex);
 return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
};
const linear = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const gama = c => c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
export const luminancia = hex => rgb(hex).map(linear).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
export function contraste(a, b) {
 const x = luminancia(a), y = luminancia(b);
 return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function oklab([r, g, b]) {
 const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
 const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
 const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
 return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function linearDeOklab([L, a, b]) {
 const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
 return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
}
export function oklch(hex) {
 const [L, a, b] = oklab(rgb(hex).map(linear));
 return [L, Math.hypot(a, b), (Math.atan2(b, a) * 180 / Math.PI + 360) % 360];
}
const lch = (L, C, H) => linearDeOklab([L, C * Math.cos(H * Math.PI / 180), C * Math.sin(H * Math.PI / 180)]);
const cabe = c => c.every(v => v >= -1e-6 && v <= 1 + 1e-6);
function cromaMaximo(L, H) {
 let lo = 0, hi = 0.5;
 for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (cabe(lch(L, m, H))) lo = m; else hi = m; }
 return lo;
}
const hex = c => '#' + c.map(v => Math.round(Math.min(1, Math.max(0, gama(v))) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
export const cromaRelativo = cor => { const [L, C, H] = oklch(cor); return C / Math.max(cromaMaximo(L, H), 1e-9); };
// O método: a cor do papel na família (origem), com a mesma luminância relativa (e, com ela, o
// mesmo contraste contra qualquer fundo), o mesmo croma relativo e o matiz próprio.
export function derivar(origem, matiz) {
 const k = cromaRelativo(origem), alvo = luminancia(origem);
 let lo = 0, hi = 1, cor = origem;
 for (let i = 0; i < 50; i++) {
  const L = (lo + hi) / 2;
  cor = hex(lch(L, k * cromaMaximo(L, matiz), matiz));
  if (luminancia(cor) < alvo) lo = L; else hi = L;
 }
 return cor;
}

// ---------- Gerador: o formato do partitura.css do kit ----------
const valor = v => typeof v === 'object' && v !== null ? v.valor : v;
const nota = v => typeof v === 'object' && v !== null ? v.nota : undefined;
const ref = v => String(v).replace(/\{cor\.([a-z0-9-]+)\}/g, 'var(--$1)');
const comColuna = (linha, comentario, coluna) => linha + ' '.repeat(Math.max(0, coluna - linha.length)) + `/* ${comentario} */`;
const virgula = n => n.toFixed(1).replace('.', ',');
// Nome de exibição dos primitivos de estado, para os comentários que o kit escreve por extenso.
const ROTULO = {latao: 'latão', patina: 'pátina', regencia: 'regência', brasa: 'brasa', jade: 'jade', agua: 'água'};
const primitivoDe = (sem, chave) => String(sem[chave]).match(/\{cor\.([a-z0-9-]+)\}/)?.[1];
const SEM_GRUPOS = [
 ['chao', 'superficie', 'superficie-2', 'linha', 'linha-forte', 'texto', 'texto-2', 'texto-3', 'acao', 'sobre-acao', 'campo'],
 ['espera', 'espera-texto', 'executando', 'executando-texto', 'verificado', 'verificado-texto', 'falha', 'falha-texto'],
 ['foco', 'anel-foco']
];
const luzDe = sem => Object.keys(sem).find(k => k.startsWith('luz-'));

export function gerarCss(p) {
 const L = [], cor = p.cor, dia = p.semantico.dia, noite = p.semantico.noite, tipo = p.tipografia, mov = p.movimento;
 const de = p.marca === 'Orkastery' ? 'da' : 'do';
 const versao = String(p.versao).split('.').slice(0, 2).join('.');
 L.push(`/* Partitura · tokens ${de} ${p.marca} · v${versao}`);
 L.push('   Nomes em PT. Primitivos não mudam entre temas; os semânticos mudam.');
 L.push('   Uso: <html data-tema="dia"> ou <html data-tema="noite">. Sem atributo = dia. */');
 L.push('', ':root {', '  /* ---------- Primitivos · dia ---------- */');
 const comNota = (linha, n) => { L.push(linha); if (n) L.push('', `  /* ${n} */`); };
 for (const [k, v] of Object.entries(cor)) comNota(`  --${k}: ${valor(v)};`, nota(v));
 for (const k of ['titulo', 'texto', 'mono']) L.push(`  --f-${k}: ${tipo.familia[k]};`);
 L.push('');
 for (const [k, v] of Object.entries(tipo.escala)) L.push(comColuna(`  --${k}: ${valor(v)};`, nota(v), 46));
 L.push('');
 for (const k of ['titulo', 'texto', 'destaque']) L.push(`  --peso-${k}: ${tipo.peso[k]};`);
 comNota(`  --espaco-rotulo: ${valor(tipo.espacoRotulo)};`, nota(tipo.espacoRotulo));
 for (const [k, v] of Object.entries(p.espaco)) comNota(`  --${k}: ${valor(v)};`, nota(v));
 for (const [k, v] of Object.entries(p.raio)) comNota(`  --${k}: ${valor(v)};`, nota(v));
 L.push(`  --curva: ${mov.curva};`);
 for (const [k, v] of Object.entries(mov.duracao)) L.push(comColuna(`  --${k === 'pulso' ? 'pulso' : 'dur-' + k}: ${valor(v)};`, nota(v), 24));
 L.push('', '  /* ---------- Semânticos · dia (padrão) ---------- */');
 for (const grupo of SEM_GRUPOS) { for (const k of grupo) L.push(`  --${k}: ${ref(dia[k])};`); L.push(''); }
 L.push('  /* Sombras frias e quase invisíveis. Separe por linha antes de separar por sombra. */');
 for (const k of ['sombra-1', 'sombra-2', 'sombra-3', luzDe(dia)]) L.push(`  --${k}: ${ref(dia[k])};`);
 L.push('', '  color-scheme: light;', '}', '', '[data-tema="noite"] {');
 const difere = k => noite[k] !== dia[k];
 for (const k of SEM_GRUPOS[0]) if (difere(k)) L.push(`  --${k}: ${ref(noite[k])};`);
 const [espera, verificado, falha, executando] = ['espera', 'verificado', 'falha', 'executando'].map(k => primitivoDe(dia, k));
 const nome = k => ROTULO[k] || k, maiuscula = t => t[0].toUpperCase() + t.slice(1);
 const razaoExecutando = contraste(valor(cor[executando]), valor(cor['noite-2']));
 L.push('', `  /* No noite, ${nome(espera)}, ${nome(verificado)} e ${nome(falha)} passam de 4,5:1 como texto.`);
 L.push(`     ${maiuscula(nome(executando))} não passa (${virgula(razaoExecutando)}:1 em noite-2): o rótulo de "executando" vai em luar, e a cor fica no ponto. */`);
 for (const k of ['espera-texto', 'executando-texto', 'verificado-texto', 'falha-texto']) if (difere(k)) L.push(`  --${k}: ${ref(noite[k])};`);
 L.push('');
 for (const k of ['foco', 'anel-foco', 'sombra-1', 'sombra-2', 'sombra-3', luzDe(noite)]) if (difere(k)) L.push(`  --${k}: ${ref(noite[k])};`);
 L.push('', '  color-scheme: dark;', '}', '');
 L.push('@media (prefers-reduced-motion: reduce) {');
 L.push(`  :root { --dur-curta: 0ms; --dur-media: 0ms; --dur-longa: 0ms; }`);
 L.push('  *, *::before, *::after { animation: none !important; transition: none !important; }', '}', '');
 const bp = p.breakpoints;
 L.push('/* Responsividade (referência; variáveis não funcionam em @media):');
 L.push(`   ${Object.entries(bp).map(([k, v]) => `${k} ${v}px`).join(' · ')} */`);
 return L.join('\n') + '\n';
}

// ---------- Verificação ----------
const iguais = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const cores = p => Object.fromEntries(Object.entries(p.cor).map(([k, v]) => [k, valor(v)]));
const resolver = (p, tema, k) => { const v = p.semantico[tema][k], m = String(v).match(/^\{cor\.([a-z0-9-]+)\}$/); return m ? valor(p.cor[m[1]]) : v; };

export function verificar() {
 const erros = [], p = ler(arquivos.json), familia = ler(arquivos.familiaJson);
 // 1. sincronia
 if (!existsSync(arquivos.css) || readFileSync(arquivos.css, 'utf8') !== gerarCss(p)) erros.push('partitura/partitura.css fora de sincronia com partitura/partitura.json: rode npm run partitura');
 // 2. o gerador reproduz o CSS da família
 if (readFileSync(arquivos.familiaCss, 'utf8') !== gerarCss(familia)) erros.push('O gerador não reproduz o partitura.css da família a partir do partitura.json dela');
 // 3. mesma estrutura
 const chavesExtra = ['derivacao'];
 if (!iguais(Object.keys(p).filter(k => !chavesExtra.includes(k)), Object.keys(familia))) erros.push('Chaves de topo diferentes das da família');
 for (const k of ['tipografia', 'espaco', 'raio', 'movimento', 'breakpoints']) if (!iguais(p[k], familia[k])) erros.push(`${k} diferente da família`);
 if (!iguais(Object.keys(p.regras), Object.keys(familia.regras))) erros.push('regras com chaves diferentes das da família');
 const ck = Object.keys(p.cor), fk = Object.keys(familia.cor);
 if (ck.length !== fk.length) erros.push('Número de primitivos de cor diferente da família');
 const acento = primitivoDe(p.semantico.dia, 'espera'), acentoFamilia = primitivoDe(familia.semantico.dia, 'espera');
 for (const tema of ['dia', 'noite']) {
  const nossas = Object.keys(p.semantico[tema]).map(k => k === `luz-${acento}` ? `luz-${acentoFamilia}` : k);
  if (!iguais(nossas, Object.keys(familia.semantico[tema]))) erros.push(`Semânticos de ${tema} diferentes dos da família`);
 }
 // Os primitivos neutros (dia e noite) são os da família, nos mesmos nomes e valores.
 for (const k of ['nevoa', 'papel', 'trilho', 'tinta', 'tinta-2', 'tinta-3', 'noite', 'noite-2', 'noite-3', 'luar', 'luar-2']) if (valor(p.cor[k]) !== valor(familia.cor[k])) erros.push(`Neutro ${k} diferente da família`);
 // 4. contraste
 const c = cores(p), medidas = [];
 const exige = (frente, fundo, minimo, motivo) => {
  const r = contraste(frente.cor, fundo.cor);
  medidas.push({par: `${frente.nome}/${fundo.nome}`, razao: Number(r.toFixed(2)), minimo, motivo});
  if (r < minimo) erros.push(`Contraste ${frente.nome}/${fundo.nome}: ${r.toFixed(2)} < ${minimo} (${motivo})`);
 };
 const P = nome => ({nome, cor: c[nome]});
 for (const t of ['tinta', 'tinta-2', 'tinta-3']) for (const f of ['nevoa', 'papel']) exige(P(t), P(f), 4.5, 'texto no dia');
 for (const t of ['luar', 'luar-2']) for (const f of ['noite', 'noite-2']) exige(P(t), P(f), 4.5, 'texto no noite');
 for (const estado of ['espera', 'executando', 'verificado', 'falha']) {
  const tinta = primitivoDe(p.semantico.dia, estado + '-texto');
  if (!tinta?.endsWith('-tinta')) erros.push(`${estado}-texto do dia não usa uma variante -tinta`);
  else for (const f of ['nevoa', 'papel']) exige(P(tinta), P(f), 4.5, `texto de ${estado} no dia`);
  const preenchimento = primitivoDe(p.semantico.dia, estado);
  if (estado === 'executando') {
   if (resolver(p, 'noite', 'executando-texto') !== c.luar) erros.push('executando-texto do noite deveria ser luar');
  } else {
   if (resolver(p, 'noite', estado + '-texto') !== c[preenchimento]) erros.push(`${estado}-texto do noite deveria ser o preenchimento`);
   for (const f of ['noite', 'noite-2']) exige(P(preenchimento), P(f), 4.5, `texto de ${estado} no noite`);
  }
 }
 exige({nome: 'foco (dia)', cor: resolver(p, 'dia', 'foco')}, P('nevoa'), 3, 'anel de foco no dia');
 exige({nome: 'foco (noite)', cor: resolver(p, 'noite', 'foco')}, P('noite'), 3, 'anel de foco no noite');
 // 5. acento único
 for (const tema of ['dia', 'noite']) for (const [k, v] of Object.entries(p.semantico[tema])) {
  const usa = new RegExp(`\\{cor\\.${acento}(-tinta)?\\}`).test(String(v));
  if (usa && !['espera', 'espera-texto'].includes(k)) erros.push(`Acento ${acento} em --${k} (${tema}): o acento é só de espera você`);
 }
 const luz = String(p.semantico.dia[`luz-${acento}`] || '');
 const [r, g, b] = rgb(c[acento]).map(v => Math.round(v * 255));
 if (!luz.includes(`rgba(${r}, ${g}, ${b},`)) erros.push(`--luz-${acento} não usa a cor do acento`);
 // 6. derivação
 const der = p.derivacao || {};
 for (const [nomeCor, d] of Object.entries(der.cores || {})) {
  const origem = valor(familia.cor[d.origem]);
  if (!origem) { erros.push(`${nomeCor}: origem ${d.origem} não existe na família`); continue; }
  const matiz = typeof d.matiz === 'number' ? d.matiz : oklch(valor(p.cor[d.matiz]))[2];
  const esperado = derivar(origem, matiz);
  if (c[nomeCor] !== esperado) erros.push(`${nomeCor}: ${c[nomeCor]} não é o que o método dá (${esperado})`);
 }
 if (der.familia?.jsonSha256 && der.familia.jsonSha256 !== sha256(readFileSync(arquivos.familiaJson))) erros.push('partitura.json da família diferente do registrado em derivacao.familia');
 if (der.familia?.cssSha256 && der.familia.cssSha256 !== sha256(readFileSync(arquivos.familiaCss))) erros.push('partitura.css da família diferente do registrado em derivacao.familia');
 if (erros.length) throw Error('Partitura fora do kit:\n' + erros.join('\n'));
 return {primitivos: ck.length, acento, derivadas: Object.keys(der.cores || {}).length, pares: medidas.length, menorTexto: Math.min(...medidas.filter(m => m.minimo === 4.5).map(m => m.razao)), medidas};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
 try {
  if (process.argv.includes('--verificar')) { const {medidas, ...resumo} = verificar(); console.log(JSON.stringify(resumo)); }
  else if (process.argv.includes('--medidas')) console.log(JSON.stringify(verificar().medidas, null, 1));
  else { writeFileSync(arquivos.css, gerarCss(ler(arquivos.json))); console.log(JSON.stringify({escrito: 'partitura/partitura.css'})); }
 } catch (e) { console.error(e.message); process.exitCode = 1; }
}
