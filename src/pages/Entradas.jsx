import { useEffect, useMemo, useState } from "react";
import ModalNovaEntrada from "../components/modals/ModalNovaEntrada";
import {
  listarEntradas,
  listarEpis,
  listarFornecedores,
  listarTamanhos,
} from "../services/entradaService";
import { temPermissao } from "../utils/permissoes";
import {
  formatarDataEntrada,
  formatarMoedaEntrada,
} from "../utils/entradaHelpers";
import {
  normalizarEntrada,
  normalizarEpiEntrada,
  normalizarFornecedorEntrada,
  normalizarTamanhoEntrada,
} from "../utils/entradaNormalizers";

function Entradas({ usuarioLogado }) {
  const [entradas, setEntradas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  const [carregandoTela, setCarregandoTela] = useState(true);
  const [erroTela, setErroTela] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 5;

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_estoque");

  const perfilUsuario = usuarioLogado?.perfil || usuarioLogado?.role || "";
  const podeCadastrar = !usuarioLogado
    ? true
    : perfilUsuario === "admin" || perfilUsuario === "gerente";

  const carregarEntradas = async () => {
    setCarregandoTela(true);
    setErroTela("");

    try {
      const [listaFornecedores, listaEpis, listaTamanhos, listaEntradas] =
        await Promise.all([
          listarFornecedores(),
          listarEpis(),
          listarTamanhos(),
          listarEntradas(),
        ]);

      setFornecedores(listaFornecedores.map(normalizarFornecedorEntrada));
      setEpis(listaEpis.map(normalizarEpiEntrada));
      setTamanhos(listaTamanhos.map(normalizarTamanhoEntrada));
      setEntradas(listaEntradas.map(normalizarEntrada));
    } catch (erro) {
      console.error("Erro ao carregar entradas:", erro);
      setErroTela(
        erro?.message || "Não foi possível carregar os registros de entrada."
      );
      setFornecedores([]);
      setEpis([]);
      setTamanhos([]);
      setEntradas([]);
    } finally {
      setCarregandoTela(false);
    }
  };

  useEffect(() => {
    carregarEntradas();
  }, []);

  const entradasResolvidas = useMemo(() => {
    return entradas.map((entrada) => {
      const epi = epis.find((item) => Number(item.id) === Number(entrada.idEpi));
      const tamanho = tamanhos.find(
        (item) => Number(item.id) === Number(entrada.idTamanho)
      );
      const fornecedor = fornecedores.find(
        (item) => Number(item.id) === Number(entrada.idFornecedor)
      );

      return {
        ...entrada,
        epiNome: epi?.nome || "Desconhecido",
        epiFabricante: epi?.fabricante || "-",
        epiCA: epi?.CA || "-",
        tamanhoNome: tamanho?.tamanho || "-",
        fornecedorNome:
          fornecedor?.nome_fantasia ||
          fornecedor?.razao_social ||
          "Fornecedor não identificado",
      };
    });
  }, [entradas, epis, tamanhos, fornecedores]);

  const entradasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return entradasResolvidas;

    return entradasResolvidas.filter((entrada) => {
      return (
        (entrada.epiNome || "").toLowerCase().includes(termo) ||
        (entrada.epiFabricante || "").toLowerCase().includes(termo) ||
        (entrada.epiCA || "").toLowerCase().includes(termo) ||
        (entrada.fornecedorNome || "").toLowerCase().includes(termo) ||
        (entrada.lote || "").toLowerCase().includes(termo) ||
        (entrada.nota_fiscal_numero || "").toLowerCase().includes(termo) ||
        (entrada.nota_fiscal_serie || "").toLowerCase().includes(termo) ||
        (entrada.tamanhoNome || "").toLowerCase().includes(termo)
      );
    });
  }, [entradasResolvidas, busca]);

  const entradasOrdenadas = useMemo(() => {
    return [...entradasFiltradas].sort((a, b) => {
      if (a.data_entrada < b.data_entrada) return 1;
      if (a.data_entrada > b.data_entrada) return -1;
      return 0;
    });
  }, [entradasFiltradas]);

  const resumoTela = useMemo(() => {
    return {
      totalRegistros: entradasOrdenadas.length,
      totalItens: entradasOrdenadas.reduce(
        (acc, item) => acc + Number(item.quantidade || 0),
        0
      ),
      valorTotal: entradasOrdenadas.reduce(
        (acc, item) =>
          acc + Number(item.quantidade || 0) * Number(item.valor_unitario || 0),
        0
      ),
    };
  }, [entradasOrdenadas]);

  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(entradasOrdenadas.length / itensPorPagina)
    );

    if (paginaAtual > total) {
      setPaginaAtual(total);
    }
  }, [paginaAtual, entradasOrdenadas.length]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;

  const entradasVisiveis = entradasOrdenadas.slice(
    indexPrimeiroItem,
    indexUltimoItem
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(entradasOrdenadas.length / itensPorPagina)
  );

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de entradas.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              📥 Registro de Entradas
            </h2>
            <p className="text-sm text-gray-500">
              Histórico de entradas de estoque conforme a tabela entrada_epi.
            </p>
          </div>

          {podeCadastrar && (
            <button
              onClick={() => setModalAberto(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm justify-center w-full lg:w-auto"
            >
              <span>➕</span> Nova Entrada
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <span className="text-[11px] text-emerald-700 uppercase font-bold tracking-wide block mb-1">
              Registros visíveis
            </span>
            <strong className="text-2xl text-emerald-900">
              {carregandoTela ? "--" : resumoTela.totalRegistros}
            </strong>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <span className="text-[11px] text-blue-700 uppercase font-bold tracking-wide block mb-1">
              Quantidade total
            </span>
            <strong className="text-2xl text-blue-900">
              {carregandoTela ? "--" : resumoTela.totalItens}
            </strong>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <span className="text-[11px] text-gray-600 uppercase font-bold tracking-wide block mb-1">
              Valor total
            </span>
            <strong className="text-2xl text-gray-900">
              {carregandoTela ? "--" : formatarMoedaEntrada(resumoTela.valorTotal)}
            </strong>
          </div>
        </div>

        {erroTela && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {erroTela}
          </div>
        )}

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por EPI, fabricante, fornecedor, lote, NF ou tamanho..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm lg:text-base"
          />
        </div>

        {carregandoTela ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            Carregando entradas...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">Data</th>
                    <th className="p-4 font-semibold">EPI / Item</th>
                    <th className="p-4 font-semibold text-center">Tam.</th>
                    <th className="p-4 font-semibold text-center">Qtd.</th>
                    <th className="p-4 font-semibold">Fornecedor / Lote</th>
                    <th className="p-4 font-semibold">NF</th>
                    <th className="p-4 font-semibold text-right">Valor Un.</th>
                    <th className="p-4 font-semibold text-right">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {entradasVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        Nenhuma entrada encontrada.
                      </td>
                    </tr>
                  ) : (
                    entradasVisiveis.map((entrada) => {
                      const total =
                        Number(entrada.quantidade || 0) *
                        Number(entrada.valor_unitario || 0);

                      return (
                        <tr
                          key={entrada.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="p-4 text-gray-600 font-mono text-sm">
                            {formatarDataEntrada(entrada.data_entrada)}
                          </td>

                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {entrada.epiNome}
                            </div>
                            <div className="text-xs text-gray-400">
                              {entrada.epiFabricante || "-"} • CA:{" "}
                              {entrada.epiCA || "-"}
                            </div>
                          </td>

                          <td className="p-4 text-center text-gray-600">
                            {entrada.tamanhoNome || "-"}
                          </td>

                          <td className="p-4 text-center">
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                              +{entrada.quantidade}
                            </span>
                          </td>

                          <td className="p-4 text-gray-600 text-sm">
                            <div className="font-bold">
                              {entrada.fornecedorNome}
                            </div>
                            <div className="text-xs text-gray-400">
                              Lote: {entrada.lote || "-"}
                            </div>
                          </td>

                          <td className="p-4 text-gray-600 text-sm">
                            Nº {entrada.nota_fiscal_numero || "-"} / Série{" "}
                            {entrada.nota_fiscal_serie || "-"}
                          </td>

                          <td className="p-4 text-right text-gray-600 font-mono text-sm">
                            {formatarMoedaEntrada(entrada.valor_unitario)}
                          </td>

                          <td className="p-4 text-right text-emerald-700 font-bold font-mono text-sm">
                            {formatarMoedaEntrada(total)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {entradasVisiveis.length > 0 ? (
                entradasVisiveis.map((entrada) => {
                  const total =
                    Number(entrada.quantidade || 0) *
                    Number(entrada.valor_unitario || 0);

                  return (
                    <div
                      key={entrada.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {formatarDataEntrada(entrada.data_entrada)}
                        </span>

                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded border border-emerald-200">
                          +{entrada.quantidade} un
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-800 text-lg mb-1">
                        {entrada.epiNome}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3">
                        Tamanho:{" "}
                        <strong className="text-gray-800">
                          {entrada.tamanhoNome || "Único"}
                        </strong>
                      </p>

                      <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                        <div>
                          <span className="block text-[10px] text-gray-400 font-bold uppercase">
                            Fornecedor
                          </span>
                          <span className="text-gray-700 font-medium truncate block">
                            {entrada.fornecedorNome}
                          </span>
                          <span className="text-xs text-gray-400">
                            Lote: {entrada.lote || "-"}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="block text-[10px] text-gray-400 font-bold uppercase">
                            Total da NF
                          </span>
                          <span className="text-emerald-700 font-bold font-mono">
                            {formatarMoedaEntrada(total)}
                          </span>
                        </div>

                        <div className="col-span-2 pt-2 border-t border-gray-200">
                          <span className="block text-[10px] text-gray-400 font-bold uppercase">
                            Nota Fiscal
                          </span>
                          <span className="text-gray-700">
                            Nº {entrada.nota_fiscal_numero || "-"} / Série{" "}
                            {entrada.nota_fiscal_serie || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  Nenhuma entrada encontrada.
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
                      : "bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                  }`}
                >
                  ← Anterior
                </button>

                <span className="text-xs lg:text-sm text-gray-600">
                  Pág. <b className="text-gray-900">{paginaAtual}</b> de{" "}
                  <b>{totalPaginas}</b>
                </span>

                <button
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded text-sm font-bold border ${
                    paginaAtual === totalPaginas
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                  }`}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modalAberto && (
        <ModalNovaEntrada
          aberto={modalAberto}
          fornecedores={fornecedores}
          epis={epis}
          tamanhos={tamanhos}
          onClose={() => setModalAberto(false)}
          onSucesso={async () => {
            setModalAberto(false);
            await carregarEntradas();
            setPaginaAtual(1);
          }}
        />
      )}
    </>
  );
}

export default Entradas;