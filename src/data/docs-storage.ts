export default [
  {
    "slug": "armazenamento",
    "group": "storage",
    "sources": [
      "docs/storage-backends/GUIA-BACKENDS.md",
      "docs/storage-backends/MATRIZ-BACKENDS.md"
    ],
    "diagram": "storage",
    "translations": {
      "pt": {
        "title": "Escolha e opere um backend",
        "description": "Compare durabilidade, busca, idempotência e limites de migração.",
        "sections": [
          {
            "id": "pgvector",
            "title": "pgvector: referência para produção",
            "paragraphs": [
              "O backend padrão usa PostgreSQL com pgvector. Oferece persistência durável, busca textual com ranking, índice único de conteúdo, filtro de ACL e ordenação no banco. Confira as capacidades da instalação antes de investigar diferenças de resultado."
            ],
            "code": "orkmind store info"
          },
          {
            "id": "memory",
            "title": "memory: testes e desenvolvimento",
            "paragraphs": [
              "memory dispensa serviço externo, mas perde os dados quando o processo termina. A busca textual usa correspondência de tokens sem ranking. A unicidade vale no processo; este backend não substitui armazenamento de produção."
            ]
          },
          {
            "id": "qdrant",
            "title": "Qdrant: somente laboratório",
            "paragraphs": [
              "O guia revisado marca Qdrant como experimental e não habilitado para produção. Ele registra questões abertas de identidade dos perfis e descarte por TTL. Não use esse backend para dados de produção com base nesta documentação.",
              "A idempotência é best-effort: gravações concorrentes podem duplicar conteúdo porque não há índice único equivalente. A busca textual não tem ranking e a camada governada pode avisar quando a janela de candidatos satura."
            ]
          },
          {
            "id": "migracao",
            "title": "Migre com perdas declaradas",
            "paragraphs": [
              "A exportação não remove a origem. O formato transporta entradas e embeddings; versões antigas e snapshots incluídos no dump não são reinjetados no destino pelo contrato atual. A perda exige aceite explícito. Confira contagens, capacidades e restauração antes de trocar o backend usado pelo runtime."
            ],
            "code": "orkmind store --help"
          }
        ]
      },
      "en": {
        "title": "Choose and operate a backend",
        "description": "Compare durability, search, idempotency and migration limits.",
        "sections": [
          {
            "id": "pgvector",
            "title": "pgvector: production reference",
            "paragraphs": [
              "The default backend uses PostgreSQL with pgvector. It provides durable storage, ranked text search, a unique content index, ACL filtering and database-side ordering. Check the installation’s capabilities before investigating result differences."
            ],
            "code": "orkmind store info"
          },
          {
            "id": "memory",
            "title": "memory: testing and development",
            "paragraphs": [
              "memory needs no external service but loses data when the process ends. Text search uses token matching without ranking. Uniqueness is process-local; this backend does not replace production storage."
            ]
          },
          {
            "id": "qdrant",
            "title": "Qdrant: laboratory use only",
            "paragraphs": [
              "The reviewed guide marks Qdrant as experimental and not enabled for production. It records unresolved profile identity and TTL disposal issues. Do not use this backend for production data based on this documentation.",
              "Idempotency is best-effort: concurrent writes may duplicate content because there is no equivalent unique index. Text search is unranked, and the governed layer may warn when the candidate window saturates."
            ]
          },
          {
            "id": "migracao",
            "title": "Migrate with declared losses",
            "paragraphs": [
              "Export does not remove the source. The format carries entries and embeddings; old versions and snapshots included in a dump are not restored into the destination under the current contract. Loss requires explicit acceptance. Check counts, capabilities and restoration before changing the runtime’s backend."
            ],
            "code": "orkmind store --help"
          }
        ]
      },
      "es": {
        "title": "Elija y opere un backend",
        "description": "Compare durabilidad, búsqueda, idempotencia y límites de migración.",
        "sections": [
          {
            "id": "pgvector",
            "title": "pgvector: referencia para producción",
            "paragraphs": [
              "El backend predeterminado usa PostgreSQL con pgvector. Ofrece persistencia duradera, búsqueda textual con ranking, índice único de contenido, filtrado ACL y ordenación en la base. Compruebe las capacidades de la instalación antes de investigar diferencias de resultados."
            ],
            "code": "orkmind store info"
          },
          {
            "id": "memory",
            "title": "memory: pruebas y desarrollo",
            "paragraphs": [
              "memory no necesita un servicio externo, pero pierde los datos al terminar el proceso. La búsqueda textual usa coincidencia de tokens sin ranking. La unicidad se limita al proceso; este backend no sustituye el almacenamiento de producción."
            ]
          },
          {
            "id": "qdrant",
            "title": "Qdrant: solo laboratorio",
            "paragraphs": [
              "La guía revisada marca Qdrant como experimental y no habilitado para producción. Registra cuestiones pendientes de identidad de perfiles y eliminación por TTL. No utilice este backend para datos de producción basándose en esta documentación.",
              "La idempotencia es best-effort: las escrituras simultáneas pueden duplicar contenido porque no existe un índice único equivalente. La búsqueda textual no tiene ranking y la capa gobernada puede advertir cuando se satura la ventana de candidatos."
            ]
          },
          {
            "id": "migracao",
            "title": "Migre con pérdidas declaradas",
            "paragraphs": [
              "La exportación no elimina el origen. El formato transporta entradas y embeddings; las versiones antiguas e instantáneas incluidas en el dump no se reinsertan en el destino con el contrato actual. La pérdida exige aceptación explícita. Compruebe recuentos, capacidades y restauración antes de cambiar el backend del runtime."
            ],
            "code": "orkmind store --help"
          }
        ]
      }
    }
  }
];
