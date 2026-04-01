import { useEffect, useMemo, useState } from "react";
import { carregarDadosFuncionarios } from "../services/funcionarioService";

const ITENS_POR_PAGINA = 6;

export function useFuncionarios() {
  // Entregas e Devoluções sumiram daqui!
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);

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
        // Mantemos estes dois para o Modal de Novo Funcionario usar
        setDepartamentos(dados.departamentos || []);
        setFuncoes(dados.funcoes || []);
        
      } catch (erro) {
        setErroTela(
          erro?.message || "Não foi possível carregar a tela de funcionários."
        );
        setFuncionarios([]);
        setDepartamentos([]);
        setFuncoes([]);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  // 🗑️ ADEUS `funcionariosResolvidos`! 
  // O filtro agora trabalha diretamente em cima do estado `funcionarios`
  const funcionariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    const listaOrdenada = [...funcionarios].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );

    if (!termo) {
      return listaOrdenada;
    }

    return listaOrdenada.filter((funcionario) => {
      return (
        (funcionario.nome || "").toLowerCase().includes(termo) ||
        String(funcionario.matricula || "").toLowerCase().includes(termo) ||
        (funcionario.departamentoNome || "").toLowerCase().includes(termo) ||
        (funcionario.funcaoNome || "").toLowerCase().includes(termo)
      );
    });
  }, [funcionarios, busca]);

  // A paginação também olha direto para os filtrados
  const totalPaginas = Math.max(
    1,
    Math.ceil(funcionariosFiltrados.length / ITENS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const funcionariosVisiveis = useMemo(() => {
    const indiceFinal = paginaAtual * ITENS_POR_PAGINA;
    const indiceInicial = indiceFinal - ITENS_POR_PAGINA;

    return funcionariosFiltrados.slice(indiceInicial, indiceFinal);
  }, [funcionariosFiltrados, paginaAtual]);

  // O resumo agora olha diretamente para o estado `funcionarios`
  const resumo = useMemo(() => {
    const totalFuncionarios = funcionarios.length;

    const departamentosAtivos = new Set(
      funcionarios
        .map((item) => item.departamentoNome)
        .filter((item) => item && item !== "Sem departamento") // Ajuste conforme seu fallback
    ).size;

    const comMovimentacao = funcionarios.filter(
      (item) => item.totalEntregas > 0 || item.totalDevolucoes > 0
    ).length;

    return {
      totalFuncionarios,
      departamentosAtivos,
      comMovimentacao,
    };
  }, [funcionarios]);

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

    // Retornamos os dados limpos
    funcionarios,
    departamentos,
    funcoes,

    // Removido: funcionariosResolvidos (a View já estava usando os visiveis)
    funcionariosFiltrados,
    funcionariosVisiveis,
    resumo,
  };
} 