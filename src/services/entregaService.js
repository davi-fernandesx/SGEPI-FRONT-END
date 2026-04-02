import { api } from "./api";

function extrairLista(resp) {
  const dados = resp?.data ?? resp;

  if (Array.isArray(dados)) return dados;

  const listaExtraida =
    dados?.entregas ??
    dados?.funcionario ??
    dados?.Epis ??
    dados?.tamanhos ??
    null;

  return Array.isArray(listaExtraida) ? listaExtraida : [];
}

async function buscarPrimeiraLista(rotas) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      console.log(`Resposta da rota ${rota}:`, resp?.data ?? resp);

      const lista = extrairLista(resp);

      if (lista.length > 0) return lista;
    } catch (erro) {
      console.error(`Erro na rota ${rota}:`, erro);
    }
  }

  return [];
}

export async function listarEntregas() {
  return buscarPrimeiraLista(["/entregas"]);
}

export async function listarFuncionariosEntrega() {
  return buscarPrimeiraLista(["/funcionarios"]);
}

export async function listarEpisEntrega() {
  return buscarPrimeiraLista(["/epis"]);
}

export async function listarTamanhosEntrega() {
  return buscarPrimeiraLista(["/tamanhos"]);
}

export async function criarEntrega(payload) {
  const rotas = ["/cadastro-entregas"];
  let ultimoErro = null;

  for (const rota of rotas) {
    try {
      const resposta = await api.post(rota, payload);
      return resposta?.data ?? resposta;
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  throw ultimoErro || new Error("Não foi possível registrar a entrega.");
}