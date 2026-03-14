import { useEffect, useMemo, useState } from "react";
import ModalNovoEpi from "../components/modals/ModalNovoEpi";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";

const mockTiposProtecao = [
  { id: 1, nome: "Proteção da Cabeça" },
  { id: 2, nome: "Proteção Auditiva" },
  { id: 3, nome: "Proteção Respiratória" },
  { id: 4, nome: "Proteção Visual" },
  { id: 5, nome: "Proteção de Mãos" },
  { id: 6, nome: "Proteção de Pés" },
  { id: 7, nome: "Proteção contra Quedas" },
];

const mockTamanhos = [
  { id: 1, tamanho: "P" },
  { id: 2, tamanho: "M" },
  { id: 3, tamanho: "G" },
  { id: 4, tamanho: "40" },
  { id: 5, tamanho: "41" },
  { id: 6, tamanho: "42" },
];

const mockEpis = [
  {
    id: 1,
    nome: "Bota de Segurança de Couro",
    fabricante: "Bracol",
    CA: "15432",
    descricao: "Bota ocupacional",
    validade_CA: "2027-12-31",
    idTipoProtecao: 6,
    alerta_minimo: 10,
  },
  {
    id: 2,
    nome: "Óculos de Proteção Incolor",
    fabricante: "3M",
    CA: "10346",
    descricao: "Óculos para proteção visual",
    validade_CA: "2028-06-30",
    idTipoProtecao: 4,
    alerta_minimo: 20,
  },
];

const mockEntradas = [
  {
    id: 1,
    idEpi: 1,
    idTamanho: 6,
    data_entrada: "2026-03-01",
    quantidade: 30,
    quantidadeAtual: 18,
    data_fabricacao: "2026-01-10",
    data_validade: "2027-12-31",
    lote: "BOTA-001",
    valor_unitario: 129.9,
  },
  {
    id: 2,
    idEpi: 2,
    idTamanho: 2,
    data_entrada: "2026-03-02",
    quantidade: 100,
    quantidadeAtual: 65,
    data_fabricacao: "2026-02-01",
    data_validade: "2028-06-30",
    lote: "OCULOS-003",
    valor_unitario: 15.5,
  },
];

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
      // tenta a próxima rota
    }
  }
  return fallback;
}

function normalizarTipoProtecao(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? item?.descricao ?? "",
  };
}

function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    tamanho: String(item?.tamanho ?? item?.Tamanho ?? ""),
  };
}

function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    fabricante: item?.fabricante ?? item?.Fabricante ?? "",
    CA: item?.CA ?? item?.ca ?? item?.Ca ?? "",
    descricao: item?.descricao ?? item?.Descricao ?? "",
    validade_CA:
      item?.validade_CA ??
      item?.validadeCA ??
      item?.validade_ca ??
      item?.ValidadeCA ??
      null,
    idTipoProtecao: Number(
      item?.idTipoProtecao ??
        item?.tipo_protecao_id ??
        item?.tipoProtecaoId ??
        item?.categoria?.id ??
        item?.categoria ??
        item?.id_tipo_protecao ??
        0
    ),
    alerta_minimo: Number(
      item?.alerta_minimo ?? item?.alertaMinimo ?? item?.AlertaMinimo ?? 0
    ),
  };
}

function normalizarEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.idProduto ??
        item?.produto_id ??
        item?.id_produto ??
        item?.epi?.id ??
        item?.produto?.id ??
        0
    ),
    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.id_tamanho ??
        item?.tamanho?.id ??
        0
    ),
    data_entrada: item?.data_entrada ?? item?.dataEntrada ?? null,
    quantidade: Number(item?.quantidade ?? 0),
    quantidadeAtual: Number(
      item?.quantidadeAtual ??
        item?.quantidade_atual ??
        item?.estoqueAtual ??
        item?.estoque_atual ??
        item?.quantidade ??
        0
    ),
    data_fabricacao: item?.data_fabricacao ?? item?.dataFabricacao ?? null,
    data_validade:
      item?.data_validade ?? item?.dataValidade ?? item?.validade ?? null,
    lote: item?.lote ?? "",
    valor_unitario: Number(
      item?.valor_unitario ?? item?.valorUnitario ?? item?.preco ?? 0
    ),
  };
}

function formatarValidade(dataString) {
  if (!dataString) return "--";
  const data = new Date(dataString);
  if (Number.isNaN(data.getTime())) return "--";
  return data.toLocaleDateString("pt-BR");
}

function formatarPreco(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function calcularStatusValidade(dataString) {
  if (!dataString) return "normal";

  const hoje = new Date();
  const validade = new Date(dataString);

  hoje.setHours(0, 0, 0, 0);
  validade.setHours(0, 0, 0, 0);

  if (Number.isNaN(validade.getTime())) return "normal";

  const diffMs = validade.getTime() - hoje.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) return "vencido";
  if (diffDias <= 30) return "proximo";
  return "normal";
}

function getStatusColor(quantidadeAtual, alertaMinimo) {
  if (quantidadeAtual <= 0) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (quantidadeAtual <= Number(alertaMinimo || 0)) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  return "bg-green-100 text-green-700 border-green-200";
}

function getStatusTexto(quantidadeAtual, alertaMinimo) {
  if (quantidadeAtual <= 0) return "Sem estoque";
  if (quantidadeAtual <= Number(alertaMinimo || 0)) return "Estoque baixo";
  return "Normal";
}

function getValidadeBadge(status) {
  if (status === "vencido") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (status === "proximo") {
    return "bg-orange-100 text-orange-700 border-orange-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function getValidadeTexto(status) {
  if (status === "vencido") return "Vencido";
  if (status === "proximo") return "Próx. venc.";
  return "Regular";
}

function ModalDetalhesEstoque({ aberto, item, onClose }) {
  if (!aberto || !item) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Detalhes do item em estoque</h3>
              <p className="text-sm text-blue-100 mt-1">
                Informações completas do lote selecionado.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 transition rounded-lg px-3 py-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
              EPI
            </span>
            <strong className="text-gray-800 text-lg">{item.nome}</strong>
            <p className="text-sm text-gray-500 mt-1">{item.descricao || "Sem descrição."}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Fabricante
              </span>
              <strong className="text-gray-800">{item.fabricante || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Tipo de proteção
              </span>
              <strong className="text-gray-800">{item.tipoProtecao || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                CA
              </span>
              <strong className="text-gray-800">{item.ca || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Lote
              </span>
              <strong className="text-gray-800">{item.lote || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Tamanho
              </span>
              <strong className="text-gray-800">{item.tamanho || "-"}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Preço unitário
              </span>
              <strong className="text-gray-800">{formatarPreco(item.preco)}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Quantidade inicial
              </span>
              <strong className="text-gray-800">{item.quantidadeInicial}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Quantidade atual
              </span>
              <strong className="text-gray-800">{item.quantidadeAtual}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Alerta mínimo
              </span>
              <strong className="text-gray-800">{item.alertaMinimo}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Validade
              </span>
              <strong className="text-gray-800">{formatarValidade(item.validade)}</strong>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Estoque({ usuarioLogado }) {
  const [epis, setEpis] = useState([]);
  const [tiposProtecao, setTiposProtecao] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
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
      const [listaTipos, listaTamanhos, listaEpis, listaEntradas] =
        await Promise.all([
          buscarPrimeiraLista(
            ["/tipo-protecao", "/tipos-protecao", "/tipos_protecao"],
            mockTiposProtecao
          ),
          buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
          buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
          buscarPrimeiraLista(
            ["/entrada-epi", "/entrada_epi", "/entradas-epi", "/entradas_epis", "/entradas"],
            mockEntradas
          ),
        ]);

      setTiposProtecao(listaTipos.map(normalizarTipoProtecao));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
      setEpis(listaEpis.map(normalizarEpi));
      setEntradas(listaEntradas.map(normalizarEntrada));
    } catch (erro) {
      console.error("Erro ao carregar estoque:", erro);
      setErroTela(
        erro?.message || "Não foi possível carregar os dados do estoque."
      );
      setTiposProtecao(mockTiposProtecao.map(normalizarTipoProtecao));
      setTamanhos(mockTamanhos.map(normalizarTamanho));
      setEpis(mockEpis.map(normalizarEpi));
      setEntradas(mockEntradas.map(normalizarEntrada));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const estoqueNormalizado = useMemo(() => {
    return entradas.map((entrada) => {
      const epi = epis.find((item) => item.id === entrada.idEpi);
      const tamanho = tamanhos.find((item) => item.id === entrada.idTamanho);
      const tipo = tiposProtecao.find(
        (item) => item.id === Number(epi?.idTipoProtecao ?? 0)
      );

      return {
        id: entrada.id,
        nome: epi?.nome ?? "EPI não encontrado",
        fabricante: epi?.fabricante ?? "-",
        ca: epi?.CA ?? "-",
        descricao: epi?.descricao ?? "",
        tipoProtecao: tipo?.nome ?? "-",
        lote: entrada.lote || "-",
        tamanho: tamanho?.tamanho || "-",
        preco: entrada.valor_unitario || 0,
        quantidadeInicial: entrada.quantidade || 0,
        quantidadeAtual: entrada.quantidadeAtual || 0,
        validade: entrada.data_validade || epi?.validade_CA || null,
        alertaMinimo: Number(epi?.alerta_minimo ?? 0),
        valorTotal:
          Number(entrada.quantidadeAtual || 0) *
          Number(entrada.valor_unitario || 0),
      };
    });
  }, [entradas, epis, tamanhos, tiposProtecao]);

  const listaFiltrada = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return estoqueNormalizado;

    return estoqueNormalizado.filter((item) => {
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
  }, [estoqueNormalizado, busca]);

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );
  }, [listaFiltrada]);

  const resumo = useMemo(() => {
    const totalLotes = estoqueNormalizado.length;
    const totalItens = estoqueNormalizado.reduce(
      (acc, item) => acc + Number(item.quantidadeAtual || 0),
      0
    );
    const estoqueBaixo = estoqueNormalizado.filter(
      (item) =>
        Number(item.quantidadeAtual || 0) > 0 &&
        Number(item.quantidadeAtual || 0) <= Number(item.alertaMinimo || 0)
    ).length;

    const semEstoque = estoqueNormalizado.filter(
      (item) => Number(item.quantidadeAtual || 0) <= 0
    ).length;

    const valorTotal = estoqueNormalizado.reduce(
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
  }, [estoqueNormalizado]);

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
              Visualize lotes, tamanhos, preços e quantidades das entradas de estoque.
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

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition duration-150"
                        >
                          <td className="p-4">
                            <div className="font-medium text-gray-800">{item.nome}</div>
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
                                {getStatusTexto(item.quantidadeAtual, item.alertaMinimo)}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
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
                          <span className="font-semibold text-gray-400 text-xs">Lote:</span>{" "}
                          {item.lote || "-"}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400 text-xs">Tamanho:</span>{" "}
                          {item.tamanho || "-"}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400 text-xs">Validade:</span>{" "}
                          {formatarValidade(item.validade)}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-400 text-xs">Preço:</span>{" "}
                          {formatarPreco(item.preco)}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold border ${getValidadeBadge(
                            validadeStatus
                          )}`}
                        >
                          {getValidadeTexto(validadeStatus)}
                        </span>

                        <button
                          type="button"
                          onClick={() => setItemDetalhe(item)}
                          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition"
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