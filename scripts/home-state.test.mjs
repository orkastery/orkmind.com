// A lógica da home (src/lib/home-state.mjs) e o texto dela (src/data/home.ts) cumprem o contrato da
// página: o estado inicial, o relógio de cada entrada do orkmind list, a recusa da regra protegida
// no diagrama, a matriz das integrações, as abas das etapas e a noite pela rolagem. O jade (o acento
// da Partitura do OrkMind) só aparece no que espera você, e os canários mostram que a conferência
// pega o acento fora do lugar. O inglês tem a mesma forma do português: os mesmos campos, listas,
// números, comandos e saídas de terminal.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {entradas,topo,integracoes,integracaoDetalhe,etapas,etapaDetalhe,nightVals,nightItems,nightProgress,barra,ESTADO_INICIAL,ETAPAS,RETIDA_EM,C,cor,mistura} from '../src/lib/home-state.mjs';
import {codeParts} from '../src/lib/technical-text.mjs';
import home from '../src/data/home.ts';

const t=home.pt;
const TIQUES=Array.from({length:25},(_,i)=>i);
const JADE=new Set(['espera','espera-texto',C.waitS]);

// As saídas da lógica num tique: o que a página pinta com cor.
function saidas(t,tick){
 return {entradas:entradas(t,tick),topo:topo(t,tick),noite:nightItems(t,1),
  integracoes:t.integrations.list.map((_,sel)=>integracoes(t,sel)),etapas:Array.from({length:ETAPAS},(_,sel)=>etapas(t,sel))};
}
// Onde o jade aparece fora do que espera você (a entrada em conflito, o nó que recusa a regra
// protegida e o evento da noite que espera você).
export function acentoForaDoLugar(s){
 const fora=[];
 for(const l of s.entradas)for(const c of [...l.segs,l.dot,l.fg,l.rowBg])if(JADE.has(c)&&l.estado!=='hold')fora.push('entrada '+l.name);
 for(const f of s.topo.coreFns)for(const c of [f.bg,f.fg,f.bd])if(JADE.has(c))fora.push('função '+f.t);
 for(const g of s.topo.groups)for(const n of g.nodes)for(const c of [n.sbg,n.sfg,n.dot,...n.segs])if(JADE.has(c)&&!n.recusou)fora.push('nó '+n.n);
 for(const c of [...s.topo.collections.flatMap(x=>[x.bg,x.fg,x.bd]),...s.topo.history.flatMap(h=>[h.bg,h.fg]),...s.topo.legend.map(l=>l.c)])if(JADE.has(c))fora.push('coleções e histórico');
 for(const linhas of s.integracoes)for(const l of linhas)for(const c of [l.bg,...l.blocks.flatMap(b=>[b.bg,b.fg,b.bd])])if(JADE.has(c))fora.push('integração '+l.tag);
 for(const abas of s.etapas)for(const f of abas)for(const c of [f.bg,f.fg,f.bd])if(JADE.has(c))fora.push('etapa '+f.name);
 for(const it of s.noite)if(it.c!=='espera'&&(JADE.has(it.fill)||it.glow.includes('--espera')))fora.push('noite '+it.t);
 return fora;
}

test('estado inicial: relógio parado, Governar, Hermes e a noite no começo',()=>{
 assert.deepEqual({...ESTADO_INICIAL},{tick:0,stage:2,integration:0,np:0});
});

test('orkmind list: o conflito espera você parado, a suspeita fica retida e as outras andam uma etapa a cada três tiques',()=>{
 const g=t.governance,espera=g.entries.findIndex(e=>e.hold),retida=g.entries.findIndex(e=>e.retained);
 assert.ok(espera>=0&&retida>=0&&espera!==retida);
 for(const tick of TIQUES){
  const linhas=entradas(t,tick);
  assert.equal(linhas.length,7);
  linhas.forEach((l,i)=>{
   assert.equal(l.segs.length,ETAPAS);
   if(i===espera){
    assert.deepEqual([l.estado,l.label,l.dot,l.fg,l.phase],['hold',g.states.hold,'espera','espera-texto',t.path.stages[l.p].toUpperCase()+' ●']);
    assert.equal(l.segs[l.p],'espera');
   }else if(i===retida){
    assert.deepEqual([l.estado,l.label,l.dot,l.fg,l.phase],['retained',g.states.retained,'falha','falha-texto',t.path.stages[RETIDA_EM].toUpperCase()+' ×']);
   }else{
    const cur=(l.p+Math.floor((tick+l.o)/3))%(ETAPAS+1);
    if(cur===ETAPAS){
     assert.deepEqual([l.estado,l.label,l.phase],['ok',g.states.ok,t.path.stages[ETAPAS-1].toUpperCase()+' ✓']);
     assert.ok(l.segs.every(s=>s==='verificado'));
    }else{
     assert.deepEqual([l.estado,l.label,l.dot,l.phase],['run',g.states.run,'executando',t.path.stages[cur].toUpperCase()+' …']);
     l.segs.forEach((s,k)=>assert.equal(s,k<cur?C.done:k===cur?'executando':'linha'));
    }
   }
  });
 }
});

test('barra de seis etapas: o rótulo acessível diz o estado de cada etapa',()=>{
 const w=t.governance.stageWords,[g,v,go,r,i,a]=t.path.stages;
 assert.equal(barra(t,'hold',2),`${g}: ${w.done}, ${v}: ${w.done}, ${go}: ${w.wait}, ${r}: ${w.next}, ${i}: ${w.next}, ${a}: ${w.next}`);
 assert.equal(barra(t,'ok',ETAPAS),t.path.stages.map(n=>`${n}: ${w.done}`).join(', '));
 for(const l of entradas(t,0))assert.equal(l.barra.split(', ').length,ETAPAS);
});

test('diagrama: oito nós em três grupos, uma função ativa por tique e a regra protegida recusada cinco tiques a cada doze',()=>{
 for(const tick of TIQUES){
  const v=topo(t,tick),nos=v.groups.flatMap(g=>g.nodes);
  assert.equal(nos.length,8);
  assert.deepEqual(v.groups.map(g=>g.nodes.length),[2,3,3]);
  assert.equal(v.coreFns.filter(f=>f.ativo).length,1);
  assert.ok(v.coreFns[tick%t.system.fns.length].ativo);
  const recusa=tick%12>=4&&tick%12<9;
  for(const n of nos){
   const guardado=t.system.groups.flatMap(g=>g.nodes).find(x=>x.n===n.n).guarded===true;
   assert.equal(n.recusou,recusa&&guardado,'recusa '+tick+' '+n.n);
   assert.equal(n.state,n.recusou?t.system.refused:t.system.active);
   assert.deepEqual([n.dot,n.sfg],n.recusou?['espera','espera-texto']:['verificado','verificado-texto']);
  }
  assert.deepEqual(v.collections.map(c=>c.id),t.system.collections);
  assert.equal(v.collections.length,23);
  for(const c of v.collections)assert.equal(c.bs,c.fora?'dashed':'solid');
  assert.equal(v.history.length,3);
  assert.deepEqual([v.history[0].prefixo,v.history[0].fg],['✓','verificado-texto']);
 }
});

test('integrações: plugin contínuo em todo turno; MCP e CLI tracejados até recuperar, com contorno de 3:1 ou mais',()=>{
 const l=integracoes(t,0);
 assert.deepEqual(l.map(x=>x.tag),['Hermes','OpenClaw','MCP','CLI']);
 assert.deepEqual(l.map(x=>x.on),[true,false,false,false]);
 for(const x of l.slice(0,2))assert.deepEqual(x.blocks.map(b=>[b.col,b.sobDemanda]),[['1 / span 6',false]]);
 for(const x of l.slice(2))assert.deepEqual(x.blocks.map(b=>[b.col,b.sobDemanda]),[['1 / span 4',true],['6 / span 1',false]]);
 for(let sel=0;sel<4;sel++)for(const x of integracoes(t,sel))for(const b of x.blocks){
  if(b.sobDemanda)assert.ok(['texto','texto-3'].includes(b.bd),'tracejado visível: '+b.bd);
  else assert.equal(b.bd,'transparent');
 }
 const d=integracaoDetalhe(t,2);
 assert.deepEqual([d.when,d.use],['MCP · para quando',t.integrations.list[2].use]);
});

test('etapas: a aba escolhida usa a cor de ação, e cada etapa entrega e exige com o identificador do código',()=>{
 const abas=etapas(t,ESTADO_INICIAL.stage);
 assert.deepEqual(abas.map(a=>a.n),['01','02','03','04','05','06']);
 assert.deepEqual([abas[2].bg,abas[2].fg,abas[2].bd],['acao','sobre-acao','acao']);
 for(const a of abas.filter(a=>!a.on))assert.deepEqual([a.bg,a.fg,a.bd],['superficie','texto','linha']);
 const d=etapaDetalhe(t,2);
 assert.deepEqual([d.gives,d.code],['Governar entrega','ProtectionError']);
 assert.deepEqual(t.path.details.map(x=>x.code),['uq_memories_collection_content_hash','ValidationError','ProtectionError','StoreCapabilities','## ALERTA: Regras de Governanca Indisponiveis','memory_versions']);
});

test('noite: o relógio vai de 23:00 a 07:00 com a rolagem e o resumo só aparece no fim',()=>{
 assert.deepEqual([nightVals(0).clock,nightVals(0.5).clock,nightVals(1).clock],['23:00','03:00','07:00']);
 assert.deepEqual([nightVals(0.9).morningOp,nightVals(0.95).morningOp],[0.22,1]);
 assert.deepEqual(nightItems(t,0).map(e=>e.on),[true,false,false,false,false]);
 assert.ok(nightItems(t,1).every(e=>e.on&&e.op===1));
 assert.deepEqual(nightItems(t,1).map(e=>e.c),['executando','falha','verificado','verificado','espera']);
 assert.equal(nightProgress(900*0.55,2000,900),0);
 assert.equal(nightProgress(-5000,2000,900),1);
});

test('jade só no que espera você, em todo tique',()=>{
 for(const tick of TIQUES)assert.deepEqual(acentoForaDoLugar(saidas(t,tick)),[],'tique '+tick);
});

test('canários: o jade fora do lugar é pego em cada parte da página',()=>{
 const mutacoes=[
  ['entrada que anda',s=>{s.entradas.find(l=>l.estado==='run').dot='espera';}],
  ['função da camada',s=>{s.topo.coreFns[0].bg=C.waitS;}],
  ['nó que não recusa',s=>{s.topo.groups[0].nodes[0].dot='espera';}],
  ['coleção',s=>{s.topo.collections[0].bg='espera';}],
  ['integração',s=>{s.integracoes[2][2].blocks[0].bd='espera';}],
  ['aba da etapa',s=>{s.etapas[0][0].bg='espera';}],
  ['evento da noite',s=>{s.noite[0].fill='espera';}],
 ];
 for(const [nome,mudar] of mutacoes){
  const s=structuredClone(saidas(t,5));
  assert.deepEqual(acentoForaDoLugar(s),[],nome+': antes da mutação');
  mudar(s);
  assert.ok(acentoForaDoLugar(s).length>0,'canário não pegou: '+nome);
 }
});

test('cor: nome de token vira var(--nome); mistura e transparente passam como estão',()=>{
 assert.equal(cor('texto'),'var(--texto)');
 assert.equal(cor(mistura('espera',22,'superficie')),'color-mix(in srgb,var(--espera) 22%,var(--superficie))');
 assert.equal(cor('transparent'),'transparent');
});

// O inglês é tradução do português: a mesma árvore, com as mesmas listas, números, cores de estado,
// identificadores e códigos. Comandos com conteúdo entre aspas mudam só dentro das aspas (cada
// língua gravou o próprio texto numa sessão real da 0.4.0); a saída do produto sai em português nas
// duas línguas, e só os IDs gerados mudam.
const IGUAIS=new Set(['c','kc','k','code','href','layerName','collectionsCmd','boardCmd','reviewError','license']);
function forma(a,b,caminho=''){
 assert.equal(typeof a,typeof b,caminho);
 if(Array.isArray(a)){assert.equal(a.length,b.length,caminho);a.forEach((x,i)=>forma(x,b[i],caminho+'['+i+']'));return;}
 if(a&&typeof a==='object'){assert.deepEqual(Object.keys(a),Object.keys(b),caminho);for(const k of Object.keys(a))forma(a[k],b[k],caminho+'.'+k);return;}
 const campo=caminho.split('.').at(-1).replace(/(\[\d+\])+$/,'');
 if(typeof a!=='string'||IGUAIS.has(campo))assert.deepEqual(a,b,caminho);
}
const semAspas=v=>v.replace(/--content "[^"]*"/,'--content "…"');
const semIds=v=>v.replace(/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/g,'ID').replace(/\b[0-9a-f]{8}\.\./g,'ID..');
test('inglês com a forma do português: campos, listas, números, comandos e códigos iguais',()=>{
 forma(home.pt,home.en);
 const codigos=o=>JSON.stringify(o).match(/`[^`]+`/g)||[];
 assert.deepEqual(codigos(home.en),codigos(home.pt),'os mesmos trechos de código, na mesma ordem');
 assert.deepEqual(home.en.system.collections,home.pt.system.collections);
 assert.deepEqual(home.en.integrations.list.map(i=>i.tag),home.pt.integrations.list.map(i=>i.tag));
 home.pt.proof.demo.forEach((d,i)=>{
  const en=home.en.proof.demo[i];
  if(d.kc==='prompt')assert.equal(semAspas(en.v),semAspas(d.v),'comando '+i);
  if(d.kc==='saida'&&!d.v.startsWith('['))assert.equal(semIds(en.v),semIds(d.v),'saída '+i);
 });
 home.pt.governance.warnings.forEach((w,i)=>{
  const en=home.en.governance.warnings[i];
  assert.equal(semAspas(en.cmd),semAspas(w.cmd),'comando do aviso '+i);
  assert.deepEqual(en.out.map(semIds),w.out.map(semIds),'saída do aviso '+i);
 });
});

test('texto da home: crase equilibrada, sem travessão e sem vocabulário proibido pelo kit',()=>{
 const textos=[];
 const coletar=o=>{if(typeof o==='string')textos.push(o);else if(o&&typeof o==='object')Object.values(o).forEach(coletar);};
 coletar(home);
 for(const s of textos)codeParts(s);
 for(const s of textos){
  assert.ok(!/[‒-―]/.test(s),'travessão: '+s.slice(0,60));
  assert.ok(!/afrouxar|batuta|metr[oô]nomo|bernstein|\bpausas?\b|\bpause[sd]?\b|disruptiv/i.test(s),'vocabulário proibido: '+s.slice(0,60));
 }
});
