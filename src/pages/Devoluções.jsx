import { useEffect, useMemo, useState } from "react";
import ModalBaixa from "../components/modals/ModalBaixa";
import ModalPeriodoRelatorioDevolucao from "../components/modals/ModalPeriodoRelatorioDevolucao";
import { useDevolucoes } from "../hooks/useDevolucoes";
import { temPermissao } from "../utils/permissoes";
import {
  abrirJanelaImpressao,
  filtrarPorPeriodo,
  formatarData,
  gerarHtmlRelatorioDevolucoes,
} from "../utils/devolucoes";

function Devolucoes({ usuarioLogado }) {
  const {
    carregando,
    erro,
    devolucoesResolvidas,
    salvarLocal,
  } = useDevolucoes();

  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalPeriodoAberto, setModalPeriodoAberto] = useState(false);
  const [tipoRelatorioModal, setTipoRelatorioModal] = useState("geral");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [periodoRelatorioInicio, setPeriodoRelatorioInicio] = useState("");
  const [periodoRelatorioFim, setPeriodoRelatorioFim] = useState("");
  const [erroPeriodoModal, setErroPeriodoModal] = useState("");

  const itensPorPagina = 5;

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_estoque");

  const perfilUsuario = usuarioLogado?.perfil || usuarioLogado?.role || "";
  const podeCadastrar =
    !usuarioLogado || perfilUsuario === "admin" || perfilUsuario === "gerente";

  const aoMudarFiltro = (setter, valor) => {
    setter(valor);
    setPaginaAtual(1);
  };

  const devolucoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return devolucoesResolvidas.filter((d) => {
      const matchTexto =
        !termo ||
        (d.funcionarioNome || "").toLowerCase().includes(termo) ||
        String(d.funcionarioMatricula || "").includes(termo) ||
        (d.motivoNome || "").toLowerCase().includes(termo) ||
        (d.epiNome || "").toLowerCase().includes(termo) ||
        (d.epiNovoNome || "").toLowerCase().includes(termo) ||
        String(d.tamanhoNome || "").toLowerCase().includes(termo) ||
        String(d.tamanhoNovoNome || "").toLowerCase().includes(termo) ||
        String(d.observacao || "").toLowerCase().includes(termo);

      let matchData = true;
      const data = String(d.data_devolucao || "").substring(0, 10);

      if (dataInicio) matchData = matchData && data >= dataInicio;
      if (dataFim) matchData = matchData && data <= dataFim;

      return matchTexto && matchData;
    });
  }, [devolucoesResolvidas, busca, dataInicio, dataFim]);

  const devolucoesOrdenadas = useMemo(() => {
    return [...devolucoesFiltradas].sort((a, b) => {
      if (a.data_devolucao < b.data_devolucao) return 1;
      if (a.data_devolucao > b.data_devolucao) return -1;
      return 0;
    });
  }, [devolucoesFiltradas]);

  const resumoTela = useMemo(() => {
    const totalDevolucoes = devolucoesOrdenadas.length;
    const totalTrocas = devolucoesOrdenadas.filter((item) => item.houveTroca).length;

    return {
      totalDevolucoes,
      totalTrocas,
      totalSemTroca: totalDevolucoes - totalTrocas,
    };
  }, [devolucoesOrdenadas]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(devolucoesOrdenadas.length / itensPorPagina));
    if (paginaAtual > total) {
      setPaginaAtual(total);
    }
  }, [paginaAtual, devolucoesOrdenadas.length]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;

  const devolucoesVisiveis = devolucoesOrdenadas.slice(
    indexPrimeiroItem,
    indexUltimoItem
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(devolucoesOrdenadas.length / itensPorPagina)
  );

  const baseDoModalPeriodo = useMemo(() => {
    if (tipoRelatorioModal === "funcionario" && funcionarioSelecionado) {
      return devolucoesResolvidas
        .filter(
          (item) => Number(item.idFuncionario) === Number(funcionarioSelecionado.id)
        )
        .sort((a, b) => {
          if (a.data_devolucao < b.data_devolucao) return 1;
          if (a.data_devolucao > b.data_devolucao) return -1;
          return 0;
        });
    }

    return [...devolucoesResolvidas].sort((a, b) => {
      if (a.data_devolucao < b.data_devolucao) return 1;
      if (a.data_devolucao > b.data_devolucao) return -1;
      return 0;
    });
  }, [tipoRelatorioModal, funcionarioSelecionado, devolucoesResolvidas]);

  const resumoModalPeriodo = useMemo(() => {
    const lista = filtrarPorPeriodo(
      baseDoModalPeriodo,
      periodoRelatorioInicio,
      periodoRelatorioFim
    );

    return {
      totalDevolucoes: lista.length,
      totalTrocas: lista.filter((item) => item.houveTroca).length,
    };
  }, [baseDoModalPeriodo, periodoRelatorioInicio, periodoRelatorioFim]);

  const resetarModalPeriodo = () => {
    setModalPeriodoAberto(false);
    setTipoRelatorioModal("geral");
    setFuncionarioSelecionado(null);
    setPeriodoRelatorioInicio("");
    setPeriodoRelatorioFim("");
    setErroPeriodoModal("");
  };

  const abrirModalRelatorioGeral = () => {
    setTipoRelatorioModal("geral");
    setFuncionarioSelecionado(null);
    setPeriodoRelatorioInicio(dataInicio || "");
    setPeriodoRelatorioFim(dataFim || "");
    setErroPeriodoModal("");
    setModalPeriodoAberto(true);
  };

  const abrirModalRelatorioFuncionario = (funcionario) => {
    setTipoRelatorioModal("funcionario");
    setFuncionarioSelecionado(funcionario || null);
    setPeriodoRelatorioInicio(dataInicio || "");
    setPeriodoRelatorioFim(dataFim || "");
    setErroPeriodoModal("");
    setModalPeriodoAberto(true);
  };

  const confirmarGeracaoRelatorio = () => {
    if (
      periodoRelatorioInicio &&
      periodoRelatorioFim &&
      periodoRelatorioInicio > periodoRelatorioFim
    ) {
      setErroPeriodoModal("A data inicial não pode ser maior que a data final.");
      return;
    }

    const filtradas = filtrarPorPeriodo(
      baseDoModalPeriodo,
      periodoRelatorioInicio,
      periodoRelatorioFim
    );

    if (filtradas.length === 0) {
      window.alert("Nenhuma devolução foi encontrada para o período selecionado.");
      return;
    }

    const html = gerarHtmlRelatorioDevolucoes({
      tipo: tipoRelatorioModal,
      funcionario: funcionarioSelecionado,
      registros: filtradas,
      inicio: periodoRelatorioInicio,
      fim: periodoRelatorioFim,
    });

    abrirJanelaImpressao(html);
    resetarModalPeriodo();
  };

  const aoSalvarDevolucao = async (novaDevolucao) => {
    salvarLocal(novaDevolucao);
    setPaginaAtual(1);
    setModalAberto(false);
  };

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de devoluções.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
            🔄 Devoluções e Trocas
          </h2>
          <p className="text-sm text-gray-500">
            Registre, filtre e imprima relatórios de devoluções.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <button
            onClick={abrirModalRelatorioGeral}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition shadow-sm border border-gray-300 flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            <span>🖨️</span> Relatório
          </button>

          {podeCadastrar && (
            <button
              onClick={() => setModalAberto(true)}
              className="bg-red-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-800 transition flex items-center gap-2 shadow-sm justify-center w-full sm:w-auto"
            >
              <span>➕</span> Registrar Devolução
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <span className="text-[11px] text-red-700 uppercase font-bold tracking-wide block mb-1">
            Devoluções visíveis
          </span>
          <strong className="text-2xl text-red-900">
            {carregando ? "--" : resumoTela.totalDevolucoes}
          </strong>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <span className="text-[11px] text-emerald-700 uppercase font-bold tracking-wide block mb-1">
            Com troca
          </span>
          <strong className="text-2xl text-emerald-900">
            {carregando ? "--" : resumoTela.totalTrocas}
          </strong>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="text-[11px] text-gray-600 uppercase font-bold tracking-wide block mb-1">
            Sem troca
          </span>
          <strong className="text-2xl text-gray-900">
            {carregando ? "--" : resumoTela.totalSemTroca}
          </strong>
        </div>
      </div>

      {erro && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
          Filtros do Relatório
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">
              Buscar colaborador / motivo / item
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Nome, matrícula, motivo, EPI, tamanho ou troca..."
                value={busca}
                onChange={(e) => aoMudarFiltro(setBusca, e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              De (Data Inicial)
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => aoMudarFiltro(setDataInicio, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Até (Data Final)
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => aoMudarFiltro(setDataFim, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 flex-col md:flex-row gap-3">
          <span className="text-xs text-gray-500 w-full md:w-auto text-center md:text-left">
            Mostrando <b>{devolucoesOrdenadas.length}</b> registros
          </span>

          {(busca || dataInicio || dataFim) && (
            <button
              onClick={() => {
                setBusca("");
                setDataInicio("");
                setDataFim("");
                setPaginaAtual(1);
              }}
              className="text-xs text-red-500 font-bold hover:underline px-3 py-2"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
          Carregando devoluções...
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold">Funcionário</th>
                  <th className="p-4 font-semibold">Item Devolvido</th>
                  <th className="p-4 font-semibold">Motivo</th>
                  <th className="p-4 font-semibold text-center">Troca?</th>
                  <th className="p-4 font-semibold text-center">Assinatura</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {devolucoesVisiveis.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      Nenhuma devolução encontrada no banco de dados.
                    </td>
                  </tr>
                ) : (
                  devolucoesVisiveis.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-600 font-mono text-sm">
                        {formatarData(d.data_devolucao)}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            abrirModalRelatorioFuncionario({
                              id: d.idFuncionario,
                              nome: d.funcionarioNome,
                              matricula: d.funcionarioMatricula,
                            })
                          }
                          className="text-left group"
                        >
                          <div className="font-bold text-red-700 group-hover:text-red-900 group-hover:underline transition">
                            {d.funcionarioNome}
                          </div>
                          <div className="text-xs text-gray-400">
                            Mat: {d.funcionarioMatricula}
                          </div>
                          <div className="text-[11px] text-red-600 mt-1 opacity-90">
                            Clique para selecionar período e imprimir
                          </div>
                        </button>
                      </td>

                      <td className="p-4 text-gray-700">
                        <div>
                          {d.epiNome}{" "}
                          <span className="text-gray-400 text-xs">
                            ({d.tamanhoNome})
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Quantidade: {d.quantidadeADevolver}
                        </div>
                        {d.houveTroca && (
                          <div className="text-xs text-green-700 mt-1">
                            Troca por: <b>{d.epiNovoNome}</b> ({d.tamanhoNovoNome}) x
                            {d.quantidadeNova || 0}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200 text-xs font-semibold">
                          {d.motivoNome}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {d.houveTroca ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                            ✅ SIM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
                            ❌ NÃO
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {d.assinatura_digital || d.token_validacao ? (
                          <span
                            className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-200"
                            title="Assinado Digitalmente"
                          >
                            ✍️ OK
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {devolucoesVisiveis.length > 0 ? (
              devolucoesVisiveis.map((d) => (
                <div
                  key={d.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                >
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {formatarData(d.data_devolucao)}
                      </span>

                      {d.houveTroca ? (
                        <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 py-0.5 rounded border border-green-100">
                          🔄 Troca
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
                          ↩️ Devolução
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() =>
                        abrirModalRelatorioFuncionario({
                          id: d.idFuncionario,
                          nome: d.funcionarioNome,
                          matricula: d.funcionarioMatricula,
                        })
                      }
                      className="text-left"
                    >
                      <h3 className="font-bold text-red-700 text-lg hover:underline">
                        {d.funcionarioNome}
                      </h3>
                      <span className="text-xs text-gray-500 block">
                        Matrícula: {d.funcionarioMatricula}
                      </span>
                      <span className="text-[11px] text-red-600 block mt-1">
                        Toque para selecionar período e imprimir
                      </span>
                    </button>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-xs text-gray-500">Item:</span>
                      <span className="text-sm font-semibold text-gray-700 text-right">
                        {d.epiNome} <small className="text-gray-400">({d.tamanhoNome})</small>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Quantidade:</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {d.quantidadeADevolver}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <span className="text-xs text-gray-500">Motivo:</span>
                      <span className="text-xs font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200 text-right">
                        {d.motivoNome}
                      </span>
                    </div>

                    {d.houveTroca && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                          Item da troca
                        </span>
                        <span className="text-sm text-green-700 font-semibold">
                          {d.epiNovoNome} ({d.tamanhoNovoNome}) x {d.quantidadeNova || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                Nenhuma devolução encontrada.
              </div>
            )}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-between items-center mt-6 px-1">
              <button
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                className={`px-4 py-2 rounded text-sm font-bold border ${
                  paginaAtual === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-red-700 hover:bg-red-50 border-red-200"
                }`}
              >
                ← Anterior
              </button>

              <span className="text-xs lg:text-sm text-gray-600">
                Pág. <b className="text-gray-900">{paginaAtual}</b> de <b>{totalPaginas}</b>
              </span>

              <button
                onClick={() =>
                  setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaAtual === totalPaginas}
                className={`px-4 py-2 rounded text-sm font-bold border ${
                  paginaAtual === totalPaginas
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-red-700 hover:bg-red-50 border-red-200"
                }`}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      <ModalPeriodoRelatorioDevolucao
        aberto={modalPeriodoAberto}
        tipo={tipoRelatorioModal}
        funcionario={funcionarioSelecionado}
        inicio={periodoRelatorioInicio}
        fim={periodoRelatorioFim}
        erro={erroPeriodoModal}
        resumo={resumoModalPeriodo}
        onClose={resetarModalPeriodo}
        onChangeInicio={(valor) => {
          setPeriodoRelatorioInicio(valor);
          setErroPeriodoModal("");
        }}
        onChangeFim={(valor) => {
          setPeriodoRelatorioFim(valor);
          setErroPeriodoModal("");
        }}
        onConfirmar={confirmarGeracaoRelatorio}
        onLimpar={() => {
          setPeriodoRelatorioInicio("");
          setPeriodoRelatorioFim("");
          setErroPeriodoModal("");
        }}
        onAplicarAtalho={({ inicio, fim }) => {
          setPeriodoRelatorioInicio(inicio || "");
          setPeriodoRelatorioFim(fim || "");
          setErroPeriodoModal("");
        }}
      />

      {modalAberto && (
        <ModalBaixa
          onClose={() => setModalAberto(false)}
          onSalvar={aoSalvarDevolucao}
        />
      )}
    </div>
  );
}

export default Devolucoes;