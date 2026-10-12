export default {
  "pt": {
    "title": "A memória que acompanha o trabalho.",
    "description": "Memória tipada, recuperação determinística e governança para sistemas agênticos.",
    "lead": "OrkMind organiza memória tipada e governada para agentes e pessoas. Recupere regras, decisões e documentos com origem, acesso e histórico explícitos.",
    "mechanism": "Como as peças se conectam",
    "mechanismText": "Da integração ao armazenamento: contexto, recuperação, governança e persistência têm responsabilidades distintas.",
    "install": "Comece pelo ambiente",
    "installText": "Instale o pacote e configure o backend. As fontes revisadas descrevem OrkMind 0.4.0, alpha, sob licença MIT.",
    "command": "pip install \"orkmind>=0.4.0\"\norkmind store info",
    "sections": [
      {
        "id": "memoria",
        "title": "Tipos que dizem o que uma memória é",
        "text": "Regras, fatos, decisões e documentos têm coleções próprias. Tags descrevem contexto e acesso; o portfólio conecta produto, projeto e iniciativa sem ampliar permissões.",
        "href": "/docs/ontologia/"
      },
      {
        "id": "busca",
        "title": "Recupere por contexto, com limites claros",
        "text": "A busca por tags é determinística. A busca semântica é complementar. ACL, proteção, expiração e orçamento orientam o que pode chegar ao agente.",
        "href": "/docs/recuperacao/"
      },
      {
        "id": "produto",
        "title": "Integração que declara sua garantia",
        "text": "Plugins de construção de prompt para Hermes e OpenClaw injetam governança por turno. MCP e CLI consultam sob demanda. Escolha a integração pelo comportamento de que você precisa.",
        "href": "/docs/integracoes/"
      },
      {
        "id": "armazenamento",
        "title": "Histórico durável, contexto limitado",
        "text": "O provider nativo mantém Core, Recall e Wiki sobre PostgreSQL. A visão do turno é limitada; o histórico íntegro continua disponível para recuperação e auditoria.",
        "href": "/docs/memory-provider/"
      }
    ]
  },
  "en": {
    "title": "Memory that stays with the work.",
    "description": "Typed memory, deterministic retrieval and governance for agent systems.",
    "lead": "OrkMind organizes typed, governed memory for agents and people. Retrieve rules, decisions and documents with explicit provenance, access and history.",
    "mechanism": "How the pieces connect",
    "mechanismText": "From integration to storage: context, retrieval, governance and persistence have distinct responsibilities.",
    "install": "Start with the environment",
    "installText": "Install the package and configure the backend. The reviewed sources describe OrkMind 0.4.0, alpha, under the MIT license.",
    "command": "pip install \"orkmind>=0.4.0\"\norkmind store info",
    "sections": [
      {
        "id": "memoria",
        "title": "Types that describe what memory means",
        "text": "Rules, facts, decisions and documents have their own collections. Tags describe context and access; the portfolio connects products, projects and initiatives without expanding permissions.",
        "href": "/docs/ontologia/"
      },
      {
        "id": "busca",
        "title": "Retrieve by context, with clear limits",
        "text": "Tag search is deterministic. Semantic search is complementary. ACLs, protection, expiration and budget govern what may reach an agent.",
        "href": "/docs/recuperacao/"
      },
      {
        "id": "produto",
        "title": "Integration with explicit guarantees",
        "text": "Prompt-building plugins for Hermes and OpenClaw inject governance per turn. MCP and CLI query on demand. Choose the integration for the behavior you need.",
        "href": "/docs/integracoes/"
      },
      {
        "id": "armazenamento",
        "title": "Durable history, bounded context",
        "text": "The native provider maintains Core, Recall and Wiki over PostgreSQL. The turn view is bounded; intact history remains available for retrieval and auditing.",
        "href": "/docs/memory-provider/"
      }
    ]
  }
};
