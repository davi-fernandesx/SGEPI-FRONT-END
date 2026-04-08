import { useEffect, useMemo, useState } from "react";
import ModalDetalhesEstoque from "../components/modals/ModalDetalhesEstoque";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";
import {
  calcularStatusValidade,
  formatarPreco,
  formatarValidade,
  getStatusColor,
  getStatusTexto,
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
  const [filtroAtivo, setFiltroAtivo] = useState("nome");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");
  const [itemDetalhe, setItemDetalhe] = useState(null);

  const itensPorPagina = 6;
  const podeVisualizar = temPermissao(usuarioLogado, "visualizar_estoque");

  const carregarProdutos = async () => {
    setCarregando(true);
    setErroTela("");
    try {
      const resp = await api.get("/entradas-estoque");
      const dados = resp?.data ?? resp;
      const estoquePronto = (Array.isArray(dados) ? dados : []).map(normalizarEntradaCompleta);
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

  // LÓGICA DE FILTRO CORRIGIDA PARA DATAS
 const listaFiltrada = useMemo(() => {
  const termo = busca.toLowerCase().trim();
  if (!termo) return entradas;

  return entradas.filter((item) => {
    if (filtroAtivo === "data_entrada") {
      if (!item.data_entrada || item.data_entrada === "-") return false;

      // Se a data já vem como "06/04/2026", precisamos inverter para "2026-04-06"
      // para comparar com o valor do <input type="date">
      const partes = item.data_entrada.split('/'); // Divide por "/"
      if (partes.length === 3) {
        const dataInvertida = `${partes[2]}-${partes[1]}-${partes[0]}`; // Monta YYYY-MM-DD
        return dataInvertida === termo; // Comparação exata de data
      }
      return false;
    }

    // Filtro para os demais campos de texto
    const valorCampo = String(item[filtroAtivo] ?? "").toLowerCase();
    return valorCampo.includes(termo);
  });
}, [entradas, busca, filtroAtivo]);

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );
  }, [listaFiltrada]);

  const resumo = useMemo(() => {
    const totalLotes = entradas.length;
    const totalItens = entradas.reduce((acc, item) => acc + Number(item.quantidadeAtual || 0), 0);
    const estoqueBaixo = entradas.filter(
      (item) => Number(item.quantidadeAtual || 0) > 0 && Number(item.quantidadeAtual || 0) <= Number(item.alertaMinimo || 0)
    ).length;
    const semEstoque = entradas.filter((item) => Number(item.quantidadeAtual || 0) <= 0).length;
    const valorTotal = entradas.reduce((acc, item) => acc + Number(item.valorTotal || 0), 0);

    return { totalLotes, totalItens, estoqueBaixo, semEstoque, valorTotal };
  }, [entradas]);

  const totalPaginas = Math.max(1, Math.ceil(listaOrdenada.length / itensPorPagina));

  useEffect(() => {
    if (paginaAtual > totalPaginas) setPaginaAtual(totalPaginas);
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
            <p className="text-sm text-gray-500">Visualize lotes, tamanhos e datas de entrada.</p>
          </div>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1">Lotes</span>
            <strong className="text-2xl text-slate-800">{carregando ? "--" : resumo.totalLotes}</strong>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <span className="text-[11px] uppercase text-blue-600 font-bold block mb-1">Itens em estoque</span>
            <strong className="text-2xl text-blue-800">{carregando ? "--" : resumo.totalItens}</strong>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <span className="text-[11px] uppercase text-yellow-700 font-bold block mb-1">Estoque baixo</span>
            <strong className="text-2xl text-yellow-800">{carregando ? "--" : resumo.estoqueBaixo}</strong>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <span className="text-[11px] uppercase text-red-700 font-bold block mb-1">Sem estoque</span>
            <strong className="text-2xl text-red-800">{carregando ? "--" : resumo.semEstoque}</strong>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="text-[11px] uppercase text-emerald-700 font-bold block mb-1">Valor estimado</span>
            <strong className="text-lg md:text-2xl text-emerald-800">{carregando ? "--" : formatarPreco(resumo.valorTotal)}</strong>
          </div>
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="flex flex-col md:flex-row mb-6 shadow-sm ring-1 ring-gray-200 rounded-lg overflow-hidden">
          <div className="relative bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
            <select
              value={filtroAtivo}
              onChange={(e) => {
                setFiltroAtivo(e.target.value);
                setBusca("");
                setPaginaAtual(1);
              }}
              className="appearance-none w-full md:w-48 bg-transparent text-gray-700 py-3 pl-4 pr-10 focus:outline-none font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <option value="nome">Nome do EPI</option>
              <option value="data_entrada">Data de Entrada</option>
              <option value="fabricante">Fabricante</option>
              <option value="ca">CA</option>
              <option value="lote">Lote</option>
              <option value="tipoProtecao">Proteção</option>
              <option value="tamanho">Tamanho</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 text-[10px]">▼</div>
          </div>
          <div className="relative flex-1 bg-white">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
            <input
              type={filtroAtivo === "data_entrada" ? "date" : "text"}
              placeholder={`Pesquisar...`}
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              className="w-full pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm lg:text-base"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute inset-y-0 right-0 px-3 text-gray-300 hover:text-red-500 transition">✕</button>
            )}
          </div>
        </div>

        {/* TABELA */}
        {carregando ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">Carregando estoque...</div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">EPI</th>
                    <th className="p-4 font-semibold">Entrada</th>
                    <th className="p-4 font-semibold text-center">Lote / CA</th>
                    <th className="p-4 font-semibold text-center">Tam.</th>
                    <th className="p-4 font-semibold text-center">Preço Unit.</th>
                    <th className="p-4 font-semibold text-center">Qtd. Atual</th>
                    <th className="p-4 font-semibold text-center">Validade</th>
                    <th className="p-4 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {itensVisiveis.length > 0 ? (
                    itensVisiveis.map((item) => {
                      const validadeStatus = calcularStatusValidade(item.validade);
                      const alertaValidade = getAlertaValidade(validadeStatus);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="p-4">
                            <div className="font-medium text-gray-800">{item.nome}</div>
                            <div className="text-xs text-gray-400 mt-1">{item.fabricante || "-"}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {formatarValidade(item.data_entrada)}
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-xs font-mono text-gray-500 block">{item.lote}</span>
                            <span className="text-[10px] text-gray-400 uppercase">CA: {item.ca}</span>
                          </td>
                          <td className="p-4 text-center text-gray-600 text-sm">{item.tamanho}</td>
                          <td className="p-4 text-center text-gray-600 text-sm">{formatarPreco(item.preco)}</td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`px-2 py-0.5 rounded font-bold border ${getStatusColor(item.quantidadeAtual, item.alertaMinimo)}`}>
                                {item.quantidadeAtual}
                              </span>
                              <span className="text-[9px] text-gray-400 font-medium uppercase mt-1">{getStatusTexto(item.quantidadeAtual, item.alertaMinimo)}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-gray-600 text-xs font-medium">{formatarValidade(item.validade)}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${alertaValidade.classe}`}>
                                {alertaValidade.texto}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => setItemDetalhe(item)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition">
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="8" className="p-8 text-center text-gray-500">Nenhum item encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden space-y-4">
              {itensVisiveis.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{item.nome}</h3>
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">{formatarValidade(item.data_entrada)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <p><span className="text-gray-400">Lote:</span> {item.lote}</p>
                    <p><span className="text-gray-400">Qtd:</span> {item.quantidadeAtual}</p>
                  </div>
                  <button onClick={() => setItemDetalhe(item)} className="mt-3 w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm">
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>

            {/* PAGINAÇÃO */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                className={`px-4 py-2 rounded text-sm font-bold border ${paginaAtual === 1 ? "bg-gray-100 text-gray-400" : "bg-white text-blue-700 border-blue-200"}`}
              >
                ←
              </button>
              <span className="text-xs text-gray-500">Página {paginaAtual} de {totalPaginas}</span>
              <button
                onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
                className={`px-4 py-2 rounded text-sm font-bold border ${paginaAtual === totalPaginas ? "bg-gray-100 text-gray-400" : "bg-white text-blue-700 border-blue-200"}`}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      <ModalDetalhesEstoque aberto={!!itemDetalhe} item={itemDetalhe} onClose={() => setItemDetalhe(null)} />
    </>
  );
}

export default Estoque;