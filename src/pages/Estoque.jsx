import { useEffect, useMemo, useState } from "react";
import ModalNovoEpi from "../components/modals/ModalNovoEpi";
import ModalDetalhesEstoque from "../components/modals/ModalDetalhesEstoque";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";
import {
  calcularStatusValidade,
  formatarPreco,
  formatarValidade,
  getStatusColor,
  getStatusTexto,
  getValidadeBadge,
  getValidadeTexto,
} from "../utils/estoqueHelpers";
import { normalizarEntradaCompleta } from "../utils/estoqueNormalizers";

function getAlertaValidade(status) {
  if (status === "vencido") {
    return {
      texto: "Validade vencida",
      classe: "bg-red-50 text-red-700 border-red-200",
      icone: "⚠️",
    };
  }

  if (status === "proximo" || status === "proximo_vencimento") {
    return {
      texto: "Próximo do vencimento",
      classe: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icone: "🟡",
    };
  }

  return {
    texto: "Dentro da validade",
    classe: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icone: "✅",
  };
}

function Estoque({ usuarioLogado }) {
  const [entradas, setEntradas] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");
  const [itemDetalhe, setItemDetalhe] = useState(null);

  const itensPorPagina = 6;

  const podeVisualizar = temPermissao(usuarioLogado, "visualizar_estoque");
  const perfilUsuario =
    usuarioLogado?.perfil || usuarioLogado?.role || "colaborador";
  const isAdmin = perfilUsuario === "admin";

  const carregarProdutos = async () => {
    setCarregando(true);
    setErroTela("");

    try {
      const resp = await api.get("/entradas-estoque");
      const dados = resp?.data ?? resp;

      const estoquePronto = (Array.isArray(dados) ? dados : []).map(
        normalizarEntradaCompleta
      );

      setEntradas(estoquePronto);
    } catch (erro) {
      console.error(erro);
      setErroTela("Não foi possível carregar o estoque.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const listaFiltrada = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return entradas;

    return entradas.filter((item) => {
      return (
        (item.nome || "").toLowerCase().includes(termo) ||
        (item.fabricante || "").toLowerCase().includes(termo) ||
        (item.ca || "").toLowerCase().includes(termo) ||
        (item.tipoProtecao || "").toLowerCase().includes(termo) ||
        (item.lote || "").toLowerCase().includes(termo) ||
        (item.tamanho || "").toLowerCase().includes(termo) ||
        (item.descricao || "").toLowerCase().includes(termo)
      );
    });
  }, [entradas, busca]);

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );
  }, [listaFiltrada]);

  const resumo = useMemo(() => {
    const totalLotes = entradas.length;

    const totalItens = entradas.reduce(
      (acc, item) => acc + Number(item.quantidadeAtual || 0),
      0
    );

    const estoqueBaixo = entradas.filter(
      (item) =>
        Number(item.quantidadeAtual || 0) > 0 &&
        Number(item.quantidadeAtual || 0) <= Number(item.alertaMinimo || 0)
    ).length;

    const semEstoque = entradas.filter(
      (item) => Number(item.quantidadeAtual || 0) <= 0
    ).length;

    const valorTotal = entradas.reduce(
      (acc, item) => acc + Number(item.valorTotal || 0),
      0
    );

    return {
      totalLotes,
      totalItens,
      estoqueBaixo,
      semEstoque,
      valorTotal,
    };
  }, [entradas]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(listaOrdenada.length / itensPorPagina)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const itensVisiveis = listaOrdenada.slice(indexPrimeiroItem, indexUltimoItem);

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full relative">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de estoque.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              📦 Controle de Estoque
            </h2>
            <p className="text-sm text-gray-500">
              Visualize lotes, tamanhos, preços e quantidades das entradas de
              estoque.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {isAdmin && (
              <button
                onClick={() => setModalAberto(true)}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm w-full sm:w-auto"
              >
                + Novo EPI
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
              Lotes
            </span>
            <strong className="text-2xl text-slate-800">
              {carregando ? "--" : resumo.totalLotes}
            </strong>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <span className="text-[11px] uppercase tracking-wide text-blue-600 font-bold block mb-1">
              Itens em estoque
            </span>
            <strong className="text-2xl text-blue-800">
              {carregando ? "--" : resumo.totalItens}
            </strong>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <span className="text-[11px] uppercase tracking-wide text-yellow-700 font-bold block mb-1">
              Estoque baixo
            </span>
            <strong className="text-2xl text-yellow-800">
              {carregando ? "--" : resumo.estoqueBaixo}
            </strong>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <span className="text-[11px] uppercase tracking-wide text-red-700 font-bold block mb-1">
              Sem estoque
            </span>
            <strong className="text-2xl text-red-800">
              {carregando ? "--" : resumo.semEstoque}
            </strong>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="text-[11px] uppercase tracking-wide text-emerald-700 font-bold block mb-1">
              Valor estimado
            </span>
            <strong className="text-lg md:text-2xl text-emerald-800">
              {carregando ? "--" : formatarPreco(resumo.valorTotal)}
            </strong>
          </div>
        </div>

        {erroTela && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {erroTela}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nome, fabricante, CA, lote, tamanho ou tipo..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm lg:text-base"
            />
          </div>
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            Carregando estoque...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">EPI</th>
                    <th className="p-4 font-semibold">Tipo / CA</th>
                    <th className="p-4 font-semibold text-center">Lote</th>
                    <th className="p-4 font-semibold text-center">Tamanho</th>
                    <th className="p-4 font-semibold text-center">Preço Unit.</th>
                    <th className="p-4 font-semibold text-center">Qtd. Atual</th>
                    <th className="p-4 font-semibold text-center">Validade</th>
                    <th className="p-4 font-semibold text-center">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {itensVisiveis.length > 0 ? (
                    itensVisiveis.map((item) => {
                      const validadeStatus = calcularStatusValidade(item.validade);
                      const alertaValidade = getAlertaValidade(validadeStatus);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition duration-150"
                        >
                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {item.nome}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {item.fabricante || "-"}
                            </div>
                          </td>

                          <td className="p-4 text-gray-600 text-sm">
                            {item.tipoProtecao || "-"} <br />
                            <span className="text-xs text-gray-400">
                              CA: {item.ca || "-"}
                            </span>
                          </td>

                          <td className="p-4 text-center text-gray-500 font-mono text-xs">
                            {item.lote || "-"}
                          </td>

                          <td className="p-4 text-center text-gray-600 text-sm">
                            {item.tamanho || "-"}
                          </td>

                          <td className="p-4 text-center text-gray-600 text-sm">
                            {formatarPreco(item.preco)}
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`px-2 py-1 rounded font-bold border ${getStatusColor(
                                  item.quantidadeAtual,
                                  item.alertaMinimo
                                )}`}
                              >
                                {item.quantidadeAtual}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {getStatusTexto(
                                  item.quantidadeAtual,
                                  item.alertaMinimo
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-gray-500 text-sm">
                                {formatarValidade(item.validade)}
                              </span>

                              <span
                                className={`px-2 py-1 rounded text-[10px] font-bold border ${getValidadeBadge(
                                  validadeStatus
                                )}`}
                              >
                                {getValidadeTexto(validadeStatus)}
                              </span>

                              <span
                                className={`px-2 py-1 rounded text-[10px] font-bold border ${alertaValidade.classe}`}
                              >
                                {alertaValidade.icone} {alertaValidade.texto}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => setItemDetalhe(item)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                            >
                              Ver mais
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        Nenhum item de estoque cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {itensVisiveis.length > 0 ? (
                itensVisiveis.map((item) => {
                  const validadeStatus = calcularStatusValidade(item.validade);
                  const alertaValidade = getAlertaValidade(validadeStatus);

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                    >
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(
                            item.quantidadeAtual,
                            item.alertaMinimo
                          )}`}
                        >
                          Qtd: {item.quantidadeAtual}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-800 text-lg mb-1 pr-20">
                        {item.nome}
                      </h3>

                      <p className="text-xs text-gray-500 mb-1">
                        {item.tipoProtecao || "-"}
                      </p>

                      <p className="text-xs text-gray-400 mb-3">
                        {item.fabricante || "-"} • CA: {item.ca || "-"}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 border-t pt-2">
                        <div>
                          <span className="font-semibold text-gray-400 text-xs">
                            Lote:
                          </span>{" "}
                          {item.lote || "-"}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400 text-xs">
                            Tamanho:
                          </span>{" "}
                          {item.tamanho || "-"}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400 text-xs">
                            Validade:
                          </span>{" "}
                          {formatarValidade(item.validade)}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400 text-xs">
                            Preço:
                          </span>{" "}
                          {formatarPreco(item.preco)}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold border ${getValidadeBadge(
                              validadeStatus
                            )}`}
                          >
                            {getValidadeTexto(validadeStatus)}
                          </span>

                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold border ${alertaValidade.classe}`}
                          >
                            {alertaValidade.icone} {alertaValidade.texto}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setItemDetalhe(item)}
                          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition w-full sm:w-auto"
                        >
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  Nenhum item de estoque cadastrado.
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
                      : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
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
                      : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
                  }`}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}

        {modalAberto && isAdmin && (
          <ModalNovoEpi
            onClose={() => setModalAberto(false)}
            onSalvar={async () => {
              setModalAberto(false);
              await carregarProdutos();
              setPaginaAtual(1);
            }}
          />
        )}
      </div>

      <ModalDetalhesEstoque
        aberto={!!itemDetalhe}
        item={itemDetalhe}
        onClose={() => setItemDetalhe(null)}
      />
    </>
  );
}

export default Estoque;