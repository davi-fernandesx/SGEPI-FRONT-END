import { api } from "./api";

function extrairLista(resp) {
  const dados = resp?.data ?? resp;
  return Array.isArray(dados) ? dados : [];
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
  return buscarPrimeiraLista(["/epis", "/epi", "/produtos"]);
}

export async function listarTamanhos() {
  return buscarPrimeiraLista(["/tamanhos", "/tamanho"]);
}

export async function listarEntradas() {
  return buscarPrimeiraLista([
    "/entrada-epi",
    "/entrada_epi",
    "/entradas",
  ]);
}

export async function criarEntrada(payload) {
  const rotas = ["/entrada-epi", "/entrada_epi", "/entradas"];

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