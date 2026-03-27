import React from "react";
import ModalEntrega from "../components/modals/ModalEntrega";
import ModalPeriodoRelatorio from "../components/modals/ModalPeriodoRelatorio";
import { useEntregas, formatarDataBR } from "../hooks/useEntregas"; // Ajuste o caminho se necessário

export default function Entregas({ usuarioLogado }) {
  // 1. Puxando toda a inteligência e o controle de estado do nosso Hook
  const {
    busca, setBusca, dataInicio, setDataInicio, dataFim, setDataFim,
    paginaAtual, setPaginaAtual, carregando, erroTela, modalAberto, setModalAberto,
    modalPeriodoAberto, tipoRelatorioModal, funcionarioSelecionado,
    periodoRelatorioInicio, setPeriodoRelatorioInicio, periodoRelatorioFim, setPeriodoRelatorioFim,
    erroPeriodoModal, setErroPeriodoModal,
    podeVisualizar, estatisticasTela, entregasOrdenadas, entregasVisiveis, totalPaginas, resumoModalPeriodo,
    aoMudarFiltro, resetarModalPeriodo, abrirModalRelatorioGeral, abrirModalRelatorioFuncionario,
    confirmarGeracaoRelatorio, aoSalvarEntrega
  } = useEntregas({ usuarioLogado });

  // 2. Renderização de Bloqueio de Permissão
  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de entregas.
        </div>
      </div>
    );
  }

  // 3. Renderização Principal (Visual/UI)
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
            📋 Histórico de Entregas
          </h2>
          <p className="text-sm text-gray-500">
            Consulte, filtre e imprima relatórios de entrega de EPIs.
          </p>
          <p className="text-xs text-blue-700 mt-2 font-medium">
            Dica: clique no nome do colaborador para imprimir o histórico individual por período.
          </p>
        </div>

        <div className="flex w-full xl:w-auto gap-2 flex-col sm:flex-row">
          <button
            onClick={abrirModalRelatorioGeral}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition shadow-sm flex items-center gap-2 justify-center w-full xl:w-auto"
          >
            <span>🖨️</span> Relatório Geral
          </button>

          <button
            onClick={() => setModalAberto(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition shadow-sm flex items-center gap-2 justify-center w-full xl:w-auto"
          >
            <span>➕</span> Nova Entrega
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <span className="text-[11px] text-blue-700 uppercase font-bold tracking-wide block mb-1">
            Entregas visíveis
          </span>
          <strong className="text-2xl text-blue-900">
            {carregando ? "--" : estatisticasTela.totalEntregas}
          </strong>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <span className="text-[11px] text-indigo-700 uppercase font-bold tracking-wide block mb-1">
            Itens distribuídos
          </span>
          <strong className="text-2xl text-indigo-900">
            {carregando ? "--" : estatisticasTela.totalItens}
          </strong>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="text-[11px] text-gray-600 uppercase font-bold tracking-wide block mb-1">
            Tipos de item
          </span>
          <strong className="text-2xl text-gray-900">
            {carregando ? "--" : estatisticasTela.totalTipos}
          </strong>
        </div>
      </div>

      {erroTela && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {erroTela}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
          Filtros da tela
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">
              Buscar colaborador / item
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Nome, matrícula, EPI ou tamanho..."
                value={busca}
                onChange={(e) => aoMudarFiltro(setBusca, e.target.value)}
                className="w-full pl-9 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">De (data inicial)</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => aoMudarFiltro(setDataInicio, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Até (data final)</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => aoMudarFiltro(setDataFim, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 flex-col md:flex-row gap-3">
          <span className="text-xs text-gray-500 w-full md:w-auto text-center md:text-left">
            Mostrando <b>{carregando ? "--" : entregasOrdenadas.length}</b> registros na tela
          </span>

          <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end flex-wrap">
            {(busca || dataInicio || dataFim) && (
              <button
                onClick={() => {
                  setBusca(""); setDataInicio(""); setDataFim(""); setPaginaAtual(1);
                }}
                className="text-xs text-red-500 font-bold hover:underline px-3 py-2"
              >
                Limpar filtros da tela
              </button>
            )}
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
          Carregando entregas...
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold">Colaborador</th>
                  <th className="p-4 font-semibold">Itens Entregues</th>
                  <th className="p-4 font-semibold text-center">Assinatura</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {entregasVisiveis.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 italic">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  entregasVisiveis.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-600 font-mono text-sm whitespace-nowrap">
                        {formatarDataBR(e.dataEntrega)}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => abrirModalRelatorioFuncionario(e.funcionario)}
                          className="text-left group"
                        >
                          <div className="font-bold text-blue-700 group-hover:text-blue-900 group-hover:underline transition">
                            {e.funcionario?.nome || "Desconhecido"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Mat: {e.funcionario?.matricula || "--"}
                          </div>
                          <div className="text-[11px] text-blue-600 mt-1 opacity-90">
                            Clique para selecionar período e imprimir
                          </div>
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {e.itens.length > 0 ? (
                            e.itens.map((i) => (
                              <span
                                key={i.id}
                                className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded border border-blue-100"
                              >
                                {i.epiNome} ({i.tamanho}) <b>x{i.quantidade}</b>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Sem itens vinculados
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {e.assinatura || e.tokenValidacao ? (
                          <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-200">
                            Digital ✍️
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            Manual 📄
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {entregasVisiveis.length > 0 ? (
              entregasVisiveis.map((e) => (
                <div key={e.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {formatarDataBR(e.dataEntrega)}
                      </span>
                      {e.assinatura || e.tokenValidacao ? (
                        <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 py-0.5 rounded border border-green-100">
                          ✍️ Assinado
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
                          📄 Manual
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => abrirModalRelatorioFuncionario(e.funcionario)}
                      className="text-left"
                    >
                      <h3 className="font-bold text-blue-700 text-lg hover:underline">
                        {e.funcionario?.nome || "Desconhecido"}
                      </h3>
                      <span className="text-xs text-gray-500 block">
                        Matrícula: {e.funcionario?.matricula || "--"}
                      </span>
                      <span className="text-[11px] text-blue-600 block mt-1">
                        Toque para selecionar período e imprimir
                      </span>
                    </button>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">
                      Itens Entregues
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {e.itens.length > 0 ? (
                        e.itens.map((i) => (
                          <span key={i.id} className="bg-white text-blue-800 text-xs px-2 py-1 rounded border border-blue-100 shadow-sm">
                            {i.epiNome} <span className="text-gray-400">|</span> Tam: {i.tamanho} <span className="text-gray-400">|</span> <b>x{i.quantidade}</b>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sem itens vinculados</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                Nenhum registro encontrado.
              </div>
            )}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-between items-center mt-6 px-1">
              <button
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                className={`px-4 py-2 rounded text-sm font-bold border ${paginaAtual === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"}`}
              >
                ← Anterior
              </button>

              <span className="text-xs lg:text-sm text-gray-600">
                Pág. <b className="text-gray-900">{paginaAtual}</b> de <b>{totalPaginas}</b>
              </span>

              <button
                onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
                className={`px-4 py-2 rounded text-sm font-bold border ${paginaAtual === totalPaginas ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"}`}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <ModalEntrega
          onClose={() => setModalAberto(false)}
          onSalvar={aoSalvarEntrega}
        />
      )}

      <ModalPeriodoRelatorio
        aberto={modalPeriodoAberto}
        tipo={tipoRelatorioModal}
        funcionario={funcionarioSelecionado}
        inicio={periodoRelatorioInicio}
        fim={periodoRelatorioFim}
        erro={erroPeriodoModal}
        resumo={resumoModalPeriodo}
        onClose={resetarModalPeriodo}
        onChangeInicio={(valor) => { setPeriodoRelatorioInicio(valor); setErroPeriodoModal(""); }}
        onChangeFim={(valor) => { setPeriodoRelatorioFim(valor); setErroPeriodoModal(""); }}
        onConfirmar={confirmarGeracaoRelatorio}
        onLimpar={() => { setPeriodoRelatorioInicio(""); setPeriodoRelatorioFim(""); setErroPeriodoModal(""); }}
        onAplicarAtalho={({ inicio, fim }) => { setPeriodoRelatorioInicio(inicio || ""); setPeriodoRelatorioFim(fim || ""); setErroPeriodoModal(""); }}
      />
    </div>
  );
}