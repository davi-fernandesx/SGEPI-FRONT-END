import { useEffect, useMemo, useState } from "react";
import ModalEntrega from "../components/modals/ModalEntrega";
import { api } from "../services/api";

const mockFuncionarios = [
  { id: 1, nome: "João Silva", matricula: "483920" },
  { id: 2, nome: "Maria Santos", matricula: "739104" },
  { id: 3, nome: "Carlos Oliveira", matricula: "102938" },
  { id: 4, nome: "Ana Pereira", matricula: "998877" },
  { id: 5, nome: "Roberto Costa", matricula: "112233" },
  { id: 6, nome: "Fernanda Lima", matricula: "554433" },
];

const mockEpis = [
  { id: 1, nome: "Capacete" },
  { id: 2, nome: "Luva de Raspa" },
  { id: 3, nome: "Sapato" },
];

const mockTamanhos = [
  { id: 1, tamanho: "P" },
  { id: 2, tamanho: "M" },
  { id: 3, tamanho: "G" },
  { id: 4, tamanho: "40" },
  { id: 5, tamanho: "42" },
];

const mockEntregasInicial = [
  {
    id: 101,
    idFuncionario: 1,
    data_entrega: "2024-01-20",
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 102,
    idFuncionario: 2,
    data_entrega: "2024-02-15",
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 103,
    idFuncionario: 3,
    data_entrega: "2024-03-10",
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 104,
    idFuncionario: 4,
    data_entrega: "2024-03-12",
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 105,
    idFuncionario: 5,
    data_entrega: "2024-03-15",
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 106,
    idFuncionario: 1,
    data_entrega: "2024-03-18",
    assinatura: null,
    token_validacao: null,
  },
];

const mockItensEntreguesInicial = [
  { id: "a1", idEntrega: 101, idEpi: 1, idTamanho: 2, quantidade: 1 },
  { id: "a2", idEntrega: 102, idEpi: 2, idTamanho: 1, quantidade: 5 },
  { id: "a3", idEntrega: 103, idEpi: 3, idTamanho: 5, quantidade: 1 },
  { id: "a4", idEntrega: 104, idEpi: 1, idTamanho: 1, quantidade: 1 },
  { id: "a5", idEntrega: 105, idEpi: 3, idTamanho: 4, quantidade: 1 },
  { id: "a6", idEntrega: 106, idEpi: 2, idTamanho: 3, quantidade: 2 },
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

function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? ""),
  };
}

function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
  };
}

function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.funcionario ??
        item?.id_funcionario ??
        item?.funcionario?.id ??
        0
    ),
    data_entrega:
      item?.data_entrega ??
      item?.dataEntrega ??
      item?.data_entrega_epi ??
      null,
    assinatura: item?.assinatura ?? null,
    token_validacao: item?.token_validacao ?? item?.tokenValidacao ?? null,
    itens: Array.isArray(item?.itens) ? item.itens : [],
  };
}

function normalizarItemEntregue(item) {
  return {
    id: item?.id ?? Date.now() + Math.random(),
    idEntrega: Number(
      item?.idEntrega ??
        item?.entrega_id ??
        item?.entregaId ??
        item?.id_entrega ??
        0
    ),
    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.epiId ??
        item?.id_epi ??
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
    quantidade: Number(item?.quantidade ?? 0),
    epiNome: item?.epiNome ?? item?.epi_nome ?? null,
    tamanhoTexto: item?.tamanho ?? item?.tamanhoTexto ?? null,
  };
}

function Entregas() {
  const [entregas, setEntregas] = useState([]);
  const [itensEntregues, setItensEntregues] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  const [modalAberto, setModalAberto] = useState(false);

  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const carregarEntregas = async () => {
    try {
      const [
        listaFuncionarios,
        listaEpis,
        listaTamanhos,
        listaEntregas,
        listaItensEntregues,
      ] = await Promise.all([
        buscarPrimeiraLista(["/funcionarios"], mockFuncionarios),
        buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
        buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
        buscarPrimeiraLista(
          ["/entregas", "/entrega-epi", "/entrega_epi"],
          mockEntregasInicial
        ),
        buscarPrimeiraLista(
          ["/epis-entregues", "/epis_entregues"],
          mockItensEntreguesInicial
        ),
      ]);

      setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
      setEpis(listaEpis.map(normalizarEpi));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
      setEntregas(listaEntregas.map(normalizarEntrega));
      setItensEntregues(listaItensEntregues.map(normalizarItemEntregue));
    } catch (erro) {
      console.log("Backend não tem entregas ainda. A usar dados falsos (mock).");
      setFuncionarios(mockFuncionarios.map(normalizarFuncionario));
      setEpis(mockEpis.map(normalizarEpi));
      setTamanhos(mockTamanhos.map(normalizarTamanho));
      setEntregas(mockEntregasInicial.map(normalizarEntrega));
      setItensEntregues(mockItensEntreguesInicial.map(normalizarItemEntregue));
    }
  };

  useEffect(() => {
    carregarEntregas();
  }, []);

  const formatarData = (data) => {
    if (!data) return "--";
    const dataObj = new Date(data);
    if (Number.isNaN(dataObj.getTime())) return "--";
    return dataObj.toLocaleDateString("pt-BR");
  };

  const aoMudarFiltro = (setter, valor) => {
    setter(valor);
    setPaginaAtual(1);
  };

  const entregasResolvidas = useMemo(() => {
    return entregas.map((entrega) => {
      const funcionario = funcionarios.find(
        (f) => Number(f.id) === Number(entrega.idFuncionario)
      );

      const itensDaTabela = itensEntregues.filter(
        (item) => Number(item.idEntrega) === Number(entrega.id)
      );

      const itensResolvidos =
        itensDaTabela.length > 0
          ? itensDaTabela.map((item) => {
              const epi = epis.find((e) => Number(e.id) === Number(item.idEpi));
              const tamanho = tamanhos.find(
                (t) => Number(t.id) === Number(item.idTamanho)
              );

              return {
                id: item.id,
                epiNome: item.epiNome || epi?.nome || "EPI não identificado",
                tamanho: item.tamanhoTexto || tamanho?.tamanho || "-",
                quantidade: item.quantidade || 0,
              };
            })
          : (entrega.itens || []).map((item) => ({
              id: item.id ?? Date.now() + Math.random(),
              epiNome: item.epiNome || item.nome || "EPI não identificado",
              tamanho: item.tamanho || "-",
              quantidade: Number(item.quantidade ?? 0),
            }));

      return {
        id: entrega.id,
        idFuncionario: entrega.idFuncionario,
        dataEntrega: (entrega.data_entrega || "").substring(0, 10),
        assinatura: entrega.assinatura,
        tokenValidacao: entrega.token_validacao,
        funcionario,
        itens: itensResolvidos,
      };
    });
  }, [entregas, itensEntregues, funcionarios, epis, tamanhos]);

  const entregasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return entregasResolvidas.filter((entrega) => {
      const nomeFuncionario = (entrega.funcionario?.nome || "").toLowerCase();
      const matricula = String(entrega.funcionario?.matricula || "");
      const matchTexto =
        !termo ||
        nomeFuncionario.includes(termo) ||
        matricula.includes(termo) ||
        entrega.itens.some(
          (item) =>
            (item.epiNome || "").toLowerCase().includes(termo) ||
            String(item.tamanho || "").toLowerCase().includes(termo)
        );

      let matchData = true;
      if (dataInicio) matchData = matchData && entrega.dataEntrega >= dataInicio;
      if (dataFim) matchData = matchData && entrega.dataEntrega <= dataFim;

      return matchTexto && matchData;
    });
  }, [entregasResolvidas, busca, dataInicio, dataFim]);

  const entregasOrdenadas = useMemo(() => {
    return [...entregasFiltradas].sort((a, b) => {
      if (a.dataEntrega > b.dataEntrega) return -1;
      if (a.dataEntrega < b.dataEntrega) return 1;
      return 0;
    });
  }, [entregasFiltradas]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(entregasOrdenadas.length / itensPorPagina));
    if (paginaAtual > total) {
      setPaginaAtual(total);
    }
  }, [entregasOrdenadas.length, paginaAtual]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const entregasVisiveis = entregasOrdenadas.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.max(1, Math.ceil(entregasOrdenadas.length / itensPorPagina));

  const imprimirRelatorioGeral = () => {
    const periodoTexto =
      dataInicio && dataFim
        ? `${formatarData(dataInicio)} até ${formatarData(dataFim)}`
        : "Período Completo (Todos os registros)";

    const dataEmissao = new Date().toLocaleDateString("pt-BR");

    const conteudoHTML = `
      <html>
        <head>
          <title>Relatório de Entrega de EPIs</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body { font-family: 'Roboto', sans-serif; padding: 40px; font-size: 12px; color: #374151; -webkit-print-color-adjust: exact; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
            .header-title h1 { margin: 0; color: #1e3a8a; font-size: 22px; text-transform: uppercase; }
            .header-title p { margin: 4px 0 0; color: #6b7280; font-size: 12px; }
            .header-meta { text-align: right; font-size: 12px; color: #4b5563; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f3f4f6; color: #111827; text-align: left; padding: 10px; border-bottom: 2px solid #d1d5db; font-size: 11px; text-transform: uppercase; font-weight: 700; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .col-data { white-space: nowrap; width: 10%; font-weight: 500; }
            .col-func { width: 30%; }
            .col-itens { width: 40%; }
            .col-assinatura { width: 20%; text-align: center; }
            .func-nome { font-weight: 700; color: #1f2937; font-size: 13px; display: block; }
            .func-meta { font-size: 11px; color: #6b7280; }
            .item-tag { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin: 1px; }
            .img-assinatura { max-height: 40px; max-width: 120px; display: inline-block; }
            .assinatura-manual { border-bottom: 1px solid #9ca3af; width: 80%; margin: 15px auto 5px; display: block; }
            .assinatura-label { font-size: 9px; color: #9ca3af; font-style: italic; }
            .summary { text-align: right; margin-top: 10px; font-size: 13px; font-weight: bold; background: #f3f4f6; padding: 10px; border-radius: 6px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .footer-line { width: 40%; border-top: 1px solid #374151; padding-top: 8px; text-align: center; font-size: 11px; }
            .disclaimer { margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: justify; border-top: 1px solid #e5e7eb; padding-top: 5px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-title"><h1>Relatório de Saída de EPIs</h1><p>Controle de Fornecimento Individual</p></div>
            <div class="header-meta"><strong>Filtro:</strong> ${periodoTexto}<br/><strong>Emissão:</strong> ${dataEmissao}<br/><strong>Status:</strong> Documento Conferido</div>
          </div>
          <table>
            <thead><tr><th class="col-data">Data</th><th class="col-func">Colaborador / Matrícula</th><th class="col-itens">Itens Entregues</th><th class="col-assinatura">Assinatura</th></tr></thead>
            <tbody>
              ${entregasOrdenadas
                .map((ent) => {
                  const listaItens = ent.itens
                    .map(
                      (i) =>
                        `<span class="item-tag">${i.epiNome} (${i.tamanho}) <b>x${i.quantidade}</b></span>`
                    )
                    .join(" ");

                  const assinaturaCell =
                    ent.assinatura || ent.tokenValidacao
                      ? `<span class="assinatura-label">Registrada digitalmente</span>`
                      : `<div class="assinatura-manual"></div><span class="assinatura-label">Assinatura Física</span>`;

                  return `<tr>
                    <td class="col-data">${formatarData(ent.dataEntrega)}</td>
                    <td class="col-func">
                      <span class="func-nome">${ent.funcionario?.nome || "Não identificado"}</span>
                      <span class="func-meta">Mat: ${ent.funcionario?.matricula || "--"}</span>
                    </td>
                    <td class="col-itens">${listaItens}</td>
                    <td class="col-assinatura">${assinaturaCell}</td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table>
          <div class="summary">Total de Entregas Registradas: ${entregasOrdenadas.length}</div>
          <div class="footer"><div class="footer-line"><b>Responsável pela Entrega</b><br/>Assinatura</div><div class="footer-line"><b>Técnico de Segurança</b><br/>Visto</div></div>
          <div class="disclaimer">Declaro recebimento dos EPIs conforme NR-06.</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=950,height=650");
    win.document.write(conteudoHTML);
    win.document.close();
  };

  const aoSalvarEntrega = async () => {
    setModalAberto(false);
    await carregarEntregas();
    setPaginaAtual(1);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
            📋 Histórico de Entregas
          </h2>
          <p className="text-sm text-gray-500">
            Consulte, filtre e imprima relatórios de entrega de EPIs.
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition shadow-sm flex items-center gap-2 justify-center w-full lg:w-auto"
        >
          <span>➕</span> Nova Entrega
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
          Filtros do Relatório
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">
              Buscar Colaborador / Item
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
            <label className="text-xs text-gray-500 mb-1 block">De (Data Inicial)</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => aoMudarFiltro(setDataInicio, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Até (Data Final)</label>
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
            Mostrando <b>{entregasOrdenadas.length}</b> registros
          </span>

          <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
            {(busca || dataInicio || dataFim) && (
              <button
                onClick={() => {
                  setBusca("");
                  setDataInicio("");
                  setDataFim("");
                  setPaginaAtual(1);
                }}
                className="text-xs text-red-500 font-bold hover:underline px-3"
              >
                Limpar Filtros
              </button>
            )}

            <button
              onClick={imprimirRelatorioGeral}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition shadow-sm text-sm flex items-center gap-2"
            >
              <span>🖨️</span> PDF
            </button>
          </div>
        </div>
      </div>

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
                    {formatarData(e.dataEntrega)}
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-gray-800">
                      {e.funcionario?.nome || "Desconhecido"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Mat: {e.funcionario?.matricula || "--"}
                    </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    {formatarData(e.dataEntrega)}
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
                <h3 className="font-bold text-gray-800 text-lg">
                  {e.funcionario?.nome || "Desconhecido"}
                </h3>
                <span className="text-xs text-gray-500 block">
                  Matrícula: {e.funcionario?.matricula || "--"}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">
                  Itens Entregues
                </span>

                <div className="flex flex-wrap gap-2">
                  {e.itens.length > 0 ? (
                    e.itens.map((i) => (
                      <span
                        key={i.id}
                        className="bg-white text-blue-800 text-xs px-2 py-1 rounded border border-blue-100 shadow-sm"
                      >
                        {i.epiNome} <span className="text-gray-400">|</span> Tam: {i.tamanho}{" "}
                        <span className="text-gray-400">|</span> <b>x{i.quantidade}</b>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Sem itens vinculados
                    </span>
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
            className={`px-4 py-2 rounded text-sm font-bold border ${
              paginaAtual === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
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
                : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
            }`}
          >
            Próxima →
          </button>
        </div>
      )}

      {modalAberto && (
        <ModalEntrega
          onClose={() => setModalAberto(false)}
          onSalvar={aoSalvarEntrega}
        />
      )}
    </div>
  );
}

export default Entregas;