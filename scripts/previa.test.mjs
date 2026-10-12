// Testes da prévia de release em /releasevalidation/<release>/: a regra do modo da build e a árvore
// composta. A árvore composta roda no fim do postbuild da build de produção: reaproveita o dist como
// raiz, compila uma prévia de exemplo de uma cópia da árvore de trabalho, monta a publicação e a confere.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PREFIXO_DA_PREVIA, releaseValida, baseDaRelease, normalizarBase, releaseDaBase, baseDoAmbiente,
  textoDaFaixa, ROBOTS_DA_RAIZ, temRegraDoRobots, versaoDaBuild
} from '../src/lib/previa.mjs';
import { root, siteBase, pages, checkLinks } from './check-links.mjs';
import { comporPublicacao, verificarPublicacao, hashesDe, executar, copiarArvoreDeTrabalho, PASTA_DAS_PREVIAS } from './publicar.mjs';

test('release aceita no caminho da prévia', () => {
  for (const release of ['0.5.5', '1.0.0-rc.1', '2026.10', 'v0.6.0', 'a', 'x'.repeat(64)]) assert.ok(releaseValida(release), release);
  for (const release of ['', '.', '..', '../x', 'a/b', 'a b', '-x', '_x', '.x', 'x'.repeat(65), 'á', '0..5', 'a@b', 'a+b', undefined, null, 5]) {
    assert.equal(releaseValida(release), false, String(release));
  }
});

test('base da release e release do base', () => {
  assert.equal(PREFIXO_DA_PREVIA, '/releasevalidation/');
  assert.equal(baseDaRelease('0.5.5'), '/releasevalidation/0.5.5/');
  assert.throws(() => baseDaRelease('../x'), /release inválida/);
  assert.equal(releaseDaBase('/releasevalidation/0.5.5/'), '0.5.5');
  assert.equal(releaseDaBase('/releasevalidation/0.5.5'), '0.5.5');
  assert.equal(releaseDaBase('releasevalidation/0.5.5'), '0.5.5');
  for (const base of ['/', '', undefined, null]) assert.equal(releaseDaBase(base), null, String(base));
  for (const base of ['/outra/', '/releasevalidation/', '/releasevalidation/a/b/', '/releasevalidation/../', '/releasevalidation/-x/', '/docs']) {
    assert.throws(() => releaseDaBase(base), /SITE_BASE inválido/, base);
  }
  assert.equal(normalizarBase('releasevalidation/0.5.5'), '/releasevalidation/0.5.5/');
});

test('SITE_BASE decide o modo da build e recusa outro caminho', () => {
  assert.equal(baseDoAmbiente({}), '/');
  assert.equal(baseDoAmbiente({ SITE_BASE: '/' }), '/');
  assert.equal(baseDoAmbiente({ SITE_BASE: '/releasevalidation/0.5.5' }), '/releasevalidation/0.5.5/');
  assert.throws(() => baseDoAmbiente({ SITE_BASE: '/docs/' }), /SITE_BASE inválido/);
});

test('faixa e robots.txt da raiz', () => {
  assert.equal(textoDaFaixa('0.5.5'), 'Prévia da release 0.5.5, não publicada');
  assert.ok(temRegraDoRobots(ROBOTS_DA_RAIZ));
  assert.ok(temRegraDoRobots('# outro robô\nUser-agent: Googlebot\nDisallow: /x/\n\nUser-agent: *\nDisallow: /releasevalidation/\n'));
  assert.ok(temRegraDoRobots('User-agent: *\nDisallow: /releasevalidation\n'));
  assert.ok(temRegraDoRobots('User-agent: *\nDisallow: /\n'));
  assert.equal(temRegraDoRobots('User-agent: Googlebot\nDisallow: /releasevalidation/\n'), false);
  assert.equal(temRegraDoRobots('User-agent: *\nDisallow: /docs/\nDisallow:\n'), false);
  assert.equal(temRegraDoRobots('User-agent: *\nAllow: /\n'), false);
  assert.equal(temRegraDoRobots(''), false);
});

test('SHA e data vêm do motor quando ele os passa', () => {
  assert.deepEqual(versaoDaBuild({ SITE_SHA: 'a'.repeat(40), SITE_DATA: '2000-01-01T00:00:00Z' }), { sha: 'a'.repeat(40), data: '2000-01-01T00:00:00Z' });
});

test('a cópia da árvore de trabalho deixa de fora dependências e build, mesmo com node_modules em link', () => {
  const dir = mkdtempSync(join(tmpdir(), 'copia-arvore-'));
  try {
    const origem = join(dir, 'origem'), destino = join(dir, 'destino'), deps = join(dir, 'deps');
    mkdirSync(join(origem, 'dist'), { recursive: true });
    mkdirSync(deps);
    writeFileSync(join(origem, 'a.txt'), 'a');
    writeFileSync(join(origem, '.gitignore'), 'node_modules/' + String.fromCharCode(10));
    writeFileSync(join(origem, 'dist', 'index.html'), 'build');
    symlinkSync(deps, join(origem, 'node_modules'), 'dir');
    symlinkSync('a.txt', join(origem, 'b.txt'));
    assert.equal(executar('git', ['init', '-q', origem]).status, 0);
    copiarArvoreDeTrabalho(origem, destino);
    assert.equal(readFileSync(join(destino, 'a.txt'), 'utf8'), 'a');
    assert.equal(lstatSync(join(destino, 'b.txt')).isSymbolicLink(), true);
    for (const fora of ['node_modules', 'dist', '.git']) assert.equal(existsSync(join(destino, fora)), false, fora);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// Árvore composta.
const RELEASE = '0.0.0-teste';
const catalogo = JSON.parse(readFileSync(join(root, 'src/data/docs-catalog.ts'), 'utf8').replace(/^export default /, '').replace(/;\s*$/, ''));
const OUTRO_SITE = catalogo.repository.split('/').at(-1) === 'orkastery' ? 'orkmind.com' : 'orkastery.com';
const pular = siteBase() ? 'build de prévia: a árvore composta é conferida a partir da build de produção'
  : process.env.SITE_TESTE_PREVIA === '0' ? 'SITE_TESTE_PREVIA=0: quem chamou confere a árvore inteira'
  : !existsSync(join(root, 'dist', 'index.html')) ? 'sem build de produção em dist/'
  : false;

let tmp = null, arvore = null;
before(() => {
  if (pular) return;
  tmp = mkdtempSync(join(tmpdir(), 'previa-arvore-'));
  const producao = join(tmp, 'producao');
  cpSync(join(root, 'dist'), producao, { recursive: true });
  const versao = JSON.parse(readFileSync(join(producao, 'versao.json'), 'utf8'));
  const sha = /^[0-9a-f]{40}$/.test(versao.sha || '') ? versao.sha : '0'.repeat(40);
  const fonte = copiarArvoreDeTrabalho(root, join(tmp, 'fonte'));
  symlinkSync(join(root, 'node_modules'), join(fonte, 'node_modules'), 'dir');
  const build = executar('npm', ['run', 'build'], {
    cwd: fonte, env: { ...process.env, SITE_BASE: baseDaRelease(RELEASE), SITE_SHA: sha, SITE_DATA: versao.data ?? '' }
  });
  if (build.status !== 0) throw Error('a build da prévia de exemplo falhou (' + (build.erro?.code ?? 'código ' + build.status) + '):\n' + (build.saida + build.erros).split('\n').slice(-40).join('\n'));
  for (const linha of build.saida.split('\n')) if (linha.startsWith('{"pages"')) console.log('# prévia de exemplo, checagem do postbuild: ' + linha);
  const hashesDaProducao = hashesDe(producao);
  const saida = join(tmp, 'publicacao');
  const { robotsCriado } = comporPublicacao({ producao, previas: [{ release: RELEASE, dist: join(fonte, 'dist') }], saida });
  arvore = { producao, saida, sha, esperado: { producao: { sha }, previas: [{ release: RELEASE, sha }], hashesDaProducao, robotsCriado } };
});
after(() => { if (tmp) rmSync(tmp, { recursive: true, force: true }); });

const previaEm = dir => join(dir, PASTA_DAS_PREVIAS, RELEASE);
function copiaDaArvore(editar) {
  const dir = join(mkdtempSync(join(tmp, 'mutacao-')), 'publicacao');
  cpSync(arvore.saida, dir, { recursive: true });
  editar(dir);
  return dir;
}
function trocar(arquivo, troca) {
  const antes = readFileSync(arquivo, 'utf8'), depois = troca(antes);
  assert.notEqual(depois, antes, 'a mutação não mudou ' + arquivo);
  writeFileSync(arquivo, depois);
}

test('árvore composta: raiz igual à produção e prévia no caminho, fora dos buscadores', { skip: pular }, () => {
  assert.deepEqual(verificarPublicacao(arvore.saida, arvore.esperado).previas, [RELEASE]);
  assert.equal(arvore.esperado.robotsCriado, false, 'a produção desta árvore já traz o robots.txt');
  assert.deepEqual(hashesDe(arvore.saida, [PASTA_DAS_PREVIAS]), arvore.esperado.hashesDaProducao);
  assert.equal(readFileSync(join(arvore.saida, 'robots.txt'), 'utf8'), ROBOTS_DA_RAIZ);
  const versao = JSON.parse(readFileSync(join(previaEm(arvore.saida), 'versao.json'), 'utf8'));
  assert.equal(versao.release, RELEASE);
  assert.equal(versao.sha, arvore.sha);
  const daPrevia = pages(previaEm(arvore.saida));
  assert.equal(daPrevia.length, pages(arvore.producao).length);
  for (const p of daPrevia) {
    assert.ok(p.source.includes('<meta name="robots" content="noindex, nofollow">'), 'sem noindex: ' + p.path);
    assert.ok(p.source.includes('data-previa="' + RELEASE + '"') && p.source.includes(textoDaFaixa(RELEASE)), 'sem a faixa: ' + p.path);
  }
  for (const p of pages(arvore.saida, [join(arvore.saida, PASTA_DAS_PREVIAS)])) {
    assert.ok(!p.source.includes('noindex') && !p.source.includes('data-previa'), 'marca de prévia na raiz: ' + p.path);
  }
  for (const nome of ['CNAME', 'robots.txt']) assert.equal(existsSync(join(previaEm(arvore.saida), nome)), false, nome);
});

test('cada desvio da árvore composta reprova a conferência', { skip: pular }, async t => {
  const casos = [
    ['página da prévia sem noindex', d => trocar(join(previaEm(d), 'docs/index.html'), s => s.replace('<meta name="robots" content="noindex, nofollow">', '')), /sem noindex/],
    ['página da prévia sem a faixa', d => trocar(join(previaEm(d), 'en/index.html'), s => s.replace('data-previa=', 'data-outra=')), /sem a faixa/],
    ['link da prévia para a raiz da produção', d => trocar(join(previaEm(d), 'index.html'), s => s.replace('</main>', '<a href="/docs/">raiz</a></main>')), /Fora da prévia/],
    ['link da prévia para a produção pela URL absoluta', d => trocar(join(previaEm(d), 'index.html'), s => s.replace('</main>', '<a href="https://' + catalogo.repository.split('/').at(-1) + '.com/docs/">raiz</a></main>')), /Fora da prévia/],
    ['link para o outro site com caminho de prévia', d => trocar(join(previaEm(d), 'index.html'), s => s.replace('</main>', '<a href="https://' + OUTRO_SITE + PREFIXO_DA_PREVIA + RELEASE + '/">outro</a></main>')), /outro site/],
    ['noindex numa página da raiz', d => trocar(join(d, 'docs/index.html'), s => s.replace('<title>', '<meta name="robots" content="noindex"><title>')), /fora do índice/],
    ['faixa numa página da raiz', d => trocar(join(d, 'docs/index.html'), s => s.replace('</main>', '<div data-previa="x"></div></main>')), /Faixa de prévia na produção/],
    ['robots.txt da raiz sem a regra', d => writeFileSync(join(d, 'robots.txt'), 'User-agent: *\nAllow: /\n'), /robots\.txt/],
    ['release errada no versao.json da prévia', d => trocar(join(previaEm(d), 'versao.json'), s => s.replace('"release": "' + RELEASE + '"', '"release": "9.9.9"')), /sem a release/],
    ['raiz diferente da build de produção', d => trocar(join(d, 'docs/index.html'), s => s + '<!-- mudou -->'), /difere da build de produção/],
    ['raiz que não é o commit da tag', d => trocar(join(d, 'versao.json'), s => s.replace(arvore.sha, 'b'.repeat(40))), /não é a produção esperada/],
    ['prévia a mais na pasta', d => cpSync(previaEm(d), join(d, PASTA_DAS_PREVIAS, '9.9.9'), { recursive: true }), /diferem das esperadas/],
    ['sitemap da raiz citando prévia', d => writeFileSync(join(d, 'sitemap-0.xml'), '<urlset><url><loc>https://exemplo.invalid' + PREFIXO_DA_PREVIA + RELEASE + '/</loc></url></urlset>'), /sitemap/],
    ['CNAME dentro da prévia', d => writeFileSync(join(previaEm(d), 'CNAME'), 'exemplo.invalid'), /CNAME/]
  ];
  for (const [nome, editar, erro] of casos) await t.test(nome, () => assert.throws(() => verificarPublicacao(copiaDaArvore(editar), arvore.esperado), erro));
});

test('a produção não aponta para prévias', { skip: pular }, () => {
  const dir = join(mkdtempSync(join(tmp, 'producao-')), 'dist');
  cpSync(arvore.producao, dir, { recursive: true });
  trocar(join(dir, 'index.html'), s => s.replace('</main>', '<a href="' + PREFIXO_DA_PREVIA + RELEASE + '/">prévia</a></main>'));
  assert.throws(() => checkLinks(dir, ''), /aponta para uma prévia/);
});

test('raiz de tag antiga sem robots.txt ganha a regra; robots.txt sem a regra reprova a montagem', { skip: pular }, () => {
  const antiga = join(mkdtempSync(join(tmp, 'antiga-')), 'dist');
  cpSync(arvore.producao, antiga, { recursive: true });
  rmSync(join(antiga, 'robots.txt'));
  const saida = join(tmp, 'publicacao-antiga');
  const { robotsCriado } = comporPublicacao({ producao: antiga, previas: [], saida });
  assert.equal(robotsCriado, true);
  assert.equal(readFileSync(join(saida, 'robots.txt'), 'utf8'), ROBOTS_DA_RAIZ);
  verificarPublicacao(saida, { producao: { sha: arvore.sha }, previas: [], hashesDaProducao: hashesDe(antiga), robotsCriado });
  writeFileSync(join(antiga, 'robots.txt'), 'User-agent: *\nDisallow:\n');
  assert.throws(() => comporPublicacao({ producao: antiga, previas: [], saida: join(tmp, 'publicacao-outra') }), /não bloqueia/);
  assert.throws(() => comporPublicacao({ producao: arvore.producao, previas: [], saida }), /não está vazia/);
});
