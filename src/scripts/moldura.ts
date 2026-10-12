// Comportamentos da Partitura em qualquer página: o menu do cabeçalho no estreito, o brilho que
// segue o cursor nos cartões de destaque e a entrada suave ao rolar ([data-reveal]), desligada com
// movimento reduzido. Sem JavaScript, nada se esconde: o menu fica aberto e o conteúdo, visível.
document.documentElement.classList.add('js');

// Menu do cabeçalho abaixo de 768 px: botão com aria-expanded; Esc fecha e devolve o foco.
const botao = document.querySelector<HTMLButtonElement>('[data-menu]');
const painel = document.querySelector<HTMLElement>('[data-painel]');
if (botao && painel) {
 const estreito = matchMedia('(max-width: 767px)');
 const rotulo = botao.querySelector<HTMLElement>('[data-menu-rotulo]');
 const definir = (aberto: boolean) => {
  botao.setAttribute('aria-expanded', String(aberto));
  if (rotulo) rotulo.textContent = (aberto ? botao.dataset.fechar : botao.dataset.abrir) || '';
  painel.hidden = estreito.matches && !aberto;
 };
 botao.addEventListener('click', () => definir(botao.getAttribute('aria-expanded') !== 'true'));
 painel.addEventListener('click', e => { if ((e.target as HTMLElement).closest('a') && estreito.matches) definir(false); });
 document.addEventListener('keydown', e => { if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') { definir(false); botao.focus(); } });
 estreito.addEventListener('change', () => definir(false));
 definir(false);
}

// Brilho que segue o cursor: só em quem tem ponteiro fino (desligado em toque).
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
 for (const el of document.querySelectorAll<HTMLElement>('[data-holofote]')) {
  el.addEventListener('mousemove', e => {
   const r = el.getBoundingClientRect();
   el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
   el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
 }
}

// Entrada suave ao rolar: 600 ms, 16 px, 80 ms entre irmãos, uma vez, quando 20% do bloco entra.
// Só para o que começa abaixo da dobra; o que já está na tela nunca some. O bloco mais alto que
// cinco janelas (zoom de 400%, janela baixa) nunca mostra 20% de si: ele entra quando ocupa 20% da
// janela. E o que recebe foco aparece na hora, para o foco nunca cair em bloco invisível.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
 const blocos = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(el => el.getBoundingClientRect().top >= innerHeight);
 for (const el of blocos) {
  const irmaos = [...(el.parentElement?.children || [])].filter(x => x.hasAttribute('data-reveal'));
  el.style.setProperty('--atraso', Math.max(0, irmaos.indexOf(el)) * 80 + 'ms');
 }
 document.documentElement.classList.add('revelar-pronto');
 for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) if (!blocos.includes(el)) el.classList.add('revelado');
 const revelar = (el: Element) => { el.classList.add('revelado'); io.unobserve(el); };
 const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting && (en.intersectionRatio >= 0.2 || en.intersectionRect.height >= innerHeight * 0.2)) revelar(en.target);
 }), {threshold: [0, 0.05, 0.1, 0.2]});
 blocos.forEach(el => io.observe(el));
 document.addEventListener('focusin', e => { const bloco = (e.target as Element).closest?.('[data-reveal]:not(.revelado)'); if (bloco) revelar(bloco); });
}
