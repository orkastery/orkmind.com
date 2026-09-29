export default [
  {
    "slug": "integracoes",
    "group": "integrations",
    "sources": [
      "README.md",
      "docs/integration-guide.md",
      "docs/mcp-setup.md",
      "docs/hermes-setup.md"
    ],
    "translations": {
      "pt": {
        "title": "Integre ao seu runtime",
        "description": "Escolha entre consulta por ferramenta e construção de contexto por plugin.",
        "sections": [
          {
            "id": "mcp",
            "title": "MCP: consulta sob demanda",
            "paragraphs": [
              "Execute o servidor stdio com o Python do ambiente em que OrkMind está instalado. Configure o cliente MCP com command e args abaixo; forneça as credenciais pelo ambiente privado do processo. Confirme que as ferramentas aparecem no cliente antes de depender delas.",
              "orkmind_query e orkmind_get_rules consultam contexto e regras; add, update e delete estão sujeitos às permissões do armazenamento. O servidor não monta o prompt do modelo."
            ],
            "code": "{\"mcpServers\":{\"orkmind\":{\"command\":\"python\",\"args\":[\"-m\",\"orkmind.mcp\"]}}}"
          },
          {
            "id": "hermes",
            "title": "Hermes: provider e plugin",
            "paragraphs": [
              "Instale o suporte Hermes e configure memory_provider: orkmind no host. O provider oferece recall, store_memory e get_rules. O plugin que participa da construção do prompt injeta a governança por turno; uma chamada isolada ao provider só comprova aquela recuperação."
            ],
            "code": "pip install \"orkmind[hermes]\"\norkmind store info"
          },
          {
            "id": "openclaw",
            "title": "OpenClaw e limites de integração",
            "paragraphs": [
              "O plugin de memória em integrations/openclaw conecta a camada semântica ao prompt. Ele é distinto de um plugin para o NativeMemoryProvider, cuja documentação declara essa ponte ainda não entregue. Consulte a fonte correspondente ao mecanismo que você pretende usar."
            ]
          }
        ]
      },
      "en": {
        "title": "Connect your runtime",
        "description": "Choose between tool-based queries and plugin-built context.",
        "sections": [
          {
            "id": "mcp",
            "title": "MCP: on-demand queries",
            "paragraphs": [
              "Run the stdio server with the Python environment where OrkMind is installed. Configure the MCP client with the command and args below; provide credentials through the process’s private environment. Confirm tools appear in the client before relying on them.",
              "orkmind_query and orkmind_get_rules query context and rules; add, update and delete are subject to storage permissions. The server does not build the model prompt."
            ],
            "code": "{\"mcpServers\":{\"orkmind\":{\"command\":\"python\",\"args\":[\"-m\",\"orkmind.mcp\"]}}}"
          },
          {
            "id": "hermes",
            "title": "Hermes: provider and plugin",
            "paragraphs": [
              "Install Hermes support and configure memory_provider: orkmind in the host. The provider offers recall, store_memory and get_rules. The plugin participating in prompt construction injects governance per turn; an isolated provider call only proves that retrieval."
            ],
            "code": "pip install \"orkmind[hermes]\"\norkmind store info"
          },
          {
            "id": "openclaw",
            "title": "OpenClaw and integration boundaries",
            "paragraphs": [
              "The memory plugin under integrations/openclaw connects the semantic layer to the prompt. It is distinct from a NativeMemoryProvider plugin, whose documentation states that bridge is not yet delivered. Consult the source for the mechanism you intend to use."
            ]
          }
        ]
      },
      "es": {
        "title": "Integre su runtime",
        "description": "Elija entre consultas mediante herramientas y contexto construido por plugins.",
        "sections": [
          {
            "id": "mcp",
            "title": "MCP: consultas bajo demanda",
            "paragraphs": [
              "Ejecute el servidor stdio con el Python del entorno donde está instalado OrkMind. Configure el cliente MCP con command y args como se indica abajo; proporcione las credenciales mediante el entorno privado del proceso. Confirme que las herramientas aparecen en el cliente antes de depender de ellas.",
              "orkmind_query y orkmind_get_rules consultan contexto y reglas; add, update y delete están sujetos a los permisos del almacenamiento. El servidor no construye el prompt del modelo."
            ],
            "code": "{\"mcpServers\":{\"orkmind\":{\"command\":\"python\",\"args\":[\"-m\",\"orkmind.mcp\"]}}}"
          },
          {
            "id": "hermes",
            "title": "Hermes: provider y plugin",
            "paragraphs": [
              "Instale el soporte Hermes y configure memory_provider: orkmind en el host. El provider ofrece recall, store_memory y get_rules. El plugin que participa en la construcción del prompt inyecta la gobernanza por turno; una llamada aislada al provider solo demuestra esa recuperación."
            ],
            "code": "pip install \"orkmind[hermes]\"\norkmind store info"
          },
          {
            "id": "openclaw",
            "title": "OpenClaw y límites de integración",
            "paragraphs": [
              "El plugin de memoria en integrations/openclaw conecta la capa semántica al prompt. Es distinto de un plugin para NativeMemoryProvider, cuya documentación indica que ese puente aún no se ha entregado. Consulte la fuente del mecanismo que desea usar."
            ]
          }
        ]
      }
    }
  },
  {
    "slug": "memory-provider",
    "group": "integrations",
    "sources": [
      "docs/memory-provider/README.md"
    ],
    "translations": {
      "pt": {
        "title": "NativeMemoryProvider",
        "description": "Monte uma visão de contexto limitada sobre um histórico íntegro.",
        "sections": [
          {
            "id": "camadas",
            "title": "Core, Recall e Wiki",
            "paragraphs": [
              "O provider nativo usa PostgreSQL e pgvector diretamente. Core mantém blocos pinados; Recall projeta turnos recentes com paginação de mensagens grandes; Wiki recupera trechos de documentos. O contexto do turno é uma projeção limitada, enquanto o banco preserva o conteúdo e suas revisões."
            ],
            "code": "pip install \"orkmind[memory-provider]\"\npython -m orkmind.memory_provider.mcp"
          },
          {
            "id": "api",
            "title": "APIs e autorização",
            "paragraphs": [
              "assemble_turn_context reúne as camadas. search_history exige sessão ou usuário; search_wiki e get_document compartilham o filtro de escopo. set_core_block é uma API de operador e não deve ser exposta como ferramenta do agente. Personas e invariantes obrigatórios ausentes produzem erro."
            ]
          },
          {
            "id": "persistencia",
            "title": "Histórico e ingestão",
            "paragraphs": [
              "O banco protege histórico e revisões com triggers append-only. A ingestão normaliza conteúdo para deduplicação, prepara chunks e embeddings e grava o documento em transação. Mudança incompatível de dimensão vetorial ou idioma de busca é recusada. Os chunks são derivados e podem ser reconstruídos; o documento íntegro permanece a fonte."
            ]
          },
          {
            "id": "escrita",
            "title": "Escrita em nome de uma pessoa",
            "paragraphs": [
              "A ingestão de sistema não tem dono. Quando a escrita vem de uma pessoa, passe o escopo dela como writer: só é gravado o que ela conseguiria ler. Classificação fora do alcance levanta ClassificationOutOfReachError antes de fatiar ou gerar embeddings; slug de documento que ela não lê levanta SlugUnavailableError, sem revelar nada do documento que o ocupa. As duas recusas herdam de WriteOutOfScopeError.",
              "A deduplicação por conteúdo só considera o que o escopo alcança, e cada atualização gera uma revisão nova registrada em ingested_by. suggest_documents completa [[link]] apenas com o que o escopo vê."
            ],
            "code": "escopo = MemoryScopeFilter.for_user(user_context)\nawait memory.ingest_document(pedido, writer=escopo)"
          }
        ]
      },
      "en": {
        "title": "NativeMemoryProvider",
        "description": "Build a bounded context view over an intact history.",
        "sections": [
          {
            "id": "camadas",
            "title": "Core, Recall and Wiki",
            "paragraphs": [
              "The native provider uses PostgreSQL and pgvector directly. Core maintains pinned blocks; Recall projects recent turns with pagination for large messages; Wiki retrieves document chunks. Turn context is a bounded projection while the database preserves content and revisions."
            ],
            "code": "pip install \"orkmind[memory-provider]\"\npython -m orkmind.memory_provider.mcp"
          },
          {
            "id": "api",
            "title": "APIs and authorization",
            "paragraphs": [
              "assemble_turn_context combines the layers. search_history requires a session or user; search_wiki and get_document share scope filtering. set_core_block is an operator API and must not be exposed as an agent tool. Missing required personas and invariants produce an error."
            ]
          },
          {
            "id": "persistencia",
            "title": "History and ingestion",
            "paragraphs": [
              "The database protects history and revisions with append-only triggers. Ingestion normalizes content for deduplication, prepares chunks and embeddings, and writes the document transactionally. Incompatible vector dimension or search language changes are rejected. Chunks are derived and can be rebuilt; the full document remains the source."
            ]
          },
          {
            "id": "escrita",
            "title": "Writing on behalf of a person",
            "paragraphs": [
              "System ingestion has no owner. When a write comes from a person, pass their scope as writer: only what they could read is written. A classification out of reach raises ClassificationOutOfReachError before chunking or embedding; a document slug they cannot read raises SlugUnavailableError without revealing anything about the document that holds it. Both refusals inherit from WriteOutOfScopeError.",
              "Content deduplication only considers what the scope reaches, and every update creates a new revision recorded in ingested_by. suggest_documents completes [[link]] only with what the scope sees."
            ],
            "code": "scope = MemoryScopeFilter.for_user(user_context)\nawait memory.ingest_document(request, writer=scope)"
          }
        ]
      },
      "es": {
        "title": "NativeMemoryProvider",
        "description": "Construya una vista de contexto limitada sobre un historial íntegro.",
        "sections": [
          {
            "id": "camadas",
            "title": "Core, Recall y Wiki",
            "paragraphs": [
              "El provider nativo usa PostgreSQL y pgvector directamente. Core mantiene bloques fijados; Recall proyecta turnos recientes con paginación de mensajes grandes; Wiki recupera fragmentos de documentos. El contexto del turno es una proyección limitada mientras la base conserva contenido y revisiones."
            ],
            "code": "pip install \"orkmind[memory-provider]\"\npython -m orkmind.memory_provider.mcp"
          },
          {
            "id": "api",
            "title": "APIs y autorización",
            "paragraphs": [
              "assemble_turn_context reúne las capas. search_history exige sesión o usuario; search_wiki y get_document comparten el filtro de alcance. set_core_block es una API de operador y no debe exponerse como herramienta del agente. La ausencia de personas e invariantes obligatorios produce un error."
            ]
          },
          {
            "id": "persistencia",
            "title": "Historial e ingestión",
            "paragraphs": [
              "La base protege historial y revisiones mediante triggers append-only. La ingestión normaliza contenido para deduplicar, prepara chunks y embeddings y guarda el documento en una transacción. Se rechazan cambios incompatibles de dimensión vectorial o idioma de búsqueda. Los chunks son derivados y pueden reconstruirse; el documento íntegro sigue siendo la fuente."
            ]
          },
          {
            "id": "escrita",
            "title": "Escritura en nombre de una persona",
            "paragraphs": [
              "La ingesta de sistema no tiene dueño. Cuando la escritura viene de una persona, pase su alcance como writer: solo se graba lo que esa persona podría leer. Una clasificación fuera de alcance lanza ClassificationOutOfReachError antes de fragmentar o generar embeddings; el slug de un documento que no puede leer lanza SlugUnavailableError, sin revelar nada del documento que lo ocupa. Ambos rechazos heredan de WriteOutOfScopeError.",
              "La deduplicación por contenido solo considera lo que el alcance permite ver, y cada actualización crea una revisión nueva registrada en ingested_by. suggest_documents completa [[link]] solo con lo que el alcance ve."
            ],
            "code": "alcance = MemoryScopeFilter.for_user(user_context)\nawait memory.ingest_document(pedido, writer=alcance)"
          }
        ]
      }
    }
  }
];
