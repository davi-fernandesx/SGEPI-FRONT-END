import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas, fallback = []) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp, fallback);
      if (Array.isArray(lista)) return lista;
    } catch (erro) {
      // tenta próxima rota
    }
  }
  return fallback;
}

function normalizarDepartamento(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
  };
}

function normalizarFuncao(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    idDepartamento: Number(
      item?.idDepartamento ??
        item?.departamento_id ??
        item?.departamentoId ??
        item?.id_departamento ??
        item?.iddepartamento ??
        item?.IDDepartamento ??
        0
    ),
  };
}

export function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [erroTela, setErroTela] = useState("");
  const [carregandoTela, setCarregandoTela] = useState(true);
  const [carregandoDepartamento, setCarregandoDepartamento] = useState(false);
  const [carregandoFuncao, setCarregandoFuncao] = useState(false);

  const carregarDados = async () => {
    setCarregandoTela(true);
    setErroTela("");

    try {
      const [listaDepartamentos, listaFuncoes] = await Promise.all([
        buscarPrimeiraLista(["/departamentos", "/departamento"], []),
        buscarPrimeiraLista(["/funcoes", "/funcao", "/cargos", "/cargo"], []),
      ]);

      setDepartamentos(listaDepartamentos.map(normalizarDepartamento));
      setFuncoes(listaFuncoes.map(normalizarFuncao));
    } catch (erro) {
      console.error("Erro ao carregar departamentos/funções:", erro);
      setErroTela(
        erro?.message ||
          "Não foi possível carregar os departamentos e funções."
      );
      setDepartamentos([]);
      setFuncoes([]);
    } finally {
      setCarregandoTela(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const departamentosComFuncoes = useMemo(() => {
    return [...departamentos]
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
      .map((dep) => ({
        ...dep,
        funcoes: [...funcoes]
          .filter((funcao) => Number(funcao.idDepartamento) === Number(dep.id))
          .sort((a, b) => (a.nome || "").localeCompare(b.nome || "")),
      }));
  }, [departamentos, funcoes]);

  const totalFuncoes = useMemo(() => funcoes.length, [funcoes]);

  const adicionarDepartamento = async (nome) => {
    const payload = { nome };

    setCarregandoDepartamento(true);

    try {
      try {
        await api.post("/cadastro-departamento", payload);
      } catch {
        try {
          await api.post("/departamento", payload);
        } catch {
          await api.post("/departamentos", payload);
        }
      }

      await carregarDados();
    } finally {
      setCarregandoDepartamento(false);
    }
  };

  const adicionarFuncao = async ({ nome, departamentoId }) => {
    const payload = {
      nome,
      idDepartamento: departamentoId,
    };

    setCarregandoFuncao(true);

    try {
      try {
        await api.post("/cadastro-funcao", payload);
      } catch {
        try {
          await api.post("/funcao", payload);
        } catch {
          try {
            await api.post("/funcoes", payload);
          } catch {
            try {
              await api.post("/cargo", payload);
            } catch {
              await api.post("/cargos", payload);
            }
          }
        }
      }

      await carregarDados();
    } finally {
      setCarregandoFuncao(false);
    }
  };

  const excluirDepartamento = async (id) => {
    try {
      try {
        await api.delete(`/departamento/${id}`);
      } catch {
        await api.delete(`/departamentos/${id}`);
      }

      await carregarDados();
    } catch (erro) {
      throw new Error(erro?.message || "Erro ao excluir departamento.");
    }
  };

  const excluirFuncao = async (funcaoId) => {
    try {
      try {
        await api.delete(`/funcao/${funcaoId}`);
      } catch {
        try {
          await api.delete(`/funcoes/${funcaoId}`);
        } catch {
          try {
            await api.delete(`/cargo/${funcaoId}`);
          } catch {
            await api.delete(`/cargos/${funcaoId}`);
          }
        }
      }

      await carregarDados();
    } catch (erro) {
      throw new Error(erro?.message || "Erro ao excluir função.");
    }
  };

  return {
    departamentos,
    funcoes,
    departamentosComFuncoes,
    totalFuncoes,
    erroTela,
    carregandoTela,
    carregandoDepartamento,
    carregandoFuncao,
    adicionarDepartamento,
    adicionarFuncao,
    excluirDepartamento,
    excluirFuncao,
  };
}