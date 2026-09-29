export default [
  {
    "slug": "governanca",
    "group": "governance",
    "sources": [
      "README.md",
      "docs/ontologia.md",
      "docs/sempre-gravar.md"
    ],
    "diagram": "governance",
    "translations": {
      "pt": {
        "title": "Proteção e gravação confiável",
        "description": "Preserve autoria, acesso e histórico, inclusive quando o backend falha.",
        "sections": [
          {
            "id": "acesso",
            "title": "Proteção antes da alteração",
            "paragraphs": [
              "Entradas protected e critical rejeitam edição ou remoção por agentes. Leitura e edição têm dimensões distintas; tags de portfólio não ampliam acesso. Conteúdo suspeito de injeção fica preservado para inspeção, mas não entra automaticamente no contexto."
            ]
          },
          {
            "id": "spool",
            "title": "Primeiro a intenção durável",
            "paragraphs": [
              "O spool registra conteúdo e metadados em disco antes da tentativa de gravação. Um drainer externo ao agente confere o hash, procura duplicata e tenta API ou CLI. A indisponibilidade do backend mantém o item pendente; o esgotamento das tentativas exige revisão. Isso depende de disco disponível e drainer configurado."
            ]
          },
          {
            "id": "recibo",
            "title": "Confirmação exige um ID real",
            "paragraphs": [
              "pending indica intenção registrada, done inclui o entry_id confirmado e failed conserva itens para revisão. Nenhum desses estados autoriza inventar um ID. Uma resposta created ou duplicate da API idempotente identifica a entrada persistida; o arquivo local sozinho não comprova gravação no backend."
            ],
            "code": "python scripts/orkmind_drain.py --status"
          }
        ]
      },
      "en": {
        "title": "Protection and reliable writes",
        "description": "Preserve authorship, access and history, including when the backend fails.",
        "sections": [
          {
            "id": "acesso",
            "title": "Protection before mutation",
            "paragraphs": [
              "Protected and critical entries reject agent edits or removal. Reading and editing have distinct dimensions; portfolio tags do not expand access. Suspected injection content is retained for inspection but does not enter context automatically."
            ]
          },
          {
            "id": "spool",
            "title": "Durable intent first",
            "paragraphs": [
              "The spool records content and metadata on disk before attempting the write. An external drainer checks the hash, looks for duplicates and tries the API or CLI. Backend unavailability leaves the item pending; exhausted attempts require review. This depends on available disk and a configured drainer."
            ]
          },
          {
            "id": "recibo",
            "title": "Confirmation requires a real ID",
            "paragraphs": [
              "pending means recorded intent, done includes the confirmed entry_id, and failed retains items for review. None of these states permits inventing an ID. A created or duplicate response from the idempotent API identifies the stored entry; a local file alone does not prove a backend write."
            ],
            "code": "python scripts/orkmind_drain.py --status"
          }
        ]
      },
      "es": {
        "title": "Protección y escritura fiable",
        "description": "Conserve autoría, acceso e historial, incluso cuando falla el backend.",
        "sections": [
          {
            "id": "acesso",
            "title": "Protección antes del cambio",
            "paragraphs": [
              "Las entradas protected y critical rechazan edición o eliminación por agentes. Lectura y edición tienen dimensiones distintas; las etiquetas de portafolio no amplían el acceso. El contenido sospechoso de inyección se conserva para inspección, pero no entra automáticamente en el contexto."
            ]
          },
          {
            "id": "spool",
            "title": "Primero la intención duradera",
            "paragraphs": [
              "El spool registra contenido y metadatos en disco antes de intentar escribir. Un drainer externo comprueba el hash, busca duplicados e intenta la API o el CLI. La indisponibilidad del backend deja el elemento pendiente; agotar los intentos exige revisión. Esto depende de disco disponible y un drainer configurado."
            ]
          },
          {
            "id": "recibo",
            "title": "La confirmación exige un ID real",
            "paragraphs": [
              "pending indica intención registrada, done incluye el entry_id confirmado y failed conserva elementos para revisión. Ninguno de esos estados permite inventar un ID. Una respuesta created o duplicate de la API idempotente identifica la entrada persistida; un archivo local por sí solo no demuestra escritura en el backend."
            ],
            "code": "python scripts/orkmind_drain.py --status"
          }
        ]
      }
    }
  }
];
