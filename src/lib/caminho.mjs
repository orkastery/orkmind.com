// O cartão vivo do hero: o canvas da home do design (startScore do Claude Design, a partitura do
// site do Orkastery), portado sem mudar o desenho, com o caminho de uma memória no lugar das fases
// de uma thread. Cada linha é uma memória; o ponto anda pelas seis etapas do OrkMind, espera em
// jade na governança quando precisa de uma pessoa (regra protegida, conflito, conteúdo suspeito),
// acende um anel ao entrar no contexto do turno (Injetar) e fica em água dali em diante. A ordem das
// chamadas a Math.random é a do design (x, v, espera), para a mesma semente dar o mesmo quadro. Com
// movimento reduzido, os pontos ficam parados onde nasceram. As cores são as da Partitura, lidas
// dos tokens no próprio canvas (água = verificado, regência = executando, jade = espera você);
// nenhuma cor fica aqui.

export const DENSIDADE = 20, TEMPO = 1;
// Etapas (índice de 0 a 5) em que a memória pode esperar uma pessoa e em que entra no contexto do turno.
export const ESPERA_EM = [2], ENTRA_EM = 4;
// '#RRGGBB' do token com transparência, para traço e halo.
const comAlfa = (hex, a) => { const n = parseInt(hex.replace('#', '').slice(0, 6), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
export function coresDoCaminho(el) {
 const s = getComputedStyle(el), v = n => s.getPropertyValue('--' + n).trim();
 const texto = v('texto'), espera = v('espera'), verificado = v('verificado'), executando = v('executando');
 return {
  rotulo: v('texto-3'), faixa: comAlfa(texto, 0.025), linha: comAlfa(texto, 0.08), nome: v('texto-3'), nomeEspera: v('espera-texto'),
  espera, esperaForte: comAlfa(espera, 0.95), esperaHalo: comAlfa(espera, 0.22), etiqueta: comAlfa(espera, 0.22),
  ok: verificado, okRastro: comAlfa(verificado, 0.8), tinta: executando, rastro: comAlfa(executando, 0.5), rastroInicio: comAlfa(executando, 0)
 };
}

export function iniciarCaminho(canvas, {etapas, nomes, etiqueta, reduzir, densidade = DENSIDADE, tempo = TEMPO, aoContar}) {
 const ctx = canvas.getContext('2d');
 if (!ctx) return {parar() {}, retomar() {}, encerrar() {}};
 const cores = coresDoCaminho(canvas);
 let w = 0, h = 0, last = 0, lastCount = -1000, raf = 0, ro = null, vivo = {run: -1, wait: -1, ok: -1}, parado = false, pedirParada = false;
 // Mudar o tamanho do canvas apaga o quadro: ele é repintado na hora, parado ou não (sem abrir outro laço).
 const size = () => {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); ctx.setTransform(d, 0, 0, d, 0, 0);
  if (notes.length) pintar(last);
 };
 const mk = () => ({x: Math.random() * 0.92, v: 0.008 + Math.random() * 0.016, hold: 0, humano: Math.random() < 0.22, flash: 0});
 let notes = [];
 const pintar = (t) => {
  const N = Math.max(4, Math.min(40, densidade));
  const speed = tempo;
  while (notes.length < N) notes.push(mk());
  if (notes.length > N) notes = notes.slice(0, N);
  const dt = last ? Math.min((t - last) / 1000, 0.05) : 0; last = t;
  ctx.clearRect(0, 0, w, h);
  const gut = w > 620 ? 132 : 0, top = 34, bot = 8, sw = w - gut, colW = sw / 6;
  ctx.font = "500 10.5px 'IBM Plex Mono', ui-monospace, monospace"; ctx.textBaseline = 'middle';
  // Os nomes das etapas do OrkMind são mais longos que os das fases: na coluna estreita, as três
  // primeiras letras.
  const caber = etapas.every(n => ctx.measureText(n.toUpperCase()).width + 14 <= colW);
  for (let k = 0; k < 6; k++) {
   const x0 = gut + k * colW, nome = etapas[k].toUpperCase();
   if (k % 2 === 1) { ctx.fillStyle = cores.faixa; ctx.fillRect(x0, 0, colW, h); }
   ctx.fillStyle = cores.rotulo; ctx.fillText(caber ? nome : nome.slice(0, 3), x0 + 10, 12);
   if (k > 0) { ctx.strokeStyle = cores.linha; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.round(x0) + .5, 24); ctx.lineTo(Math.round(x0) + .5, h); ctx.stroke(); }
  }
  const gap = (h - top - bot) / Math.max(1, N - 1);
  const largura = Math.ceil(ctx.measureText(etiqueta).width) + 14;
  let run = 0, wait = 0, ok = 0;
  for (let i = 0; i < N; i++) {
   const n = notes[i], y = Math.round(top + i * gap) + .5;
   if (!reduzir) {
    if (n.hold > 0) n.hold -= dt;
    else {
     const prev = n.x; n.x += n.v * dt * speed;
     const a = Math.floor(n.x * 6), b = Math.floor(prev * 6);
     if (a !== b && n.humano && ESPERA_EM.includes(a)) n.hold = 3 + Math.random() * 5;
     if (a !== b && a === ENTRA_EM) n.flash = 1;
     if (n.x > 1) { notes[i] = mk(); notes[i].x = 0; }
    }
   }
   const holding = n.hold > 0, done = n.x >= ENTRA_EM / 6;
   if (holding) wait++; else if (done) ok++; else run++;
   const x = gut + n.x * sw;
   if (gut && gap >= 11) { ctx.fillStyle = holding ? cores.nomeEspera : cores.nome; ctx.fillText(nomes[i % nomes.length], 0, y); }
   ctx.strokeStyle = cores.linha; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gut, y); ctx.lineTo(w, y); ctx.stroke();
   const tl = Math.min(x - gut, 200);
   if (tl > 1) {
    const g = ctx.createLinearGradient(x - tl, 0, x, 0);
    g.addColorStop(0, cores.rastroInicio);
    g.addColorStop(1, holding ? cores.esperaForte : done ? cores.okRastro : cores.rastro);
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - tl, y); ctx.lineTo(x, y); ctx.stroke();
   }
   if (n.flash > 0) {
    n.flash = Math.max(0, n.flash - dt * 0.5);
    ctx.strokeStyle = comAlfa(cores.ok, n.flash); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 4 + (1 - n.flash) * 12, 0, Math.PI * 2); ctx.stroke();
   }
   if (holding) {
    ctx.fillStyle = cores.esperaHalo; ctx.beginPath(); ctx.arc(x, y, 8 + Math.sin(t / 380) * 2, 0, Math.PI * 2); ctx.fill();
    if (gap >= 11 && x < w - largura - 16) {
     ctx.fillStyle = cores.etiqueta; ctx.beginPath();
     if (ctx.roundRect) ctx.roundRect(x + 14, y - 8, largura, 16, 5); else ctx.rect(x + 14, y - 8, largura, 16);
     ctx.fill(); ctx.fillStyle = cores.nomeEspera; ctx.fillText(etiqueta, x + 21, y + .5);
    }
    ctx.fillStyle = cores.espera;
   } else ctx.fillStyle = done ? cores.ok : cores.tinta;
   ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
  if (t - lastCount > 700) {
   lastCount = t;
   if (vivo.run !== run || vivo.wait !== wait || vivo.ok !== ok) { vivo = {run, wait, ok}; aoContar?.(vivo); }
  }
 };
 // A parada do laço só vale depois de um quadro desenhado: fora da tela desde o início, o canvas
 // ainda mostra os pontos onde nasceram, como no design.
 const quadro = (t) => {
  pintar(t);
  if (pedirParada) { parado = true; pedirParada = false; return; }
  if (!parado) raf = requestAnimationFrame(quadro);
 };
 const comecar = () => {
  if (!canvas.clientWidth) { raf = requestAnimationFrame(comecar); return; }
  size(); ro = new ResizeObserver(size); ro.observe(canvas);
  raf = requestAnimationFrame(quadro);
 };
 comecar();
 // Fora da tela o quadro não é redesenhado (economia de CPU); ao voltar, o intervalo é limitado
 // a 50 ms pelo próprio desenho, como no design.
 return {
  parar() { if (parado) return; if (notes.length) { parado = true; cancelAnimationFrame(raf); } else pedirParada = true; },
  retomar() { pedirParada = false; if (parado) { parado = false; last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(quadro); } },
  encerrar() { cancelAnimationFrame(raf); ro?.disconnect(); }
 };
}
