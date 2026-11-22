// Modelo e gerenciamento básico de entregas para a TechFlow Solutions (logística)

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
  constructor() {
    this.entregas = [];
  }

  // Create: cadastra nova entrega evitando código duplicado
  cadastrar(dados) {
    const entrega = new Entrega(dados);
    const jaExiste = this.entregas.some((item) => item.codigo === entrega.codigo);

    if (jaExiste) {
      throw new Error(`Já existe uma entrega com o código ${entrega.codigo}.`);
    }

    this.entregas.push(entrega);
    return entrega;
  }

  // Read: lista todas ou busca pelo código de rastreio
  listar() {
    return [...this.entregas];
  }

  buscarPorCodigo(codigo) {
    return this.entregas.find((item) => item.codigo === String(codigo).trim()) || null;
  }

  // Update: atualiza status validando valores permitidos
  atualizarStatus(codigo, novoStatus) {
    if (!STATUS_VALIDOS.includes(novoStatus)) {
      throw new Error(`Status inválido: ${novoStatus}`);
    }

    const entrega = this.buscarPorCodigo(codigo);
    if (!entrega) {
      throw new Error(`Entrega ${codigo} não encontrada.`);
    }

    entrega.status = novoStatus;
    return entrega;
  }

  // Delete: remove entrega existente ou lança erro se não achar
  remover(codigo) {
    const indice = this.entregas.findIndex((item) => item.codigo === String(codigo).trim());
    if (indice === -1) {
      throw new Error(`Entrega ${codigo} não encontrada.`);
    }

    const [removida] = this.entregas.splice(indice, 1);
    return removida;
  }
}

module.exports = {
  Entrega,
  GerenciadorEntregas,
  STATUS_VALIDOS,
};