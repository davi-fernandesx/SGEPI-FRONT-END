import { useEffect, useMemo, useState } from "react";
import { carregarDadosFuncionarios } from "../services/funcionarioService";
import { formatarData } from "../utils/funcionarios";

const ITENS_POR_PAGINA = 6;

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);

  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");
  const [funcionarioDetalhe, setFuncionarioDetalhe] = useState(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErroTela("");

      try {
        const dados = await carregarDadosFuncionarios();

        setFuncionarios(dados.funcionarios || []);
        setDepartamentos(dados.departamentos || []);
        setFuncoes(dados.funcoes || []);
        setEntregas(dados.entregas || []);
        setDevolucoes(dados.devolucoes || []);
      } catch (erro) {
        setErroTela(
          erro?.response?.data?.message ||
            erro?.message ||
            "Não foi possível carregar a tela de funcionários."
        );

        setFuncionarios([]);
        setDepartamentos([]);
        setFuncoes([]);
        setEntregas([]);
        setDevolucoes([]);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const funcionariosResolvidos = useMemo(() => {
    return funcionarios.map((funcionario) => {
      const departamento = departamentos.find(
        (dep) => Number(dep.id) === Number(funcionario.idDepartamento)
      );

      const funcao = funcoes.find(
        (fn) => Number(fn.id) === Number(funcionario.idFuncao)
      );

      const entregasDoFuncionario = entregas.filter(
        (entrega) => Number(entrega.idFuncionario) === Number(funcionario.id)
      );

      const devolucoesDoFuncionario = devolucoes.filter(
        (devolucao) =>
          Number(devolucao.idFuncionario) === Number(funcionario.id)
      );

      const datasMovimentacao = [
        ...entregasDoFuncionario.map((item) => item.data_entrega),
        ...devolucoesDoFuncionario.map((item) => item.data_devolucao),
      ]
        .filter(Boolean)
        .sort((a, b) => String(b).localeCompare(String(a)));

      return {
        ...funcionario,
        departamentoNome: departamento?.nome || "-",
        funcaoNome: funcao?.nome || "-",
        totalEntregas: entregasDoFuncionario.length,
        totalDevolucoes: devolucoesDoFuncionario.length,
        ultimaMovimentacao: datasMovimentacao.length
          ? formatarData(datasMovimentacao[0])
          : "-",
      };
    });
  }, [funcionarios, departamentos, funcoes, entregas, devolucoes]);

  const funcionariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    const listaOrdenada = [...funcionariosResolvidos].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );

    if (!termo) {
      return listaOrdenada;
    }

    return listaOrdenada.filter((funcionario) => {
      return (
        (funcionario.nome || "").toLowerCase().includes(termo) ||
        String(funcionario.matricula || "").includes(termo) ||
        (funcionario.departamentoNome || "").toLowerCase().includes(termo) ||
        (funcionario.funcaoNome || "").toLowerCase().includes(termo)
      );
    });
  }, [funcionariosResolvidos, busca]);

  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(funcionariosFiltrados.length / ITENS_POR_PAGINA)
    );

    if (paginaAtual > total) {
      setPaginaAtual(total);
    }
  }, [paginaAtual, funcionariosFiltrados.length]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(funcionariosFiltrados.length / ITENS_POR_PAGINA)
  );

  const funcionariosVisiveis = useMemo(() => {
    const indiceFinal = paginaAtual * ITENS_POR_PAGINA;
    const indiceInicial = indiceFinal - ITENS_POR_PAGINA;

    return funcionariosFiltrados.slice(indiceInicial, indiceFinal);
  }, [funcionariosFiltrados, paginaAtual]);

  const resumo = useMemo(() => {
    const totalFuncionarios = funcionariosResolvidos.length;

    const departamentosAtivos = new Set(
      funcionariosResolvidos
        .map((item) => item.departamentoNome)
        .filter((item) => item && item !== "-")
    ).size;

    const comMovimentacao = funcionariosResolvidos.filter(
      (item) => item.totalEntregas > 0 || item.totalDevolucoes > 0
    ).length;

    return {
      totalFuncionarios,
      departamentosAtivos,
      comMovimentacao,
    };
  }, [funcionariosResolvidos]);

  function atualizarBusca(valor) {
    setBusca(valor);
    setPaginaAtual(1);
  }

  function abrirDetalhes(funcionario) {
    setFuncionarioDetalhe(funcionario);
  }

  function fecharDetalhes() {
    setFuncionarioDetalhe(null);
  }

  function irParaPaginaAnterior() {
    setPaginaAtual((prev) => Math.max(prev - 1, 1));
  }

  function irParaProximaPagina() {
    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas));
  }

  return {
    busca,
    setBusca: atualizarBusca,

    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    irParaPaginaAnterior,
    irParaProximaPagina,

    carregando,
    erroTela,

    funcionarioDetalhe,
    setFuncionarioDetalhe,
    abrirDetalhes,
    fecharDetalhes,

    funcionarios,
    departamentos,
    funcoes,
    entregas,
    devolucoes,

    funcionariosResolvidos,
    funcionariosFiltrados,
    funcionariosVisiveis,
    resumo,
  };
}