// A lógica da home em funções puras, no molde do site do Orkastery (a classe Component do Claude
// Design, portada). O build chama estas funções com o estado inicial e renderiza o HTML estático; o
// navegador (src/scripts/home.ts) chama as mesmas com o estado que muda (relógio, cliques, rolagem).
// As cores são da Partitura do OrkMind (partitura/partitura.css): um nome de token vira var(--nome)
// e um tom intermediário vira color-mix de tokens. O jade (--espera) só pinta o que espera você: a
// regra protegida recusada, a entrada em conflito e o conteúdo que fica para a revisão da manhã.

export const ETAPAS = 6;
// Etapa (de 0 a 5) em que a entrada suspeita fica retida: Governar.
export const RETIDA_EM = 2;
export const ESTADO_INICIAL = Object.freeze({tick: 0, stage: 2, integration: 0, np: 0});
export const TICK_MS = 2400;

// Tom de um token sobre outro (ou sobre o transparente), só com variáveis da Partitura.
export const mistura = (token, pct, base = 'transparent') => `color-mix(in srgb,var(--${token}) ${pct}%,${base === 'transparent' ? base : `var(--${base})`})`;
// Papéis de cor da home: estado em -texto sobre o tom do próprio estado (4,5:1 ou mais nos dois temas).
export const C = {
 ink: 'texto', ink2: 'texto-2', ink3: 'texto-3',
 wait: 'espera', waitT: 'espera-texto', waitS: mistura('espera', 22, 'superficie'),
 ok: 'verificado', okT: 'verificado-texto', okS: mistura('verificado', 14, 'superficie'),
 run: 'executando', runT: 'executando-texto', runS: mistura('executando', 14, 'superficie'),
 fail: 'falha', failT: 'falha-texto', failS: mistura('falha', 14, 'superficie'),
 track: 'linha', done: mistura('texto-3', 60, 'linha')
};
export const cor = nome => nome === 'transparent' || nome.includes('(') ? nome : `var(--${nome})`;
const fill = (texto, valores) => texto.replace(/\{(\w+)\}/g, (m, k) => (k in valores ? String(valores[k]) : m));
export const preencher = fill;

// Rótulo acessível da barra de seis etapas (kit: aria-label com o estado de cada fase).
export function barra(t, estado, cur) {
 const w = t.governance.stageWords, agora = {run: w.now, hold: w.wait, retained: w.held, ok: w.done}[estado];
 return t.path.stages.map((nome, i) => `${nome}: ${estado === 'ok' || i < cur ? w.done : i === cur ? agora : w.next}`).join(', ');
}

// orkmind list (05): a etapa e o estado de cada entrada pelo relógio. A entrada em conflito espera
// você parada na etapa dela; a suspeita fica retida em Governar; as outras andam uma etapa a cada
// três tiques e, depois de Auditar, ficam no contexto. O glifo da etapa segue o kit (… ● ✓ ×).
export function entradas(t, tick) {
 const g = t.governance, nomes = t.path.stages;
 return g.entries.map(e => {
  let cur, st, changed = false;
  const at = k => (e.p + Math.floor((k + e.o) / 3)) % (ETAPAS + 1);
  if (e.hold) { cur = e.p; st = 'hold'; }
  else if (e.retained) { cur = RETIDA_EM; st = 'retained'; }
  else { cur = at(tick); st = cur === ETAPAS ? 'ok' : 'run'; changed = tick > 0 && cur !== at(tick - 1); }
  const col = {run: [C.run, C.runT], hold: [C.wait, C.waitT], ok: [C.ok, C.okT], retained: [C.fail, C.failT]}[st];
  const segs = nomes.map((_, i) => st === 'ok' ? C.ok : i < cur ? C.done : i === cur ? col[0] : C.track);
  const glifo = {run: '…', hold: '●', ok: '✓', retained: '×'}[st];
  const etapa = (st === 'ok' ? nomes[ETAPAS - 1] : nomes[cur]).toUpperCase() + ' ' + glifo;
  return {...e, estado: st, segs, dot: col[0], fg: col[1], label: g.states[st], phase: etapa, barra: barra(t, st, st === 'ok' ? ETAPAS : cur),
   rowBg: changed ? mistura(st === 'ok' ? 'verificado' : 'executando', 7, 'superficie') : 'transparent'};
 });
}

// Diagrama do sistema (01): a função ativa da camada, os oito nós em três grupos com o estado de
// cada um, o histórico de versões e a grade das 23 coleções (quem leu cada coleção neste turno).
// O nó guardado recusa a edição de uma regra protegida por cinco tiques a cada doze.
export const GRUPO_CORES = ['texto', 'texto-3', mistura('texto-3', 45, 'linha')];
export function topo(t, tick) {
 const s = t.system, MC = GRUPO_CORES;
 const recusa = (tick % 12) >= 4 && (tick % 12) < 9;
 const segs = k => { const cur = k % (ETAPAS + 1); return Array.from({length: ETAPAS}, (_, i) => cur === ETAPAS ? C.ok : i < cur ? C.done : i === cur ? C.run : C.track); };
 const act = tick % s.fns.length;
 let seed = 0;
 const groups = s.groups.map((gr, gi) => {
  const nodes = gr.nodes.map(n => {
   seed++;
   const recusou = recusa && !!n.guarded;
   return {n: n.n, edge: n.edge, d: n.d, recusou, state: recusou ? s.refused : s.active, dot: recusou ? C.wait : C.ok,
    sbg: recusou ? C.waitS : C.okS, sfg: recusou ? C.waitT : C.okT, segs: segs(seed * 2 + Math.floor((tick + seed) / 3))};
  });
  return {name: gr.name, env: gr.env, color: MC[gi], nodes, foot: fill(s.foot, {n: nodes.length})};
 });
 const versoes = s.versions, q0 = Math.floor(tick / 2) % versoes.length;
 const history = [0, 1, 2].map(k => {
  const nome = versoes[(q0 + k) % versoes.length];
  return k === 0 ? {prefixo: '✓', nome, bg: 'superficie', fg: C.okT} : {prefixo: (k + 1) + '.', nome, bg: mistura('superficie', 55), fg: C.ink2};
 });
 const collections = s.collections.map((id, i) => {
  const o = (i * 3 + Math.floor(tick / 2) + (i % 5)) % 4;
  return o === 3 ? {id, fora: true, bg: 'superficie', fg: C.ink3, bd: mistura('texto', 25), bs: 'dashed'} : {id, fora: false, grupo: o, bg: MC[o], fg: o === 2 ? 'texto' : 'superficie', bd: MC[o], bs: 'solid'};
 });
 const coreFns = s.fns.map((label, i) => ({t: label, ativo: i === act,
  bg: i === act ? mistura('executando', 22) : mistura('texto', 4), fg: i === act ? 'texto' : 'texto-2', bd: i === act ? mistura('executando', 60) : 'linha'}));
 return {coreFns, groups, history, collections, legend: s.groups.map((gr, i) => ({n: gr.name, c: MC[i]}))};
}

// Noite (06): o relógio vai de 23:00 a 07:00 conforme a rolagem (np de 0 a 1).
export function nightVals(np) {
 const m = 1380 + Math.round(np * 480);
 const pad = n => String(n).padStart(2, '0');
 return {clock: pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60), pct: (np * 100).toFixed(1) + '%',
  morningOn: np > 0.9, morningOp: np > 0.9 ? 1 : 0.22, morningTf: np > 0.9 ? 'none' : 'translateY(14px)'};
}
export function nightItems(t, np) {
 const pm = np * 480;
 return t.night.events.map(e => {
  const [hh, mm] = e.t.split(':').map(Number);
  const at = ((hh * 60 + mm) - 1380 + 1440) % 1440;
  const on = pm >= at - 8;
  return {...e, on, op: on ? 1 : 0.26, fill: on ? e.c : 'chao', glow: on ? `0 0 14px var(--${e.c})` : 'none'};
 });
}
// A fórmula do design: 0 quando o topo da seção está a 55% da janela, 1 perto do fim dela.
export function nightProgress(top, height, vh) {
 return Math.max(0, Math.min(1, (vh * 0.55 - top) / Math.max(1, height - vh * 0.45)));
}

// Integrações (04): a matriz (uma linha clicável por integração, os blocos pelas etapas que ela
// cobre, tracejado onde a etapa só acontece se alguém pedir) e os dois cartões da escolhida. O
// contorno tracejado fica em texto-3 ou mais escuro, para a forma passar de 3:1 sobre o cartão.
export function integracoes(t, sel) {
 return t.integrations.list.map((m, i) => {
  const on = sel === i;
  return {tag: m.tag, turn: m.turn, on, bg: on ? 'superficie-2' : 'transparent',
   blocks: m.blocks.map(([label, start, span, sobDemanda]) => ({label, sobDemanda, col: `${start} / span ${span}`,
    bg: sobDemanda ? 'transparent' : on ? 'texto' : 'superficie-2',
    fg: sobDemanda ? (on ? 'texto' : C.ink2) : on ? 'superficie-2' : C.ink2,
    bd: sobDemanda ? (on ? 'texto' : 'texto-3') : 'transparent'}))};
 });
}
export function integracaoDetalhe(t, sel) {
 const it = t.integrations.list[sel];
 return {when: fill(t.integrations.whenLabel, {tag: it.tag}), use: it.use, about: it.about};
}

// Caminho (07): as seis etapas como abas e o par de cartões da escolhida. A aba escolhida usa a cor
// de ação do kit (--acao), nunca o jade.
export function etapas(t, sel) {
 return t.path.stages.map((name, i) => {
  const on = sel === i;
  return {name, n: '0' + (i + 1), on, bg: on ? 'acao' : 'superficie', fg: on ? 'sobre-acao' : 'texto', bd: on ? 'acao' : 'linha'};
 });
}
export function etapaDetalhe(t, sel) {
 const d = t.path.details[sel];
 return {gives: fill(t.path.givesLabel, {stage: t.path.stages[sel]}), givesText: d.gives, needs: d.needs, code: d.code};
}
