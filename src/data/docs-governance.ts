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
  },
  {
    "slug": "company-brain",
    "group": "governance",
    "sources": [
      "README.md",
      "README.pt-BR.md",
      "docs/company-brain.md"
    ],
    "translations": {
      "pt": {
        "title": "Company Brain governado",
        "description": "Consulte o portfólio governado da fábrica com citação, concessões e histórico append-only.",
        "sections": [
          {
            "id": "o-que-e",
            "title": "Uma projeção exata do portfólio",
            "paragraphs": [
              "O Company Brain é a projeção exata e governada do que uma fábrica de software sabe sobre o próprio portfólio: produtos (prod), projetos (proj) e iniciativas (init). Ele não é a memória semântica do OrkMind, com coleções, tags e busca: vive em tabelas próprias no PostgreSQL e só responde o que um produtor autorizado gravou, citando a origem de cada item.",
              "O modo context, a operação history e esta documentação estão na main do repositório, na seção Unreleased do CHANGELOG. Ainda não fazem parte de uma versão publicada no PyPI."
            ]
          },
          {
            "id": "contrato",
            "title": "Contrato e API separados",
            "paragraphs": [
              "O contrato orkmind.company-brain/v1 é o mesmo arquivo no OrkMind e no Orkastery, byte a byte. O sha256 dele sai em capabilities como contract_hash, e o Orkastery recusa um Brain com hash diferente. O envelope das chamadas é a API orkmind.company-brain-api/v1: operações novas entram nela de forma aditiva, sem mudar o contract_hash. O pacote de contexto e o history são dessa API.",
              "A validação é estrita: campo desconhecido é recusado, o id começa pelo kind, proj só tem pai prod e init só tem pai proj. A falha sai como um código brain.*, sem eco do conteúdo."
            ]
          },
          {
            "id": "identidade",
            "title": "Identidade do login, concessões explícitas",
            "paragraphs": [
              "A identidade vem só do login autenticado no PostgreSQL, que o administrador do banco mapeia para um principal humano ou de serviço. Nenhum campo da requisição, variável de ambiente ou argumento de ferramenta nomeia um principal. As concessões valem por tenant, principal e ACL, com ações, recursos, instâncias de origem, campos visíveis e validade; a revogação vale na chamada seguinte."
            ],
            "items": [
              "get, query e history são só de principal humano.",
              "ingest, migrate e rollback são só de principal de serviço.",
              "Sem a concessão da ação, a leitura responde como se a entidade não existisse."
            ]
          },
          {
            "id": "operacoes",
            "title": "Operações pela CLI e pelo MCP",
            "paragraphs": [
              "orkmind brain request lê um envelope JSON no stdin e escreve a resposta no stdout; a ferramenta MCP orkmind_brain recebe o mesmo envelope. A DSN vem de ORKMIND_DATABASE_URL e o tenant de ORKMIND_BRAIN_TENANT; nenhum argumento escolhe banco ou identidade. As operações são capabilities, get, query, history, receipts, head e ingest. Os estados de resposta são ok, empty, unknown, withheld, forbidden, unavailable e conflict."
            ],
            "code": "echo '{\"schema\":\"orkmind.company-brain-api/v1\",\"operation\":\"capabilities\"}' | orkmind brain request"
          },
          {
            "id": "contexto",
            "title": "Modo context: um pacote citável",
            "paragraphs": [
              "Uma seleção com mode context monta no servidor o pacote orkmind.company-brain-context/v1: as entidades pedidas por id e os pais que a concessão deixa ver, cada uma com a citação inteira da fonte (autoridade, instância, referência, hash, versão e local). Tudo roda num instantâneo REPEATABLE READ, READ ONLY. O que não tem citação inteira vira lacuna tipada, sem conteúdo.",
              "O digest é o sha256 do JSON canônico do pacote, sem horário: o mesmo estado dá o mesmo digest, e quem recebe recalcula. O OrkMind cita; o frescor contra a fonte é calculado por quem tem a fonte. Um OrkMind anterior a este modo responde brain.selection.context-unsupported."
            ],
            "items": [
              "entity.unknown: ausente, apagada ou sem a concessão get.",
              "entity.withheld: retida pela ACL; só o id aparece.",
              "citation.incomplete: a citação visível não está inteira, e o item não entra.",
              "owner.unresolved, observed.unknown e recorded.unknown: item citado sem dono resolvido ou sem horário."
            ]
          },
          {
            "id": "historico",
            "title": "Histórico append-only",
            "paragraphs": [
              "A operação history devolve as versões de uma entidade em ordem de sequência, com a origem de cada uma: evento, produtor, fonte citada, ciclo da fábrica, horário de gravação e a marca rolled_back. Nada apaga ou reescreve essas versões; numa entidade apagada, o tombstone é a última.",
              "Exige a ação history, só de humano; sem ela, a resposta é unknown. Concessão que não mostra o campo source responde forbidden, porque versão sem origem não é citável. Os campos do corpo seguem os campos da concessão."
            ],
            "code": "echo '{\"schema\":\"orkmind.company-brain-api/v1\",\"operation\":\"history\",\"payload\":{\"tenant_id\":\"exemplo\",\"id\":\"proj-exemplo\",\"limit\":50}}' | orkmind brain request"
          },
          {
            "id": "escrita",
            "title": "Escrita, migração e uso pelo Orkastery",
            "paragraphs": [
              "A escrita é só do produtor de serviço: ingest confere sequência, autoria, versão e referências e grava projeção, histórico e recibos na mesma transação; o mesmo evento repetido devolve o mesmo recibo. A migração administrativa usa orkmind brain migration, com plano conferido por hash e rollback por compensação, sem restaurar o banco inteiro. O schema só é criado por uma operação administrativa explícita; uma consulta nunca migra.",
              "No Orkastery, ork brain context pede o modo context, confere o pacote inteiro e acrescenta o frescor contra o portfólio local. Diante de um OrkMind sem esse modo, monta o pacote pelo caminho anterior, com query e get, e declara isso no pacote."
            ]
          }
        ]
      },
      "en": {
        "title": "Governed Company Brain",
        "description": "Query the factory's governed portfolio with citations, grants and append-only history.",
        "sections": [
          {
            "id": "o-que-e",
            "title": "An exact projection of the portfolio",
            "paragraphs": [
              "The Company Brain is the exact, governed projection of what a software factory knows about its own portfolio: products (prod), projects (proj) and initiatives (init). It is not OrkMind's semantic memory of collections, tags and search: it lives in its own PostgreSQL tables and only answers what an authorized producer recorded, citing where each item came from.",
              "The context mode, the history operation and this documentation are on the repository's main branch, in the Unreleased section of the CHANGELOG. They are not yet part of a version published on PyPI."
            ]
          },
          {
            "id": "contrato",
            "title": "Separate contract and API",
            "paragraphs": [
              "The orkmind.company-brain/v1 contract is the same file in OrkMind and Orkastery, byte for byte. Its sha256 is reported by capabilities as contract_hash, and Orkastery refuses a Brain with a different hash. Calls use the orkmind.company-brain-api/v1 envelope: new operations are added to it without changing contract_hash. The context package and history belong to this API.",
              "Validation is strict: unknown fields are rejected, the id starts with the kind, proj only has a prod parent and init only has a proj parent. Failures come out as a brain.* code, without echoing the content."
            ]
          },
          {
            "id": "identidade",
            "title": "Identity from the login, explicit grants",
            "paragraphs": [
              "Identity comes only from the authenticated PostgreSQL login, which the database administrator maps to a human or service principal. No request field, environment variable or tool argument names a principal. Grants apply per tenant, principal and ACL, with actions, resources, source instances, visible fields and validity; revocation takes effect on the next call."
            ],
            "items": [
              "get, query and history are for human principals only.",
              "ingest, migrate and rollback are for service principals only.",
              "Without a grant for the action, a read answers as if the entity did not exist."
            ]
          },
          {
            "id": "operacoes",
            "title": "Operations from the CLI and MCP",
            "paragraphs": [
              "orkmind brain request reads a JSON envelope on stdin and writes the response to stdout; the orkmind_brain MCP tool takes the same envelope. The DSN comes from ORKMIND_DATABASE_URL and the tenant from ORKMIND_BRAIN_TENANT; no argument selects the database or the identity. The operations are capabilities, get, query, history, receipts, head and ingest. Response states are ok, empty, unknown, withheld, forbidden, unavailable and conflict."
            ],
            "code": "echo '{\"schema\":\"orkmind.company-brain-api/v1\",\"operation\":\"capabilities\"}' | orkmind brain request"
          },
          {
            "id": "contexto",
            "title": "Context mode: a citable package",
            "paragraphs": [
              "A selection with mode context builds the orkmind.company-brain-context/v1 package on the server: the entities requested by id and the parents the grant lets you see, each with the complete source citation (authority, instance, reference, hash, version and location). Everything runs in one REPEATABLE READ, READ ONLY snapshot. Anything without a complete citation becomes a typed gap, with no content.",
              "The digest is the sha256 of the package's canonical JSON, with no timestamp: the same state yields the same digest, and the receiver recomputes it. OrkMind cites; freshness against the source is computed by whoever holds the source. An OrkMind older than this mode answers brain.selection.context-unsupported."
            ],
            "items": [
              "entity.unknown: missing, deleted or without the get grant.",
              "entity.withheld: withheld by the ACL; only the id appears.",
              "citation.incomplete: the visible citation is not complete, so the item is left out.",
              "owner.unresolved, observed.unknown and recorded.unknown: a cited item without a resolved owner or a timestamp."
            ]
          },
          {
            "id": "historico",
            "title": "Append-only history",
            "paragraphs": [
              "The history operation returns an entity's versions in sequence order, each with its origin: event, producer, cited source, factory cycle, recording time and the rolled_back flag. Nothing deletes or rewrites these versions; for a deleted entity, the tombstone is the last one.",
              "It requires the history action, for humans only; without it, the answer is unknown. A grant that does not show the source field gets forbidden, because a version without an origin is not citable. Body fields follow the grant's fields."
            ],
            "code": "echo '{\"schema\":\"orkmind.company-brain-api/v1\",\"operation\":\"history\",\"payload\":{\"tenant_id\":\"exemplo\",\"id\":\"proj-exemplo\",\"limit\":50}}' | orkmind brain request"
          },
          {
            "id": "escrita",
            "title": "Writes, migration and use by Orkastery",
            "paragraphs": [
              "Only the service producer writes: ingest checks sequence, authorship, version and references and records projection, history and receipts in the same transaction; repeating the same event returns the same receipt. Administrative migration uses orkmind brain migration, with a hash-checked plan and rollback by compensation, never by restoring the whole database. The schema is created only by an explicit administrative operation; a query never migrates.",
              "In Orkastery, ork brain context requests the context mode, checks the whole package and adds freshness against the local portfolio. Against an OrkMind without this mode, it builds the package the earlier way, with query and get, and says so in the package."
            ]
          }
        ]
      },
      "es": {
        "title": "Company Brain gobernado",
        "description": "Consulte el portafolio gobernado de la fábrica con citas, concesiones e historial append-only.",
        "sections": [
          {
            "id": "o-que-e",
            "title": "Una proyección exacta del portafolio",
            "paragraphs": [
              "El Company Brain es la proyección exacta y gobernada de lo que una fábrica de software sabe sobre su propio portafolio: productos (prod), proyectos (proj) e iniciativas (init). No es la memoria semántica de OrkMind, con colecciones, etiquetas y búsqueda: vive en tablas propias en PostgreSQL y solo responde lo que un productor autorizado registró, citando el origen de cada elemento.",
              "El modo context, la operación history y esta documentación están en la rama main del repositorio, en la sección Unreleased del CHANGELOG. Todavía no forman parte de una versión publicada en PyPI."
            ]
          },
          {
            "id": "contrato",
            "title": "Contrato y API separados",
            "paragraphs": [
              "El contrato orkmind.company-brain/v1 es el mismo archivo en OrkMind y en Orkastery, byte a byte. Su sha256 aparece en capabilities como contract_hash, y Orkastery rechaza un Brain con un hash distinto. Las llamadas usan el sobre de la API orkmind.company-brain-api/v1: las operaciones nuevas se añaden sin cambiar el contract_hash. El paquete de contexto y history pertenecen a esta API.",
              "La validación es estricta: se rechaza cualquier campo desconocido, el id empieza por el kind, proj solo tiene padre prod e init solo tiene padre proj. El fallo sale como un código brain.*, sin repetir el contenido."
            ]
          },
          {
            "id": "identidade",
            "title": "Identidad del login, concesiones explícitas",
            "paragraphs": [
              "La identidad viene solo del login autenticado en PostgreSQL, que el administrador de la base asigna a un principal humano o de servicio. Ningún campo de la solicitud, variable de entorno ni argumento de herramienta nombra a un principal. Las concesiones valen por tenant, principal y ACL, con acciones, recursos, instancias de origen, campos visibles y vigencia; la revocación vale desde la llamada siguiente."
            ],
            "items": [
              "get, query y history son solo para principales humanos.",
              "ingest, migrate y rollback son solo para principales de servicio.",
              "Sin la concesión de la acción, la lectura responde como si la entidad no existiera."
            ]
          },
          {
            "id": "operacoes",
            "title": "Operaciones por la CLI y por MCP",
            "paragraphs": [
              "orkmind brain request lee un sobre JSON en stdin y escribe la respuesta en stdout; la herramienta MCP orkmind_brain recibe el mismo sobre. La DSN viene de ORKMIND_DATABASE_URL y el tenant de ORKMIND_BRAIN_TENANT; ningún argumento elige la base ni la identidad. Las operaciones son capabilities, get, query, history, receipts, head e ingest. Los estados de respuesta son ok, empty, unknown, withheld, forbidden, unavailable y conflict."
            ],
            "code": "echo '{\"schema\":\"orkmind.company-brain-api/v1\",\"operation\":\"capabilities\"}' | orkmind brain request"
          },
          {
            "id": "contexto",
            "title": "Modo context: un paquete citable",
            "paragraphs": [
              "Una selección con mode context arma en el servidor el paquete orkmind.company-brain-context/v1: las entidades pedidas por id y los padres que la concesión deja ver, cada una con la cita completa de la fuente (autoridad, instancia, referencia, hash, versión y ubicación). Todo se ejecuta en una sola instantánea REPEATABLE READ, READ ONLY. Lo que no tiene la cita completa se convierte en una laguna tipada, sin contenido.",
              "El digest es el sha256 del JSON canónico del paquete, sin hora: el mismo estado da el mismo digest, y quien lo recibe lo recalcula. OrkMind cita; la frescura frente a la fuente la calcula quien tiene la fuente. Un OrkMind anterior a este modo responde brain.selection.context-unsupported."
            ],
            "items": [
              "entity.unknown: ausente, eliminada o sin la concesión get.",
              "entity.withheld: retenida por la ACL; solo aparece el id.",
              "citation.incomplete: la cita visible no está completa y el elemento queda fuera.",
              "owner.unresolved, observed.unknown y recorded.unknown: elemento citado sin responsable resuelto o sin hora."
            ]
          },
          {
            "id": "historico",
            "title": "Historial append-only",
            "paragraphs": [
              "La operación history devuelve las versiones de una entidad en orden de secuencia, cada una con su origen: evento, productor, fuente citada, ciclo de la fábrica, hora de registro y la marca rolled_back. Nada borra ni reescribe estas versiones; en una entidad eliminada, el tombstone es la última.",
              "Exige la acción history, solo para humanos; sin ella, la respuesta es unknown. Una concesión que no muestra el campo source recibe forbidden, porque una versión sin origen no es citable. Los campos del cuerpo siguen los campos de la concesión."
            ],
            "code": "echo '{\"schema\":\"orkmind.company-brain-api/v1\",\"operation\":\"history\",\"payload\":{\"tenant_id\":\"exemplo\",\"id\":\"proj-exemplo\",\"limit\":50}}' | orkmind brain request"
          },
          {
            "id": "escrita",
            "title": "Escritura, migración y uso por Orkastery",
            "paragraphs": [
              "Solo escribe el productor de servicio: ingest comprueba secuencia, autoría, versión y referencias y registra proyección, historial y recibos en la misma transacción; el mismo evento repetido devuelve el mismo recibo. La migración administrativa usa orkmind brain migration, con un plan verificado por hash y rollback por compensación, nunca restaurando la base entera. El schema solo se crea con una operación administrativa explícita; una consulta nunca migra.",
              "En Orkastery, ork brain context pide el modo context, verifica el paquete entero y añade la frescura frente al portafolio local. Ante un OrkMind sin este modo, arma el paquete por el camino anterior, con query y get, y lo declara en el paquete."
            ]
          }
        ]
      }
    }
  }
];
