export default [
  {
    "slug": "arquitetura",
    "group": "concepts",
    "sources": [
      "README.md",
      "docs/integration-guide.md",
      "docs/ontologia.md"
    ],
    "diagram": "memory",
    "translations": {
      "pt": {
        "title": "Arquitetura da memória",
        "description": "Separe contexto, governança e persistência para entender as garantias.",
        "sections": [
          {
            "id": "fluxo",
            "title": "Do contexto ao armazenamento",
            "paragraphs": [
              "A integração recebe o contexto. `SemanticLayer` valida a ontologia, detecta tags e organiza o orçamento. `GovernedStore` aplica proteção, acesso e ordenação. O backend persiste e consulta os dados conforme suas capacidades declaradas."
            ]
          },
          {
            "id": "busca",
            "title": "Tags primeiro; semântica complementar",
            "paragraphs": [
              "A busca por tags usa correspondência exata. A busca semântica combina texto e vetores quando configurada, sem substituir a recuperação de regras. ACL, expiração e risco de injeção filtram o que pode entrar no contexto."
            ]
          },
          {
            "id": "fronteiras",
            "title": "Garantias com fronteiras",
            "paragraphs": [
              "As regras alcançam o prompt por integrações que o constroem. MCP e CLI oferecem consulta sob demanda. O backend `memory` é volátil e `qdrant` é experimental; a camada governada não elimina essas limitações do armazenamento."
            ]
          }
        ]
      },
      "en": {
        "title": "Memory architecture",
        "description": "Separate context, governance and persistence to understand the guarantees.",
        "sections": [
          {
            "id": "fluxo",
            "title": "From context to storage",
            "paragraphs": [
              "The integration receives context. `SemanticLayer` validates ontology, detects tags and manages the budget. `GovernedStore` applies protection, access and ordering. The backend stores and queries data according to its declared capabilities."
            ]
          },
          {
            "id": "busca",
            "title": "Tags first; semantics as a complement",
            "paragraphs": [
              "Tag search uses exact matching. Semantic search combines text and vectors when configured, without replacing rule retrieval. ACLs, expiration and injection risk filter what may enter context."
            ]
          },
          {
            "id": "fronteiras",
            "title": "Guarantees with boundaries",
            "paragraphs": [
              "Rules reach the prompt through integrations that build it. MCP and CLI provide on-demand queries. The `memory` backend is volatile and `qdrant` is experimental; the governed layer does not remove these storage limitations."
            ]
          }
        ]
      }
    }
  },
  {
    "slug": "ontologia",
    "group": "concepts",
    "sources": [
      "docs/ontologia.md"
    ],
    "translations": {
      "pt": {
        "title": "Coleções, tags e portfólio",
        "description": "Escolha tipos e dimensões sem confundir organização com permissão.",
        "sections": [
          {
            "id": "colecoes",
            "title": "Coleções tipadas",
            "paragraphs": [
              "A coleção descreve a finalidade da entrada. As 23 coleções abaixo vêm da referência de ontologia; uma coleção de planejamento não executa o plano e uma definição de DAG não promete execução automática."
            ],
            "items": [
              "`rule`: Regras",
              "`instruction`: Procedimentos",
              "`fact`: Fatos verificáveis",
              "`learning`: Lições",
              "`preference`: Preferências",
              "`decision`: Decisões e contexto",
              "`content`: Conteúdo de referência",
              "`agenda`: Agenda",
              "`contacts`: Contatos",
              "`handoff`: Passagem de contexto",
              "`roadmap`: Planejamento",
              "`files`: Referências de arquivos",
              "`docs`: Referências de documentação",
              "`dags`: Definições de DAG",
              "`tools`: Conhecimento de ferramentas",
              "`users`: Identidades e perfis",
              "`session`: Estado de sessão; exige `session_id`",
              "`artifact`: Artefatos; exige `artifact_type`",
              "`compliance`: Revisões; exige `compliance_type`",
              "`semantic_log`: Pacotes de log; exige `package_id`",
              "`product`: Identidade de produto",
              "`project`: Demanda de produto",
              "`initiative`: Entrega delimitada"
            ]
          },
          {
            "id": "tags",
            "title": "Dimensões de tags",
            "paragraphs": [
              "As 11 dimensões organizam contexto e acesso. `audience` controla leitura; `editors` controla alteração. `person` descreve relevância, não concede acesso. `project` identifica o workspace físico, enquanto `prod`, `proj` e `init` organizam o portfólio."
            ],
            "items": [
              "`skill`: Habilidade",
              "`agent`: Agente",
              "`domain`: Domínio técnico",
              "`project`: Workspace físico",
              "`situation`: Situação",
              "`person`: Pessoa mencionada",
              "`audience`: Quem pode ler",
              "`editors`: Quem pode editar",
              "`prod`: Produto",
              "`proj`: Projeto de produto",
              "`init`: Iniciativa"
            ]
          },
          {
            "id": "prioridade",
            "title": "Prioridade, escopo e origem",
            "paragraphs": [
              "As prioridades são `critical`, `high`, `medium` e `low`. Os escopos são `global`, `project` e `session`. A origem pode ser `human`, `agent` ou `system`, mas escrever esse rótulo não substitui autenticação. O portfólio liga `product` → `project` → `initiative`; essa hierarquia não amplia ACL."
            ]
          }
        ]
      },
      "en": {
        "title": "Collections, tags and portfolio",
        "description": "Choose types and dimensions without confusing organization with permission.",
        "sections": [
          {
            "id": "colecoes",
            "title": "Typed collections",
            "paragraphs": [
              "The collection describes an entry’s purpose. The 23 collections below come from the ontology reference; a planning collection does not execute the plan and a DAG definition does not promise automatic execution."
            ],
            "items": [
              "`rule`: Rules",
              "`instruction`: Procedures",
              "`fact`: Verifiable facts",
              "`learning`: Lessons",
              "`preference`: Preferences",
              "`decision`: Decisions and context",
              "`content`: Reference content",
              "`agenda`: Schedules",
              "`contacts`: Contacts",
              "`handoff`: Context handoff",
              "`roadmap`: Planning",
              "`files`: File references",
              "`docs`: Documentation references",
              "`dags`: DAG definitions",
              "`tools`: Tool knowledge",
              "`users`: Identities and profiles",
              "`session`: Session state; requires `session_id`",
              "`artifact`: Artifacts; requires `artifact_type`",
              "`compliance`: Reviews; requires `compliance_type`",
              "`semantic_log`: Log packages; requires `package_id`",
              "`product`: Product identity",
              "`project`: Product demand",
              "`initiative`: Bounded delivery"
            ]
          },
          {
            "id": "tags",
            "title": "Tag dimensions",
            "paragraphs": [
              "The 11 dimensions organize context and access. `audience` controls reading; `editors` controls changes. `person` describes relevance, not access. `project` identifies the physical workspace, while `prod`, `proj` and `init` organize the portfolio."
            ],
            "items": [
              "`skill`: Skill",
              "`agent`: Agent",
              "`domain`: Technical domain",
              "`project`: Physical workspace",
              "`situation`: Situation",
              "`person`: Mentioned person",
              "`audience`: Who may read",
              "`editors`: Who may edit",
              "`prod`: Product",
              "`proj`: Product project",
              "`init`: Initiative"
            ]
          },
          {
            "id": "prioridade",
            "title": "Priority, scope and source",
            "paragraphs": [
              "Priorities are `critical`, `high`, `medium` and `low`. Scopes are `global`, `project` and `session`. Source may be `human`, `agent` or `system`, but writing that label does not replace authentication. Portfolio links `product` → `project` → `initiative`; the hierarchy does not expand ACLs."
            ]
          }
        ]
      }
    }
  }
];
