import { api } from "./api";
import {
  extrairLista,
  normalizarDevolucao,
  normalizarDepartamento,
  normalizarEntrega,
  normalizarFuncionario,
  normalizarFuncao,
} from "../utils/funcionarios";

async function buscarPrimeiraLista(rotas) {
  let ultimoErro = null;

  for (const rota of rotas) {
    try {
      console.log("Tentando rota:", rota);
      const resposta = await api.get(rota);
      const lista = extrairLista(resposta);
      console.log("Sucesso na rota:", rota, lista);

      if (Array.isArray(lista)) {
        return lista;
      }
    } catch (erro) {
      console.error("Erro na rota:", rota, erro);
      ultimoErro = erro;
    }
  }

  throw (
    ultimoErro ||
    new Error("Não foi possível buscar dados em nenhuma das rotas informadas.")
  );
}

export async function carregarDadosFuncionarios() {
  const [
    listaFuncionarios,
    listaDepartamentos,
    listaFuncoes,
    listaEntregas,
    listaDevolucoes,
  ] = await Promise.all([
    buscarPrimeiraLista(["/funcionarios"]),
    buscarPrimeiraLista(["/departamentos"]),
    buscarPrimeiraLista(["/funcoes", "/funcao", "/cargos", "/cargo"]),
    buscarPrimeiraLista([
      "/entrega-epi",
      "/entrega_epi",
      "/entregas",
      "/epis-entregues",
      "/epis_entregues",
    ]),
    buscarPrimeiraLista(["/devolucoes", "/devolucao"]),
  ]);

  return {
    funcionarios: listaFuncionarios.map(normalizarFuncionario),
    departamentos: listaDepartamentos.map(normalizarDepartamento),
    funcoes: listaFuncoes.map(normalizarFuncao),
    entregas: listaEntregas.map(normalizarEntrega),
    devolucoes: listaDevolucoes.map(normalizarDevolucao),
  };
}