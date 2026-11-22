const { DatabaseSync } = require("node:sqlite");

function criarConexao(caminhoBanco = "techflow.db") {
  const db = new DatabaseSync(caminhoBanco);

  db.exec(`
    CREATE TABLE IF NOT EXISTS entregas (
      codigo TEXT PRIMARY KEY,
      destinatario TEXT NOT NULL,
      destino TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pendente'
    );
  `);

  return db;
}

module.exports = { criarConexao };
