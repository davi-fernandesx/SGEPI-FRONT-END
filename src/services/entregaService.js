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
      // tenta próxima rota
    }
  }

  throw new Error("Não foi possível carregar os dados.");
}

export async function listarEntregas() {
  return buscarPrimeiraLista(["/entrega-epi", "/entrega_epi", "/entregas"]);
}

export async function listarFuncionariosEntrega() {
  return buscarPrimeiraLista(["/funcionarios"]);
}

export async function listarEpisEntrega() {
  return buscarPrimeiraLista(["/epis", "/epi", "/produtos"]);
}

export async function listarTamanhosEntrega() {
  return buscarPrimeiraLista(["/tamanhos", "/tamanho"]);
}

export async function criarEntrega(payload) {
  const rotas = ["/entrega-epi", "/entrega_epi", "/entregas"];
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

export async function salvarItensEntrega(lista) {
  const rotas = ["/epis-entregues", "/epis_entregues"];
  let ultimoErro = null;

  for (const rota of rotas) {
    try {
      await Promise.all(lista.map((item) => api.post(rota, item)));
      return true;
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  throw ultimoErro || new Error("Não foi possível salvar os itens da entrega.");
}