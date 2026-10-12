import {test} from 'node:test';
import assert from 'node:assert/strict';
import {codeParts,plainText,technicalUnits,technicalHtml,technicalSvg,codeSegments,codeHtml} from '../src/lib/technical-text.mjs';
import {violations,scaleViolations,glueViolations,cssCanaries,checkCode,proseExceptions,productNames} from './check-code.mjs';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('a backtick span becomes code and the prose around it stays escaped text',()=>{
 assert.equal(technicalHtml('Configure `ORKMIND_DATABASE_URL` no ambiente protegido'),'Configure <code>ORKMIND_<wbr>DATABASE_URL</code> no ambiente protegido');
 assert.equal(technicalHtml('O CLI e o MCP devolvem memória sob demanda'),'O CLI e o MCP devolvem memória sob demanda');
 assert.equal(technicalHtml('<script>alert(1)</script> & "x"'),'&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;');
 assert.equal(technicalHtml('Use `<thread>` e `a&b`'),'Use <code>&lt;thread&gt;</code> e <code>a&amp;b</code>');
});

test('an unbalanced, empty or padded backtick span fails the build instead of leaking',()=>{
 for(const text of ['Use `orkmind store info.','Use `` aqui.','Use ` get` aqui.','Use `get ` aqui.','a ` b ` c ` d']){
  assert.throws(()=>technicalHtml(text),/backtick|code span/,text);
  assert.throws(()=>plainText(text),/backtick|code span/,text);
 }
 assert.deepEqual(codeParts(''),[]);
});

test('plain text for title, meta and SVG title drops only the marks',()=>{
 assert.equal(plainText('`NativeMemoryProvider`'),'NativeMemoryProvider');
 assert.equal(plainText('A `GovernedStore` aplica a ACL.'),'A GovernedStore aplica a ACL.');
 assert.equal(plainText('Sem código.'),'Sem código.');
});

test('what touches the chip travels with it in one unit with slack',()=>{
 assert.deepEqual(technicalUnits('produtos (`prod`), projetos'),[{text:'produtos '},{open:'(',code:'prod',close:'),'},{text:' projetos'}]);
 assert.deepEqual(technicalUnits('Use `orkmind stats` e siga.'),[{text:'Use '},{open:'',code:'orkmind stats',close:''},{text:' e siga.'}]);
 assert.equal(technicalHtml('As operações são `get`, `query` e `history`.'),'As operações são <span class="code-unit" style="--folga:0.6ch"><code>get</code>,</span> <code>query</code> e <span class="code-unit" style="--folga:0.6ch"><code>history</code>.</span>');
 assert.equal(technicalHtml('produtos (`prod`), projetos'),'produtos <span class="code-unit" style="--folga:1.8ch">(<code>prod</code>),</span> projetos');
 // Pontuação estreita pesa menos que letra ou símbolo; a folga tem teto de 12.
 assert.match(technicalHtml('Veja `a`=1, depois.'),/--folga:2\.6ch/);
 assert.match(technicalHtml('Veja `a`'+'b'.repeat(30)+' depois.'),/--folga:12ch/);
 // Dois códigos separados só por pontuação: ela fica com o primeiro, sem embrulhar duas vezes.
 assert.equal(technicalHtml('`a`/`b`'),'<span class="code-unit" style="--folga:1ch"><code>a</code>/</span><code>b</code>');
});

test('break points inside code fall after separators and on camel humps, never inside a word',()=>{
 assert.deepEqual(codeSegments('NativeMemoryProvider'),['Native','Memory','Provider']);
 assert.deepEqual(codeSegments('orkmind.company-brain/v1'),['orkmind.','company-','brain/v1']);
 assert.deepEqual(codeSegments('.ork-ci/<thread>.json'),['.ork-','ci/','<thread>.json']);
 assert.deepEqual(codeSegments('ORK_TESTE_EXIGE_AMBIENTE=1'),['ORK_','TESTE_','EXIGE_','AMBIENTE=1']);
 // O último pedaço curto (extensão, versão, sigla) não fica sozinho na linha de baixo.
 assert.deepEqual(codeSegments('orkastery/docs/guias/contribuir/com-o-ork.md'),['orkastery/','docs/','guias/','contribuir/','com-','o-','ork.md']);
 assert.deepEqual(codeSegments('ORKMIND_PROVIDER_TEST_DATABASE_URL'),['ORKMIND_','PROVIDER_','TEST_','DATABASE_URL']);
 for(const whole of ['--collection','get','brain.*','orkmind brain request','sha256','_ci'])assert.deepEqual(codeSegments(whole),[whole]);
 assert.equal(codeHtml('get'),'<code>get</code>');
 assert.equal(codeHtml('docs/contribuir'),'<code>docs/<wbr>contribuir</code>');
});

test('code inside the SVG becomes a monospace tspan; the rest stays text',()=>{
 assert.equal(technicalSvg('`done` · `entry_id` confirmado'),'<tspan class="code">done</tspan> · <tspan class="code">entry_id</tspan> confirmado');
 assert.equal(technicalSvg('Lê e grava'),'Lê e grava');
 assert.equal(technicalSvg('`<x>` & y'),'<tspan class="code">&lt;x&gt;</tspan> &amp; y');
 assert.throws(()=>technicalSvg('`aberto'),/backtick/);
});

test('identifiers left in PT, EN and ES prose fail the code audit',()=>{
 for(const sentence of ['Configure ORKMIND_DATABASE_URL no ambiente.','A GovernedStore aplica a ACL.','The orkmind.company-brain/v1 contract.','Consulte docs/contribuir hoje.','El paquete queda en .ork-ci/<thread>.json.','Use --tags agora.','Rode orkmind store info.','Usar o ork é opcional.','Sai em contract_hash.','Completa [[link]] sozinho.','Canal em SECURITY.md.','Código brain.* sem eco.','Chama assembleTurn aqui.','No ruff nem no mypy.']){
  assert.ok(violations(`<p>${sentence}</p>`).length,sentence);
 }
});
test('the same identifiers rendered as code pass the audit',()=>{
 for(const text of ['Configure `ORKMIND_DATABASE_URL` no ambiente.','A `GovernedStore` aplica a ACL.','The `orkmind.company-brain/v1` contract.','Consulte `docs/contribuir` hoje.','El paquete queda en `.ork-ci/<thread>.json`.','Use `--tags` agora.','Rode `orkmind store info`.','Usar o `ork` é opcional.','Sai em `contract_hash`.','Completa `[[link]]` sozinho.','Canal em `SECURITY.md`.','Código `brain.*` sem eco.']){
  assert.deepEqual(violations(`<p>${technicalHtml(text)}</p>`),[],text);
 }
});
test('product names, domains, acronyms, versions and the breadcrumb stay prose',()=>{
 for(const html of ['<p>OrkMind, OpenClaw e GitHub sobre PostgreSQL com pgvector, no PyPI.</p>','<p>maestro@orkastery.com · orkmind.com</p>','<p>MCP, CLI, ACL, RRF, TTL, AES-256-GCM, append-only e compare-and-swap.</p>','<p>OrkMind 0.4.0, Python 3.11 e Node.js.</p>','<nav><a href="/">Início</a><span aria-hidden="true">/</span><a href="/docs/">Documentação</a><span aria-hidden="true">/</span><span>Coleções, tags e portfólio</span></nav>','<p>Entrada e/ou saída.</p>']){
  assert.deepEqual(violations(html),[],html);
 }
});
test('inline tags and entities never hide an identifier; separate items never join into one',()=>{
 assert.deepEqual(violations('<p>A Govern<b>ed</b>Store aplica.</p>'),['GovernedStore']);
 assert.deepEqual(violations('<p>ORKMIND&#95;DATABASE&#95;URL</p>'),['ORKMIND_DATABASE_URL']);
 assert.deepEqual(violations('<p>Rode <em>orkmind</em> <code>stats</code>.</p>'),['orkmind']);
 assert.deepEqual(violations('<nav><a href="/">Home</a><a href="/docs/">Documentation</a><a href="/c/">Concepts</a></nav>'),[]);
 assert.deepEqual(violations('<a rel="next" href="/x/"><small>Next</small>Memory architecture</a>'),[]);
 // Painel escondido e aria-hidden não isentam: podem aparecer.
 assert.deepEqual(violations('<div hidden><p aria-hidden="true">Use contract_hash.</p></div>'),['contract_hash']);
});
test('SVG: tspan.code is code, title and desc take no markup, other SVG text is audited',()=>{
 assert.deepEqual(violations('<svg><title>GovernedStore</title><desc>A GovernedStore aplica.</desc><text><tspan class="code">GovernedStore</tspan><tspan x="1" class="node-detail">acesso</tspan></text></svg>'),[]);
 assert.deepEqual(violations('<svg><text><tspan>GovernedStore</tspan></text></svg>'),['GovernedStore']);
 // Rótulo e detalhe em linhas diferentes do SVG não se juntam num identificador falso.
 assert.deepEqual(violations('<svg><text><tspan>Integração</tspan><tspan x="75">Contexto</tspan></text></svg>'),[]);
});
test('every prose exception is exact and cannot hide a neighbouring identifier',()=>{
 assert.equal(new Set(proseExceptions).size,proseExceptions.length);
 for(const phrase of [...proseExceptions,...productNames]){
  assert.deepEqual(violations(`<p>${phrase}</p>`),[],phrase);
  assert.deepEqual(violations(`<p>${phrase} com contract_hash</p>`),['contract_hash'],phrase);
 }
});
test('inline code keeps the shared scale of its paragraph and a unit glues at most 12 characters',()=>{
 assert.deepEqual(scaleViolations('<p>Com <code>get</code> e <code class="mono">query</code>.</p>'),['<code class="mono">']);
 assert.deepEqual(scaleViolations('<p>Com <code>get</code> e <code>query</code>.</p>'),[]);
 const longa=technicalHtml('Veja `a`'+'b'.repeat(30)+' depois.');
 assert.equal(glueViolations(`<p>${longa}</p>`).length,1);
 assert.deepEqual(glueViolations(`<p>${technicalHtml('Estados `ok`, `empty` e (`init`).')}</p>`),[]);
});
test('generated CSS must keep the atomic chip, the unit without breaks and the link underline',()=>{
 const css=':not(pre)>code{display:inline-block;max-width:100%}.code-unit{white-space:nowrap}a>code,a .code-unit,a .code-unit>code{text-decoration:inherit}';
 assert.equal(cssCanaries(css),true);
 assert.throws(()=>cssCanaries(css.replace('display:inline-block;','')),/split across lines/);
 assert.throws(()=>cssCanaries(css.replace('white-space:nowrap','white-space:normal')),/detach/);
 assert.throws(()=>cssCanaries(css.replace('a .code-unit>code{','a .code-unit>span{')),/underline/);
});
test('rendered-directory audit rejects a regression and accepts the repair',()=>{
 const dir=mkdtempSync(join(tmpdir(),'site-code-'));
 const css=':not(pre)>code{display:inline-block;max-width:100%}.code-unit{white-space:nowrap}a>code,a .code-unit,a .code-unit>code{text-decoration:inherit}';
 try{
  writeFileSync(join(dir,'site.css'),css);
  writeFileSync(join(dir,'index.html'),'<p>A <strong>Governed</strong>Store e ORKMIND_DATABASE_URL.</p>');
  assert.throws(()=>checkCode(dir),/Technical text outside code/);
  writeFileSync(join(dir,'index.html'),`<p>${technicalHtml('A `GovernedStore` e `ORKMIND_DATABASE_URL`.')}</p>`);
  assert.equal(checkCode(dir).unformatted,0);
  writeFileSync(join(dir,'site.css'),css.replace('.code-unit{white-space:nowrap}',''));
  assert.throws(()=>checkCode(dir),/detach/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
