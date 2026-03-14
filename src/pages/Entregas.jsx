import { useEffect, useMemo, useState } from "react";
import ModalEntrega from "../components/modals/ModalEntrega";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";

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

function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    matricula: String(item?.matricula ?? item?.Matricula ?? ""),
  };
}

function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
  };
}

function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    tamanho: String(item?.tamanho ?? item?.Tamanho ?? ""),
  };
}

function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
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
      item?.data ??
      null,
    assinatura:
      item?.assinatura ??
      item?.assinatura_digital ??
      item?.assinaturaDigital ??
      null,
    token_validacao: item?.token_validacao ?? item?.tokenValidacao ?? null,
    itens: Array.isArray(item?.itens) ? item.itens : [],
  };
}

function normalizarItemEntregue(item) {
  return {
    id: item?.id ?? `${Date.now()}-${Math.random()}`,
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

function pad2(valor) {
  return String(valor).padStart(2, "0");
}

function dataLocalParaISO(data) {
  if (!data) return "";
  return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(
    data.getDate()
  )}`;
}

function obterHojeISO() {
  return dataLocalParaISO(new Date());
}

function obterPrimeiroDiaMesISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${pad2(hoje.getMonth() + 1)}-01`;
}

function obterPrimeiroDiaAnoISO() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-01-01`;
}

function obterDataMenosDiasISO(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return dataLocalParaISO(data);
}

function formatarDataBR(data) {
  if (!data) return "--";

  const texto = String(data).substring(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return "--";

  return dataObj.toLocaleDateString("pt-BR");
}

function obterTextoPeriodo(inicio, fim) {
  if (inicio && fim) {
    return `${formatarDataBR(inicio)} até ${formatarDataBR(fim)}`;
  }

  if (inicio && !fim) {
    return `A partir de ${formatarDataBR(inicio)}`;
  }

  if (!inicio && fim) {
    return `Até ${formatarDataBR(fim)}`;
  }

  return "Período completo (todos os registros)";
}

function escapeHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function filtrarEntregasPorPeriodo(lista, inicio, fim) {
  return lista.filter((entrega) => {
    const data = String(entrega?.dataEntrega || "").substring(0, 10);

    if (!data) return !inicio && !fim;
    if (inicio && data < inicio) return false;
    if (fim && data > fim) return false;

    return true;
  });
}

function totalItensDaLista(lista) {
  return lista.reduce((acc, entrega) => {
    const subtotal = (entrega?.itens || []).reduce(
      (soma, item) => soma + Number(item?.quantidade ?? 0),
      0
    );
    return acc + subtotal;
  }, 0);
}

function totalTiposDaLista(lista) {
  const tipos = new Set();

  lista.forEach((entrega) => {
    (entrega?.itens || []).forEach((item) => {
      tipos.add(`${item?.epiNome || ""}::${item?.tamanho || ""}`);
    });
  });

  return tipos.size;
}

function abrirJanelaImpressao(html) {
  const win = window.open("", "", "width=1100,height=750");

  if (!win) {
    window.alert(
      "Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-up."
    );
    return;
  }

  win.document.write(html);
  win.document.close();
}

function ModalPeriodoRelatorio({
  aberto,
  tipo,
  funcionario,
  inicio,
  fim,
  erro,
  resumo,
  onClose,
  onChangeInicio,
  onChangeFim,
  onConfirmar,
  onLimpar,
  onAplicarAtalho,
}) {
  if (!aberto) return null;

  const titulo =
    tipo === "funcionario"
      ? "Selecionar período do funcionário"
      : "Selecionar período geral";

  const subtitulo =
    tipo === "funcionario"
      ? `Escolha o intervalo de entregas para ${funcionario?.nome || "o funcionário"}`
      : "Escolha o intervalo para imprimir a distribuição de EPIs de todos os funcionários";

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{titulo}</h3>
              <p className="text-sm text-blue-100 mt-1">{subtitulo}</p>

              {tipo === "funcionario" && funcionario && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold">{funcionario.nome}</span>
                  <span className="text-xs text-blue-100">
                    Matrícula: {funcionario.matricula || "--"}
                  </span>
                </div>
              )}
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

        <div className="p-6">
          <div className="mb-5">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500 block mb-3">
              Atalhos rápidos
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAplicarAtalho({ inicio: "", fim: "" })}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Todo o período
              </button>

              <button
                type="button"
                onClick={() =>
                  onAplicarAtalho({
                    inicio: obterPrimeiroDiaMesISO(),
                    fim: obterHojeISO(),
                  })
                }
                className="px-3 py-2 rounded-lg border border-blue-200 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
              >
                Mês atual
              </button>

              <button
                type="button"
                onClick={() =>
                  onAplicarAtalho({
                    inicio: obterDataMenosDiasISO(30),
                    fim: obterHojeISO(),
                  })
                }
                className="px-3 py-2 rounded-lg border border-blue-200 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
              >
                Últimos 30 dias
              </button>

              <button
                type="button"
                onClick={() =>
                  onAplicarAtalho({
                    inicio: obterPrimeiroDiaAnoISO(),
                    fim: obterHojeISO(),
                  })
                }
                className="px-3 py-2 rounded-lg border border-blue-200 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
              >
                Ano atual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">
                Data inicial
              </label>
              <input
                type="date"
                value={inicio}
                onChange={(e) => onChangeInicio(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">
                Data final
              </label>
              <input
                type="date"
                value={fim}
                onChange={(e) => onChangeFim(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {erro ? (
            <div className="mt-4 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
              {erro}
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Período selecionado
              </span>
              <strong className="text-sm text-gray-800">
                {obterTextoPeriodo(inicio, fim)}
              </strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Entregas encontradas
              </span>
              <strong className="text-2xl text-blue-700">{resumo.totalEntregas}</strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Itens no período
              </span>
              <strong className="text-2xl text-indigo-700">{resumo.totalItens}</strong>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
            <button
              type="button"
              onClick={onLimpar}
              className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
            >
              Limpar datas
            </button>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onConfirmar}
                className="px-5 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition shadow-sm"
              >
                🖨️ Gerar relatório
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Entregas({ usuarioLogado }) {
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
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");

  const [modalPeriodoAberto, setModalPeriodoAberto] = useState(false);
  const [tipoRelatorioModal, setTipoRelatorioModal] = useState("geral");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [periodoRelatorioInicio, setPeriodoRelatorioInicio] = useState("");
  const [periodoRelatorioFim, setPeriodoRelatorioFim] = useState("");
  const [erroPeriodoModal, setErroPeriodoModal] = useState("");

  const itensPorPagina = 5;

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_dashboard");

  const carregarEntregas = async () => {
    setCarregando(true);
    setErroTela("");

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
      console.error("Erro ao carregar entregas:", erro);
      setErroTela(
        erro?.message || "Não foi possível carregar os dados das entregas."
      );
      setFuncionarios(mockFuncionarios.map(normalizarFuncionario));
      setEpis(mockEpis.map(normalizarEpi));
      setTamanhos(mockTamanhos.map(normalizarTamanho));
      setEntregas(mockEntregasInicial.map(normalizarEntrega));
      setItensEntregues(mockItensEntreguesInicial.map(normalizarItemEntregue));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEntregas();
  }, []);

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
          : (entrega.itens || []).map((item, index) => ({
              id: item.id ?? `${entrega.id}-${index}`,
              epiNome: item.epiNome || item.nome || "EPI não identificado",
              tamanho: item.tamanho || item.tamanhoNome || "-",
              quantidade: Number(item.quantidade ?? 0),
            }));

      return {
        id: entrega.id,
        idFuncionario: entrega.idFuncionario,
        dataEntrega: String(entrega.data_entrega || "").substring(0, 10),
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

      if (dataInicio) {
        matchData = matchData && entrega.dataEntrega >= dataInicio;
      }

      if (dataFim) {
        matchData = matchData && entrega.dataEntrega <= dataFim;
      }

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

  const estatisticasTela = useMemo(() => {
    return {
      totalEntregas: entregasOrdenadas.length,
      totalItens: totalItensDaLista(entregasOrdenadas),
      totalTipos: totalTiposDaLista(entregasOrdenadas),
    };
  }, [entregasOrdenadas]);

  const baseDoModalPeriodo = useMemo(() => {
    if (tipoRelatorioModal === "funcionario" && funcionarioSelecionado) {
      return entregasResolvidas
        .filter(
          (entrega) =>
            Number(entrega.idFuncionario) === Number(funcionarioSelecionado.id)
        )
        .sort((a, b) => {
          if (a.dataEntrega > b.dataEntrega) return -1;
          if (a.dataEntrega < b.dataEntrega) return 1;
          return 0;
        });
    }

    return [...entregasResolvidas].sort((a, b) => {
      if (a.dataEntrega > b.dataEntrega) return -1;
      if (a.dataEntrega < b.dataEntrega) return 1;
      return 0;
    });
  }, [tipoRelatorioModal, funcionarioSelecionado, entregasResolvidas]);

  const resumoModalPeriodo = useMemo(() => {
    const lista = filtrarEntregasPorPeriodo(
      baseDoModalPeriodo,
      periodoRelatorioInicio,
      periodoRelatorioFim
    );

    return {
      totalEntregas: lista.length,
      totalItens: totalItensDaLista(lista),
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
    if (!funcionario) return;

    setTipoRelatorioModal("funcionario");
    setFuncionarioSelecionado(funcionario);
    setPeriodoRelatorioInicio(dataInicio || "");
    setPeriodoRelatorioFim(dataFim || "");
    setErroPeriodoModal("");
    setModalPeriodoAberto(true);
  };

  const gerarHtmlRelatorio = ({
    tipo = "geral",
    funcionario = null,
    registros = [],
    inicio = "",
    fim = "",
  }) => {
    const periodoTexto = obterTextoPeriodo(inicio, fim);
    const dataEmissao = new Date().toLocaleDateString("pt-BR");
    const horaEmissao = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const totalEntregas = registros.length;
    const totalItens = totalItensDaLista(registros);
    const totalTipos = totalTiposDaLista(registros);

    const tituloPrincipal =
      tipo === "funcionario"
        ? "Histórico Individual de Entregas de EPIs"
        : "Relatório Geral de Distribuição de EPIs";

    const subtituloPrincipal =
      tipo === "funcionario"
        ? `${funcionario?.nome || "Funcionário não identificado"} • Matrícula ${
            funcionario?.matricula || "--"
          }`
        : "Todos os funcionários";

    const linhasTabela =
      registros.length > 0
        ? registros
            .map((ent) => {
              const funcionarioNome = escapeHtml(
                ent.funcionario?.nome || "Não identificado"
              );
              const matricula = escapeHtml(ent.funcionario?.matricula || "--");

              const itensHtml =
                ent.itens?.length > 0
                  ? ent.itens
                      .map((item) => {
                        const epi = escapeHtml(item.epiNome || "EPI");
                        const tamanho = escapeHtml(item.tamanho || "-");
                        const quantidade = Number(item.quantidade || 0);

                        return `<span class="item-tag">${epi} (${tamanho}) <strong>x${quantidade}</strong></span>`;
                      })
                      .join(" ")
                  : `<span class="sem-itens">Sem itens vinculados</span>`;

              const assinaturaHtml =
                ent.assinatura || ent.tokenValidacao
                  ? `<span class="tag tag-ok">Registrada digitalmente</span>`
                  : `<div class="assinatura-vazia"></div><span class="assinatura-legenda">Assinatura física</span>`;

              return `
                <tr>
                  <td class="col-data">${formatarDataBR(ent.dataEntrega)}</td>
                  <td class="col-funcionario">
                    <div class="funcionario-nome">${funcionarioNome}</div>
                    <div class="funcionario-meta">Matrícula: ${matricula}</div>
                  </td>
                  <td class="col-itens">${itensHtml}</td>
                  <td class="col-assinatura">${assinaturaHtml}</td>
                </tr>
              `;
            })
            .join("")
        : `
          <tr>
            <td colspan="4" class="sem-registros">
              Nenhum registro encontrado para o período selecionado.
            </td>
          </tr>
        `;

    return `
      <html>
        <head>
          <title>${escapeHtml(tituloPrincipal)}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap');

            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'Roboto', sans-serif;
              margin: 0;
              padding: 32px;
              color: #1f2937;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .topbar {
              border: 1px solid #dbeafe;
              background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
              border-radius: 18px;
              padding: 22px 24px;
              margin-bottom: 24px;
            }

            .topbar-grid {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 24px;
            }

            .topbar h1 {
              margin: 0;
              font-size: 24px;
              color: #1d4ed8;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.02em;
            }

            .topbar p {
              margin: 8px 0 0;
              color: #475569;
              font-size: 13px;
            }

            .meta-box {
              min-width: 260px;
              border: 1px solid #dbeafe;
              background: #ffffff;
              border-radius: 14px;
              padding: 14px 16px;
            }

            .meta-row {
              font-size: 12px;
              color: #334155;
              line-height: 1.6;
              margin-bottom: 2px;
            }

            .cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 20px;
            }

            .card {
              border: 1px solid #e5e7eb;
              border-radius: 14px;
              padding: 16px;
              background: #f8fafc;
            }

            .card .label {
              display: block;
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .card .value {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
            }

            .section-title {
              font-size: 13px;
              font-weight: 800;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin: 0 0 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              overflow: hidden;
              border-radius: 16px;
              border: 1px solid #e5e7eb;
            }

            thead th {
              text-align: left;
              padding: 12px 14px;
              background: #0f172a;
              color: #ffffff;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            tbody td {
              padding: 14px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: top;
              font-size: 12px;
            }

            tbody tr:nth-child(even) {
              background: #fafafa;
            }

            .col-data {
              width: 12%;
              white-space: nowrap;
              font-weight: 700;
              color: #334155;
            }

            .col-funcionario {
              width: 25%;
            }

            .col-itens {
              width: 43%;
            }

            .col-assinatura {
              width: 20%;
              text-align: center;
            }

            .funcionario-nome {
              font-size: 13px;
              font-weight: 800;
              color: #111827;
              margin-bottom: 4px;
            }

            .funcionario-meta {
              font-size: 11px;
              color: #6b7280;
            }

            .item-tag {
              display: inline-block;
              padding: 5px 8px;
              margin: 2px;
              border-radius: 999px;
              background: #eff6ff;
              color: #1d4ed8;
              border: 1px solid #bfdbfe;
              font-size: 11px;
              font-weight: 500;
            }

            .tag {
              display: inline-block;
              padding: 6px 10px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 700;
            }

            .tag-ok {
              color: #166534;
              background: #dcfce7;
              border: 1px solid #bbf7d0;
            }

            .assinatura-vazia {
              width: 80%;
              margin: 10px auto 6px;
              border-bottom: 1px solid #94a3b8;
              min-height: 20px;
            }

            .assinatura-legenda {
              font-size: 10px;
              color: #6b7280;
              font-style: italic;
            }

            .sem-itens {
              color: #94a3b8;
              font-style: italic;
            }

            .sem-registros {
              text-align: center;
              color: #6b7280;
              padding: 24px;
              font-style: italic;
            }

            .footer {
              margin-top: 28px;
              display: flex;
              justify-content: space-between;
              gap: 20px;
            }

            .assinatura-box {
              width: 48%;
              padding-top: 42px;
              border-top: 1px solid #334155;
              text-align: center;
              font-size: 11px;
              color: #475569;
            }

            .obs {
              margin-top: 24px;
              padding: 14px 16px;
              border-radius: 12px;
              background: #f8fafc;
              border: 1px solid #e5e7eb;
              color: #475569;
              font-size: 10px;
              line-height: 1.55;
            }

            @media print {
              body {
                padding: 18px;
              }

              .topbar {
                break-inside: avoid;
              }

              table, tr, td, th {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="topbar">
            <div class="topbar-grid">
              <div>
                <h1>${escapeHtml(tituloPrincipal)}</h1>
                <p>${escapeHtml(subtituloPrincipal)}</p>
              </div>

              <div class="meta-box">
                <div class="meta-row"><strong>Período:</strong> ${escapeHtml(periodoTexto)}</div>
                <div class="meta-row"><strong>Emissão:</strong> ${escapeHtml(dataEmissao)}</div>
                <div class="meta-row"><strong>Hora:</strong> ${escapeHtml(horaEmissao)}</div>
                <div class="meta-row"><strong>Tipo:</strong> ${
                  tipo === "funcionario" ? "Relatório individual" : "Relatório geral"
                }</div>
              </div>
            </div>
          </div>

          <div class="cards">
            <div class="card">
              <span class="label">Entregas</span>
              <span class="value">${totalEntregas}</span>
            </div>

            <div class="card">
              <span class="label">Itens distribuídos</span>
              <span class="value">${totalItens}</span>
            </div>

            <div class="card">
              <span class="label">Tipos de item</span>
              <span class="value">${totalTipos}</span>
            </div>
          </div>

          <h2 class="section-title">Detalhamento das entregas</h2>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Colaborador</th>
                <th>Itens entregues</th>
                <th>Assinatura</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>

          <div class="footer">
            <div class="assinatura-box">
              Responsável pela Entrega
            </div>
            <div class="assinatura-box">
              Técnico de Segurança / Conferência
            </div>
          </div>

          <div class="obs">
            Declaro, para os devidos fins, que o presente relatório representa o histórico de fornecimento de EPIs conforme os registros lançados no sistema. Recomenda-se a conferência periódica dos dados e das assinaturas em conformidade com a NR-06 e as rotinas internas da empresa.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
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

    const filtradas = filtrarEntregasPorPeriodo(
      [...baseDoModalPeriodo],
      periodoRelatorioInicio,
      periodoRelatorioFim
    );

    if (filtradas.length === 0) {
      window.alert("Nenhuma entrega foi encontrada para o período selecionado.");
      return;
    }

    const html = gerarHtmlRelatorio({
      tipo: tipoRelatorioModal,
      funcionario: funcionarioSelecionado,
      registros: filtradas,
      inicio: periodoRelatorioInicio,
      fim: periodoRelatorioFim,
    });

    abrirJanelaImpressao(html);
    resetarModalPeriodo();
  };

  const aoSalvarEntrega = async () => {
    setModalAberto(false);
    await carregarEntregas();
    setPaginaAtual(1);
  };

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de entregas.
        </div>
      </div>
    );
  }

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
            <label className="text-xs text-gray-500 mb-1 block">
              De (data inicial)
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => aoMudarFiltro(setDataInicio, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Até (data final)
            </label>
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
                  setBusca("");
                  setDataInicio("");
                  setDataFim("");
                  setPaginaAtual(1);
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
                <div
                  key={e.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                >
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
                          <span
                            key={i.id}
                            className="bg-white text-blue-800 text-xs px-2 py-1 rounded border border-blue-100 shadow-sm"
                          >
                            {i.epiNome} <span className="text-gray-400">|</span> Tam:{" "}
                            {i.tamanho} <span className="text-gray-400">|</span>{" "}
                            <b>x{i.quantidade}</b>
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
    </div>
  );
}

export default Entregas;