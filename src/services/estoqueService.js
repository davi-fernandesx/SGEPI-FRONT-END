import { api } from "./api";

// Mantemos essa função! Ela é um ótimo escudo.
// Se o backend der erro ou mandar algo vazio, ela garante que o 
// React receba uma lista vazia [], evitando que a tela quebre.
function extrairLista(resp) {
  const dados = resp?.data ?? resp;
  return Array.isArray(dados) ? dados : [];
}

// Criamos uma função simples e direta, sem aquele loop for...of
async function buscarLista(rota, mensagemErro) {
  try {
    const resp = await api.get(rota);
    return extrairLista(resp);
  } catch (erro) {
    console.error(`Erro ao buscar dados na rota ${rota}:`, erro);
    throw new Error(mensagemErro);
  }
}

export async function listarTiposProtecao() {
  return buscarLista("/protecoes", "Não foi possível carregar os tipos de proteção.");
}

export async function listarTamanhos() {
  return buscarLista("/tamanhos", "Não foi possível carregar os tamanhos.");
}

export async function listarEpis() {
  return buscarLista("/epis", "Não foi possível carregar o catálogo de EPIs.");
}

// Lembra da nossa conversa anterior? 
// Agora essa rota "/entradas" é a que vai trazer aquele JSON "gordo" e aninhado,
// com Tamanho e EPI (e Proteção) já embutidos dentro dela!
export async function listarEntradasEstoque() {
  return buscarLista("/entradas", "Não foi possível carregar as entradas de estoque.");
}