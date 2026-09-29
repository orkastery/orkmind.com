// As 23 coleções válidas para organizar memórias no OrkMind.
// Fonte: docs/ontologia.md do repositório Orkastery/OrkMind.
export interface Colecao {
  id: string;
  nome: string;
  proposito: string;
  exemplo: string;
  requisito?: string;
  destaque?: boolean;
}

export const colecoes: Colecao[] = [
  {
    id: "rule",
    nome: "Regras",
    proposito: "Regras mandatórias que precisam ser seguidas. Entram no contexto sempre que as tags casam.",
    exemplo: "Nunca usar rm -rf em produção",
    requisito: "recomenda mandatory: true",
    destaque: true,
  },
  {
    id: "instruction",
    nome: "Instruções",
    proposito: "Instruções de procedimento: como fazer algo do jeito certo.",
    exemplo: "Usar a esteira de CI para todo deploy",
  },
  {
    id: "fact",
    nome: "Fatos",
    proposito: "Fatos verificáveis sobre o projeto, o usuário ou o ambiente.",
    exemplo: "O banco de produção é PostgreSQL 16",
  },
  {
    id: "learning",
    nome: "Aprendizados",
    proposito: "Lições tiradas da experiência, para o sistema não repetir o erro.",
    exemplo: "Testes de auth falharam com mocks; usar banco real",
  },
  {
    id: "preference",
    nome: "Preferências",
    proposito: "Preferências de estilo e abordagem de quem opera o sistema.",
    exemplo: "Preferir commits atômicos e PRs pequenos",
  },
  {
    id: "decision",
    nome: "Decisões",
    proposito: "Decisões tomadas e o contexto em que foram tomadas.",
    exemplo: "React no frontend pela familiaridade do time",
  },
  {
    id: "content",
    nome: "Conteúdos",
    proposito: "Conteúdo de referência: artigos, documentos, textos de apoio.",
    exemplo: "Especificação da API v2 em content/reference",
  },
  {
    id: "agenda",
    nome: "Agenda",
    proposito: "Compromissos, cronogramas e alertas de data.",
    exemplo: "Reunião semanal toda segunda às 14h",
  },
  {
    id: "contacts",
    nome: "Contatos",
    proposito: "Pessoas, papéis e contextos em que elas aparecem.",
    exemplo: "Pessoa de exemplo, líder do time de DevOps",
  },
  {
    id: "handoff",
    nome: "Handoffs",
    proposito: "Passagem de contexto entre sessões e entre agentes.",
    exemplo: "Handoff do módulo X para o agente Y",
    requisito: "recomenda origin e destination",
    destaque: true,
  },
  {
    id: "roadmap",
    nome: "Roadmap",
    proposito: "Planos, fases e marcos do que vem pela frente.",
    exemplo: "MVP fase 2: DAG e múltiplos alvos",
  },
  {
    id: "files",
    nome: "Arquivos",
    proposito: "Referências a arquivos e caminhos relevantes.",
    exemplo: "src/orkmind/core/models.py",
  },
  {
    id: "docs",
    nome: "Docs",
    proposito: "Referências à documentação do sistema.",
    exemplo: "docs/ontologia.md define o esquema",
  },
  {
    id: "dags",
    nome: "DAGs",
    proposito: "Definições de ativação em grafo: o que depende do quê.",
    exemplo: "DAG de deploy: ci, teste, deploy",
  },
  {
    id: "tools",
    nome: "Ferramentas",
    proposito: "Conhecimento sobre ferramentas e APIs disponíveis.",
    exemplo: "A CLI orkmind add grava uma memória",
  },
  {
    id: "users",
    nome: "Usuários",
    proposito: "Identidades, papéis e permissões de quem usa o sistema.",
    exemplo: "Pessoa de exemplo, admin do workspace orkmind",
  },
  {
    id: "session",
    nome: "Sessões",
    proposito: "Estado de sessão de cada execução de agente.",
    exemplo: "Sessão 42: refatoração da camada de store",
    requisito: "exige session_id",
    destaque: true,
  },
  {
    id: "artifact",
    nome: "Artefatos",
    proposito: "Artefatos produzidos pelo sistema: releases, relatórios, entregas.",
    exemplo: "Notas da release v0.3.0",
    requisito: "exige artifact_type",
    destaque: true,
  },
  {
    id: "compliance",
    nome: "Compliance",
    proposito: "Revisões e violações de regras, com rastro auditável.",
    exemplo: "Violação registrada: regra D5 descumprida",
    requisito: "exige compliance_type",
  },
  {
    id: "semantic_log",
    nome: "Log semântico",
    proposito: "Pacotes de log semântico de cada ciclo de trabalho.",
    exemplo: "Pacote 2026-08-31: execução do ciclo F3",
    requisito: "exige package_id",
  },
  {
    id: "product",
    nome: "Produtos",
    proposito: "Memórias organizadas em torno de um produto; não substituem a entidade Produto do catálogo.",
    exemplo: "Contexto de mercado e operação do OrkMind",
  },
  {
    id: "project",
    nome: "Projetos",
    proposito: "Memórias organizadas em torno de um projeto; não criam nem duplicam a entidade Projeto.",
    exemplo: "Decisões técnicas do projeto Company Brain",
  },
  {
    id: "initiative",
    nome: "Iniciativas",
    proposito: "Memórias organizadas em torno de uma iniciativa; a identidade e as relações continuam no catálogo.",
    exemplo: "Aprendizados da iniciativa Biblioteca governada",
  },
];
