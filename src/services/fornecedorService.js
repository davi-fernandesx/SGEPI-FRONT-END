import { api } from "./api";

export async function listarFornecedores() {
  const rotas = ["/fornecedores", "/fornecedor"];

  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const dados = resp?.data ?? resp;

      if (Array.isArray(dados)) return dados;
    } catch {
      continue;
    }
  }

  throw new Error("Erro ao buscar fornecedores");
}

export async function criarFornecedor(payload) {
  await api.post("/fornecedores", payload);
}