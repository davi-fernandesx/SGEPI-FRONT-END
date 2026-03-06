import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const mockFornecedores = [
  {
    id: 1,
    razao_social: "3M do Brasil Ltda",
    nome_fantasia: "3M",
    cnpj: "45.985.371/0001-08",
    inscricao_estadual: "123.456.789.000",
  },
  {
    id: 2,
    razao_social: "Bracol Calçados de Segurança Ltda",
    nome_fantasia: "Bracol",
    cnpj: "12.345.678/0001-90",
    inscricao_estadual: "987.654.321.000",
  },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança", fabricante: "3M", CA: "12345" },
  { id: 2, nome: "Luva de Proteção", fabricante: "Volk", CA: "67890" },
  { id: 3, nome: "Sapato de Segurança", fabricante: "Bracol", CA: "54321" },
  { id: 4, nome: "Óculos de Proteção", fabricante: "3M", CA: "99999" },
];

const mockTamanhos = [
  { id: 1, tamanho: "P" },
  { id: 2, tamanho: "M" },
  { id: 3, tamanho: "G" },
  { id: 4, tamanho: "GG" },
  { id: 5, tamanho: "38" },
  { id: 6, tamanho: "40" },
  { id: 7, tamanho: "42" },
  { id: 8, tamanho: "44" },
  { id: 9, tamanho: "Único" },
];

const mockEntradasInicial = [
  {
    id: 101,
    idEpi: 1,
    idTamanho: 2,
    idFornecedor: 1,
    data_entrada: "2024-01-15",
    quantidade: 50,
    quantidadeAtual: 50,
    data_fabricacao: "2023-12-01",
    data_validade: "2026-12-01",
    lote: "L-2024-A",
    valor_unitario: 45.9,
    nota_fiscal_numero: "12345",
    nota_fiscal_serie: "1",
  },
  {
    id: 102,
    idEpi: 3,
    idTamanho: 7,
    idFornecedor: 2,
    data_entrada: "2024-01-18",
    quantidade: 20,
    quantidadeAtual: 20,
    data_fabricacao: "2023-11-15",
    data_validade: "2026-11-15",
    lote: "L-998-B",
    valor_unitario: 120,
    nota_fiscal_numero: "45678",
    nota_fiscal_serie: "2",
  },
  {
    id: 103,
    idEpi: 2,
    idTamanho: 3,
    idFornecedor: 1,
    data_entrada: "2024-02-01",
    quantidade: 100,
    quantidadeAtual: 100,
    data_fabricacao: "2024-01-05",
    data_validade: "2027-01-05",
    lote: "L-555-C",
    valor_unitario: 12.5,
    nota_fiscal_numero: "78910",
    nota_fiscal_serie: "1",
  },
];

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas, fallback) {
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

function normalizarFornecedor(item) {
  return {
    id: Number(item?.id ?? 0),
    razao_social: item?.razao_social ?? item?.razaoSocial ?? "",
    nome_fantasia: item?.nome_fantasia ?? item?.nomeFantasia ?? "",
    cnpj: item?.cnpj ?? "",
    inscricao_estadual:
      item?.inscricao_estadual ?? item?.inscricaoEstadual ?? "",
  };
}

function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    fabricante: item?.fabricante ?? "",
    CA: item?.CA ?? item?.ca ?? "",
  };
}

function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

function normalizarEntrada(item) {
  return {
    id: Number(item?.id ?? 0),
    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.epiId ??
        item?.id_epi ??
        item?.idProduto ??
        item?.produto_id ??
        0
    ),
    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.tamanhoId ??
        item?.id_tamanho ??
        0
    ),
    idFornecedor: Number(
      item?.idFornecedor ??
        item?.fornecedor_id ??
        item?.fornecedorId ??
        item?.id_fornecedor ??
        0
    ),
    data_entrada: item?.data_entrada ?? item?.dataEntrada ?? "",
    quantidade: Number(item?.quantidade ?? 0),
    quantidadeAtual: Number(
      item?.quantidadeAtual ??
        item?.quantidade_atual ??
        item?.estoqueAtual ??
        item?.estoque_atual ??
        item?.quantidade ??
        0
    ),
    data_fabricacao: item?.data_fabricacao ?? item?.dataFabricacao ?? "",
    data_validade: item?.data_validade ?? item?.dataValidade ?? item?.validade ?? "",
    lote: item?.lote ?? "",
    valor_unitario: Number(item?.valor_unitario ?? item?.valorUnitario ?? 0),
    nota_fiscal_numero:
      item?.nota_fiscal_numero ?? item?.notaFiscalNumero ?? "",
    nota_fiscal_serie:
      item?.nota_fiscal_serie ?? item?.notaFiscalSerie ?? "",
  };
}

function Entradas() {
  const [entradas, setEntradas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const [idFornecedor, setIdFornecedor] = useState("");
  const [idEpi, setIdEpi] = useState("");
  const [idTamanho, setIdTamanho] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [dataEntrada, setDataEntrada] = useState("");
  const [dataFabricacao, setDataFabricacao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [lote, setLote] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [notaFiscalNumero, setNotaFiscalNumero] = useState("");
  const [notaFiscalSerie, setNotaFiscalSerie] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarEntradas = async () => {
    try {
      const [listaFornecedores, listaEpis, listaTamanhos, listaEntradas] =
        await Promise.all([
          buscarPrimeiraLista(["/fornecedores"], mockFornecedores),
          buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
          buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
          buscarPrimeiraLista(
            ["/entrada-epi", "/entrada_epi", "/entradas"],
            mockEntradasInicial
          ),
        ]);

      setFornecedores(listaFornecedores.map(normalizarFornecedor));
      setEpis(listaEpis.map(normalizarEpi));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
      setEntradas(listaEntradas.map(normalizarEntrada));
    } catch (erro) {
      setFornecedores(mockFornecedores.map(normalizarFornecedor));
      setEpis(mockEpis.map(normalizarEpi));
      setTamanhos(mockTamanhos.map(normalizarTamanho));
      setEntradas(mockEntradasInicial.map(normalizarEntrada));
    }
  };

  useEffect(() => {
    carregarEntradas();
  }, []);

  const formatarData = (data) => {
    if (!data) return "--";
    const dataObj = new Date(data);
    if (Number.isNaN(dataObj.getTime())) return "--";
    return dataObj.toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

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

    return entradasResolvidas.filter((e) => {
      return (
        (e.epiNome || "").toLowerCase().includes(termo) ||
        (e.epiFabricante || "").toLowerCase().includes(termo) ||
        (e.epiCA || "").toLowerCase().includes(termo) ||
        (e.fornecedorNome || "").toLowerCase().includes(termo) ||
        (e.lote || "").toLowerCase().includes(termo) ||
        (e.nota_fiscal_numero || "").toLowerCase().includes(termo) ||
        (e.nota_fiscal_serie || "").toLowerCase().includes(termo) ||
        (e.tamanhoNome || "").toLowerCase().includes(termo)
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

  useEffect(() => {
    const total = Math.max(1, Math.ceil(entradasOrdenadas.length / itensPorPagina));
    if (paginaAtual > total) setPaginaAtual(total);
  }, [paginaAtual, entradasOrdenadas.length]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const entradasVisiveis = entradasOrdenadas.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.max(1, Math.ceil(entradasOrdenadas.length / itensPorPagina));

  function abrirModal() {
    setIdFornecedor("");
    setIdEpi("");
    setIdTamanho("");
    setQuantidade("");
    setDataEntrada(new Date().toISOString().split("T")[0]);
    setDataFabricacao("");
    setDataValidade("");
    setLote("");
    setValorUnitario("");
    setNotaFiscalNumero("");
    setNotaFiscalSerie("");
    setModalAberto(true);
  }

  const salvarEntrada = async () => {
    if (!idFornecedor || !idEpi || !idTamanho || !quantidade || !dataEntrada) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    setCarregando(true);

    const pacoteDados = {
      idFornecedor: Number(idFornecedor),
      idEpi: Number(idEpi),
      idTamanho: Number(idTamanho),
      quantidade: Number(quantidade),
      quantidadeAtual: Number(quantidade),
      data_entrada: dataEntrada,
      data_fabricacao: dataFabricacao || null,
      data_validade: dataValidade || null,
      lote,
      valor_unitario: Number(valorUnitario || 0),
      nota_fiscal_numero: notaFiscalNumero,
      nota_fiscal_serie: notaFiscalSerie,
    };

    try {
      await api.post("/entrada-epi", pacoteDados);
      const novaEntrada = { id: Date.now(), ...pacoteDados };
      setEntradas((prev) => [novaEntrada, ...prev]);
      setModalAberto(false);
      setPaginaAtual(1);
    } catch (erro) {
      try {
        await api.post("/entrada_epi", pacoteDados);
        const novaEntrada = { id: Date.now(), ...pacoteDados };
        setEntradas((prev) => [novaEntrada, ...prev]);
        setModalAberto(false);
        setPaginaAtual(1);
      } catch (erro2) {
        const novaEntrada = { id: Date.now(), ...pacoteDados };
        setEntradas((prev) => [novaEntrada, ...prev]);
        setModalAberto(false);
        setPaginaAtual(1);
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
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

        <button
          onClick={abrirModal}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm justify-center w-full lg:w-auto"
        >
          <span>➕</span> Nova Entrada
        </button>
      </div>

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
              entradasVisiveis.map((e) => {
                const total = Number(e.quantidade || 0) * Number(e.valor_unitario || 0);

                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600 font-mono text-sm">
                      {formatarData(e.data_entrada)}
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-gray-800">{e.epiNome}</div>
                      <div className="text-xs text-gray-400">
                        {e.epiFabricante || "-"} • CA: {e.epiCA || "-"}
                      </div>
                    </td>

                    <td className="p-4 text-center text-gray-600">{e.tamanhoNome || "-"}</td>

                    <td className="p-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                        +{e.quantidade}
                      </span>
                    </td>

                    <td className="p-4 text-gray-600 text-sm">
                      <div className="font-bold">{e.fornecedorNome}</div>
                      <div className="text-xs text-gray-400">Lote: {e.lote || "-"}</div>
                    </td>

                    <td className="p-4 text-gray-600 text-sm">
                      Nº {e.nota_fiscal_numero || "-"} / Série {e.nota_fiscal_serie || "-"}
                    </td>

                    <td className="p-4 text-right text-gray-600 font-mono text-sm">
                      {formatarMoeda(e.valor_unitario)}
                    </td>

                    <td className="p-4 text-right text-emerald-700 font-bold font-mono text-sm">
                      {formatarMoeda(total)}
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
          entradasVisiveis.map((e) => {
            const total = Number(e.quantidade || 0) * Number(e.valor_unitario || 0);

            return (
              <div key={e.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    {formatarData(e.data_entrada)}
                  </span>

                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded border border-emerald-200">
                    +{e.quantidade} un
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-lg mb-1">{e.epiNome}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tamanho: <strong className="text-gray-800">{e.tamanhoNome || "Único"}</strong>
                </p>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">
                      Fornecedor
                    </span>
                    <span className="text-gray-700 font-medium truncate block">
                      {e.fornecedorNome}
                    </span>
                    <span className="text-xs text-gray-400">Lote: {e.lote || "-"}</span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">
                      Total da NF
                    </span>
                    <span className="text-emerald-700 font-bold font-mono">
                      {formatarMoeda(total)}
                    </span>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-gray-200">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">
                      Nota Fiscal
                    </span>
                    <span className="text-gray-700">
                      Nº {e.nota_fiscal_numero || "-"} / Série {e.nota_fiscal_serie || "-"}
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
            Pág. <b className="text-gray-900">{paginaAtual}</b> de <b>{totalPaginas}</b>
          </span>

          <button
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
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

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-800">📦 Nova Entrada</h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione o EPI <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={idEpi}
                  onChange={(e) => setIdEpi(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {epis.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={idTamanho}
                  onChange={(e) => setIdTamanho(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {tamanhos.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.tamanho}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ex: 50"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Entrada <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={dataEntrada}
                  onChange={(e) => setDataEntrada(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Unitário (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0.00"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={idFornecedor}
                  onChange={(e) => setIdFornecedor(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {fornecedores.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome_fantasia || item.razao_social}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Lote
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ex: LT-2024"
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fabricação
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={dataFabricacao}
                  onChange={(e) => setDataFabricacao(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Validade
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={dataValidade}
                  onChange={(e) => setDataValidade(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Nota Fiscal
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ex: 12345"
                  value={notaFiscalNumero}
                  onChange={(e) => setNotaFiscalNumero(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Série da Nota Fiscal
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ex: 1"
                  value={notaFiscalSerie}
                  onChange={(e) => setNotaFiscalSerie(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t shrink-0">
              <button
                onClick={() => setModalAberto(false)}
                disabled={carregando}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEntrada}
                disabled={carregando}
                className={`px-4 py-2 text-white font-bold rounded-lg shadow-md transition ${
                  carregando
                    ? "bg-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {carregando ? "A registar..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Entradas;