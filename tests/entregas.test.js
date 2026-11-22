const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { criarConexao } = require("../src/database");
const { GerenciadorEntregas } = require("../src/entregas");

describe("GerenciadorEntregas com SQLite (CRUD + validações)", () => {
  let db;
  let gerenciador;

  beforeEach(() => {
    db = criarConexao(":memory:");
    gerenciador = new GerenciadorEntregas(db);
  });

  afterEach(() => {
    db.close();
  });

  it("deve gerar código automático no padrão TF-XXX-0001 e iniciar como Pendente", () => {
    const entrega = gerenciador.cadastrar({
      destinatario: "Ana Silva",
      destino: "São Paulo - SP",
    });

    assert.match(entrega.codigo, /^TF-[A-Z2-9]{3}-0001$/);
    assert.equal(entrega.status, "Pendente");
    assert.equal(gerenciador.listar().length, 1);
  });

  it("deve bloquear cadastro com campo obrigatório vazio ou código duplicado", () => {
    assert.throws(() => {
      gerenciador.cadastrar({
        codigo: "TF-ABC-0001",
        destinatario: "",
        destino: "São Paulo - SP",
      });
    }, /obrigatório/);

    gerenciador.cadastrar({
      codigo: "TF-ABC-0001",
      destinatario: "Ana Silva",
      destino: "São Paulo - SP",
    });

    assert.throws(() => {
      gerenciador.cadastrar({
        codigo: "TF-ABC-0001",
        destinatario: "Carlos Souza",
        destino: "Campinas - SP",
      });
    }, /Já existe uma entrega/);
  });

  it("deve buscar entrega por código de rastreio", () => {
    const criada = gerenciador.cadastrar({
      destinatario: "Mariana Costa",
      destino: "Curitiba - PR",
    });

    const encontrada = gerenciador.buscarPorCodigo(criada.codigo);
    assert.ok(encontrada);
    assert.equal(encontrada.destinatario, "Mariana Costa");
    assert.equal(gerenciador.buscarPorCodigo("TF-ZZZ-9999"), null);
  });

  it("deve atualizar status válido e rejeitar status inválido", () => {
    const criada = gerenciador.cadastrar({
      destinatario: "Pedro Lima",
      destino: "Belo Horizonte - MG",
    });

    const atualizada = gerenciador.atualizarStatus(criada.codigo, "Em Rota");
    assert.equal(atualizada.status, "Em Rota");

    assert.throws(() => {
      gerenciador.atualizarStatus(criada.codigo, "Extraviado");
    }, /Status inválido/);
  });

  it("deve remover entrega existente e lançar erro se não existir", () => {
    const criada = gerenciador.cadastrar({
      destinatario: "Lucas Melo",
      destino: "Rio de Janeiro - RJ",
    });

    const removida = gerenciador.remover(criada.codigo);
    assert.equal(removida.codigo, criada.codigo);
    assert.equal(gerenciador.listar().length, 0);

    assert.throws(() => {
      gerenciador.remover(criada.codigo);
    }, /não encontrada/);
  });
});
