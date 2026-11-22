const { criarConexao } = require("./database");

const STATUS_VALIDOS = ["Pendente", "Em Rota", "Entregue"];

class Entrega {
  constructor({ codigo, destinatario, destino, status = "Pendente" }) {
    if (!codigo || String(codigo).trim() === "") {
      throw new Error("Código de rastreio é obrigatório.");
    }
    if (!destinatario || String(destinatario).trim() === "") {
      throw new Error("Destinatário é obrigatório.");
    }
    if (!destino || String(destino).trim() === "") {
      throw new Error("Destino é obrigatório.");
    }
    if (!STATUS_VALIDOS.includes(status)) {
      throw new Error(`Status inválido: ${status}`);
    }

    this.codigo = String(codigo).trim();
    this.destinatario = String(destinatario).trim();
    this.destino = String(destino).trim();
    this.status = status;
  }
}

class GerenciadorEntregas {
  constructor(db = criarConexao()) {
    this.db = db;
  }

  cadastrar(dados) {
    const entrega = new Entrega(dados);

    if (this.buscarPorCodigo(entrega.codigo)) {
      throw new Error(`Já existe uma entrega com o código ${entrega.codigo}.`);
    }

    const stmt = this.db.prepare(
      "INSERT INTO entregas (codigo, destinatario, destino, status) VALUES (?, ?, ?, ?)"
    );
    stmt.run(entrega.codigo, entrega.destinatario, entrega.destino, entrega.status);

    return entrega;
  }

  listar() {
    const stmt = this.db.prepare("SELECT codigo, destinatario, destino, status FROM entregas");
    return stmt.all();
  }

  buscarPorCodigo(codigo) {
    const stmt = this.db.prepare(
      "SELECT codigo, destinatario, destino, status FROM entregas WHERE codigo = ?"
    );
    return stmt.get(String(codigo).trim()) || null;
  }

  atualizarStatus(codigo, novoStatus) {
    if (!STATUS_VALIDOS.includes(novoStatus)) {
      throw new Error(`Status inválido: ${novoStatus}`);
    }

    const entrega = this.buscarPorCodigo(codigo);
    if (!entrega) {
      throw new Error(`Entrega ${codigo} não encontrada.`);
    }

    const stmt = this.db.prepare("UPDATE entregas SET status = ? WHERE codigo = ?");
    stmt.run(novoStatus, entrega.codigo);

    return this.buscarPorCodigo(entrega.codigo);
  }

  remover(codigo) {
    const entrega = this.buscarPorCodigo(codigo);
    if (!entrega) {
      throw new Error(`Entrega ${codigo} não encontrada.`);
    }

    const stmt = this.db.prepare("DELETE FROM entregas WHERE codigo = ?");
    stmt.run(entrega.codigo);

    return entrega;
  }
}

module.exports = {
  Entrega,
  GerenciadorEntregas,
  STATUS_VALIDOS,
};
