const crypto = require("node:crypto");
const { criarConexao } = require("./database");

const STATUS_VALIDOS = [
  "Aguardando Produção",
  "Produção Concluída",
  "Em Rota",
  "Entregue",
];

const TRANSICOES_PERMITIDAS = {
  "Aguardando Produção": ["Produção Concluída"],
  "Produção Concluída": ["Em Rota"],
  "Em Rota": ["Entregue"],
  "Entregue": [],
};

const CARACTERES_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function gerarBlocoAleatorio(tamanho = 3) {
  const bytes = crypto.randomBytes(tamanho);
  let bloco = "";
  for (let i = 0; i < tamanho; i++) {
    bloco += CARACTERES_CODIGO[bytes[i] % CARACTERES_CODIGO.length];
  }
  return bloco;
}

function gerarCodigoRastreio(sequencia = 1) {
  const numeroFormatado = String(Math.max(1, Number(sequencia) || 1)).padStart(4, "0");
  const letras = gerarBlocoAleatorio(3);
  return `TF-${letras}-${numeroFormatado}`;
}

class Entrega {
  constructor({ codigo, destinatario, destino, status = "Aguardando Produção" }) {
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

    this.codigo = String(codigo).trim().toUpperCase();
    this.destinatario = String(destinatario).trim();
    this.destino = String(destino).trim();
    this.status = status;
  }
}

class GerenciadorEntregas {
  constructor(db = criarConexao()) {
    this.db = db;
  }

  obterProximoCodigoAutomatico() {
    const totalAtual = this.db.prepare("SELECT COUNT(*) AS total FROM entregas").get().total;
    let sequencia = Number(totalAtual) + 1;
    let candidato = gerarCodigoRastreio(sequencia);

    while (this.buscarPorCodigo(candidato)) {
      sequencia += 1;
      candidato = gerarCodigoRastreio(sequencia);
    }

    return candidato;
  }

  cadastrar(dados = {}) {
    const codigoFinal =
      dados.codigo && String(dados.codigo).trim() !== ""
        ? String(dados.codigo).trim().toUpperCase()
        : this.obterProximoCodigoAutomatico();

    const entrega = new Entrega({
      ...dados,
      codigo: codigoFinal,
      status: dados.status || "Aguardando Produção",
    });

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
    return stmt.get(String(codigo).trim().toUpperCase()) || null;
  }

  atualizarStatus(codigo, novoStatus) {
    if (!STATUS_VALIDOS.includes(novoStatus)) {
      throw new Error(`Status inválido: ${novoStatus}`);
    }

    const entrega = this.buscarPorCodigo(codigo);
    if (!entrega) {
      throw new Error(`Entrega ${codigo} não encontrada.`);
    }

    if (entrega.status !== novoStatus) {
      const permitidos = TRANSICOES_PERMITIDAS[entrega.status] || [];
      if (!permitidos.includes(novoStatus)) {
        throw new Error(
          `Transição de status inválida: ${entrega.status} -> ${novoStatus}`
        );
      }
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
  TRANSICOES_PERMITIDAS,
  gerarCodigoRastreio,
};
