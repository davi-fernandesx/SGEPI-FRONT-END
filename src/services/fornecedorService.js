import { api } from "./api";

export async function listarFornecedores() {
  const rotas = ["/fornecedores"];

  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const dados = resp?.data ?? resp;

      // 1. Verifica se a lista veio direta (caso você mude o Go no futuro)
      if (Array.isArray(dados)) return dados;
      
      // 2. Verifica se a lista veio dentro da chave "Fornecedores" (como está agora)
      if (dados && Array.isArray(dados.Fornecedores)) return dados.Fornecedores;

    } catch {
      continue;
    }
  }

  throw new Error("Erro ao buscar fornecedores");
}

export async function criarFornecedor(payload) {
  await api.post("gerencial/cadastro-fornecedores", payload);
}