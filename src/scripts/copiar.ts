// Comando copiável: copia o comando do botão. O rótulo vira "✓ copiado" por 1,6 s; se a área de
// transferência recusar, "× use Ctrl+C" (⌘C no Mac), e a mensagem para leitor de tela manda copiar
// à mão. Cada botão cuida do próprio rótulo.
const atalho = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘C' : 'Ctrl+C';
for (const botao of document.querySelectorAll<HTMLButtonElement>('[data-copiar]')) {
 let volta = 0;
 const rotulo = botao.querySelector<HTMLElement>('[data-rotulo-visivel]');
 const status = botao.parentElement?.querySelector<HTMLElement>('[data-status]');
 const mostrar = (estado: 'ok' | 'falha' | null) => {
  if (rotulo) {
   rotulo.textContent = (estado === 'ok' ? botao.dataset.rotuloOk : estado === 'falha' ? botao.dataset.rotuloFalha : botao.dataset.rotulo || '')?.replace('{atalho}', atalho) || '';
   if (estado) rotulo.dataset.estado = estado; else delete rotulo.dataset.estado;
  }
  if (status) status.textContent = estado === 'ok' ? botao.dataset.msgOk || '' : estado === 'falha' ? (botao.dataset.msgFalha || '').replace('{atalho}', atalho) : '';
 };
 botao.addEventListener('click', async () => {
  let ok = true;
  try { if (!navigator.clipboard) throw new Error('sem área de transferência'); await navigator.clipboard.writeText(botao.dataset.copiar || ''); } catch { ok = false; }
  mostrar(ok ? 'ok' : 'falha');
  clearTimeout(volta);
  volta = window.setTimeout(() => mostrar(null), 1600);
 });
}
