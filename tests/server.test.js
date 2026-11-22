const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { criarConexao } = require("../src/database");
const { criarServidor } = require("../src/server");

describe("API REST /api/entregas", () => {
  let db;
  let server;
  let baseUrl;

  beforeEach(async () => {
    db = criarConexao(":memory:");
    server = criarServidor(db);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });

  it("deve criar, listar, atualizar status e remover entrega via HTTP", async () => {
    // 1. POST - Cadastrar
    const resCreate = await fetch(`${baseUrl}/api/entregas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: "TF-900",
        destinatario: "Fernanda Alves",
        destino: "Campinas - SP",
      }),
    });
    assert.equal(resCreate.status, 201);
    const criada = await resCreate.json();
    assert.equal(criada.status, "Pendente");

    // 2. GET - Listar
    const resList = await fetch(`${baseUrl}/api/entregas`);
    const lista = await resList.json();
    assert.equal(lista.length, 1);

    // 3. PATCH - Atualizar status
    const resPatch = await fetch(`${baseUrl}/api/entregas/TF-900`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Em Rota" }),
    });
    assert.equal(resPatch.status, 200);
    const atualizada = await resPatch.json();
    assert.equal(atualizada.status, "Em Rota");

    // 4. DELETE - Remover
    const resDelete = await fetch(`${baseUrl}/api/entregas/TF-900`, {
      method: "DELETE",
    });
    assert.equal(resDelete.status, 200);
  });
});
