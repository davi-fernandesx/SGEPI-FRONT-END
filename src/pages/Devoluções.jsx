import { useEffect, useMemo, useState } from "react";
import ModalBaixa from "../components/modals/ModalBaixa";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";

const mockFuncionarios = [
  { id: 1, nome: "João Silva", matricula: "483920" },
  { id: 2, nome: "Maria Santos", matricula: "739104" },
  { id: 3, nome: "Carlos Oliveira", matricula: "102938" },
  { id: 4, nome: "Ana Pereira", matricula: "554433" },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança" },
  { id: 2, nome: "Sapato de Segurança" },
  { id: 3, nome: "Luva de Proteção" },
  { id: 4, nome: "Protetor Auricular" },
];

const mockTamanhos = [
  { id: 1, tamanho: "P" },
  { id: 2, tamanho: "M" },
  { id: 3, tamanho: "G" },
  { id: 4, tamanho: "38" },
  { id: 5, tamanho: "40" },
  { id: 6, tamanho: "42" },
  { id: 7, tamanho: "44" },
  { id: 8, tamanho: "Único" },
];

const mockMotivos = [
  { id: 1, nome: "Desgaste Natural" },
  { id: 2, nome: "Desligamento / Demissão" },
  { id: 3, nome: "Dano / Quebra Acidental" },
];

const mockDevolucoesInicial = [
  {
    id: 101,
    idFuncionario: 1,
    idEpi: 1,
    idMotivo: 1,
    data_devolucao: "2024-01-22",
    idTamanho: 2,
    quantidadeADevolver: 1,
    idEpiNovo: 1,
    idTamanhoNovo: 2,
    quantidadeNova: 1,
    assinatura_digital: null,
    token_validacao: null,
  },
  {
    id: 102,
    idFuncionario: 2,
    idEpi: 3,
    idMotivo: 2,
    data_devolucao: "2024-01-25",
    idTamanho: 1,
    quantidadeADevolver: 1,
    idEpiNovo: null,
    idTamanhoNovo: null,
    quantidadeNova: null,
    assinatura_digital: null,
    token_validacao: null,
  },
  {
    id: 103,
    idFuncionario: 3,
    idEpi: 2,
    idMotivo: 3,
    data_devolucao: "2024-02-10",
    idTamanho: 6,
    quantidadeADevolver: 1,
    idEpiNovo: 2,
    idTamanhoNovo: 6,
    quantidadeNova: 1,
    assinatura_digital: null,
    token_validacao: null,
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
      // tenta a próxima rota
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

function normalizarMotivo(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? item?.descricao ?? "",
  };
}

function normalizarDevolucao(item) {
  const trocaLegada = item?.troca || null;

  return {
    id: Number(item?.id ?? Date.now() + Math.random()),

    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.id_funcionario ??
        item?.funcionario ??
        item?.funcionario?.id ??
        0
    ),

    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.epiId ??
        item?.id_epi ??
        item?.epi ??
        item?.epi?.id ??
        0
    ),

    idMotivo: Number(
      item?.idMotivo ??
        item?.motivo_id ??
        item?.motivoId ??
        item?.id_motivo ??
        item?.motivo?.id ??
        0
    ),

    data_devolucao: item?.data_devolucao ?? item?.dataDevolucao ?? item?.data ?? "",

    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.tamanhoId ??
        item?.id_tamanho ??
        0
    ),

    quantidadeADevolver: Number(
      item?.quantidadeADevolver ??
        item?.quantidade_a_devolver ??
        item?.quantidade ??
        0
    ),

    idEpiNovo: Number(
      item?.idEpiNovo ??
        item?.epi_novo_id ??
        item?.epiNovoId ??
        trocaLegada?.novoEpi ??
        0
    ),

    idTamanhoNovo: Number(
      item?.idTamanhoNovo ??
        item?.tamanho_novo_id ??
        item?.tamanhoNovoId ??
        0
    ),

    quantidadeNova: Number(
      item?.quantidadeNova ??
        item?.quantidade_nova ??
        trocaLegada?.novaQuantidade ??
        0
    ),

    assinatura_digital:
      item?.assinatura_digital ??
      item?.assinaturaDigital ??
      item?.assinatura ??
      null,

    token_validacao: item?.token_validacao ?? item?.tokenValidacao ?? null,

    observacao: item?.observacao ?? item?.observacoes ?? item?.obs ?? "",

    motivoTextoFallback:
      typeof item?.motivo === "string" ? item.motivo : item?.motivo?.nome || "",

    tamanhoTextoFallback: typeof item?.tamanho === "string" ? item.tamanho : "",

    novoTamanhoTextoFallback:
      trocaLegada?.novoTamanho ?? item?.novoTamanho ?? "",

    nomeFuncionarioFallback:
      item?.nome_funcionario ??
      item?.funcionarioNome ??
      item?.funcionario?.nome ??
      "",

    nomeEpiFallback: item?.nome_epi ?? item?.epiNome ?? item?.epi?.nome ?? "",
    nomeEpiNovoFallback:
      item?.nome_epi_novo ?? item?.epiNovoNome ?? item?.epiNovo?.nome ?? "",

    trocaLegada,
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

function formatarData(data) {
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
  if (inicio && fim) return `${formatarData(inicio)} até ${formatarData(fim)}`;
  if (inicio && !fim) return `A partir de ${formatarData(inicio)}`;
  if (!inicio && fim) return `Até ${formatarData(fim)}`;
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

function filtrarPorPeriodo(lista, inicio, fim) {
  return lista.filter((item) => {
    const data = String(item?.data_devolucao || "").substring(0, 10);

    if (!data) return !inicio && !fim;
    if (inicio && data < inicio) return false;
    if (fim && data > fim) return false;

    return true;
  });
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

function ModalPeriodoRelatorioDevolucao({
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
      ? `Escolha o intervalo de devoluções para ${
          funcionario?.nome || "o funcionário"
        }`
      : "Escolha o intervalo para imprimir o relatório geral de devoluções";

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-red-700 to-rose-700 text-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{titulo}</h3>
              <p className="text-sm text-red-100 mt-1">{subtitulo}</p>

              {tipo === "funcionario" && funcionario && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold">{funcionario.nome}</span>
                  <span className="text-xs text-red-100">
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
                className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition"
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
                className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition"
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
                className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition"
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
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
                Devoluções encontradas
              </span>
              <strong className="text-2xl text-red-700">
                {resumo.totalDevolucoes}
              </strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Trocas no período
              </span>
              <strong className="text-2xl text-emerald-700">
                {resumo.totalTrocas}
              </strong>
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
                className="px-5 py-3 rounded-xl bg-red-700 text-white font-bold hover:bg-red-800 transition shadow-sm"
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

function Devolucoes({ usuarioLogado }) {
  const [devolucoes, setDevolucoes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [motivos, setMotivos] = useState([]);

  const [carregandoTela, setCarregandoTela] = useState(true);
  const [erroTela, setErroTela] = useState("");

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
  const podeCadastrar = !usuarioLogado
    ? true
    : perfilUsuario === "admin" || perfilUsuario === "gerente";

  const carregarDevolucoes = async () => {
    setCarregandoTela(true);
    setErroTela("");

    try {
      const [
        listaFuncionarios,
        listaEpis,
        listaTamanhos,
        listaMotivos,
        listaDevolucoes,
      ] = await Promise.all([
        buscarPrimeiraLista(["/funcionarios"], mockFuncionarios),
        buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
        buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
        buscarPrimeiraLista(
          [
            "/motivos-devolucao",
            "/motivo-devolucao",
            "/motivos_baixa",
            "/motivos",
          ],
          mockMotivos
        ),
        buscarPrimeiraLista(
          ["/devolucoes", "/devolucao", "/baixas"],
          mockDevolucoesInicial
        ),
      ]);

      setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
      setEpis(listaEpis.map(normalizarEpi));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
      setMotivos(listaMotivos.map(normalizarMotivo));
      setDevolucoes(listaDevolucoes.map(normalizarDevolucao));
    } catch (erro) {
      console.error("Erro ao carregar devoluções:", erro);
      setErroTela(
        erro?.message || "Não foi possível carregar os registros de devolução."
      );
      setFuncionarios(mockFuncionarios.map(normalizarFuncionario));
      setEpis(mockEpis.map(normalizarEpi));
      setTamanhos(mockTamanhos.map(normalizarTamanho));
      setMotivos(mockMotivos.map(normalizarMotivo));
      setDevolucoes(mockDevolucoesInicial.map(normalizarDevolucao));
    } finally {
      setCarregandoTela(false);
    }
  };

  useEffect(() => {
    carregarDevolucoes();
  }, []);

  const aoMudarFiltro = (setter, valor) => {
    setter(valor);
    setPaginaAtual(1);
  };

  const devolucoesResolvidas = useMemo(() => {
    return devolucoes.map((d) => {
      const funcionario = funcionarios.find(
        (f) => Number(f.id) === Number(d.idFuncionario)
      );
      const epi = epis.find((e) => Number(e.id) === Number(d.idEpi));
      const tamanho = tamanhos.find((t) => Number(t.id) === Number(d.idTamanho));
      const motivo = motivos.find((m) => Number(m.id) === Number(d.idMotivo));

      const epiNovo = epis.find((e) => Number(e.id) === Number(d.idEpiNovo));
      const tamanhoNovo = tamanhos.find(
        (t) => Number(t.id) === Number(d.idTamanhoNovo)
      );

      const houveTroca =
        Number(d.idEpiNovo || 0) > 0 ||
        Number(d.idTamanhoNovo || 0) > 0 ||
        Number(d.quantidadeNova || 0) > 0 ||
        !!d.trocaLegada;

      return {
        ...d,
        funcionarioNome:
          funcionario?.nome || d.nomeFuncionarioFallback || "Desconhecido",
        funcionarioMatricula: funcionario?.matricula || "--",
        epiNome: epi?.nome || d.nomeEpiFallback || "EPI não identificado",
        tamanhoNome: tamanho?.tamanho || d.tamanhoTextoFallback || "-",
        motivoNome:
          motivo?.nome || d.motivoTextoFallback || "Motivo não identificado",
        houveTroca,
        epiNovoNome:
          epiNovo?.nome ||
          d.nomeEpiNovoFallback ||
          (houveTroca ? "EPI de troca" : null),
        tamanhoNovoNome:
          tamanhoNovo?.tamanho || d.novoTamanhoTextoFallback || "-",
      };
    });
  }, [devolucoes, funcionarios, epis, tamanhos, motivos]);

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
    if (paginaAtual > total) setPaginaAtual(total);
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
          (item) =>
            Number(item.idFuncionario) === Number(funcionarioSelecionado.id)
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

  const gerarHtmlRelatorioDevolucoes = ({
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

    const totalDevolucoes = registros.length;
    const totalTrocas = registros.filter((item) => item.houveTroca).length;
    const totalSemTroca = totalDevolucoes - totalTrocas;

    const tituloPrincipal =
      tipo === "funcionario"
        ? "Histórico Individual de Devoluções"
        : "Relatório Geral de Devoluções de EPI";

    const subtituloPrincipal =
      tipo === "funcionario"
        ? `${funcionario?.nome || "Funcionário não identificado"} • Matrícula ${
            funcionario?.matricula || "--"
          }`
        : "Todos os funcionários";

    const linhasTabela =
      registros.length > 0
        ? registros
            .map((d) => {
              const funcionarioNome = escapeHtml(
                d.funcionarioNome || "Não identificado"
              );
              const matricula = escapeHtml(d.funcionarioMatricula || "--");
              const epiNome = escapeHtml(d.epiNome || "EPI não identificado");
              const tamanhoNome = escapeHtml(d.tamanhoNome || "-");
              const motivoNome = escapeHtml(
                d.motivoNome || "Motivo não identificado"
              );
              const quantidade = Number(d.quantidadeADevolver || 0);

              const trocaHtml = d.houveTroca
                ? `<div class="troca-box">
                    <span class="tag tag-ok">Houve troca</span>
                    <div class="troca-detalhe">
                      Novo item: <strong>${escapeHtml(
                        d.epiNovoNome || "EPI de troca"
                      )}</strong> (${escapeHtml(
                    d.tamanhoNovoNome || "-"
                  )}) • Quantidade: <strong>${Number(d.quantidadeNova || 0)}</strong>
                    </div>
                  </div>`
                : `<span class="tag tag-muted">Sem troca</span>`;

              const assinaturaHtml =
                d.assinatura_digital || d.token_validacao
                  ? `<span class="tag tag-ok">Registrada digitalmente</span>`
                  : `<div class="assinatura-vazia"></div><span class="assinatura-legenda">Assinatura física</span>`;

              return `
                <tr>
                  <td class="col-data">${formatarData(d.data_devolucao)}</td>
                  <td class="col-funcionario">
                    <div class="funcionario-nome">${funcionarioNome}</div>
                    <div class="funcionario-meta">Matrícula: ${matricula}</div>
                  </td>
                  <td class="col-item">
                    <div class="item-principal">${epiNome} (${tamanhoNome})</div>
                    <div class="item-sub">Quantidade devolvida: <strong>${quantidade}</strong></div>
                  </td>
                  <td class="col-motivo">${motivoNome}</td>
                  <td class="col-troca">${trocaHtml}</td>
                  <td class="col-assinatura">${assinaturaHtml}</td>
                </tr>
              `;
            })
            .join("")
        : `
          <tr>
            <td colspan="6" class="sem-registros">
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

            * { box-sizing: border-box; }

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
              border: 1px solid #fecaca;
              background: linear-gradient(135deg, #fff1f2 0%, #ffffff 100%);
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
              color: #b91c1c;
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
              border: 1px solid #fecaca;
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
              background: #7f1d1d;
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

            .col-data { width: 10%; white-space: nowrap; font-weight: 700; color: #334155; }
            .col-funcionario { width: 20%; }
            .col-item { width: 22%; }
            .col-motivo { width: 18%; }
            .col-troca { width: 20%; }
            .col-assinatura { width: 10%; text-align: center; }

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

            .item-principal {
              font-size: 12px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 4px;
            }

            .item-sub {
              font-size: 11px;
              color: #6b7280;
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

            .tag-muted {
              color: #475569;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
            }

            .troca-box { display: block; }

            .troca-detalhe {
              margin-top: 8px;
              font-size: 11px;
              color: #334155;
              line-height: 1.5;
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
              body { padding: 18px; }
              .topbar { break-inside: avoid; }
              table, tr, td, th { break-inside: avoid; }
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
              <span class="label">Devoluções</span>
              <span class="value">${totalDevolucoes}</span>
            </div>

            <div class="card">
              <span class="label">Com troca</span>
              <span class="value">${totalTrocas}</span>
            </div>

            <div class="card">
              <span class="label">Sem troca</span>
              <span class="value">${totalSemTroca}</span>
            </div>
          </div>

          <h2 class="section-title">Detalhamento das devoluções</h2>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Colaborador</th>
                <th>Item devolvido</th>
                <th>Motivo</th>
                <th>Troca</th>
                <th>Assinatura</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>

          <div class="footer">
            <div class="assinatura-box">
              Responsável pelo Almoxarifado
            </div>
            <div class="assinatura-box">
              Técnico de Segurança do Trabalho
            </div>
          </div>

          <div class="obs">
            Declaro, para os devidos fins, que o presente relatório representa o histórico de devoluções e trocas de EPIs conforme os registros lançados no sistema. Recomenda-se a conferência periódica dos dados e das assinaturas em conformidade com a NR-06 e com as rotinas internas da empresa.
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
    const itemLocal = normalizarDevolucao({
      id: novaDevolucao?.id ?? Date.now(),
      ...novaDevolucao,
    });

    setDevolucoes((prev) => {
      const semDuplicado = prev.filter(
        (item) => Number(item.id) !== Number(itemLocal.id)
      );
      return [itemLocal, ...semDuplicado];
    });

    setPaginaAtual(1);
    setModalAberto(false);
  };

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de devoluções.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
            🔄 Devoluções e Trocas
          </h2>
          <p className="text-sm text-gray-500">
            Registre, filtre e imprima relatórios de devoluções conforme a tabela
            devolução.
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
            {carregandoTela ? "--" : resumoTela.totalDevolucoes}
          </strong>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <span className="text-[11px] text-emerald-700 uppercase font-bold tracking-wide block mb-1">
            Com troca
          </span>
          <strong className="text-2xl text-emerald-900">
            {carregandoTela ? "--" : resumoTela.totalTrocas}
          </strong>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="text-[11px] text-gray-600 uppercase font-bold tracking-wide block mb-1">
            Sem troca
          </span>
          <strong className="text-2xl text-gray-900">
            {carregandoTela ? "--" : resumoTela.totalSemTroca}
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
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {carregandoTela ? (
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
                        {d.epiNome}{" "}
                        <small className="text-gray-400">({d.tamanhoNome})</small>
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
                          {d.epiNovoNome} ({d.tamanhoNovoNome}) x
                          {d.quantidadeNova || 0}
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
