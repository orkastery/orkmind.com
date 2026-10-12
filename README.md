# OrkMind: site e documentação

Site estático Astro com português em `/` e inglês em `/en/`. Todas as páginas HTML
têm idioma, canonical, alternates recíprocos e seletor para a mesma página. Os slugs
e IDs técnicos permanecem estáveis entre línguas.

O espanhol saiu do site por decisão do dono. Cada URL `/es/` que existia (a home, o
índice das docs e cada artigo) é uma página estática de redirecionamento para a mesma
página em inglês: meta refresh, canonical na página em inglês, `noindex` e um script
que mantém o fragmento. `check:redirecionamentos` confere cada uma no build, e
`test:redirecionamentos` prova que um redirecionamento faltando, apontando para outro
lugar, sem `noindex` ou com página de conteúdo sobrando em `/es/` reprova.

## Desenvolvimento e prova local

Requer Node.js 22 e as dependências do lockfile. Com a instalação já preparada,
nenhuma etapa do build acessa a rede. As fontes, fontes tipográficas e ativos são locais.
Em uma instalação nova, `npm ci` prepara dependências; essa preparação exige que
os pacotes estejam disponíveis no cache ou no registry e não faz parte da prova offline.

```sh
npm run dev
npm run build
npm run partitura
node scripts/partitura.mjs --verificar
npm run docs:check
npm run check:links
npm run check:i18n
npm run check:public
npm run check:content
npm run check:design
npm run test:docs
npm run test:home
npm run test:design
npm run test:code
npm run check:code
```

O prebuild confere o snapshot e a revisão editorial. O postbuild confere HTML,
links, fragmentos, idiomas, metadados, redirecionamentos, padrões públicos, semântica,
o código no texto, a Partitura e a lógica da home, e executa canários negativos. Build aprovado não é revisão visual nem prova
de naturalidade da tradução. Links externos são inventariados, mas não consultados
pela prova offline.
`parse5` já integra a árvore do Astro; a mesma versão do lockfile é declarada
diretamente para os auditores de HTML, sem adicionar outro parser.

## Conteúdo e fontes

`src/data/docs-catalog.ts` lista módulos editoriais. Cada artigo tem slug, grupo,
fontes e texto explícito em PT e EN. Não há fallback silencioso ou tradução
remota durante o build. `docs-schema.ts` descreve o formato; o verificador valida
os módulos usados pelas rotas. Os arquivos `.ts` editoriais exportam dados JSON
por default para permitir leitura pelo Astro e por Node sem executar conteúdo.

`src/data/docs-sources.json` contém caminhos relativos, SHA-256, classificação,
tratamento e destinos das fontes. Cada revisão registra hash das fontes, hash
do texto, autor editorial e data. O inventário inclui documentação e metadados de
versão; não copia responsáveis pessoais nem conteúdo interno para o site.

```sh
# Use um clone local do repositório de produto correspondente.
npm run docs:sync -- --source /caminho/do/orkmind --orkastery-source /caminho/do/orkastery
npm run docs:check -- --source /caminho/do/orkmind --orkastery-source /caminho/do/orkastery

# Depois de revisar de fato as traduções e fontes afetadas:
npm run docs:sync -- --source /caminho/do/orkmind --orkastery-source /caminho/do/orkastery --review pt,en --reviewer executor-editorial --articles contribuir
npm run build
```

A página Contribuir usa o CONTRIBUTING do OrkMind e os guias do Orkastery.
`--orkastery-source` informa o checkout externo; seus caminhos locais não entram
no snapshot público. Sem essa opção, o padrão é o layout `orkastery/fontes/orkmind`,
com a fonte Orkastery dois níveis acima de `--source`.

A sincronização comum preserva os recibos anteriores, mas uma fonte alterada
invalida os hashes de revisão; não aprova traduções sozinha. `--review` é uma
atestação editorial explícita de quem executa o comando, não revisão humana
independente. Selecione em `--articles` somente os slugs alterados, separados por vírgula.
Os artigos fora da seleção preservam o revisor, a data e os hashes.
Não use a opção antes de ler os textos. Fonte nova sem destino,
fonte removida ainda referenciada e revisão desatualizada reprovam.

Sem `--source`, o build verifica apenas a integridade e cobertura do snapshot
versionado. Isso permite CI offline, mas não prova que o upstream não mudou.
Índices, modelos e marca têm tratamento explícito; roadmap é exceção deliberada:
um resumo mensal traduzido e um link para o repositório, sem cópia de tickets.

## Revisão mensal do roadmap

Revise `src/data/roadmap.json`, atualize `updatedAt`, `nextReview` e os dois resumos (PT e EN).
A página editorial `roadmap` contextualiza o mês em `docs-standards.ts` (Orkastery)
ou `docs-retrieval.ts` (OrkMind): atualize-a na mesma revisão e registre os hashes.
Uma intenção não é uma capacidade entregue. Datas de revisão não são prazos de entrega.

## Código no texto

Todo comando, caminho, flag e identificador técnico citado nas páginas sai como
código, e o código não se parte no meio da linha. No texto editorial (catálogos
`docs-*.ts`, `home.ts`, `docs-diagrams.ts` e as traduções dos componentes da home),
a crase marca o código: ``Configure `ORKMIND_DATABASE_URL` no ambiente``. O
renderizador `src/lib/technical-text.mjs`, usado por `TechnicalText.astro`,
transforma a crase em `<code>`, escapa o resto e reprova crase sem par. No SVG o
trecho vira `tspan.code`, em fonte monoespaçada; `<title>`, `meta description` e o
`title`/`desc` do SVG recebem o texto sem a marcação.

O chip é atômico (`inline-block` com `max-width: 100%`): um código que cabe na
coluna nunca se parte entre linhas, e um maior que ela quebra dentro do próprio
chip, nos pontos que o renderizador marca com `<wbr>` depois de `/`, `.`, `_`, `-`,
`=` e `:` e na troca de minúscula para maiúscula. O que encosta no chip
(parêntese, vírgula, dois-pontos) viaja com ele numa `.code-unit` sem quebra, que
reserva a folga do que foi colado.

Marque com crase o que a fonte marca como código: executável (`orkmind`, `ork`,
`ruff`), comando, opção, variável de ambiente, arquivo, caminho, classe, função,
campo, operação, estado, coleção, contrato, código de erro e a branch `main`. Nome
de produto e de padrão fica em prosa: OrkMind, PostgreSQL, Hermes, OpenClaw, MCP,
CLI, ACL, AES-256-GCM, append-only. `pgvector`, `memory` e `qdrant` são código quando
nomeiam o backend configurado; "PostgreSQL com pgvector", a extensão, fica em prosa.
Mudar o texto de um catálogo das docs pede a revisão editorial do artigo
(`docs:sync --review`, acima).

`check:code` lê a prosa visível das páginas geradas e reprova executável, opção,
variável de ambiente, `snake_case`, `camelCase`, `PascalCase` composto, arquivo,
identificador pontuado ou versionado, caminho, marcador e link de wiki fora de
`code`. As exceções são exatas e ficam no próprio script (nomes de produto,
`Node.js`, `e/ou`). Identificador em palavra comum (`get`, `pending`, `source`) só
o contexto distingue: o padrão não o vê, e a marcação depende de quem escreve. Se um
componente renderizar o texto sem o `TechnicalText`, a crase vaza para a página, e
`check:code` reprova qualquer crase na prosa visível. Também reprova código com mais
de 30 caracteres sem ponto de quebra (`<wbr>` ou espaço), código com escala própria
dentro do parágrafo, unidade colada a mais de 12 caracteres e a falta das regras do
chip no CSS gerado. Limites conhecidos, sem efeito no conteúdo de hoje: o padrão não
pega `-h`, `sha256`, `getURL`, `Dockerfile` nem variável sem sublinhado (`HOME`), e
reprovaria prosa como "e.g.", "leitura/escrita" e "JavaScript"; exceção nova entra
exata na lista do script.

## Design system: a Partitura do OrkMind

O site segue a Partitura, o design system do kit do dono (o `DESIGN.md` e o
`CLAUDE.md` do kit), com a mesma estrutura de tokens, as mesmas regras duras, a mesma
tipografia, o mesmo movimento e o mesmo cuidado de copy do site do Orkastery. Muda o que
é do OrkMind: narrativa, textos e cores.

Os tokens moram em `partitura/partitura.json`, no formato do kit, e
`partitura/partitura.css` sai dele por `npm run partitura` (não edite o CSS à mão).
`node scripts/partitura.mjs --verificar` confere a sincronia, prova que o mesmo gerador
reproduz byte a byte o `partitura.css` da família a partir do `partitura.json` dela
(cópia em `partitura/familia/`, com o sha256 registrado), refaz a derivação de cada cor
e mede o contraste; `--medidas` lista os pares. O `check:design` roda a mesma
verificação no build.

### A paleta, pelo método da família

Os neutros (névoa, papel, trilho, tinta, noite, luar), a regência (executando) e a brasa
(falha) são os da família. O acento deixa de ser o latão e passa a ser o jade, o verde do
símbolo do OrkMind (`marca/svg/simbolo.svg`), só para o que espera você. O verificado sai
da pátina, que ficaria a 14 graus do jade, e vai para a água, no matiz 210 do OKLCH, entre
o jade e a regência. Cada cor derivada mantém a luminância relativa da cor de origem na
família (e, com ela, todo contraste) e o croma relativo do papel, com o matiz próprio:

| Cor | Origem na família | Uso | Contraste |
| --- | --- | --- | --- |
| `--jade` #34D399 | o verde da marca | espera você, ponto de revisão humana | 9,07:1 em noite-2 |
| `--jade-tinta` #1A7554 | latão-tinta | texto de espera você no dia | 4,95:1 em névoa |
| `--agua` #3C96A5 | pátina | verificado | 5,07:1 em noite-2 |
| `--agua-tinta` #1F6874 | pátina-tinta | texto de verificado no dia | 5,59:1 em névoa |

Proporção de uso: névoa 58% · papel 18% · tinta 14% · trilho 6% · estados 3% · jade ≤ 1%.
Todo texto passa de 4,5:1; o menor par é 4,95:1. No tema noite, "executando" escreve em
luar (a regência não passa como texto) e a cor fica no ponto.

### Regras duras, conferidas no build

`check:design` reprova o build que:

- usa o jade fora do que espera você, do ponto de revisão, do chip de espera, do
  separador e da borda de luz do comando de instalação, no CSS ou num atributo `style` (a cor
  de estado da home só leva jade dentro de um elemento marcado com `data-espera`);
- tira o foco de um elemento sem o anel do kit (`box-shadow: var(--anel-foco)`);
- usa outra família que não Geist (títulos), Hanken Grotesk (texto) e IBM Plex Mono
  (prova), servidas do próprio site com a licença OFL em `public/licenses/`;
- escreve cor solta (hex, `rgb`, `hsl`) fora dos blocos de tokens, no CSS ou num
  atributo `style`;
- põe bloco de código, terminal ou comando copiável fora do tema noite;
- carrega folha de estilo, script, fonte ou imagem de fora;
- usa a marca fora dos arquivos de `marca/` ou a assinatura errada para o fundo;
- escreve no texto visível um termo que o kit proíbe, em português ou inglês e com as flexões,
  ou um travessão.

`test:design` prova, com canários, que cada uma dessas regras reprova a mutação que deve
pegar. Alvos de toque de 44 px, teclado e estouro lateral são conferidos no navegador
pelo `check:visual` (abaixo). O estado nunca vem só pela cor: chip com rótulo, glifo na
etapa (`…`, `●`, `✓`, `×`) e contorno tracejado no que só acontece quando alguém pede.

Títulos, menus, links, botões e rótulos usam caixa de frase; siglas, comandos e nomes
próprios conservam a grafia original. Os diagramas das docs têm `title`, `desc`,
relações numeradas e legenda textual.

## A home

A home segue a estrutura da home do design do dono, a mesma do site do Orkastery, com a
narrativa do OrkMind: hero (com o cartão vivo do caminho de uma memória), hosts, 01
Sistema, 02 O problema, 03 Para quem, 04 Integrações, 05 Governança, 06 Gravação
garantida, 07 Como funciona, 08 Prova e a chamada final. O texto das duas línguas está em
`src/data/home.ts`; a versão do pacote, num lugar só, em `src/data/release.mjs`.

A lógica da página (o relógio do diagrama e do `orkmind list`, as integrações, as etapas
e a noite pela rolagem) são funções puras em `src/lib/home-state.mjs`: o build as chama
com o estado inicial e o navegador (`src/scripts/home.ts`) com o estado que muda. O canvas
do hero está em `src/lib/caminho.mjs`. Com movimento reduzido nada se move sozinho; sem
movimento reduzido, o botão "Parar o movimento" do cartão vivo para e retoma o canvas, o
relógio e as animações (WCAG 2.2.2). Sem JavaScript, nada fica escondido: a noite sai inteira,
e as descrições dos nós, os textos das quatro integrações e as seis etapas saem abertos (o
script inline do `<head>` marca a página com a classe `js` antes da pintura, e só então os
botões recolhem o que não está escolhido). A entrada ao rolar vale também para o bloco mais
alto que a janela (zoom de 400%), e o que recebe foco aparece na hora. `test:home` confere o relógio, a
recusa da regra protegida, a matriz das integrações, as abas, a noite, o jade só no que
espera você (com canários) e a forma do inglês igual à do português.

Todo número tem o comando que o prova:

- 20/20 (M1, turnos com o bloco de regras), 6/6 (M3, os cenários de falha segura em que o
  plugin acerta: alerta quando deve e nenhum alerta nos casos de controle) e 0 (M7):
  `python bench/run.py` no repositório do OrkMind, que grava `bench/results/latest.json`
  (resultado do commit `31e4e4f`, de 01/09/2026, anterior à 0.4.0); a lacuna de recall com
  embedder real (M4) aparece como planejada.
- 23 coleções e 11 dimensões de tag: o comando do terminal da seção 08, que imprime
  `23 11` com o pacote 0.4.0 instalado.
- As saídas de terminal (a gravação com aviso de conflito e de injeção, a busca por tags)
  são reais, de sessões da 0.4.0 com PostgreSQL e `pgvector`; a página em inglês usa a
  própria sessão, com o conteúdo em inglês. A saída do produto sai em português nas duas
  línguas (e é marcada como português para leitor de tela).

O que ainda não existe aparece como lacuna: comando ou ferramenta de revisão de conflito
e de conteúdo suspeito, e injeção em todo turno pelo MCP e pela CLI.

A imagem de compartilhamento sai de `scripts/og.mjs`, com o CSS e as fontes do próprio
build e o título do hero, em PT-BR (`public/og.png`) e em inglês (`public/og-en.png`).
Rode depois de `npm run build`, com o Playwright do `check:visual`, e confira as imagens
antes de versionar.

## Prova visual sem rede

Forneça uma instalação local de Playwright e Chromium. Nenhum caminho pessoal
ou navegador é fixado no código ou no lockfile do site.

```sh
PLAYWRIGHT_MODULE=/caminho/playwright-core/index.mjs \
CHROMIUM_EXECUTABLE=/caminho/chromium \
npm run check:visual -- --output /diretorio/privado/screenshots
```

O verificador intercepta todas as requisições, serve somente `dist` em memória e
bloqueia destinos externos. Exercita home, índice, arquitetura e Contribuir nos dois
idiomas, 1440/1280/1024/768/390/320 px, no esquema claro (o site não reage ao esquema
escuro: o noite é por seção; `--schemes light,dark` repete a matriz no escuro): 48 screenshots, estouro
lateral, navegação por teclado (o link de pular, o menu do estreito e o seletor de
língua), o foco em cada parada do Tab a 1280 e 390 px (anel presente, sem recorte e sem o
cabeçalho por cima), alvos de toque de 44 px, contraste medido contra o fundo efetivo
(4,5:1, ou 3:1 no texto grande), os oito nós do diagrama (cada um abre e fecha a própria
descrição), as integrações, as abas das etapas (também pelas setas) e as linhas longas dos
terminais, que rolam dentro do próprio bloco. Uma vez por língua, confere copiar (sucesso e
recusa da área de transferência), o menu do estreito com Esc, o movimento reduzido sem nada
rodando, o botão que para o movimento, a página sem JavaScript (nada escondido), a janela de
320 x 256 px (zoom de 400%: todo bloco aparece ao rolar e nenhum foco cai em bloco invisível) e
o menu numa janela baixa (568 x 320 px, todo item ao alcance do teclado). Em todas as páginas de cada idioma,
nas mesmas larguras e esquemas, confere o código inline (não se parte entre
linhas, não solta o que encosta nele, não passa da coluna, uma escala por bloco,
sublinhado do link, e o chip maior que a coluna só quebra depois de separador, em
espaço ou na corcova camelCase) e uma só borda esquerda de conteúdo. `--plan` lista a
matriz sem abrir o navegador. `--dist` aponta outro build e `--widths`, `--locales` e
`--schemes` recortam a matriz (por exemplo `--widths 320 --locales pt --schemes dark`),
para provar que uma guarda reprova uma mutação do dist; valor desconhecido e matriz
vazia reprovam.

Para medir o código inline de um build por largura, antes e depois de uma mudança:

```sh
PLAYWRIGHT_MODULE=/caminho/playwright-core/index.mjs \
CHROMIUM_EXECUTABLE=/caminho/chromium \
node scripts/measure-code.mjs --dist dist --from 320 --to 1280 --step 10 \
  --output /diretorio/privado/medida.json
```

A saída conta, por largura, código partido entre linhas, código maior que a coluna
que quebra dentro do próprio chip (e quantos quebram no meio da palavra), o que
encosta no chip solto noutra linha, chip além da coluna, estouro da janela e
identificadores fora de `code` na prosa visível, com os padrões do `check:code`.
Os PNGs e `report.json` ficam fora do repositório público. Se o navegador não puder
iniciar, o comando falha e registra o impedimento; não muda sandbox nem permissões.
A inspeção humana das imagens ainda é necessária para avaliar qualidade visual.

## Privacidade e publicação

`check:public` procura padrões de dados pessoais e credenciais em fontes e saída,
sem imprimir o valor encontrado. O email institucional de contato é uma exceção
explícita; a busca não substitui revisão contextual. O contato é um link de e-mail;
o site não tem formulário nem backend de coleta.

O workflow `.github/workflows/publicar.yml` publica somente por tag (`producao-*` ou
`validacao-*`), pelo apagamento de uma tag `validacao-*` ou por execução manual, e
sempre a publicação composta descrita em "Prévia de uma release". Um commit local
ou um push na `main` não publica. A reversão operacional é promover uma revisão
anteriormente validada, com autorização do responsável.

## Prévia de uma release

Cada release em validação sai no domínio do próprio site, em
`https://orkmind.com/releasevalidation/<release>/`, antes de qualquer promoção. A publicação
no GitHub Pages é sempre composta: a raiz é a build da última tag `producao-AAAAMMDD-HHMM`
(a produção aprovada) e cada tag `validacao-<release>` ativa vira uma prévia, compilada
com `base` `/releasevalidation/<release>/`. Uma prévia nova não muda a raiz; uma promoção
nova mantém as prévias.

Para abrir a prévia de um commit revisado:

```sh
git tag validacao-<release> <sha> && git push origin validacao-<release>
```

A release aceita letras, números, ponto, sublinhado e hífen, começando por letra ou
número (`0.5.5`, `0.6.0-rc.1`); na ordem das prévias, um sufixo como `-rc.1` conta como
anterior à versão final. O push da tag dispara `.github/workflows/publicar.yml`. Envie uma
tag por push: o GitHub não dispara o workflow quando mais de três tags chegam juntas. O
commit precisa ter a regra da prévia (`src/lib/previa.mjs`).

No push da tag, o GitHub roda o workflow e o motor (`scripts/publicar.mjs`) do próprio
commit marcado, que montam a publicação inteira, raiz inclusive, e as builds rodam o código
dele no mesmo job. Só marque commit revisado: quem pode criar tag pode mudar o site. Para
exigir aprovação antes de cada deploy, o dono pode pôr revisor obrigatório no ambiente
`github-pages` ou um ruleset nas tags `producao-*` e `validacao-*`.

Na prévia, todo link interno, asset, canonical, alternates, seletor de língua e o
`versao.json` ficam dentro do `base`; toda página tem `noindex, nofollow` e, no topo, a
faixa "Prévia da release <release>, não publicada" com o SHA do commit. O `robots.txt` da
raiz bloqueia `/releasevalidation/`, e a prévia não entra em sitemap da produção. Os dois
bloqueios juntos têm um custo: o robô que respeita o `robots.txt` nem lê o `noindex`, então
o endereço de uma prévia que vazar ainda pode aparecer numa busca, sem o conteúdo. O
commit publicado se confere em `/releasevalidation/<release>/versao.json`, que traz
`release` e `sha`.

Para tirar uma prévia do ar, apague a tag no remoto:

```sh
git push origin --delete validacao-<release>
```

O apagamento dispara a publicação de novo, já sem a prévia (apagar mais de três tags
de uma vez não dispara; nesse caso, rode à mão). Apague também a tag local
(`git tag -d validacao-<release>`), senão um envio de todas as tags a traz de volta.
Para recompor à mão, rode o workflow "Publicar" pela aba Actions, na `main`. Há também
um teto: ficam no ar as 5 prévias mais novas pela ordem de versão
(`git -c versionsort.suffix=- tag --sort=-v:refname`), ajustável por `PREVIAS_MAXIMO`
no workflow.

Só o dono promove para a raiz, criando `producao-AAAAMMDD-HHMM` no commit que validou
pela prévia. Uma prévia verde não é aprovação. A raiz é sempre a maior tag
`producao-AAAAMMDD-HHMM` pelo nome; tag `producao-*` fora desse padrão é ignorada. Os nomes
seguem o mesmo fuso das tags que já existem. No push de uma tag `producao-*` que não vira a
raiz (nome menor que o da maior, ou fora do padrão), a execução reprova e nada muda no ar;
o mesmo vale para uma tag `validacao-*` que fique fora do teto. As execuções esperam na
fila do Pages, uma depois da outra, sem que uma descarte a outra; depois de corrigir uma
tag recusada, rode o workflow à mão para recompor. Para reverter, crie uma tag
`producao-*` nova no commit anterior. Apagar uma tag `producao-*` não republica sozinho: a
raiz só muda na publicação seguinte, para a maior tag que restar. Promover ou reverter para
um commit anterior a esta regra usa o workflow antigo daquele commit, que publica só a
raiz: as prévias saem do ar até a próxima publicação composta.

O ambiente `github-pages` do repositório precisa aceitar as tags `validacao-*` na
política de deploy, configuração feita pelo dono; sem isso, a execução disparada pela
tag para no job `publicar`. Se a build de qualquer árvore falhar, ou a conferência da
árvore montada reprovar, nada é publicado e o site no ar fica como estava: uma prévia
ativa que não compila segura toda publicação, promoção inclusive, até a tag dela sair.

Prova local:

```sh
npm run build
SITE_BASE=/releasevalidation/0.5.5/ npm run build
npm run test:publicar
node scripts/publicar.mjs --ensaio
node scripts/publicar.mjs --saida /tmp/publicacao
```

A build de produção termina com `test:previa`: compila uma prévia de exemplo a partir
da árvore de trabalho, monta a árvore com o `dist` de produção e confere raiz, prévia,
`noindex`, faixa, `robots.txt`, `versao.json` e links, com canários que reprovam cada
desvio. A segunda linha compila uma prévia com todas as checagens do postbuild em modo
`base` (`SITE_BASE` só aceita `/` e `/releasevalidation/<release>/`). `test:publicar`
ensaia o motor (`scripts/publicar.mjs`) num repositório Git temporário com tags de
verdade. As duas últimas usam as tags deste clone: `--ensaio` mostra o que seria
publicado, e `--saida` monta e confere a árvore; o `npm ci` dos commits cujo
`package-lock.json` difere do clone precisa de rede. Para iterar mais rápido,
`SITE_TESTE_PREVIA=0 npm run build` pula a árvore composta do `test:previa` (os testes da
regra continuam). O `check:visual` continua servindo só a build de produção; a prévia se
confere pelo `test:previa` e abrindo a URL dela.
