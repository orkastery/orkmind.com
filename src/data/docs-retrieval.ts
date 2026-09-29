export default [
  {
    "slug": "recuperacao",
    "group": "retrieval",
    "sources": [
      "README.md",
      "docs/ontologia.md"
    ],
    "diagram": "retrieval",
    "translations": {
      "pt": {
        "title": "Recupere contexto relevante",
        "description": "Combine filtros determinísticos, prioridade e busca semântica opcional.",
        "sections": [
          {
            "id": "tags",
            "title": "Correspondência exata",
            "paragraphs": [
              "A consulta por tags usa contenção exata. Se uma regra não aparece, confira tags, escopo, ACL, expiração e o backend ativo antes de atribuir o resultado ao modelo. A detecção de contexto sugere tags; ela não substitui regras de acesso."
            ],
            "code": "orkmind search --tags '{\"skill\":[\"testing\"]}'\norkmind detect --text \"review the tests\""
          },
          {
            "id": "semantica",
            "title": "Semântica e orçamento",
            "paragraphs": [
              "Texto e vetores podem ser combinados por RRF quando configurados. Isso amplia descoberta, sem substituir a busca determinística de regras. O orçamento prioriza entradas críticas e obrigatórias; saturação e degradação precisam aparecer na resposta ou no diagnóstico."
            ]
          }
        ]
      },
      "en": {
        "title": "Retrieve relevant context",
        "description": "Combine deterministic filters, priority and optional semantic search.",
        "sections": [
          {
            "id": "tags",
            "title": "Exact matching",
            "paragraphs": [
              "Tag queries use exact containment. If a rule is missing, check tags, scope, ACL, expiration and the active backend before attributing the result to the model. Context detection suggests tags; it does not replace access rules."
            ],
            "code": "orkmind search --tags '{\"skill\":[\"testing\"]}'\norkmind detect --text \"review the tests\""
          },
          {
            "id": "semantica",
            "title": "Semantics and budget",
            "paragraphs": [
              "Text and vectors can be fused with RRF when configured. This broadens discovery without replacing deterministic rule retrieval. The budget prioritizes critical and mandatory entries; saturation and degradation must appear in the response or diagnostics."
            ]
          }
        ]
      },
      "es": {
        "title": "Recupere contexto relevante",
        "description": "Combine filtros deterministas, prioridad y búsqueda semántica opcional.",
        "sections": [
          {
            "id": "tags",
            "title": "Coincidencia exacta",
            "paragraphs": [
              "Las consultas por etiquetas usan contención exacta. Si falta una regla, compruebe etiquetas, alcance, ACL, caducidad y backend activo antes de atribuir el resultado al modelo. La detección de contexto sugiere etiquetas; no sustituye las reglas de acceso."
            ],
            "code": "orkmind search --tags '{\"skill\":[\"testing\"]}'\norkmind detect --text \"review the tests\""
          },
          {
            "id": "semantica",
            "title": "Semántica y presupuesto",
            "paragraphs": [
              "Texto y vectores pueden combinarse mediante RRF cuando están configurados. Esto amplía el descubrimiento sin sustituir la recuperación determinista de reglas. El presupuesto prioriza entradas críticas y obligatorias; la saturación y degradación deben aparecer en la respuesta o el diagnóstico."
            ]
          }
        ]
      }
    }
  },
  {
    "slug": "federacao",
    "group": "retrieval",
    "sources": [
      "docs/federation.md"
    ],
    "translations": {
      "pt": {
        "title": "Memória federada por projeto",
        "description": "Consulte fontes autorizadas preservando isolamento e proveniência.",
        "sections": [
          {
            "id": "identidade",
            "title": "Identidade e duas camadas de acesso",
            "paragraphs": [
              "A federação é recall somente leitura entre memórias separadas por projeto. O perfil autoriza as fontes; GovernedStore aplica novamente a ACL de cada entrada. system_owner, builder e agent têm escopos distintos. Perfil ausente ou malformado é negado."
            ]
          },
          {
            "id": "resultado",
            "title": "Resultado com origem e lacunas",
            "paragraphs": [
              "Cada resultado conserva source, project e producer. O contrato orkmind.federated-recall/v1 declara unavailable_sources sem eliminar os resultados saudáveis. O manifesto guarda nomes de variáveis; credenciais e identidades não devem ser copiadas de exemplos para produção."
            ],
            "code": "orkmind federation --help"
          }
        ]
      },
      "en": {
        "title": "Federated memory by project",
        "description": "Query authorized sources while preserving isolation and provenance.",
        "sections": [
          {
            "id": "identidade",
            "title": "Identity and two access layers",
            "paragraphs": [
              "Federation is read-only recall across project-separated memories. The profile authorizes sources; GovernedStore reapplies each entry’s ACL. system_owner, builder and agent have distinct scopes. Missing or malformed profiles are denied."
            ]
          },
          {
            "id": "resultado",
            "title": "Results with provenance and gaps",
            "paragraphs": [
              "Each result retains source, project and producer. The orkmind.federated-recall/v1 contract declares unavailable_sources without dropping healthy results. The manifest stores variable names; credentials and identities must not be copied from examples into production."
            ],
            "code": "orkmind federation --help"
          }
        ]
      },
      "es": {
        "title": "Memoria federada por proyecto",
        "description": "Consulte fuentes autorizadas conservando aislamiento y procedencia.",
        "sections": [
          {
            "id": "identidade",
            "title": "Identidad y dos capas de acceso",
            "paragraphs": [
              "La federación es recall de solo lectura entre memorias separadas por proyecto. El perfil autoriza las fuentes; GovernedStore vuelve a aplicar la ACL de cada entrada. system_owner, builder y agent tienen alcances distintos. Los perfiles ausentes o malformados se deniegan."
            ]
          },
          {
            "id": "resultado",
            "title": "Resultados con procedencia y lagunas",
            "paragraphs": [
              "Cada resultado conserva source, project y producer. El contrato orkmind.federated-recall/v1 declara unavailable_sources sin eliminar resultados sanos. El manifiesto guarda nombres de variables; no copie credenciales ni identidades de ejemplos a producción."
            ],
            "code": "orkmind federation --help"
          }
        ]
      }
    }
  },
  {
    "slug": "roadmap",
    "group": "governance",
    "sources": [
      "README.md"
    ],
    "translations": {
      "pt": {
        "title": "Direção do produto",
        "description": "Resumo mensal e acompanhamento no repositório.",
        "sections": [
          {
            "id": "resumo",
            "title": "Resumo de setembro de 2026",
            "paragraphs": [
              "A evolução acompanha integrações, memória governada e documentação. Consulte o repositório para acompanhar propostas e estado real; planos não significam que uma capacidade já está disponível."
            ]
          }
        ]
      },
      "en": {
        "title": "Product direction",
        "description": "Monthly summary and repository tracking.",
        "sections": [
          {
            "id": "resumo",
            "title": "September 2026 summary",
            "paragraphs": [
              "Work tracks integrations, governed memory and documentation. Consult the repository for proposals and actual state; plans do not mean a capability is already available."
            ]
          }
        ]
      },
      "es": {
        "title": "Dirección del producto",
        "description": "Resumen mensual y seguimiento en el repositorio.",
        "sections": [
          {
            "id": "resumo",
            "title": "Resumen de septiembre de 2026",
            "paragraphs": [
              "La evolución abarca integraciones, memoria gobernada y documentación. Consulte el repositorio para seguir propuestas y estado real; los planes no significan que una capacidad ya esté disponible."
            ]
          }
        ]
      }
    }
  }
];
