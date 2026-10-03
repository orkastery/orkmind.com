export default [
  {
    "slug": "contribuir",
    "group": "guides",
    "sources": [
      "CONTRIBUTING.md",
      "docs/contribuir/o-que-contribuir.md",
      "docs/contribuir/desenvolvimento-local.md",
      "docs/contribuir/testes.md",
      "docs/contribuir/documentacao.md",
      "docs/contribuir/lint-e-estilo.md",
      "docs/contribuir/pull-request.md",
      "docs/contribuir/triagem.md",
      "docs/contribuir/versoes-e-publicacao.md",
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
              "O PR traz o problema, a mudança, a prova, a baseline e o risco, e diz na seção de uso de agente quando um agente escreveu parte do diff. Cole a saída real dos comandos. Rode na main atual o mesmo comando que falhou para separar regressão de dívida anterior; mudança de comportamento pede teste que falhava antes e passa agora. Usar o ork é recomendado e opcional. O mantenedor integra com os checks obrigatórios verdes no commit exato e conduz a publicação.",
              "O CI roda a suíte sem banco, o pacote e o plugin do OpenClaw; não roda a integração, o ruff nem o mypy. A integração apaga o banco de teste e só aceita alvo com test, _ci ou sandbox no nome, em ORKMIND_TEST_DATABASE_URL e ORKMIND_PROVIDER_TEST_DATABASE_URL. Rode-a quando mexer no que grava no banco e diga no PR o que rodou."
            ],
            "code": "python -m pip install -e \".[dev,memory-provider,documents,qdrant,encryption]\"\npython -m pytest -m \"not integration\" -q"
          },
          {
            "id": "guias",
            "title": "Um guia por tarefa",
            "paragraphs": [
              "O OrkMind tem um guia por tarefa em docs/contribuir, indexado no CONTRIBUTING: do clone aos testes, documentação, estilo, pull request, triagem e publicação. Cada guia abre com a resposta em uma frase, e um teste confere que os comandos, caminhos e links citados existem.",
              "Os guias estão em português do Brasil hoje; a versão em inglês está prevista antes do lançamento. Contribuições claras em inglês são bem-vindas."
            ],
            "links": [
              {
                "label": "O que contribuir",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/o-que-contribuir.md"
              },
              {
                "label": "Desenvolvimento local",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/desenvolvimento-local.md"
              },
              {
                "label": "Testes",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/testes.md"
              },
              {
                "label": "Documentação",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/documentacao.md"
              },
              {
                "label": "Lint e estilo",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/lint-e-estilo.md"
              },
              {
                "label": "Pull request",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/pull-request.md"
              },
              {
                "label": "Triagem",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/triagem.md"
              },
              {
                "label": "Versões e publicação",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/versoes-e-publicacao.md"
              }
            ]
          },
          {
            "id": "orkastery",
            "title": "No Orkastery e com o ork",
            "paragraphs": [
              "Para contribuir com o Orkastery, ou conduzir a sua contribuição com o ork, use os guias do Orkastery. A suíte inteira do núcleo roda sem as dependências opcionais: o teste que precisa delas sai como skip com o motivo, e ORK_TESTE_EXIGE_AMBIENTE=1 não pula nada. O CI pede uma linha no CHANGELOG quando o PR muda core, adapters ou marketplaces, e o bundle de prova de cada thread fica em .ork-ci/<thread>.json."
            ],
            "links": [
              {
                "label": "Ler o CONTRIBUTING do Orkastery",
                "href": "https://github.com/orkastery/orkastery/blob/main/CONTRIBUTING.md"
              },
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
              "The PR states the problem, the change, the proof, the baseline and the risk, and uses the agent section to say when an agent wrote part of the diff. Paste the real command output. Run the failing command on the current main to separate a regression from earlier debt; a behavior change needs a test that failed before and passes now. Using ork is recommended and optional. The maintainer merges with the required checks green on the exact commit and handles publishing.",
              "CI runs the database-free suite, the package and the OpenClaw plugin; it does not run integration tests, ruff or mypy. Integration tests erase the test database and only accept a target with test, _ci or sandbox in its name, in ORKMIND_TEST_DATABASE_URL and ORKMIND_PROVIDER_TEST_DATABASE_URL. Run them when you change anything that writes to the database and say in the PR what you ran."
            ],
            "code": "python -m pip install -e \".[dev,memory-provider,documents,qdrant,encryption]\"\npython -m pytest -m \"not integration\" -q"
          },
          {
            "id": "guias",
            "title": "One guide per task",
            "paragraphs": [
              "OrkMind has one guide per task in docs/contribuir, indexed in CONTRIBUTING: from cloning to tests, documentation, style, pull requests, triage and publishing. Each guide opens with a one-sentence answer, and a test checks that the commands, paths and links it cites exist.",
              "The guides are in Brazilian Portuguese today; an English version is planned before launch. Clear contributions in English are welcome."
            ],
            "links": [
              {
                "label": "What to contribute",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/o-que-contribuir.md"
              },
              {
                "label": "Local development",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/desenvolvimento-local.md"
              },
              {
                "label": "Tests",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/testes.md"
              },
              {
                "label": "Documentation",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/documentacao.md"
              },
              {
                "label": "Lint and style",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/lint-e-estilo.md"
              },
              {
                "label": "Pull request",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/pull-request.md"
              },
              {
                "label": "Triage",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/triagem.md"
              },
              {
                "label": "Releases and publishing",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/versoes-e-publicacao.md"
              }
            ]
          },
          {
            "id": "orkastery",
            "title": "In Orkastery and with ork",
            "paragraphs": [
              "To contribute to Orkastery, or to drive your contribution with ork, use the Orkastery guides. The core's full suite runs without the optional dependencies: a test that needs them is skipped with the reason, and ORK_TESTE_EXIGE_AMBIENTE=1 skips nothing. CI requires a CHANGELOG line when the PR changes core, adapters or marketplaces, and each thread's proof bundle lives in .ork-ci/<thread>.json."
            ],
            "links": [
              {
                "label": "Read the Orkastery CONTRIBUTING",
                "href": "https://github.com/orkastery/orkastery/blob/main/CONTRIBUTING.md"
              },
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
                "label": "Pull request",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/pull-request.md"
              },
              {
                "label": "Triage",
                "href": "https://github.com/orkastery/orkastery/blob/main/docs/guias/contribuir/triagem.md"
              },
              {
                "label": "Releases and publishing",
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
              "El PR expone el problema, el cambio, la prueba, la línea base y el riesgo, y usa la sección de uso de agentes para indicar cuándo un agente escribió parte del diff. Pegue la salida real de los comandos. Ejecute en la main actual el mismo comando que falló para separar una regresión de una deuda anterior; un cambio de comportamiento pide una prueba que fallaba antes y pasa ahora. Usar ork es recomendable y opcional. El mantenedor integra con los checks obligatorios en verde en el commit exacto y conduce la publicación.",
              "La CI ejecuta la suite sin base de datos, el paquete y el plugin de OpenClaw; no ejecuta la integración, ruff ni mypy. La integración borra la base de pruebas y solo acepta un destino con test, _ci o sandbox en el nombre, en ORKMIND_TEST_DATABASE_URL y ORKMIND_PROVIDER_TEST_DATABASE_URL. Ejecútela cuando cambie algo que escribe en la base e indique en el PR lo que ejecutó."
            ],
            "code": "python -m pip install -e \".[dev,memory-provider,documents,qdrant,encryption]\"\npython -m pytest -m \"not integration\" -q"
          },
          {
            "id": "guias",
            "title": "Una guía por tarea",
            "paragraphs": [
              "OrkMind tiene una guía por tarea en docs/contribuir, indexada en CONTRIBUTING: del clon a las pruebas, documentación, estilo, pull request, triaje y publicación. Cada guía empieza con la respuesta en una frase, y una prueba comprueba que existen los comandos, rutas y enlaces que cita.",
              "Las guías están hoy en portugués de Brasil; la versión en inglés está prevista antes del lanzamiento. Las contribuciones claras en inglés son bienvenidas."
            ],
            "links": [
              {
                "label": "Qué contribuir",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/o-que-contribuir.md"
              },
              {
                "label": "Desarrollo local",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/desenvolvimento-local.md"
              },
              {
                "label": "Pruebas",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/testes.md"
              },
              {
                "label": "Documentación",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/documentacao.md"
              },
              {
                "label": "Lint y estilo",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/lint-e-estilo.md"
              },
              {
                "label": "Pull request",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/pull-request.md"
              },
              {
                "label": "Triaje",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/triagem.md"
              },
              {
                "label": "Versiones y publicación",
                "href": "https://github.com/orkastery/orkmind/blob/main/docs/contribuir/versoes-e-publicacao.md"
              }
            ]
          },
          {
            "id": "orkastery",
            "title": "En Orkastery y con ork",
            "paragraphs": [
              "Para contribuir a Orkastery, o conducir su contribución con ork, use las guías de Orkastery. La suite completa del núcleo se ejecuta sin las dependencias opcionales: la prueba que las necesita se omite con el motivo, y ORK_TESTE_EXIGE_AMBIENTE=1 no omite nada. La CI pide una línea en el CHANGELOG cuando el PR cambia core, adapters o marketplaces, y el paquete de prueba de cada hilo queda en .ork-ci/<thread>.json."
            ],
            "links": [
              {
                "label": "Leer el CONTRIBUTING de Orkastery",
                "href": "https://github.com/orkastery/orkastery/blob/main/CONTRIBUTING.md"
              },
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
                "label": "Pull request",
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
