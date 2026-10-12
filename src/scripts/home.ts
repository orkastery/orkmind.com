// Interações da home: o relógio de 2,4 s (diagrama, coleções, histórico e orkmind list), a
// descrição de cada nó, as integrações, as etapas em abas, a noite pela rolagem, o canvas do hero e
// o botão que para e retoma todo o movimento (WCAG 2.2.2). O estado inicial veio
// pronto do build; aqui só se recalcula com as mesmas funções (src/lib/home-state.mjs) e se repinta o
// mesmo elemento. Com movimento reduzido, nada se move sozinho: o canvas fica parado e o relógio
// não anda; cliques, teclado e rolagem continuam valendo.
import {entradas, topo, integracoes, etapas, nightVals, nightItems, nightProgress, cor, ESTADO_INICIAL, TICK_MS} from '../lib/home-state.mjs';
import {iniciarCaminho} from '../lib/caminho.mjs';

const dados = document.getElementById('home-dados');
if (dados) {
 const t = JSON.parse(dados.textContent || '{}');
 const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const estado = {...ESTADO_INICIAL};
 const $ = <T extends Element = HTMLElement>(sel: string, raiz: ParentNode = document) => [...raiz.querySelectorAll<T & HTMLElement>(sel)];
 const pinta = (el: HTMLElement | undefined | null, estilo: Record<string, string>) => { if (el) for (const [k, v] of Object.entries(estilo)) el.style.setProperty(k, v); };

 // Canvas do hero: a contagem viva no topo do cartão. Parado pelo botão, ele não volta ao entrar na tela.
 let parado = false, visivel = false;
 const canvas = document.querySelector<HTMLCanvasElement>('[data-caminho]');
 let caminho: {parar(): void, retomar(): void} | null = null;
 if (canvas) {
  const vivo = Object.fromEntries($('[data-vivo]').map(el => [el.dataset.vivo, el]));
  const quadro = iniciarCaminho(canvas, {etapas: t.path.stages, nomes: t.hero.names, etiqueta: t.hero.waitTag, reduzir,
   aoContar: (c: {run: number, wait: number, ok: number}) => { for (const k of ['run', 'wait', 'ok'] as const) if (vivo[k]) vivo[k].textContent = String(c[k]); }});
  caminho = quadro;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => { visivel = en.isIntersecting; if (visivel && !parado) quadro.retomar(); else quadro.parar(); })).observe(canvas);
 }

 // Diagrama do sistema, coleções e histórico pelo relógio.
 function pintaTopo(tick: number) {
  const v = topo(t, tick);
  v.coreFns.forEach((f: any, i: number) => pinta($(`[data-fn="${i}"]`)[0], {background: cor(f.bg), color: cor(f.fg), 'border-color': cor(f.bd)}));
  let no = 0;
  v.groups.forEach((g: any) => g.nodes.forEach((n: any) => {
   const el = $(`[data-no="${no++}"]`)[0]; if (!el) return;
   const est = $('[data-no-estado]', el)[0], ponto = $('[data-no-ponto]', el)[0], rotulo = $('[data-no-rotulo]', el)[0];
   pinta(est, {background: cor(n.sbg), color: cor(n.sfg)});
   pinta(ponto, {background: cor(n.dot)});
   if (rotulo) rotulo.textContent = n.state;
   $('[data-no-segs] > span', el).forEach((s, k) => pinta(s, {background: cor(n.segs[k])}));
  }));
  v.history.forEach((h: any, k: number) => {
   const el = $(`[data-historico="${k}"]`)[0]; if (!el) return;
   const pre = $('[data-historico-prefixo]', el)[0], nome = $('code', el)[0];
   if (pre) pre.textContent = h.prefixo;
   if (nome) nome.textContent = h.nome;
   pinta(el, {background: cor(h.bg), color: cor(h.fg)});
  });
  v.collections.forEach((c: any, i: number) => {
   const el = $(`[data-colecao="${i}"]`)[0]; if (!el) return;
   pinta(el, {background: cor(c.bg), color: cor(c.fg), border: `1px ${c.bs} ${cor(c.bd)}`});
   // Quem leu a coleção também em texto (para leitor de tela), não só pelo tom do cinza.
   const quem = $('[data-colecao-quem]', el)[0]; if (quem) quem.textContent = ', ' + (c.fora ? t.system.free : v.legend[c.grupo].n);
  });
 }
 // Cada nó do diagrama abre e fecha a própria descrição (sem JavaScript, todas ficam abertas).
 $<HTMLButtonElement>('[data-no-botao]').forEach(botao => {
  botao.setAttribute('aria-expanded', 'false');
  botao.addEventListener('click', () => {
   const aberto = botao.getAttribute('aria-expanded') !== 'true', desc = document.getElementById(botao.getAttribute('aria-controls') || '');
   botao.setAttribute('aria-expanded', String(aberto));
   desc?.classList.toggle('aberta', aberto);
  });
 });
 // orkmind list pelo relógio.
 function pintaEntradas(tick: number) {
  entradas(t, tick).forEach((l: any, i: number) => {
   const linha = $(`[data-entrada="${i}"]`)[0]; if (!linha) return;
   pinta(linha, {background: cor(l.rowBg)});
   linha.toggleAttribute('data-espera', l.estado === 'hold');
   const barra = $('[data-entrada-barra]', linha)[0];
   if (barra) { barra.setAttribute('aria-label', l.barra); $(':scope > span', barra).forEach((s, k) => pinta(s, {background: cor(l.segs[k])})); }
   const etapa = $('[data-entrada-etapa]', linha)[0]; if (etapa) etapa.textContent = l.phase;
   const est = $('[data-entrada-estado]', linha)[0]; pinta(est, {color: cor(l.fg)});
   pinta(est?.firstElementChild as HTMLElement, {background: cor(l.dot)});
   const rot = $('[data-entrada-rotulo]', linha)[0]; if (rot) rot.textContent = l.label;
  });
 }
 let relogio = 0;
 const ligarRelogio = () => { relogio = window.setInterval(() => { estado.tick++; pintaTopo(estado.tick); pintaEntradas(estado.tick); }, TICK_MS); };
 if (!reduzir) ligarRelogio();

 // Parar e retomar todo o movimento: o relógio, o canvas e as animações (que ficam onde estão).
 const botaoMovimento = document.querySelector<HTMLButtonElement>('[data-movimento]');
 if (botaoMovimento && !reduzir) {
  botaoMovimento.hidden = false;
  botaoMovimento.addEventListener('click', () => {
   parado = !parado;
   document.documentElement.classList.toggle('movimento-parado', parado);
   botaoMovimento.textContent = (parado ? botaoMovimento.dataset.retomar : botaoMovimento.dataset.parar) || '';
   if (parado) { clearInterval(relogio); caminho?.parar(); } else { ligarRelogio(); if (visivel) caminho?.retomar(); }
  });
 }

 // Integrações: a linha escolhida e os dois cartões dela.
 function pintaIntegracoes() {
  integracoes(t, estado.integration).forEach((l: any, i: number) => {
   const linha = $(`[data-integracao="${i}"]`)[0]; if (!linha) return;
   linha.setAttribute('aria-pressed', l.on ? 'true' : 'false');
   pinta(linha, {background: cor(l.bg)});
   $('.integracao-faixa', linha).forEach((f, k) => pinta(f, {background: cor(l.blocks[k].bg), color: cor(l.blocks[k].fg), 'border-color': cor(l.blocks[k].bd)}));
  });
  $('[data-integracao-texto]').forEach(el => el.classList.toggle('ativo', Number(el.dataset.integracaoTexto) === estado.integration));
 }
 $('[data-integracao]').forEach(el => el.addEventListener('click', () => { estado.integration = Number(el.dataset.integracao); pintaIntegracoes(); }));
 // O estado (aria-pressed) e o anúncio da troca só existem com JavaScript: sem ele, as quatro ficam abertas.
 document.getElementById('integracoes-detalhe')?.setAttribute('aria-live', 'polite');
 pintaIntegracoes();

 // Etapas do caminho: com JavaScript viram abas (setas, Home e End); sem ele, as seis ficam abertas.
 const abas = $('[data-etapa]');
 $('[data-etapas]')[0]?.setAttribute('role', 'tablist');
 abas.forEach(aba => { aba.setAttribute('role', 'tab'); aba.setAttribute('aria-controls', 'caminho-painel'); });
 const painel = document.getElementById('caminho-painel');
 painel?.setAttribute('role', 'tabpanel'); painel?.setAttribute('aria-live', 'polite');
 function pintaEtapas(foco = false) {
  etapas(t, estado.stage).forEach((f: any, i: number) => {
   const aba = abas[i]; if (!aba) return;
   aba.setAttribute('aria-selected', f.on ? 'true' : 'false'); aba.tabIndex = f.on ? 0 : -1;
   pinta(aba, {background: cor(f.bg), 'border-color': cor(f.bd), color: cor(f.fg)});
   if (f.on && foco) aba.focus();
  });
  $('[data-detalhe]').forEach(el => el.classList.toggle('ativo', Number(el.dataset.detalhe) === estado.stage));
  document.getElementById('caminho-painel')?.setAttribute('aria-labelledby', 'etapa-' + estado.stage);
 }
 pintaEtapas();
 abas.forEach(aba => {
  aba.addEventListener('click', () => { estado.stage = Number(aba.dataset.etapa); pintaEtapas(); });
  // A seta parte da aba que tem o foco (com o roving tabindex, é a escolhida).
  aba.addEventListener('keydown', e => {
   const n = abas.length, aqui = Number(aba.dataset.etapa), alvo = ({ArrowRight: aqui + 1, ArrowDown: aqui + 1, ArrowLeft: aqui - 1, ArrowUp: aqui - 1, Home: 0, End: n - 1} as Record<string, number>)[e.key];
   if (alvo === undefined) return;
   e.preventDefault(); estado.stage = (alvo + n) % n; pintaEtapas(true);
  });
 });

 // Noite: o relógio e a linha do tempo seguem a rolagem, como no design.
 const noite = document.querySelector<HTMLElement>('[data-noite]');
 if (noite) {
  let quadro = 0;
  const relogio = $('[data-noite-relogio]', noite)[0], pct = $('[data-noite-pct]', noite)[0], fio = $('[data-noite-fio]', noite)[0], manha = $('[data-noite-manha]', noite)[0];
  const eventos = $('[data-noite-evento]', noite);
  const pintaNoite = () => {
   const v = nightVals(estado.np);
   if (relogio) relogio.textContent = v.clock;
   pinta(pct, {width: v.pct}); pinta(fio, {height: v.pct});
   pinta(manha, {opacity: String(v.morningOp), transform: v.morningTf});
   nightItems(t, estado.np).forEach((e: any, i: number) => {
    const ev = eventos[i]; if (!ev) return;
    pinta(ev, {opacity: String(e.op)});
    pinta($('[data-noite-ponto]', ev)[0], {background: `var(--${e.fill})`, 'box-shadow': e.glow});
   });
  };
  const aoRolar = () => {
   if (quadro) return;
   quadro = requestAnimationFrame(() => {
    quadro = 0;
    const r = noite.getBoundingClientRect(), p = nightProgress(r.top, r.height, window.innerHeight);
    if (Math.abs(p - estado.np) > 0.004) { estado.np = p; pintaNoite(); }
   });
  };
  // O build saiu com a noite inteira (para quem está sem JavaScript): a primeira pintura é incondicional.
  const r = noite.getBoundingClientRect();
  estado.np = nightProgress(r.top, r.height, window.innerHeight);
  pintaNoite();
  window.addEventListener('scroll', aoRolar, {passive: true});
 }
}
