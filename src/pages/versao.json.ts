// Qual commit gerou este build. O teste e a producao servem o mesmo artefato, e a promocao
// confere a producao por aqui: o SHA que voce aprovou no teste e o que o dominio mostra.
import { execSync } from 'node:child_process';

function git(argumentos: string): string | null {
  try {
    return execSync(`git ${argumentos}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

export function GET() {
  const versao = {
    sha: process.env.SITE_SHA ?? git('rev-parse HEAD'),
    data: process.env.SITE_DATA ?? git('log -1 --format=%cI')
  };
  return new Response(`${JSON.stringify(versao, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/json' }
  });
}
