# techflow-logistica-agile

## 📋 Escopo do Projeto

O sistema permite o controle completo (CRUD) de entregas logísticas com validações de domínio e persistência em banco de dados relacional:

- **Cadastro de Entregas:** Validação de campos obrigatórios (`codigo`, `destinatario`, `destino`) e bloqueio de códigos de rastreio duplicados.
- **Consulta e Rastreamento:** Listagem geral e busca individual por código de rastreio.
- **Atualização de Status:** Controle de fluxo de entrega restrito aos status válidos (`Pendente`, `Em Rota`, `Entregue`).
- **Remoção de Registros:** Exclusão segura com validação de existência.
- **Persistência em Banco de Dados:** Armazenamento relacional utilizando SQLite nativo (`node:sqlite`).

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem / Runtime:** JavaScript (Node.js 22)
- **Banco de Dados:** SQLite (`node:sqlite` nativo)
- **Testes Automatizados:** Node.js Test Runner (`node --test` + `node:assert/strict`)
- **CI/CD:** GitHub Actions
- **Gestão Ágil:** GitHub Projects (Kanban com automação de workflow via Issues)

---

## 📁 Estrutura do Repositório

```text
techflow-logistica-agile/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline de CI para execução automática dos testes
├── docs/
│   └── modelagem_inicial.md    # Documentação e modelagem inicial do sistema
├── src/
│   ├── database.js             # Configuração da conexão e schema SQLite
│   └── entregas.js             # Regras de negócio e CRUD de entregas
├── tests/
│   └── entregas.test.js        # Testes unitários e de integração em memória
├── .gitignore
└── README.md

⚙️ Metodologia Ágil e Fluxo de Trabalho

O desenvolvimento segue o fluxo Kanban utilizando o GitHub Projects:

    Backlog / To Do: Planejamento e priorização das tarefas técnicas via Issues.

    In Progress: Desenvolvimento incremental em commits atômicos e semânticos (feat:, docs:, ci:).

    Done: Movimentação automatizada dos cards no quadro Kanban por meio de palavras-chave nos commits (Closes #<id>), condicionada à aprovação dos testes no pipeline de GitHub Actions.

🚀 Como Executar Localmente
Pré-requisitos

    Node.js 22 ou superior instalado.

Passo a passo
Bash

# 1. Clonar o repositório
git clone git@github.com:lbezerra07/techflow-logistica-agile.git
cd techflow-logistica-agile

# 2. Executar a suíte de testes automatizados
node --test