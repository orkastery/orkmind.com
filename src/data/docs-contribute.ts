export default [
  {
    "slug": "contribuir",
    "group": "guides",
    "sources": [
      "CONTRIBUTING.md",
      "orkastery/CONTRIBUTING.md",
      "orkastery/docs/guias/contribuir/o-que-contribuir.md",
      "orkastery/docs/guias/contribuir/desenvolvimento-local.md",
      "orkastery/docs/guias/contribuir/testes-e-verificacao.md",
      "orkastery/docs/guias/contribuir/documentacao.md",
      "orkastery/docs/guias/contribuir/lint-e-estilo.md",
      "orkastery/docs/guias/contribuir/pull-request.md",
      "orkastery/docs/guias/contribuir/triagem.md",
      "orkastery/docs/guias/contribuir/versoes-e-publicacao.md",
      "orkastery/docs/guias/contribuir/com-o-ork.md"
    ],
    "translations": {
      "pt": {
        "title": "Contribuir",
        "description": "Escolha uma contribuição, prepare a prova e encontre o guia da sua tarefa.",
        "sections": [
          {
            "id": "comecar",
            "title": "Por onde começar",
            "paragraphs": [
              "Feature nova começa no GitHub Discussions. Defeito começa por uma issue com o comando, a saída real e a versão. Documentação e correções pequenas podem ir direto a um PR. Consulte issues e roadmap antes de começar; comente na issue que pretende assumir."
            ],
            "links": [
              {
                "label": "Propor uma feature no Discussions",
                "href": "https://github.com/orkastery/orkmind/discussions"
              },
              {
                "label": "Ver as issues",
                "href": "https://github.com/orkastery/orkmind/issues"
              },
              {
                "label": "Ler o CONTRIBUTING",
                "href": "https://github.com/orkastery/orkmind/blob/main/CONTRIBUTING.md"
              }
            ]
          },
          {
            "id": "prova",
            "title": "Prepare uma mudança verificável",
            "paragraphs": [
              "O PR explica o problema, a mudança, a prova, a baseline e o risco. Cole a saída real dos comandos. Separe regressões de falhas que já existiam; mudança de comportamento pede teste que reproduza o defeito. Usar o ork é recomendado e opcional. O mantenedor integra com CI verde no commit exato e conduz a publicação.",
              "Os testes de integração exigem ORKMIND_TEST_DATABASE_URL e apagam o banco de testes. Use somente um banco de teste dedicado; consulte o CONTRIBUTING antes de executar a suíte inteira."
            ],
            "code": "pip install -e \".[dev]\"\npytest -m \"not integration\""
          },
          {
            "id": "guias",
            "title": "Um guia por tarefa",
            "paragraphs": [
              "O OrkMind ainda não tem uma série própria de guias de contribuição. Use os guias do Orkastery para o fluxo de contribuição e o CONTRIBUTING do OrkMind para os comandos e contratos específicos.",
              "Os guias-fonte estão em português do Brasil. A versão em inglês está prevista antes do lançamento. Contribuições claras em inglês são bem-vindas."
            ],
            "links": [
              {
                "label": "O que contribuir",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/o-que-contribuir.md"
              },
              {
                "label": "Desenvolvimento local",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/desenvolvimento-local.md"
              },
              {
                "label": "Testes e verificação",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/testes-e-verificacao.md"
              },
              {
                "label": "Documentação",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/documentacao.md"
              },
              {
                "label": "Lint e estilo",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/lint-e-estilo.md"
              },
              {
                "label": "Pull request",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/pull-request.md"
              },
              {
                "label": "Triagem",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/triagem.md"
              },
              {
                "label": "Versões e publicação",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/versoes-e-publicacao.md"
              },
              {
                "label": "Contribuir com o ork",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/com-o-ork.md"
              }
            ]
          },
          {
            "id": "triagem",
            "title": "Prazo, revisão e segurança",
            "paragraphs": [
              "A meta é uma primeira resposta em até 7 dias para issues e uma primeira revisão no mesmo prazo para PRs. É meta, não garantia. Se passar do prazo, comente no pedido original. Vulnerabilidades vão pelo canal privado indicado em SECURITY.md. Nunca inclua segredos, dados pessoais ou dados de clientes no repositório."
            ],
            "links": [
              {
                "label": "Como reportar uma vulnerabilidade",
                "href": "https://github.com/orkastery/orkmind/blob/main/SECURITY.md"
              }
            ]
          }
        ]
      },
      "en": {
        "title": "Contribute",
        "description": "Choose a contribution, prepare evidence and find the guide for your task.",
        "sections": [
          {
            "id": "comecar",
            "title": "Where to start",
            "paragraphs": [
              "Start new features in GitHub Discussions. Report bugs in an issue with the command, actual output and version. Documentation and small fixes can go straight to a PR. Check existing issues and the roadmap first; comment on an issue before picking it up."
            ],
            "links": [
              {
                "label": "Propose a feature in Discussions",
                "href": "https://github.com/orkastery/orkmind/discussions"
              },
              {
                "label": "Browse issues",
                "href": "https://github.com/orkastery/orkmind/issues"
              },
              {
                "label": "Read CONTRIBUTING",
                "href": "https://github.com/orkastery/orkmind/blob/main/CONTRIBUTING.md"
              }
            ]
          },
          {
            "id": "prova",
            "title": "Prepare a verifiable change",
            "paragraphs": [
              "A PR explains the problem, change, evidence, baseline and risk. Include actual command output. Separate regressions from existing failures; behavior changes need a test that reproduces the problem. Using ork is recommended and optional. The maintainer integrates with passing CI at the exact commit and handles publishing.",
              "Integration tests require ORKMIND_TEST_DATABASE_URL and erase the test database. Use only a dedicated test database; read CONTRIBUTING before running the full suite."
            ],
            "code": "pip install -e \".[dev]\"\npytest -m \"not integration\""
          },
          {
            "id": "guias",
            "title": "One guide per task",
            "paragraphs": [
              "OrkMind does not yet have its own contribution guide series. Use the Orkastery guides for the contribution workflow and OrkMind’s CONTRIBUTING for its specific commands and contracts.",
              "Source guides are currently in Brazilian Portuguese. English versions are planned before launch. Clear contributions in English are welcome."
            ],
            "links": [
              {
                "label": "What to contribute",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/o-que-contribuir.md"
              },
              {
                "label": "Local development",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/desenvolvimento-local.md"
              },
              {
                "label": "Tests and verification",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/testes-e-verificacao.md"
              },
              {
                "label": "Documentation",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/documentacao.md"
              },
              {
                "label": "Lint and style",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/lint-e-estilo.md"
              },
              {
                "label": "Pull requests",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/pull-request.md"
              },
              {
                "label": "Triage",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/triagem.md"
              },
              {
                "label": "Versions and publishing",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/versoes-e-publicacao.md"
              },
              {
                "label": "Contributing with ork",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/com-o-ork.md"
              }
            ]
          },
          {
            "id": "triagem",
            "title": "Response time, review and security",
            "paragraphs": [
              "The target is an initial response to issues within 7 days, and an initial PR review within the same period. This is a target, not a guarantee. If it is missed, comment on the original request. Report vulnerabilities through the private channel in SECURITY.md. Keep secrets, personal information and customer data out of the repository."
            ],
            "links": [
              {
                "label": "How to report a vulnerability",
                "href": "https://github.com/orkastery/orkmind/blob/main/SECURITY.md"
              }
            ]
          }
        ]
      },
      "es": {
        "title": "Cómo contribuir",
        "description": "Elija una contribución, prepare las pruebas y encuentre la guía de su tarea.",
        "sections": [
          {
            "id": "comecar",
            "title": "Por dónde empezar",
            "paragraphs": [
              "Una funcionalidad nueva empieza en GitHub Discussions. Un defecto empieza por una issue con el comando, la salida real y la versión. La documentación y las correcciones pequeñas pueden ir directamente a un PR. Consulte las issues y el roadmap antes de empezar; comente en la issue que quiera asumir."
            ],
            "links": [
              {
                "label": "Proponer una funcionalidad en Discussions",
                "href": "https://github.com/orkastery/orkmind/discussions"
              },
              {
                "label": "Consultar las issues",
                "href": "https://github.com/orkastery/orkmind/issues"
              },
              {
                "label": "Leer CONTRIBUTING",
                "href": "https://github.com/orkastery/orkmind/blob/main/CONTRIBUTING.md"
              }
            ]
          },
          {
            "id": "prova",
            "title": "Prepare un cambio verificable",
            "paragraphs": [
              "El PR explica el problema, el cambio, las pruebas, la baseline y el riesgo. Incluya la salida real de los comandos. Separe las regresiones de los fallos previos; un cambio de comportamiento requiere una prueba que reproduzca el defecto. Usar ork es recomendable y opcional. El mantenedor integra con CI aprobado en el commit exacto y se encarga de publicar.",
              "Las pruebas de integración requieren ORKMIND_TEST_DATABASE_URL y borran la base de pruebas. Use solo una base de pruebas dedicada; lea CONTRIBUTING antes de ejecutar la suite completa."
            ],
            "code": "pip install -e \".[dev]\"\npytest -m \"not integration\""
          },
          {
            "id": "guias",
            "title": "Una guía por tarea",
            "paragraphs": [
              "OrkMind aún no tiene una serie propia de guías de contribución. Use las guías de Orkastery para el flujo de contribución y el CONTRIBUTING de OrkMind para sus comandos y contratos específicos.",
              "Las guías fuente están en portugués de Brasil. La versión en inglés está prevista antes del lanzamiento. Las contribuciones claras en inglés son bienvenidas."
            ],
            "links": [
              {
                "label": "Qué contribuir",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/o-que-contribuir.md"
              },
              {
                "label": "Desarrollo local",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/desenvolvimento-local.md"
              },
              {
                "label": "Pruebas y verificación",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/testes-e-verificacao.md"
              },
              {
                "label": "Documentación",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/documentacao.md"
              },
              {
                "label": "Lint y estilo",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/lint-e-estilo.md"
              },
              {
                "label": "Pull requests",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/pull-request.md"
              },
              {
                "label": "Triaje",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/triagem.md"
              },
              {
                "label": "Versiones y publicación",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/versoes-e-publicacao.md"
              },
              {
                "label": "Contribuir con ork",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/com-o-ork.md"
              }
            ]
          },
          {
            "id": "triagem",
            "title": "Plazo, revisión y seguridad",
            "paragraphs": [
              "El objetivo es una primera respuesta a las issues en un máximo de 7 días y una primera revisión de los PRs en el mismo plazo. Es un objetivo, no una garantía. Si se supera, comente en la solicitud original. Comunique las vulnerabilidades por el canal privado de SECURITY.md. No incluya secretos, datos personales ni datos de clientes en el repositorio."
            ],
            "links": [
              {
                "label": "Cómo comunicar una vulnerabilidad",
                "href": "https://github.com/orkastery/orkmind/blob/main/SECURITY.md"
              }
            ]
          }
        ]
      }
    }
  }
];
