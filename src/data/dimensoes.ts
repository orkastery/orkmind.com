// As 11 dimensões de tags da ontologia do OrkMind e o conjunto de exemplo
// do simulador de busca. Dimensões e semântica: docs/ontologia.md do core.
export interface Dimensao {
  chave: string;
  nome: string;
  desc: string;
}

export const dimensoes: Dimensao[] = [
  { chave: "skill", nome: "Habilidade", desc: "Que capacidade está em jogo: deploy, testes, git, auth." },
  { chave: "agent", nome: "Agente", desc: "Qual runtime ou agente usa a memória." },
  { chave: "domain", nome: "Domínio", desc: "Área técnica: backend, frontend, infra, segurança." },
  { chave: "project", nome: "Projeto", desc: "A qual projeto a memória pertence." },
  { chave: "situation", nome: "Situação", desc: "O momento de uso: debugging, review, refatoração." },
  { chave: "person", nome: "Pessoa", desc: "Quem é citado ou relevante na memória." },
  { chave: "audience", nome: "Audiência", desc: "Quem pode ler a entrada. É controle de acesso." },
  { chave: "prod", nome: "Produto", desc: "Identidade de negócio; não amplia acesso." },
  { chave: "proj", nome: "Projeto de produto", desc: "Demanda dentro de um produto." },
  { chave: "init", nome: "Iniciativa", desc: "Entrega delimitada em um projeto." },
  { chave: "editors", nome: "Editores", desc: "Quem pode alterar a entrada. Também é acesso." },
];

export interface TagSelecionavel {
  dimensao: string;
  valor: string;
}

export const tagsSelecionaveis: TagSelecionavel[] = [
  { dimensao: "skill", valor: "deploy" },
  { dimensao: "skill", valor: "testing" },
  { dimensao: "agent", valor: "claude-code" },
  { dimensao: "agent", valor: "hermes" },
  { dimensao: "domain", valor: "infra" },
  { dimensao: "domain", valor: "backend" },
  { dimensao: "project", valor: "orkmind" },
  { dimensao: "situation", valor: "debugging" },
  { dimensao: "situation", valor: "deploy" },
  { dimensao: "person", valor: "pessoa-exemplo" },
  { dimensao: "audience", valor: "team" },
  { dimensao: "editors", valor: "owner" },
];

export interface MemoriaExemplo {
  colecao: string;
  conteudo: string;
  mandatoria: boolean;
  prioridade: "critical" | "high" | "medium" | "low";
  tags: Record<string, string[]>;
}

// Conjunto de exemplo do simulador, espelhando os exemplos da documentação.
export const memoriasExemplo: MemoriaExemplo[] = [
  {
    colecao: "rule",
    conteudo: "Nunca usar rm -rf em produção",
    mandatoria: true,
    prioridade: "critical",
    tags: { skill: ["deploy"], domain: ["infra"] },
  },
  {
    colecao: "rule",
    conteudo: "Todo deploy passa pela esteira de CI, sem exceção",
    mandatoria: true,
    prioridade: "critical",
    tags: { skill: ["deploy"], situation: ["deploy"], editors: ["owner"] },
  },
  {
    colecao: "learning",
    conteudo: "Testes de auth falharam com mocks; usar banco real",
    mandatoria: false,
    prioridade: "high",
    tags: { skill: ["testing"], domain: ["backend"], project: ["orkmind"] },
  },
  {
    colecao: "fact",
    conteudo: "O banco de produção é PostgreSQL 16 com pgvector",
    mandatoria: false,
    prioridade: "medium",
    tags: { domain: ["infra", "backend"], project: ["orkmind"] },
  },
  {
    colecao: "preference",
    conteudo: "Preferir commits atômicos e PRs pequenos",
    mandatoria: false,
    prioridade: "medium",
    tags: { person: ["pessoa-exemplo"], audience: ["team"] },
  },
  {
    colecao: "instruction",
    conteudo: "Rodar a suíte inteira antes de abrir PR",
    mandatoria: false,
    prioridade: "high",
    tags: { skill: ["testing"], agent: ["claude-code"] },
  },
  {
    colecao: "decision",
    conteudo: "pgvector é o backend padrão; qdrant é opcional",
    mandatoria: false,
    prioridade: "medium",
    tags: { domain: ["backend"], project: ["orkmind"], editors: ["owner"] },
  },
  {
    colecao: "handoff",
    conteudo: "Sessão anterior parou no meio da migração 007",
    mandatoria: false,
    prioridade: "high",
    tags: { agent: ["hermes"], situation: ["debugging"], project: ["orkmind"] },
  },
];
