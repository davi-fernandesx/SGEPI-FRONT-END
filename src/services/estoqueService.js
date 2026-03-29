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

      if (Array.isArray(lista)) {
        return lista;
      }
    } catch {
      // tenta a próxima rota
    }
  }

  throw new Error("Não foi possível carregar os dados da rota informada.");
}

export async function listarTiposProtecao() {
  return buscarPrimeiraLista([
    "/tipo-protecao",
    "/tipos-protecao",
    "/tipos_protecao",
  ]);
}

export async function listarTamanhos() {
  return buscarPrimeiraLista(["/tamanhos", "/tamanho"]);
}

export async function listarEpis() {
  return buscarPrimeiraLista(["/epis", "/epi", "/produtos"]);
}

export async function listarEntradasEstoque() {
  return buscarPrimeiraLista([
    "/entrada-epi",
    "/entrada_epi",
    "/entradas-epi",
    "/entradas_epis",
    "/entradas",
  ]);
}