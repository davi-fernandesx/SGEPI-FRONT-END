import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";

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
  { id: 1, nome: "Capacete de Segurança", CA: "32.145" },
  { id: 2, nome: "Luva de Raspa", CA: "15.400" },
  { id: 3, nome: "Sapato de Segurança", CA: "40.222" },
  { id: 4, nome: "Óculos de Proteção", CA: "11.200" },
  { id: 5, nome: "Protetor Auricular", CA: "19.100" },
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

function normalizarFornecedor(item) {
  return {
    id: Number(item?.id ?? 0),
    razao_social: item?.razao_social ?? item?.razaoSocial ?? item?.nome ?? "",
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
    CA: item?.CA ?? item?.ca ?? "",
  };
}

function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

async function tentarSalvarRegistros(registros) {
  let ultimoErro = null;

  for (const rota of ["/entrada-epi", "/entrada_epi", "/entradas"]) {
    try {
      await Promise.all(registros.map((registro) => api.post(rota, registro)));
      return true;
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  throw ultimoErro || new Error("Não foi possível registrar a entrada.");
}

function ModalEntrada({ onClose, onSalvar }) {
  const [fornecedores, setFornecedores] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const [dataEntrada, setDataEntrada] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [buscaFornecedor, setBuscaFornecedor] = useState("");

  const [notaFiscalNumero, setNotaFiscalNumero] = useState("");
  const [notaFiscalSerie, setNotaFiscalSerie] = useState("");

  const [itensEntrada, setItensEntrada] = useState([]);

  const [epiId, setEpiId] = useState("");
  const [tamanhoTemp, setTamanhoTemp] = useState("");
  const [qtdTemp, setQtdTemp] = useState(1);
  const [precoTemp, setPrecoTemp] = useState("");
  const [loteTemp, setLoteTemp] = useState("");
  const [dataFabricacaoTemp, setDataFabricacaoTemp] = useState("");
  const [validadeTemp, setValidadeTemp] = useState("");

  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregandoDados(true);

      try {
        const [listaFornecedores, listaEpis, listaTamanhos] = await Promise.all([
          buscarPrimeiraLista(["/fornecedores"], mockFornecedores),
          buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
          buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
        ]);

        if (!ativo) return;

        setFornecedores(listaFornecedores.map(normalizarFornecedor));
        setEpis(listaEpis.map(normalizarEpi));
        setTamanhos(listaTamanhos.map(normalizarTamanho));
      } finally {
        if (ativo) {
          setCarregandoDados(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const epiSelecionadoObj = useMemo(() => {
    return epis.find((e) => Number(e.id) === Number(epiId)) || null;
  }, [epis, epiId]);

  const tamanhoSelecionadoObj = useMemo(() => {
    return tamanhos.find((t) => Number(t.id) === Number(tamanhoTemp)) || null;
  }, [tamanhos, tamanhoTemp]);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = buscaFornecedor.toLowerCase().trim();

    if (!termo) return fornecedores;

    return fornecedores.filter((f) => {
      return (
        (f.razao_social || "").toLowerCase().includes(termo) ||
        (f.nome_fantasia || "").toLowerCase().includes(termo) ||
        String(f.cnpj || "").includes(termo)
      );
    });
  }, [fornecedores, buscaFornecedor]);

  const valorTotalEntrada = useMemo(() => {
    return itensEntrada.reduce(
      (acc, item) => acc + Number(item.totalItem || 0),
      0
    );
  }, [itensEntrada]);

  function limparCamposItem() {
    setEpiId("");
    setTamanhoTemp("");
    setQtdTemp(1);
    setPrecoTemp("");
    setLoteTemp("");
    setDataFabricacaoTemp("");
    setValidadeTemp("");
  }

  function adicionarItem() {
    if (!epiId || !tamanhoTemp || !qtdTemp || !precoTemp || !loteTemp.trim()) {
      alert("Preencha EPI, tamanho, quantidade, valor unitário e lote.");
      return;
    }

    const quantidade = Number(qtdTemp);
    const valorUnitario = Number(precoTemp);

    if (Number.isNaN(quantidade) || quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    if (Number.isNaN(valorUnitario) || valorUnitario < 0) {
      alert("Informe um valor unitário válido.");
      return;
    }

    const itemDuplicado = itensEntrada.some(
      (item) =>
        Number(item.idEpi) === Number(epiId) &&
        Number(item.idTamanho) === Number(tamanhoTemp) &&
        String(item.lote || "").toLowerCase() ===
          String(loteTemp || "").trim().toLowerCase()
    );

    if (itemDuplicado) {
      alert("Esse item com esse tamanho e lote já foi adicionado.");
      return;
    }

    const novoItem = {
      id: Date.now() + Math.random(),
      idEpi: Number(epiId),
      epiNome: epiSelecionadoObj?.nome || "EPI",
      ca: epiSelecionadoObj?.CA || "-",
      idTamanho: Number(tamanhoTemp),
      tamanhoNome: tamanhoSelecionadoObj?.tamanho || "-",
      quantidade,
      quantidadeAtual: quantidade,
      valor_unitario: valorUnitario,
      lote: loteTemp.trim(),
      data_fabricacao: dataFabricacaoTemp || null,
      data_validade: validadeTemp || null,
      totalItem: quantidade * valorUnitario,
    };

    setItensEntrada((prev) => [...prev, novoItem]);
    limparCamposItem();
  }

  function removerItem(id) {
    if (window.confirm("Deseja remover este item da lista?")) {
      setItensEntrada((prev) => prev.filter((item) => item.id !== id));
    }
  }

  async function salvarEntrada() {
    if (!fornecedorSelecionado) {
      alert("Selecione um fornecedor.");
      return;
    }

    if (!dataEntrada) {
      alert("Informe a data da entrada.");
      return;
    }

    if (itensEntrada.length === 0) {
      alert("Adicione pelo menos um item.");
      return;
    }

    setCarregando(true);

    const registros = itensEntrada.map((item) => ({
      idFornecedor: Number(fornecedorSelecionado.id),
      idEpi: Number(item.idEpi),
      idTamanho: Number(item.idTamanho),
      data_entrada: dataEntrada,
      quantidade: Number(item.quantidade),
      quantidadeAtual: Number(item.quantidadeAtual),
      data_fabricacao: item.data_fabricacao || null,
      data_validade: item.data_validade || null,
      lote: item.lote,
      valor_unitario: Number(item.valor_unitario),
      nota_fiscal_numero: notaFiscalNumero?.trim() || "",
      nota_fiscal_serie: notaFiscalSerie?.trim() || "",
    }));

    const retornoLocal = {
      id: Date.now(),
      idFornecedor: Number(fornecedorSelecionado.id),
      fornecedorNome:
        fornecedorSelecionado.nome_fantasia ||
        fornecedorSelecionado.razao_social ||
        "",
      data_entrada: dataEntrada,
      nota_fiscal_numero: notaFiscalNumero?.trim() || "",
      nota_fiscal_serie: notaFiscalSerie?.trim() || "",
      itens: registros.map((registro, index) => ({
        id: Date.now() + index,
        ...registro,
        epiNome: itensEntrada[index]?.epiNome,
        tamanhoNome: itensEntrada[index]?.tamanhoNome,
      })),
      valor_total: valorTotalEntrada,
    };

    let salvouNoServidor = false;

    try {
      try {
        await tentarSalvarRegistros(registros);
        salvouNoServidor = true;
      } catch (erro) {
        salvouNoServidor = false;
      }

      if (onSalvar) {
        await onSalvar(retornoLocal);
      }

      if (salvouNoServidor) {
        alert("Entrada registrada com sucesso.");
      } else {
        alert(
          "Não foi possível salvar no servidor. Os dados foram mantidos localmente nesta sessão."
        );
      }

      onClose();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden animate-fade-in flex flex-col max-h-[95vh] border border-slate-200">
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                Entrada de Estoque
              </h2>
              <p className="text-emerald-100 text-xs">
                Cadastro conforme a tabela <b>entrada_epi</b>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-emerald-100 hover:text-white hover:bg-emerald-700 p-2 rounded-full transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
          {carregandoDados && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Carregando fornecedores, EPIs e tamanhos...
            </div>
          )}

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
              1. Dados gerais da entrada
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Fornecedor <span className="text-red-500">*</span>
                </label>

                {fornecedorSelecionado ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-emerald-900">
                        {fornecedorSelecionado.nome_fantasia ||
                          fornecedorSelecionado.razao_social}
                      </p>
                      <p className="text-xs text-emerald-600">
                        Razão social: {fornecedorSelecionado.razao_social || "-"}
                      </p>
                      <p className="text-xs text-emerald-600">
                        CNPJ: {fornecedorSelecionado.cnpj || "-"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFornecedorSelecionado(null);
                        setBuscaFornecedor("");
                      }}
                      className="shrink-0 text-xs text-red-500 hover:text-red-700 font-medium underline px-2"
                    >
                      Trocar
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Digite razão social, nome fantasia ou CNPJ..."
                      className="w-full pl-3 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition"
                      value={buscaFornecedor}
                      onChange={(e) => setBuscaFornecedor(e.target.value)}
                    />

                    {buscaFornecedor.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                        {fornecedoresFiltrados.length === 0 ? (
                          <div className="p-3 text-sm text-slate-400 italic">
                            Nenhum fornecedor encontrado.
                          </div>
                        ) : (
                          fornecedoresFiltrados.map((f) => (
                            <button
                              type="button"
                              key={f.id}
                              onClick={() => {
                                setFornecedorSelecionado(f);
                                setBuscaFornecedor("");
                              }}
                              className="w-full text-left p-3 hover:bg-emerald-50 border-b border-slate-50 last:border-0"
                            >
                              <p className="text-sm font-bold text-slate-700">
                                {f.nome_fantasia || f.razao_social}
                              </p>
                              <p className="text-xs text-slate-500">
                                {f.razao_social || "-"}
                              </p>
                              <p className="text-xs text-slate-500">
                                CNPJ: {f.cnpj || "-"}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data da Entrada
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-600"
                  value={dataEntrada}
                  onChange={(e) => setDataEntrada(e.target.value)}
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número da Nota Fiscal
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  placeholder="Ex.: 12345"
                  value={notaFiscalNumero}
                  onChange={(e) => setNotaFiscalNumero(e.target.value)}
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Série da Nota Fiscal
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  placeholder="Ex.: 1"
                  value={notaFiscalSerie}
                  onChange={(e) => setNotaFiscalSerie(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative">
            {!fornecedorSelecionado && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                <span className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⚠️ Selecione o fornecedor primeiro
                </span>
              </div>
            )}

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
              2. Itens da entrada
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  EPI
                </label>
                <select
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 outline-none text-sm bg-white"
                  value={epiId}
                  onChange={(e) => setEpiId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {epis.map((epi) => (
                    <option key={epi.id} value={epi.id}>
                      {epi.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Tamanho
                </label>
                <select
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 outline-none text-sm bg-white"
                  value={tamanhoTemp}
                  onChange={(e) => setTamanhoTemp(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {tamanhos.map((tamanho) => (
                    <option key={tamanho.id} value={tamanho.id}>
                      {tamanho.tamanho}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Qtd.
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
                  value={qtdTemp}
                  onChange={(e) => setQtdTemp(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Valor Unit.
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
                  placeholder="0.00"
                  value={precoTemp}
                  onChange={(e) => setPrecoTemp(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Lote
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
                  placeholder="Ex: LT-2026-01"
                  value={loteTemp}
                  onChange={(e) => setLoteTemp(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={adicionarItem}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded shadow-md transition flex items-center justify-center gap-1 text-sm"
                >
                  <span>+</span> Incluir
                </button>
              </div>

              <div className="md:col-span-3 mt-2 md:mt-0">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">
                  Data de Fabricação
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  value={dataFabricacaoTemp}
                  onChange={(e) => setDataFabricacaoTemp(e.target.value)}
                />
              </div>

              <div className="md:col-span-3 mt-2 md:mt-0">
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">
                  Data de Validade
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                  value={validadeTemp}
                  onChange={(e) => setValidadeTemp(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs">
                    <tr>
                      <th className="p-3 pl-4">Item</th>
                      <th className="p-3 text-center">Tam.</th>
                      <th className="p-3 text-center">Qtd.</th>
                      <th className="p-3 text-center">Lote</th>
                      <th className="p-3 text-right">Unitário</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Ação</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {itensEntrada.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-8 text-center text-slate-400 italic bg-white"
                        >
                          Nenhum item adicionado ainda.
                        </td>
                      </tr>
                    ) : (
                      itensEntrada.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition bg-white"
                        >
                          <td className="p-3">
                            <span className="font-medium text-slate-800">
                              {item.epiNome}
                            </span>
                            <span className="block text-xs text-slate-400">
                              CA: {item.ca || "-"} | Validade:{" "}
                              {item.data_validade || "N/A"}
                            </span>
                          </td>

                          <td className="p-3 text-center text-slate-600">
                            {item.tamanhoNome}
                          </td>

                          <td className="p-3 text-center font-bold text-slate-700">
                            {item.quantidade}
                          </td>

                          <td className="p-3 text-center text-slate-600">
                            {item.lote}
                          </td>

                          <td className="p-3 text-right text-slate-600">
                            {item.valor_unitario.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>

                          <td className="p-3 text-right font-bold text-emerald-600">
                            {item.totalItem.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => removerItem(item.id)}
                              className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition"
                              title="Remover item"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  {itensEntrada.length > 0 && (
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                      <tr>
                        <td
                          colSpan="5"
                          className="p-3 text-right font-bold text-slate-600 uppercase text-xs tracking-wider"
                        >
                          Total da Entrada:
                        </td>
                        <td className="p-3 text-right font-black text-lg text-emerald-700">
                          {valorTotalEntrada.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-4 flex justify-between items-center border-t border-slate-200">
          <div className="text-xs text-slate-400">
            * Campos conforme a estrutura de entrada de estoque
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvarEntrada}
              disabled={carregando}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition flex items-center gap-2 active:scale-95 disabled:opacity-60"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {carregando ? "Salvando..." : "Finalizar Entrada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalEntrada;
