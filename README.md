# OrkMind — site e documentação

Site estático Astro com português em `/`, inglês em `/en/` e espanhol em `/es/`.
Todas as páginas HTML têm idioma, canonical, alternates recíprocos e seletor para
a mesma página. Os slugs e IDs técnicos permanecem estáveis entre línguas.

## Desenvolvimento e prova local

Requer Node.js 22 e as dependências do lockfile. Com a instalação já preparada,
nenhuma etapa do build acessa a rede. As fontes, fontes tipográficas e ativos são locais.
Em uma instalação nova, `npm ci` prepara dependências; essa preparação exige que
os pacotes estejam disponíveis no cache ou no registry e não faz parte da prova offline.

```sh
npm run dev
npm run build
npm run docs:check
npm run check:links
npm run check:i18n
npm run check:public
npm run check:content
npm run test:docs
```

O prebuild confere o snapshot e a revisão editorial. O postbuild confere HTML,
links, fragmentos, idiomas, metadados, padrões públicos e semântica, e executa
canários negativos. Build aprovado não é revisão visual nem prova de naturalidade
da tradução. Links externos são inventariados, mas não consultados pela prova offline.
`parse5` já integra a árvore do Astro; a mesma versão do lockfile é declarada
diretamente para os auditores de HTML, sem adicionar outro parser.

## Conteúdo e fontes

`src/data/docs-catalog.ts` lista módulos editoriais. Cada artigo tem slug, grupo,
fontes e texto explícito em PT, EN e ES. Não há fallback silencioso ou tradução
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
npm run docs:sync -- --source /caminho/do/orkmind --orkastery-source /caminho/do/orkastery --review pt,en,es --reviewer executor-editorial --articles contribuir
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

Revise `src/data/roadmap.json`, atualize `updatedAt`, `nextReview` e os três resumos.
A página editorial `roadmap` contextualiza o mês em `docs-standards.ts` (Orkastery)
ou `docs-retrieval.ts` (OrkMind): atualize-a na mesma revisão e registre os hashes.
Uma intenção não é uma capacidade entregue. Datas de revisão não são prazos de entrega.

## Tipografia, caixa e diagramas

Preserve `src/styles/tokens.css`, logos, fontes e paleta da marca. Títulos, menus,
links, botões e rótulos usam caixa de frase. Siglas, comandos e nomes próprios
conservam a grafia original. Display é para títulos; a fonte de texto sustenta
prosa com largura de leitura limitada e entrelinha generosa; mono identifica código.

O layout documental tem trilha, sumário, navegação por assunto e anterior/próximo.
SVGs têm title, desc, relações numeradas e legenda textual; a leitura não depende
só da cor. A superfície documental adapta os tokens existentes ao esquema claro;
as páginas de apresentação mantêm o tema escuro da marca. Testar o navegador em
modo claro não significa que a home ofereça um tema claro.

Os componentes demonstrativos legados permanecem no histórico de desenvolvimento,
mas não são importados pelas rotas atuais. As páginas ativas usam HomePage,
DocsArticle e DocsDiagram com os catálogos editoriais. Não reintroduza componentes
com texto fixo em português sem revisão das três línguas.

## Prova visual sem rede

Forneça uma instalação local de Playwright e Chromium. Nenhum caminho pessoal
ou navegador é fixado no código ou no lockfile do site.

```sh
PLAYWRIGHT_MODULE=/caminho/playwright-core/index.mjs \
CHROMIUM_EXECUTABLE=/caminho/chromium \
npm run check:visual -- --output /diretorio/privado/screenshots
```

O verificador intercepta todas as requisições, serve somente `dist` em memória e
bloqueia destinos externos. Exercita home, índice e arquitetura nos três idiomas,
1280/390 px e esquemas claro/escuro: 36 screenshots, overflow e navegação por teclado.
Os PNGs e `report.json` ficam fora do repositório público. Se o navegador não puder
iniciar, o comando falha e registra o impedimento; não muda sandbox nem permissões.
A inspeção humana das imagens ainda é necessária para avaliar qualidade visual.

## Privacidade e publicação

`check:public` procura padrões de dados pessoais e credenciais em fontes e saída,
sem imprimir o valor encontrado. O email institucional de contato é uma exceção
explícita; a busca não substitui revisão contextual. O formulário apenas prepara
um email no aplicativo do visitante; não tem backend de coleta.

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
(`git tag -d validacao-<release>`), senão um envio de todas as tags a traz de volta. Para recompor à mão, rode o workflow
"Publicar" pela aba Actions, na `main`. Há também um teto: ficam no ar as 5 prévias mais
novas pela ordem de versão (`git tag --sort=-v:refname`), ajustável por `PREVIAS_MAXIMO`
no workflow.

Só o dono promove para a raiz, criando `producao-AAAAMMDD-HHMM` no commit que validou
pela prévia. Uma prévia verde não é aprovação. A raiz é sempre a maior tag
`producao-AAAAMMDD-HHMM` pelo nome; tag `producao-*` fora desse padrão é ignorada. Os nomes
seguem o mesmo fuso das tags que já existem. No push de uma tag `producao-*` que não vira a
raiz (nome menor que o da maior, ou fora do padrão), a execução reprova e nada muda no ar;
o mesmo vale para uma tag `validacao-*` que fique fora do teto. Para reverter, crie uma tag
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
`SITE_TESTE_PREVIA=0 npm run build` pula o `test:previa`. O `check:visual` continua
servindo só a build de produção; a prévia se confere pelo `test:previa` e abrindo a URL dela.
