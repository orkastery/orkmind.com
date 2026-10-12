// Qual commit gerou este build. O teste e a producao servem o mesmo artefato, e a promocao
// confere a producao por aqui: o SHA que voce aprovou no teste e o que o dominio mostra.
// Na prévia de uma release (/releasevalidation/<release>/), leva também a release.
import { releaseDaBase, versaoDaBuild } from '../lib/previa.mjs';

export function GET() {
  const release = releaseDaBase(import.meta.env.BASE_URL);
  const versao = { ...versaoDaBuild(), ...(release ? { release } : {}) };
  return new Response(`${JSON.stringify(versao, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/json' }
  });
}
