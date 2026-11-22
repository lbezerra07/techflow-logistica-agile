const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { criarConexao } = require("./database");
const { GerenciadorEntregas } = require("./entregas");

function lerCorpoJson(req) {
  return new Promise((resolve, reject) => {
    let dados = "";
    req.on("data", (chunk) => (dados += chunk));
    req.on("end", () => {
      if (!dados) return resolve({});
      try {
        resolve(JSON.parse(dados));
      } catch {
        reject(new Error("JSON inválido no corpo da requisição."));
      }
    });
    req.on("error", reject);
  });
}

function enviarJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function criarServidor(db = criarConexao()) {
  const gerenciador = new GerenciadorEntregas(db);
  const publicDir = path.join(__dirname, "..", "public");

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    try {
      // Rotas da API REST (/api/entregas)
      if (pathname === "/api/entregas" && req.method === "GET") {
        return enviarJson(res, 200, gerenciador.listar());
      }

      if (pathname === "/api/entregas" && req.method === "POST") {
        const body = await lerCorpoJson(req);
        const criada = gerenciador.cadastrar(body);
        return enviarJson(res, 201, criada);
      }

      const matchCodigo = pathname.match(/^\/api\/entregas\/([^/]+)$/);
      if (matchCodigo) {
        const codigo = decodeURIComponent(matchCodigo[1]);

        if (req.method === "GET") {
          const entrega = gerenciador.buscarPorCodigo(codigo);
          if (!entrega) return enviarJson(res, 404, { erro: "Entrega não encontrada." });
          return enviarJson(res, 200, entrega);
        }

        if (req.method === "PATCH") {
          const body = await lerCorpoJson(req);
          const atualizada = gerenciador.atualizarStatus(codigo, body.status);
          return enviarJson(res, 200, atualizada);
        }

        if (req.method === "DELETE") {
          const removida = gerenciador.remover(codigo);
          return enviarJson(res, 200, removida);
        }
      }

      // Servir Front-end estático (public/index.html)
      if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
        const indexPath = path.join(publicDir, "index.html");
        if (fs.existsSync(indexPath)) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          return fs.createReadStream(indexPath).pipe(res);
        }
      }

      enviarJson(res, 404, { erro: "Rota não encontrada." });
    } catch (err) {
      const status = err.message.includes("não encontrada") ? 404 : 400;
      enviarJson(res, status, { erro: err.message });
    }
  });
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = criarServidor();
  server.listen(PORT, () => {
    console.log(`Servidor TechFlow rodando em http://localhost:${PORT}`);
  });
}

module.exports = { criarServidor };
