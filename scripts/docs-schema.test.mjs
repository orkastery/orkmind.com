import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8').replace(/^export default /, '').replace(/;\s*$/, ''));
test('catalog declares local modules and a public source', () => {
 const c = read('../src/data/docs-catalog.ts');
 assert.equal(c.schemaVersion, 1);
 assert.ok(Array.isArray(c.modules));
 assert.equal(new Set(c.modules).size, c.modules.length);
 assert.ok(c.modules.every(x => /^docs-[a-z]+\.ts$/.test(x)));
 assert.match(c.repository, /^https:\/\/github.com\/orkastery\//);
});
test('monthly summary is explicit in each language', () => {
 const r = read('../src/data/roadmap.json');
 assert.deepEqual(Object.keys(r.summary).sort(), ['en','es','pt']);
 assert.equal(new Set(Object.values(r.summary)).size, 3);
 assert.ok(Date.parse(r.nextReview) > Date.parse(r.updatedAt));
});
