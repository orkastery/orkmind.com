// PT-BR em / e inglês em /en/ (DESIGN.md da Partitura). O espanhol saiu por decisão do dono: as
// URLs /es/ antigas são páginas de redirecionamento para /en/ (src/pages/es/).
export const locales = ['pt', 'en'] as const;
export type Locale = typeof locales[number];
export const languageTag = {pt:'pt-BR', en:'en'};
export const languageName = {pt:'Português', en:'English'};
// O base da build: '' na produção e /releasevalidation/<release> na prévia (SITE_BASE, src/lib/previa.mjs).
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
export function withBase(path: string) { return base + path; }
export function withoutBase(path: string) { return base && (path === base || path.startsWith(base + '/')) ? path.slice(base.length) || '/' : path; }
export function localeFor(path: string): Locale { const logical = withoutBase(path); return logical.startsWith('/en/') ? 'en' : 'pt'; }
export function unlocalize(path: string) { return withoutBase(path).replace(/^\/en(?=\/)/, '') || '/'; }
// Caminho da página na língua, sem o base: serve ao link para o outro site, que não tem esta prévia.
export function localizedPath(path: string, locale: Locale) { return (locale === 'pt' ? '' : '/'+locale) + unlocalize(path); }
// Href da página na língua dentro desta build, com o base da prévia quando houver.
export function localize(path: string, locale: Locale) { return withBase(localizedPath(path, locale)); }
const labels = {
 pt: {contribute:'Contribuir',home:'Início',docs:'Documentação',language:'Idioma',skip:'Pular para o conteúdo',navigation:'Navegação principal',onThisPage:'Nesta página',previous:'Anterior',next:'Próximo',source:'Fontes desta página',reviewed:'Revisão editorial',indexTitle:'Documentação para usar e entender',indexDescription:'Comece pelo seu objetivo. Encontre guias, conceitos e referências com origem explícita.',start:'Começar',concepts:'Conceitos',guides:'Guias',reference:'Referência',standards:'Padrões',product:'Produto',integrations:'Integrações',governance:'Governança',storage:'Armazenamento',retrieval:'Recuperação',openSource:'Código aberto',contact:'Contato',read:'Ler o guia',roadmap:'Planejamento no repositório',nextReview:'Próxima revisão',menu:'Abrir navegação',close:'Fechar navegação',soon:'Em breve',newTab:'Abre em nova aba',contents:'Guias por assunto',provenance:'Conteúdo curado das fontes listadas. A data indica revisão editorial; não certifica uma instalação.',name:'Seu nome',email:'Seu email',message:'Mensagem',send:'Preparar email',contactText:'Dúvidas, propostas e contribuições são bem-vindas.',mailHelp:'O envio abre seu aplicativo de email. Nenhum dado é enviado a um servidor por este formulário.',license:'Licença MIT',organization:'A organização',ork:'O produto Ork',diagram:'Diagrama',legacy:'Atalhos das versões anteriores'},
 en: {contribute:'Contribute',home:'Home',docs:'Documentation',language:'Language',skip:'Skip to content',navigation:'Main navigation',onThisPage:'On this page',previous:'Previous',next:'Next',source:'Page sources',reviewed:'Editorial review',indexTitle:'Documentation to use and understand',indexDescription:'Start with your goal. Find guides, concepts and references with explicit sources.',start:'Get started',concepts:'Concepts',guides:'Guides',reference:'Reference',standards:'Standards',product:'Product',integrations:'Integrations',governance:'Governance',storage:'Storage',retrieval:'Retrieval',openSource:'Open source',contact:'Contact',read:'Read the guide',roadmap:'Planning in the repository',nextReview:'Next review',menu:'Open navigation',close:'Close navigation',soon:'Coming soon',newTab:'Opens in a new tab',contents:'Guides by topic',provenance:'Content curated from the listed sources. The date indicates editorial review; it does not certify an installation.',name:'Your name',email:'Your email',message:'Message',send:'Prepare email',contactText:'Questions, proposals and contributions are welcome.',mailHelp:'Submitting opens your email application. This form sends no data to a server.',license:'MIT license',organization:'The organization',ork:'The Ork product',diagram:'Diagram',legacy:'Shortcuts from earlier versions'},
};
export const ui = (locale: Locale) => labels[locale];

// Moldura da Partitura (cabeçalho, rodapé e comando copiável) nas duas línguas.
// Destinos que começam por "/" ou "#" são deste site; os outros são chaves de destinosExternos.
const frame = {
 pt: {nav:[['#caminho','Como funciona'],['#integracoes','Integrações'],['#prova','Prova']],docs:'Docs',github:'GitHub',talk:'Falar com a gente',languageShort:{pt:'PT',en:'EN'},menuOpen:'Abrir o menu',menuClose:'Fechar o menu',copy:'copiar',copied:'✓ copiado',copyFailed:'× use {atalho}',copiedMessage:'Comando copiado.',copyFailedMessage:'Não deu para copiar: o comando ficou selecionado; copie com {atalho}.',copyHint:'Copiar o comando',tagline:'A memória que acompanha o trabalho: tipada, governada e com a origem de cada regra.',columns:[{title:'Produto',links:[['OrkMind','/'],['Company Brain','/docs/company-brain/'],['Ork','ork'],['Changelog','changelog']]},{title:'Docs',links:[['Começar','/docs/comecar/'],['Arquitetura','/docs/arquitetura/'],['Integrações','/docs/integracoes/'],['Governança','/docs/governanca/'],['Contribuir','/docs/contribuir/']]},{title:'Orkastery',links:[['GitHub','github'],['PyPI','pypi'],['Segurança','security'],['Contato','mailto']]}],rights:'© 2026 OrkMind · MIT',maintainer:'Mantido pela Orkastery'},
 en: {nav:[['#caminho','How it works'],['#integracoes','Integrations'],['#prova','Proof']],docs:'Docs',github:'GitHub',talk:'Talk to us',languageShort:{pt:'PT',en:'EN'},menuOpen:'Open the menu',menuClose:'Close the menu',copy:'copy',copied:'✓ copied',copyFailed:'× use {atalho}',copiedMessage:'Command copied.',copyFailedMessage:'Could not copy: the command is selected; copy it with {atalho}.',copyHint:'Copy the command',tagline:'The memory that stays with the work: typed, governed and with the source of every rule.',columns:[{title:'Product',links:[['OrkMind','/'],['Company Brain','/docs/company-brain/'],['Ork','ork'],['Changelog','changelog']]},{title:'Docs',links:[['Get started','/docs/comecar/'],['Architecture','/docs/arquitetura/'],['Integrations','/docs/integracoes/'],['Governance','/docs/governanca/'],['Contribute','/docs/contribuir/']]},{title:'Orkastery',links:[['GitHub','github'],['PyPI','pypi'],['Security','security'],['Contact','mailto']]}],rights:'© 2026 OrkMind · MIT',maintainer:'Maintained by Orkastery'}
};
export const moldura = (locale: Locale) => frame[locale];
// O e-mail institucional publicado (o único que o check:public aceita) e os destinos fora do site.
export const contato = 'maestro@orkastery.com';
export const destinosExternos: Record<string,string> = {
 changelog:'https://github.com/orkastery/orkmind/blob/main/CHANGELOG.md',
 github:'https://github.com/orkastery/orkmind',
 pypi:'https://pypi.org/project/orkmind/',
 security:'https://github.com/orkastery/orkmind/blob/main/SECURITY.md',
 mailto:'mailto:maestro@orkastery.com'
};
// O produto Ork mora no site da Orkastery, na mesma língua (sem o base desta prévia).
export const destinoExterno = (alvo: string, locale: Locale) => alvo === 'ork' ? 'https://orkastery.com' + localizedPath('/ork/', locale) : destinosExternos[alvo];
