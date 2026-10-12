export default {
  "memory": {
    "pt": {
      "title": "Da integração à memória",
      "description": "A integração fornece contexto. `SemanticLayer` organiza tags e orçamento. `GovernedStore` aplica acesso e proteção antes de consultar o backend. A integração decide como o resultado entra no prompt.",
      "nodes": [
        "Integração · contexto",
        "`SemanticLayer` · tags",
        "`GovernedStore` · acesso",
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
      "description": "The integration supplies context. `SemanticLayer` organizes tags and budget. `GovernedStore` applies access and protection before querying the backend. The integration decides how results enter the prompt.",
      "nodes": [
        "Integration · context",
        "`SemanticLayer` · tags",
        "`GovernedStore` · access",
        "Backend · persistence"
      ],
      "edges": [
        "Detects and queries",
        "Filters and orders",
        "Reads and writes"
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
    }
  },
  "storage": {
    "pt": {
      "title": "Persistência e capacidades",
      "description": "`GovernedStore` aplica regras comuns sobre backends com capacidades distintas. `pgvector` é a referência de produção; `memory` é volátil; `qdrant` é experimental e limitado ao laboratório nas fontes revisadas.",
      "nodes": [
        "`GovernedStore` · contrato",
        "`StoreCapabilities` · limites",
        "Backend selecionado"
      ],
      "edges": [
        "Consulta capacidades",
        "Aplica a configuração"
      ]
    },
    "en": {
      "title": "Persistence and capabilities",
      "description": "`GovernedStore` applies common rules over backends with different capabilities. `pgvector` is the production reference; `memory` is volatile; `qdrant` is experimental and limited to laboratory use in the reviewed sources.",
      "nodes": [
        "`GovernedStore` · contract",
        "`StoreCapabilities` · limits",
        "Selected backend"
      ],
      "edges": [
        "Reads capabilities",
        "Applies configuration"
      ]
    }
  },
  "governance": {
    "pt": {
      "title": "Intenção, tentativa e confirmação",
      "description": "O spool guarda a intenção em `pending`. O drainer confere hash e tenta persistir. Só a confirmação real leva a `done`; falhas continuam pendentes ou vão a `failed` para revisão.",
      "nodes": [
        "`pending` · intenção em disco",
        "Drainer · hash e tentativa",
        "`done` · `entry_id` confirmado"
      ],
      "edges": [
        "Processa",
        "Confirma"
      ]
    },
    "en": {
      "title": "Intent, attempt and confirmation",
      "description": "The spool stores intent in `pending`. The drainer verifies the hash and attempts persistence. Only real confirmation leads to `done`; failures remain pending or move to `failed` for review.",
      "nodes": [
        "`pending` · intent on disk",
        "Drainer · hash and attempt",
        "`done` · confirmed `entry_id`"
      ],
      "edges": [
        "Processes",
        "Confirms"
      ]
    }
  }
};
