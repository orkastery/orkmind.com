export default {
  "memory": {
    "pt": {
      "title": "Da integração à memória",
      "description": "A integração fornece contexto. SemanticLayer organiza tags e orçamento. GovernedStore aplica acesso e proteção antes de consultar o backend. A integração decide como o resultado entra no prompt.",
      "nodes": [
        "Integração · contexto",
        "SemanticLayer · tags",
        "GovernedStore · acesso",
        "Backend · persistência"
      ],
      "edges": [
        "Detecta e consulta",
        "Filtra e ordena",
        "Lê e grava"
      ]
    },
    "en": {
      "title": "From integration to memory",
      "description": "The integration supplies context. SemanticLayer organizes tags and budget. GovernedStore applies access and protection before querying the backend. The integration decides how results enter the prompt.",
      "nodes": [
        "Integration · context",
        "SemanticLayer · tags",
        "GovernedStore · access",
        "Backend · persistence"
      ],
      "edges": [
        "Detects and queries",
        "Filters and orders",
        "Reads and writes"
      ]
    },
    "es": {
      "title": "De la integración a la memoria",
      "description": "La integración aporta contexto. SemanticLayer organiza etiquetas y presupuesto. GovernedStore aplica acceso y protección antes de consultar el backend. La integración decide cómo entran los resultados en el prompt.",
      "nodes": [
        "Integración · contexto",
        "SemanticLayer · etiquetas",
        "GovernedStore · acceso",
        "Backend · persistencia"
      ],
      "edges": [
        "Detecta y consulta",
        "Filtra y ordena",
        "Lee y escribe"
      ]
    }
  },
  "retrieval": {
    "pt": {
      "title": "Recuperação com limites explícitos",
      "description": "Tags exatas selecionam candidatos. Acesso, expiração e risco filtram o resultado. Prioridade e orçamento organizam a projeção. Busca semântica pode acrescentar contexto, sem substituir regras.",
      "nodes": [
        "Tags · correspondência exata",
        "Governança · filtros",
        "Contexto · prioridade e orçamento"
      ],
      "edges": [
        "Seleciona",
        "Organiza"
      ]
    },
    "en": {
      "title": "Retrieval with explicit limits",
      "description": "Exact tags select candidates. Access, expiration and risk filter results. Priority and budget organize the projection. Semantic search may add context without replacing rules.",
      "nodes": [
        "Tags · exact matching",
        "Governance · filters",
        "Context · priority and budget"
      ],
      "edges": [
        "Selects",
        "Organizes"
      ]
    },
    "es": {
      "title": "Recuperación con límites explícitos",
      "description": "Las etiquetas exactas seleccionan candidatos. Acceso, caducidad y riesgo filtran los resultados. Prioridad y presupuesto organizan la proyección. La búsqueda semántica puede añadir contexto sin sustituir reglas.",
      "nodes": [
        "Etiquetas · coincidencia exacta",
        "Gobernanza · filtros",
        "Contexto · prioridad y presupuesto"
      ],
      "edges": [
        "Selecciona",
        "Organiza"
      ]
    }
  },
  "storage": {
    "pt": {
      "title": "Persistência e capacidades",
      "description": "GovernedStore aplica regras comuns sobre backends com capacidades distintas. pgvector é a referência de produção; memory é volátil; Qdrant é experimental e limitado ao laboratório nas fontes revisadas.",
      "nodes": [
        "GovernedStore · contrato",
        "StoreCapabilities · limites",
        "Backend selecionado"
      ],
      "edges": [
        "Consulta capacidades",
        "Aplica a configuração"
      ]
    },
    "en": {
      "title": "Persistence and capabilities",
      "description": "GovernedStore applies common rules over backends with different capabilities. pgvector is the production reference; memory is volatile; Qdrant is experimental and limited to laboratory use in the reviewed sources.",
      "nodes": [
        "GovernedStore · contract",
        "StoreCapabilities · limits",
        "Selected backend"
      ],
      "edges": [
        "Reads capabilities",
        "Applies configuration"
      ]
    },
    "es": {
      "title": "Persistencia y capacidades",
      "description": "GovernedStore aplica reglas comunes sobre backends con distintas capacidades. pgvector es la referencia de producción; memory es volátil; Qdrant es experimental y está limitado al laboratorio en las fuentes revisadas.",
      "nodes": [
        "GovernedStore · contrato",
        "StoreCapabilities · límites",
        "Backend seleccionado"
      ],
      "edges": [
        "Consulta capacidades",
        "Aplica la configuración"
      ]
    }
  },
  "governance": {
    "pt": {
      "title": "Intenção, tentativa e confirmação",
      "description": "O spool guarda a intenção em pending. O drainer confere hash e tenta persistir. Só a confirmação real leva a done; falhas continuam pendentes ou vão a failed para revisão.",
      "nodes": [
        "pending · intenção em disco",
        "Drainer · hash e tentativa",
        "done · entry_id confirmado"
      ],
      "edges": [
        "Processa",
        "Confirma"
      ]
    },
    "en": {
      "title": "Intent, attempt and confirmation",
      "description": "The spool stores intent in pending. The drainer verifies the hash and attempts persistence. Only real confirmation leads to done; failures remain pending or move to failed for review.",
      "nodes": [
        "pending · intent on disk",
        "Drainer · hash and attempt",
        "done · confirmed entry_id"
      ],
      "edges": [
        "Processes",
        "Confirms"
      ]
    },
    "es": {
      "title": "Intención, intento y confirmación",
      "description": "El spool guarda la intención en pending. El drainer verifica el hash e intenta persistir. Solo una confirmación real conduce a done; los fallos siguen pendientes o pasan a failed para revisión.",
      "nodes": [
        "pending · intención en disco",
        "Drainer · hash e intento",
        "done · entry_id confirmado"
      ],
      "edges": [
        "Procesa",
        "Confirma"
      ]
    }
  }
};
