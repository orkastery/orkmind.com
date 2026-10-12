// Testes da prévia de release em /releasevalidation/<release>/: a regra do modo da build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFIXO_DA_PREVIA, releaseValida, baseDaRelease, normalizarBase, releaseDaBase, baseDoAmbiente,
  textoDaFaixa, ROBOTS_DA_RAIZ, temRegraDoRobots, versaoDaBuild
} from '../src/lib/previa.mjs';

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
