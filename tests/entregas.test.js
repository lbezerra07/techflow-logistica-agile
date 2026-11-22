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

  it("deve cadastrar uma entrega válida no SQLite com status inicial Pendente", () => {
    const entrega = gerenciador.cadastrar({
      codigo: "TF-101",
      destinatario: "Ana Silva",
      destino: "São Paulo - SP",
    });

    assert.equal(entrega.codigo, "TF-101");
    assert.equal(entrega.status, "Pendente");
    assert.equal(gerenciador.listar().length, 1);
  });

  it("deve bloquear cadastro com campo obrigatório vazio ou código duplicado", () => {
    assert.throws(() => {
      gerenciador.cadastrar({
        codigo: "",
        destinatario: "Ana Silva",
        destino: "São Paulo - SP",
      });
    }, /obrigatório/);

    gerenciador.cadastrar({
      codigo: "TF-101",
      destinatario: "Ana Silva",
      destino: "São Paulo - SP",
    });

    assert.throws(() => {
      gerenciador.cadastrar({
        codigo: "TF-101",
        destinatario: "Carlos Souza",
        destino: "Campinas - SP",
      });
    }, /Já existe uma entrega/);
  });

  it("deve buscar entrega por código de rastreio", () => {
    gerenciador.cadastrar({
      codigo: "TF-202",
      destinatario: "Mariana Costa",
      destino: "Curitiba - PR",
    });

    const encontrada = gerenciador.buscarPorCodigo("TF-202");
    assert.ok(encontrada);
    assert.equal(encontrada.destinatario, "Mariana Costa");
    assert.equal(gerenciador.buscarPorCodigo("INEXISTENTE"), null);
  });

  it("deve atualizar status válido e rejeitar status inválido", () => {
    gerenciador.cadastrar({
      codigo: "TF-303",
      destinatario: "Pedro Lima",
      destino: "Belo Horizonte - MG",
    });

    const atualizada = gerenciador.atualizarStatus("TF-303", "Em Rota");
    assert.equal(atualizada.status, "Em Rota");

    assert.throws(() => {
      gerenciador.atualizarStatus("TF-303", "Extraviado");
    }, /Status inválido/);
  });

  it("deve remover entrega existente e lançar erro se não existir", () => {
    gerenciador.cadastrar({
      codigo: "TF-404",
      destinatario: "Lucas Melo",
      destino: "Rio de Janeiro - RJ",
    });

    const removida = gerenciador.remover("TF-404");
    assert.equal(removida.codigo, "TF-404");
    assert.equal(gerenciador.listar().length, 0);

    assert.throws(() => {
      gerenciador.remover("TF-404");
    }, /não encontrada/);
  });
});
