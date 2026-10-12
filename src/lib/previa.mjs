// Prévia de release no próprio domínio: cada release em validação sai em
// /releasevalidation/<release>/, fora dos buscadores, ao lado da produção aprovada na raiz.
// Esta é a regra única do modo da build, lida pelo astro.config.mjs, pelos componentes e
// pelos scripts de checagem e de publicação. A entrada é SITE_BASE: ausente ou "/" compila
// a produção; "/releasevalidation/<release>/" compila a prévia daquela release.
import { execFileSync } from 'node:child_process';

export const PREFIXO_DA_PREVIA = '/releasevalidation/';
const RELEASE = /^[0-9A-Za-z][0-9A-Za-z._-]{0,63}$/;

/** Release aceita no caminho da prévia: letras, números, ponto, sublinhado e hífen, começando por letra ou número. */
export function releaseValida(release) {
  return typeof release === 'string' && RELEASE.test(release) && !release.includes('..');
}

/** O base da prévia de uma release. */
export function baseDaRelease(release) {
  if (!releaseValida(release)) {
    throw new Error(`release inválida para a prévia: ${JSON.stringify(release)} (use letras, números, ponto, sublinhado e hífen, começando por letra ou número)`);
  }
  return PREFIXO_DA_PREVIA + release + '/';
}

/** "/" para a raiz; senão o base com barra no começo e no fim. */
export function normalizarBase(base) {
  if (base === undefined || base === null) return '/';
  let b = String(base).trim();
  if (b === '' || b === '/') return '/';
  if (!b.startsWith('/')) b = '/' + b;
  if (!b.endsWith('/')) b += '/';
  return b;
}

/** A release de um base de prévia; null para a raiz; qualquer outro base é erro. */
export function releaseDaBase(base) {
  const b = normalizarBase(base);
  if (b === '/') return null;
  const release = b.startsWith(PREFIXO_DA_PREVIA) ? b.slice(PREFIXO_DA_PREVIA.length, -1) : null;
  if (release === null || !releaseValida(release)) {
    throw new Error(`SITE_BASE inválido: ${JSON.stringify(base)}. Use "/" para a produção ou ${PREFIXO_DA_PREVIA}<release>/ para a prévia.`);
  }
  return release;
}

/** O base da build atual, validado; o astro.config.mjs passa este valor ao Astro. */
export function baseDoAmbiente(env = process.env) {
  const base = normalizarBase(env.SITE_BASE);
  releaseDaBase(base);
  return base;
}

/** O texto da faixa que toda página da prévia mostra no topo, com o SHA ao lado. */
export function textoDaFaixa(release) {
  return `Prévia da release ${release}, não publicada`;
}

/** O robots.txt da raiz: a produção pode ser indexada; as prévias, não. */
export const ROBOTS_DA_RAIZ = 'User-agent: *\nDisallow: /releasevalidation/\n';

/** Diz se o grupo "User-agent: *" do robots.txt bloqueia o caminho das prévias (regra por prefixo). */
export function temRegraDoRobots(texto) {
  let agentes = [], emRegras = false;
  for (const linha of String(texto ?? '').split(/\r?\n/)) {
    const util = linha.replace(/#.*$/, '').trim();
    const i = util.indexOf(':');
    if (i < 0) continue;
    const campo = util.slice(0, i).trim().toLowerCase(), valor = util.slice(i + 1).trim();
    if (campo === 'user-agent') {
      if (emRegras) { agentes = []; emRegras = false; }
      agentes.push(valor);
    } else {
      emRegras = true;
      if (campo === 'disallow' && valor && PREFIXO_DA_PREVIA.startsWith(valor) && agentes.includes('*')) return true;
    }
  }
  return false;
}

/** SHA e data do commit compilado: SITE_SHA e SITE_DATA quando o motor da publicação passa, senão o git do checkout. */
export function versaoDaBuild(env = process.env) {
  return { sha: env.SITE_SHA ?? git(['rev-parse', 'HEAD']), data: env.SITE_DATA ?? git(['log', '-1', '--format=%cI']) };
}

function git(argumentos) {
  try {
    return execFileSync('git', argumentos, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}
