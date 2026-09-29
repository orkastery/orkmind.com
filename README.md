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
npm run docs:sync -- --source /caminho/do/repositorio
npm run docs:check -- --source /caminho/do/repositorio

# Depois de revisar de fato as traduções e fontes afetadas:
npm run docs:sync -- --source /caminho/do/repositorio --review pt,en,es --reviewer editor
npm run build
```

A sincronização comum preserva os recibos anteriores, mas uma fonte alterada
invalida os hashes de revisão; não aprova traduções sozinha. `--review` é uma
atestação editorial explícita de quem executa o comando, não revisão humana
independente. Não use a opção antes de ler os textos. Fonte nova sem destino,
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

O workflow existente `.github/workflows/publicar.yml` publica somente por promoção
explícita com tag `producao-*` ou execução manual com ref. Um commit local não
publica. A reversão operacional é promover uma revisão anteriormente validada,
com autorização do responsável; o workflow não foi alterado por esta revisão.
