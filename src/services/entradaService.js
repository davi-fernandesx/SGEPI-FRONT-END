import { api } from "./api";

export function extrairLista(resp) {
  // Pega o corpo da resposta
  const dados = resp?.data ?? resp;

  // 1. Se o Back-end mandou um Array direto (ex: Tamanhos), retorna ele
  if (Array.isArray(dados)) return dados;

  // 2. Se for um Objeto (Paginado), busca a lista dentro das chaves possíveis
  // O Go costuma usar PascalCase (Fornecedores), o JS costuma usar camelCase (fornecedores)
  const listaEncontrada = 
    dados?.Fornecedores || dados?.fornecedores || 
    dados?.Epis || dados?.epis || 
    dados?.Entradas || dados?.entradas || 
    dados?.Tamanhos || dados?.tamanhos ||
    dados?.Data || dados?.data || 
    [];

  console.log("📥 [Service] Conteúdo extraído:", listaEncontrada);
  
  return Array.isArray(listaEncontrada) ? listaEncontrada : [];
}

async function buscarPrimeiraLista(rotas) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp);

      if (Array.isArray(lista)) return lista;
    } catch {
      continue;
    }
  }

  throw new Error("Erro ao buscar dados da API.");
}

export async function listarFornecedores() {
  return buscarPrimeiraLista(["/fornecedores"]);
}

export async function listarEpis() {
  return buscarPrimeiraLista(["/epis"]);
}

export async function listarTamanhos() {
  return buscarPrimeiraLista(["/tamanhos"]);
}

export async function listarEntradas() {
  return buscarPrimeiraLista([
    "/entradas",
  ]);
}

export async function criarEntrada(payload) {
  const rotas = ["/cadastrar-entrada"];

  for (const rota of rotas) {
    try {
      await api.post(rota, payload);
      return;
    } catch {
      continue;
    }
  }

  throw new Error("Erro ao salvar entrada.");
}