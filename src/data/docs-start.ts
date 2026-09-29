export default [
  {
    "slug": "comecar",
    "group": "start",
    "sources": [
      "README.md",
      "README.pt-BR.md",
      "pyproject.toml"
    ],
    "translations": {
      "pt": {
        "title": "Comece com OrkMind",
        "description": "Instale a memória tipada e confira armazenamento e recuperação.",
        "sections": [
          {
            "id": "instalar",
            "title": "Instalação e requisitos",
            "paragraphs": [
              "OrkMind é software aberto sob licença MIT. As fontes revisadas descrevem a versão 0.4.0, alpha. Use Python 3.11 ou superior e PostgreSQL com pgvector para o backend padrão. Configure ORKMIND_DATABASE_URL no ambiente protegido; não publique o valor."
            ],
            "code": "pip install \"orkmind>=0.4.0\"\norkmind store info\norkmind stats"
          },
          {
            "id": "primeira-memoria",
            "title": "Grave e consulte uma entrada",
            "paragraphs": [
              "Escolha uma coleção pela finalidade do conteúdo e tags pelo contexto de recuperação. O exemplo grava uma instrução neutra; regras protegidas ou obrigatórias dependem de identidade e autorização apropriadas. Confirme a saída do backend antes de afirmar que algo foi persistido."
            ],
            "code": "orkmind add --collection instruction --content \"Run the project checks before delivery\" --tags '{\"skill\":[\"testing\"]}'\norkmind search --tags '{\"skill\":[\"testing\"]}'"
          },
          {
            "id": "limite",
            "title": "Recuperar não é injetar",
            "paragraphs": [
              "O CLI e o MCP devolvem memória sob demanda; não constroem o prompt do modelo. Os plugins de construção de prompt para Hermes e OpenClaw fazem a injeção por turno. Habilitar um servidor MCP, sozinho, não garante que o agente o consulte a cada ação."
            ]
          }
        ]
      },
      "en": {
        "title": "Get started with OrkMind",
        "description": "Install typed memory and check storage and retrieval.",
        "sections": [
          {
            "id": "instalar",
            "title": "Installation and requirements",
            "paragraphs": [
              "OrkMind is open source under the MIT license. The reviewed sources describe version 0.4.0, alpha. Use Python 3.11 or later and PostgreSQL with pgvector for the default backend. Set ORKMIND_DATABASE_URL in the protected environment; do not publish its value."
            ],
            "code": "pip install \"orkmind>=0.4.0\"\norkmind store info\norkmind stats"
          },
          {
            "id": "primeira-memoria",
            "title": "Store and query an entry",
            "paragraphs": [
              "Choose a collection by content purpose and tags by retrieval context. This example stores a neutral instruction; protected or mandatory rules require appropriate identity and authorization. Confirm the backend response before claiming persistence."
            ],
            "code": "orkmind add --collection instruction --content \"Run the project checks before delivery\" --tags '{\"skill\":[\"testing\"]}'\norkmind search --tags '{\"skill\":[\"testing\"]}'"
          },
          {
            "id": "limite",
            "title": "Retrieval is not injection",
            "paragraphs": [
              "The CLI and MCP return memory on demand; they do not build the model prompt. Prompt-building plugins for Hermes and OpenClaw perform per-turn injection. Enabling an MCP server alone does not guarantee that an agent queries it before every action."
            ]
          }
        ]
      },
      "es": {
        "title": "Empiece con OrkMind",
        "description": "Instale la memoria tipada y compruebe almacenamiento y recuperación.",
        "sections": [
          {
            "id": "instalar",
            "title": "Instalación y requisitos",
            "paragraphs": [
              "OrkMind es software abierto bajo licencia MIT. Las fuentes revisadas describen la versión 0.4.0, alpha. Use Python 3.11 o posterior y PostgreSQL con pgvector para el backend predeterminado. Configure ORKMIND_DATABASE_URL en el entorno protegido; no publique su valor."
            ],
            "code": "pip install \"orkmind>=0.4.0\"\norkmind store info\norkmind stats"
          },
          {
            "id": "primeira-memoria",
            "title": "Guarde y consulte una entrada",
            "paragraphs": [
              "Elija una colección según la finalidad del contenido y etiquetas según el contexto de recuperación. El ejemplo guarda una instrucción neutra; las reglas protegidas u obligatorias requieren identidad y autorización adecuadas. Confirme la respuesta del backend antes de afirmar que se persistió algo."
            ],
            "code": "orkmind add --collection instruction --content \"Run the project checks before delivery\" --tags '{\"skill\":[\"testing\"]}'\norkmind search --tags '{\"skill\":[\"testing\"]}'"
          },
          {
            "id": "limite",
            "title": "Recuperar no es inyectar",
            "paragraphs": [
              "El CLI y MCP devuelven memoria bajo demanda; no construyen el prompt del modelo. Los plugins de construcción de prompts para Hermes y OpenClaw realizan la inyección por turno. Habilitar un servidor MCP por sí solo no garantiza que el agente lo consulte antes de cada acción."
            ]
          }
        ]
      }
    }
  }
];
