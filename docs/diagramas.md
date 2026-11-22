mkdir -p docs
cat << 'EOF' > docs/diagramas.md
# Documentação Técnica e Diagramas — TechFlow Solutions

## 1. Diagrama de Casos de Uso (UML)

```mermaid
flowchart LR
    Operador["Operador / Gestor Logístico"]

    subgraph Sistema["TechFlow Solutions (Web + API REST)"]
        UC1["Cadastrar Entrega<br/>Gera código TF-XXX-0001<br/>e define status inicial"]
        UC2["Listar e Filtrar Entregas<br/>Por código, destinatário<br/>ou destino"]
        UC3["Atualizar Status da Entrega<br/>Selecionar e clicar em Salvar"]
        UC4["Excluir Entrega"]
        UC5["Visualizar Painel e Contadores<br/>Totais por status"]
        UC6["Validar Dados e Status<br/>Campos obrigatórios e<br/>status permitidos"]
    end

    Operador --> UC1
    Operador --> UC2
    Operador --> UC3
    Operador --> UC4
    Operador --> UC5

    UC1 -. "<<include>>" .-> UC6
    UC3 -. "<<include>>" .-> UC6
```

## 2. Diagrama de Classes (UML)

```mermaid
classDiagram
    class Entrega {
        +string codigo
        +string destinatario
        +string destino
        +string status
        +constructor(dados)
    }

    class GerenciadorEntregas {
        +DatabaseSync db
        +constructor(db)
        +obterProximoCodigoAutomatico() string
        +cadastrar(dados) Entrega
        +listar() Entrega[]
        +buscarPorCodigo(codigo) Entrega|null
        +atualizarStatus(codigo, novoStatus) Entrega
        +remover(codigo) Entrega
    }

    class DatabaseFactory {
        <<module>>
        +criarConexao(caminho) DatabaseSync
    }

    class HttpServer {
        <<module>>
        +criarServidor(db) Server
    }

    class StatusEntrega {
        <<enumeration>>
        Aguardando Produção
        Produção Concluída
        Em Rota
        Entregue
    }

    GerenciadorEntregas --> DatabaseFactory : usa conexão SQLite
    GerenciadorEntregas --> Entrega : instancia e persiste
    Entrega --> StatusEntrega : possui
    HttpServer --> DatabaseFactory : inicializa banco
    HttpServer --> GerenciadorEntregas : delega operações REST
```

## 3. MER — Modelo Entidade-Relacionamento

* **Entidade:** `ENTREGA`
  * `codigo` (PK): identificador único no formato `TF-XXX-0001`, sem duplicidade.
  * `destinatario`: nome ou identificação de quem recebe a entrega (obrigatório).
  * `destino`: local/cidade de destino (obrigatório).
  * `status`: estado atual no fluxo logístico (`Aguardando Produção`, `Produção Concluída`, `Em Rota`, `Entregue`), iniciando em `Aguardando Produção`.

## 4. DER — Diagrama Entidade-Relacionamento (`node:sqlite`)

```mermaid
erDiagram
    ENTREGAS {
        TEXT codigo PK "NOT NULL, UNIQUE"
        TEXT destinatario "NOT NULL"
        TEXT destino "NOT NULL"
        TEXT status "NOT NULL, DEFAULT 'Aguardando Produção'"
    }
```

## 5. Mindmap — TechFlow Solutions

```mermaid
mindmap
  root((TechFlow Solutions))
    Stack e Arquitetura
      Node.js 22 zero-dependency
      node:http API REST
      node:sqlite persistência local e :memory:
      HTML5 / CSS / JS estático public/index.html
    Regras de Negócio
      Código automático TF-XXX-0001
      Prevenção de colisão de código
      Status: Aguardando Produção, Produção Concluída, Em Rota, Entregue
      Alteração livre entre status válidos
      Bloqueio de campos vazios e duplicados
    Interface Web
      Cards de estatísticas por status
      Formulário de nova entrega
      Busca e filtro em tempo real
      Select + botão Salvar
      Botão Excluir
    Qualidade e Workflow
      Testes nativos node:test
      GitHub Actions CI
      Kanban com Issues e commits atômicos
```
EOF