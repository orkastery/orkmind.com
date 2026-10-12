// Ensaio do motor da publicação composta (scripts/publicar.mjs) num repositório Git temporário, com
// tags de verdade: raiz pela última tag de produção, promoção que mantém as prévias, prévia que mantém
// a raiz, tag apagada que sai do ar, teto pela ordem de versão e recusas antes de qualquer build.
// Quatro builds de verdade, reaproveitadas por commit e base; roda com npm run test:publicar.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { root } from './check-links.mjs';
import { executar, copiarArvoreDeTrabalho } from './publicar.mjs';

const pular = process.env.SITE_TESTE_PREVIA === '0' ? 'SITE_TESTE_PREVIA=0' : false;
let tmp = null, repo = null, cache = null, rodada = 0;
const shas = {};

function git(dir, ...args) {
  const r = executar('git', ['-C', dir, '-c', 'user.name=Ensaio', '-c', 'user.email=ensaio@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', ...args]);
  if (r.status !== 0) throw Error('git ' + args.join(' ') + ': ' + (r.erro?.code ?? r.erros));
  return r.saida.trim();
}

/** Roda o motor como o workflow roda, contra o repositório do ensaio; devolve código, resumo e saída. */
function motor({ maximo, ensaio = false, repositorio = repo, extras = [] } = {}) {
  rodada += 1;
  const saida = join(tmp, 'publicacao-' + rodada), resumo = join(tmp, 'resumo-' + rodada + '.json');
  const args = [join(root, 'scripts/publicar.mjs'), '--repo', repositorio, '--cache', cache, '--resumo', resumo];
  if (ensaio) args.push('--ensaio'); else args.push('--saida', saida);
  if (maximo !== undefined) args.push('--maximo', String(maximo));
  args.push(...extras);
  const { SITE_BASE, GITHUB_STEP_SUMMARY, ...env } = process.env;
  const r = executar(process.execPath, args, { cwd: root, env });
  for (const linha of (r.saida + r.erros).split('\n')) if (/^(Raiz|Prévia|Fora do teto|Tags producao|build|Publicação|Nenhuma|Tag de prévia|Commit de prévia|A pasta)/.test(linha)) console.log('# rodada ' + rodada + ': ' + linha);
  return { code: r.status, saida, resumo: existsSync(resumo) ? JSON.parse(readFileSync(resumo, 'utf8')) : null, texto: r.saida + r.erros };
}
const versaoEm = (dir, ...partes) => JSON.parse(readFileSync(join(dir, ...partes, 'versao.json'), 'utf8'));
const previasEm = dir => existsSync(join(dir, 'releasevalidation')) ? readdirSync(join(dir, 'releasevalidation')).sort() : [];
function semFalha(r) { assert.equal(r.code, 0, r.texto.split('\n').slice(-30).join('\n')); return r; }

before(() => {
  if (pular) return;
  tmp = mkdtempSync(join(tmpdir(), 'publicar-ensaio-'));
  repo = join(tmp, 'repo'); cache = join(tmp, 'cache');
  mkdirSync(repo); mkdirSync(cache);
  copiarArvoreDeTrabalho(root, repo);
  git(repo, 'init', '-q', '-b', 'main');
  git(repo, 'add', '--', '.');
  git(repo, 'commit', '-q', '-m', 'A');
  shas.A = git(repo, 'rev-parse', 'HEAD');
  appendFileSync(join(repo, 'README.md'), '\nLinha nova do ensaio.\n');
  git(repo, 'commit', '-q', '-a', '-m', 'B');
  shas.B = git(repo, 'rev-parse', 'HEAD');
});
after(() => { if (tmp) rmSync(tmp, { recursive: true, force: true }); });

test('a raiz é a última tag de produção e a prévia sai no caminho dela', { skip: pular }, () => {
  git(repo, 'tag', 'producao-20990101-0000', shas.A);
  git(repo, 'tag', 'validacao-9.9.1', shas.A);
  const r = semFalha(motor());
  assert.equal(r.resumo.raiz.tag, 'producao-20990101-0000');
  assert.equal(versaoEm(r.saida).sha, shas.A);
  assert.deepEqual(previasEm(r.saida), ['9.9.1']);
  const daPrevia = versaoEm(r.saida, 'releasevalidation', '9.9.1');
  assert.equal(daPrevia.sha, shas.A);
  assert.equal(daPrevia.release, '9.9.1');
  assert.match(readFileSync(join(r.saida, 'robots.txt'), 'utf8'), /Disallow: \/releasevalidation\//);
});

test('uma promoção nova troca a raiz e mantém as prévias', { skip: pular }, () => {
  git(repo, 'tag', 'producao-20990102-0000', shas.B);
  const r = semFalha(motor());
  assert.equal(versaoEm(r.saida).sha, shas.B);
  assert.deepEqual(previasEm(r.saida), ['9.9.1']);
  assert.equal(versaoEm(r.saida, 'releasevalidation', '9.9.1').sha, shas.A);
});

test('uma prévia nova entra e mantém a raiz', { skip: pular }, () => {
  git(repo, 'tag', 'validacao-9.9.2', shas.B);
  const r = semFalha(motor());
  assert.equal(versaoEm(r.saida).sha, shas.B);
  assert.deepEqual(previasEm(r.saida), ['9.9.1', '9.9.2']);
  assert.equal(versaoEm(r.saida, 'releasevalidation', '9.9.2').sha, shas.B);
});

test('apagar a tag de prévia tira a prévia do ar na publicação seguinte', { skip: pular }, () => {
  git(repo, 'tag', '-d', 'validacao-9.9.1');
  const r = semFalha(motor());
  assert.equal(versaoEm(r.saida).sha, shas.B);
  assert.deepEqual(previasEm(r.saida), ['9.9.2']);
});

test('o teto deixa no ar as prévias mais novas pela ordem de versão', { skip: pular }, () => {
  git(repo, 'tag', 'validacao-9.9.10', shas.B);
  const plano = semFalha(motor({ ensaio: true, maximo: 1 })).resumo;
  assert.deepEqual(plano.previas.map(p => p.release), ['9.9.10']);
  assert.deepEqual(plano.foraDoTeto, ['validacao-9.9.2']);
  git(repo, 'tag', '-d', 'validacao-9.9.10');
  const r = semFalha(motor({ maximo: 0 }));
  assert.deepEqual(previasEm(r.saida), []);
  assert.equal(versaoEm(r.saida).sha, shas.B);
});

test('tag producao-* fora do padrão não vira raiz', { skip: pular }, () => {
  git(repo, 'tag', 'producao-teste', shas.A);
  const plano = semFalha(motor({ ensaio: true })).resumo;
  assert.equal(plano.raiz.tag, 'producao-20990102-0000');
  assert.deepEqual(plano.ignoradas, ['producao-teste']);
  git(repo, 'tag', '-d', 'producao-teste');
});

test('release inválida reprova antes de compilar', { skip: pular }, () => {
  git(repo, 'tag', 'validacao-a@b', shas.B);
  const r = motor();
  assert.equal(r.code, 1);
  assert.match(r.texto, /release inválida: validacao-a@b/);
  assert.equal(existsSync(r.saida), false);
  git(repo, 'tag', '-d', 'validacao-a@b');
});

test('commit sem suporte à prévia reprova antes de compilar', { skip: pular }, () => {
  git(repo, 'rm', '-q', 'src/lib/previa.mjs');
  git(repo, 'commit', '-q', '-m', 'C sem a regra da prévia');
  git(repo, 'tag', 'validacao-9.9.3', 'HEAD');
  const r = motor();
  assert.equal(r.code, 1);
  assert.match(r.texto, /sem suporte ao base \(src\/lib\/previa\.mjs ausente\): validacao-9\.9\.3/);
  assert.equal(existsSync(r.saida), false);
  git(repo, 'tag', '-d', 'validacao-9.9.3');
});

test('sem tag de produção não há raiz para publicar', { skip: pular }, () => {
  const vazio = join(tmp, 'sem-producao');
  mkdirSync(vazio);
  writeFileSync(join(vazio, 'LEIAME'), 'ensaio\n');
  git(vazio, 'init', '-q', '-b', 'main');
  git(vazio, 'add', '--', 'LEIAME');
  git(vazio, 'commit', '-q', '-m', 'só uma prévia');
  git(vazio, 'tag', 'validacao-1.0.0', 'HEAD');
  const r = motor({ ensaio: true, repositorio: vazio });
  assert.equal(r.code, 1);
  assert.match(r.texto, /Nenhuma tag producao-AAAAMMDD-HHMM/);
});

test('pasta de publicação ocupada reprova antes de compilar', { skip: pular }, () => {
  const ocupada = join(tmp, 'publicacao-' + (rodada + 1));
  mkdirSync(ocupada);
  writeFileSync(join(ocupada, 'sobra.txt'), 'x');
  const r = motor();
  assert.equal(r.code, 1);
  assert.match(r.texto, /não está vazia/);
});

test('a ordem de versão põe a release final antes da rc', { skip: pular }, () => {
  git(repo, 'tag', 'validacao-1.0.0', shas.B);
  git(repo, 'tag', 'validacao-1.0.0-rc.1', shas.B);
  const plano = semFalha(motor({ ensaio: true, maximo: 9 })).resumo;
  assert.deepEqual(plano.previas.map(p => p.release), ['9.9.2', '1.0.0', '1.0.0-rc.1']);
  git(repo, 'tag', '-d', 'validacao-1.0.0', 'validacao-1.0.0-rc.1');
});

test('a tag do disparo precisa entrar na publicação', { skip: pular }, () => {
  const antiga = motor({ ensaio: true, extras: ['--tag-do-disparo', 'producao-20990101-0000'] });
  assert.equal(antiga.code, 1);
  assert.match(antiga.texto, /A tag producao-20990101-0000 não vira a raiz/);
  semFalha(motor({ ensaio: true, extras: ['--tag-do-disparo', 'producao-20990102-0000'] }));
  const foraDoTeto = motor({ ensaio: true, maximo: 0, extras: ['--tag-do-disparo', 'validacao-9.9.2'] });
  assert.equal(foraDoTeto.code, 1);
  assert.match(foraDoTeto.texto, /A prévia validacao-9.9.2 fica fora do teto de 0/);
  semFalha(motor({ ensaio: true, extras: ['--tag-do-disparo', 'validacao-9.9.2'] }));
});

test('o cache não reaproveita build que reprovou no postbuild', { skip: pular }, () => {
  git(repo, 'checkout', '-q', shas.B);
  writeFileSync(join(repo, 'src/data/ensaio.ts'), 'export default ' + JSON.stringify('ensaio' + String.fromCharCode(64) + 'example.invalid') + ';\n');
  git(repo, 'add', '--', 'src/data/ensaio.ts');
  git(repo, 'commit', '-q', '-m', 'D com e-mail que o check:public recusa');
  const sha = git(repo, 'rev-parse', 'HEAD');
  git(repo, 'tag', 'validacao-9.9.4', sha);
  for (const rodadaDoCache of [1, 2]) {
    const r = motor();
    assert.equal(r.code, 1, 'rodada ' + rodadaDoCache);
    assert.match(r.texto, /\(prévia 9\.9\.4\) falhou/);
    assert.ok(!r.texto.includes('build reaproveitada: ' + sha), 'rodada ' + rodadaDoCache + ' reaproveitou a build que reprovou');
  }
  git(repo, 'tag', '-d', 'validacao-9.9.4');
  // Sem o marcador de build verde, nem um dist completo no cache é reaproveitado: a build é refeita.
  rmSync(join(cache, shas.B + '-9.9.2', '.publicar-build-ok'));
  const refeita = semFalha(motor());
  assert.ok(refeita.texto.includes('build de ' + shas.B.slice(0, 7) + ' como prévia 9.9.2'), 'a build sem marcador foi reaproveitada');
});

test('o workflow publica a árvore composta só por tag, com permissões por job', () => {
  const texto = readFileSync(join(root, '.github/workflows/publicar.yml'), 'utf8');
  for (const trecho of ["tags: ['producao-*', 'validacao-*']", '\n  delete:\n', '\n  workflow_dispatch:\n',
    "startsWith(github.event.ref, 'validacao-')", "format('pages-ignorado-{0}', github.run_id)", 'cancel-in-progress: false',
    'persist-credentials: false', 'timeout-minutes: 30', '\npermissions:\n  contents: read\n',
    '    permissions:\n      pages: write\n      id-token: write\n', '--tag-do-disparo "$GITHUB_REF_NAME"',
    'node scripts/publicar.mjs --saida publicacao', 'conferir publicacao/versao.json', 'path: publicacao']) {
    assert.ok(texto.includes(trecho), trecho);
  }
  assert.ok(!/workflow_dispatch:\s*\n\s+inputs:/.test(texto), 'o disparo manual não escolhe a raiz');
  const linhas = texto.split('\n');
  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].match(/^(\s*)(?:- )?run:(.*)$/);
    if (!m) continue;
    const bloco = [m[2]];
    for (let j = i + 1; j < linhas.length && (linhas[j].trim() === '' || linhas[j].search(/\S/) > m[1].length); j++) bloco.push(linhas[j]);
    assert.ok(!bloco.join('\n').includes('$' + '{{'), 'run com expressão do GitHub perto da linha ' + (i + 1));
  }
});
