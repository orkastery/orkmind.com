import {test} from 'node:test';
import assert from 'node:assert/strict';
import {codeParts,plainText,technicalUnits,technicalHtml,technicalSvg,codeSegments,codeHtml} from '../src/lib/technical-text.mjs';

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
