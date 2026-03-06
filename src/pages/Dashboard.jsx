import { useEffect, useMemo, useState } from "react";

import ModalEntrada from "../components/modals/ModalEntrada";
import ModalEntrega from "../components/modals/ModalEntrega";
import ModalBaixa from "../components/modals/ModalBaixa";
import ModalBusca from "../components/modals/ModalBusca";
import { api } from "../services/api";

const mockEpis = [
  {
    id: 1,
    nome: "Bota de Segurança",
    fabricante: "Bracol",
    CA: "15432",
    descricao: "Bota ocupacional para uso industrial",
    validade_CA: "2027-12-31T00:00:00Z",
    idTipoProtecao: 6,
    alerta_minimo: 10,
  },
  {
    id: 2,
    nome: "Óculos de Proteção Incolor",
    fabricante: "3M",
    CA: "10346",
    descricao: "Proteção visual contra partículas",
    validade_CA: "2028-06-30T00:00:00Z",
    idTipoProtecao: 4,
    alerta_minimo: 20,
  },
];

const mockEntradas = [
  {
    id: 101,
    idEpi: 1,
    idTamanho: 7,
    idFornecedor: 2,
    data_entrada: "2026-03-01",
    quantidade: 30,
    quantidadeAtual: 18,
    data_fabricacao: "2026-01-10",
    data_validade: "2027-12-31",
    lote: "BOTA-001",
    valor_unitario: 129.9,
  },
  {
    id: 102,
    idEpi: 2,
    idTamanho: 9,
    idFornecedor: 1,
    data_entrada: "2026-03-02",
    quantidade: 100,
    quantidadeAtual: 65,
    data_fabricacao: "2026-02-01",
    data_validade: "2028-06-30",
    lote: "OCULOS-003",
    valor_unitario: 15.5,
  },
];

const mockEntregas = [
  {
    id: 201,
    idFuncionario: 1,
    data_entrega: new Date().toISOString().split("T")[0],
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 202,
    idFuncionario: 2,
    data_entrega: new Date().toISOString().split("T")[0],
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 203,
    idFuncionario: 3,
    data_entrega: "2026-03-01",
    assinatura: null,
    token_validacao: null,
  },
];

const mockDevolucoes = [
  {
    id: 301,
    idFuncionario: 1,
    idEpi: 1,
    idMotivo: 1,
    data_devolucao: "2026-03-01",
    idTamanho: 7,
    quantidadeADevolver: 1,
    idEpiNovo: 1,
    idTamanhoNovo: 7,
    quantidadeNova: 1,
    assinatura_digital: null,
    token_validacao: null,
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
      // tenta próxima rota
    }
  }
  return fallback;
}

function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    alerta_minimo: Number(item?.alerta_minimo ?? item?.alertaMinimo ?? 0),
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
    quantidade: Number(item?.quantidade ?? 0),
    quantidadeAtual: Number(
      item?.quantidadeAtual ??
        item?.quantidade_atual ??
        item?.estoqueAtual ??
        item?.estoque_atual ??
        item?.quantidade ??
        0
    ),
    valor_unitario: Number(item?.valor_unitario ?? item?.valorUnitario ?? item?.preco ?? 0),
    data_entrada: item?.data_entrada ?? item?.dataEntrada ?? "",
  };
}

function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    data_entrega:
      item?.data_entrega ??
      item?.dataEntrega ??
      item?.data ??
      "",
  };
}

function normalizarDevolucao(item) {
  return {
    id: Number(item?.id ?? 0),
    data_devolucao:
      item?.data_devolucao ??
      item?.dataDevolucao ??
      item?.data ??
      "",
  };
}

function Dashboard({ usuarioLogado }) {
  const [modalAberto, setModalAberto] = useState(null);

  const [epis, setEpis] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  const fecharModal = () => setModalAberto(null);

  const nomeExibicao =
    usuarioLogado?.nome || "usuário";

  const carregarResumo = async () => {
    setCarregandoResumo(true);

    try {
      const [listaEpis, listaEntradas, listaEntregas, listaDevolucoes] =
        await Promise.all([
          buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
          buscarPrimeiraLista(
            ["/entrada-epi", "/entrada_epi", "/entradas"],
            mockEntradas
          ),
          buscarPrimeiraLista(
            ["/entrega-epi", "/entrega_epi", "/entregas"],
            mockEntregas
          ),
          buscarPrimeiraLista(
            ["/devolucoes", "/devolucao"],
            mockDevolucoes
          ),
        ]);

      setEpis(listaEpis.map(normalizarEpi));
      setEntradas(listaEntradas.map(normalizarEntrada));
      setEntregas(listaEntregas.map(normalizarEntrega));
      setDevolucoes(listaDevolucoes.map(normalizarDevolucao));
    } finally {
      setCarregandoResumo(false);
    }
  };

  useEffect(() => {
    carregarResumo();
  }, []);

  const resumo = useMemo(() => {
    const hoje = new Date().toISOString().split("T")[0];

    const totalItens = entradas.reduce(
      (acc, entrada) => acc + Number(entrada.quantidadeAtual || 0),
      0
    );

    const entregasHoje = entregas.filter(
      (entrega) => String(entrega.data_entrega || "").substring(0, 10) === hoje
    ).length;

    const devolucoesHoje = devolucoes.filter(
      (devolucao) => String(devolucao.data_devolucao || "").substring(0, 10) === hoje
    ).length;

    const valorTotal = entradas.reduce(
      (acc, entrada) =>
        acc + Number(entrada.quantidadeAtual || 0) * Number(entrada.valor_unitario || 0),
      0
    );

    const estoquePorEpi = entradas.reduce((acc, entrada) => {
      const epiId = Number(entrada.idEpi);
      acc[epiId] = (acc[epiId] || 0) + Number(entrada.quantidadeAtual || 0);
      return acc;
    }, {});

    const alertas = epis.filter((epi) => {
      const estoqueAtual = estoquePorEpi[Number(epi.id)] || 0;
      const alertaMinimo = Number(epi.alerta_minimo || 0);
      return alertaMinimo > 0 && estoqueAtual <= alertaMinimo;
    }).length;

    return {
      totalItens,
      entregasHoje,
      devolucoesHoje,
      alertas,
      valorTotal,
    };
  }, [epis, entradas, entregas, devolucoes]);

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="animate-fade-in pb-20 md:pb-0">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Olá, <span className="text-blue-600">{nomeExibicao}</span> 👋
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Aqui está o resumo geral do sistema hoje.
          </p>
        </div>

        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-gray-400 uppercase">Status do Sistema</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-700">
              {carregandoResumo ? "Carregando..." : "Operacional"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-gray-500 text-[10px] md:text-sm font-bold uppercase truncate">
              Total em Estoque
            </h3>
            <span className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg text-xs md:text-base">
              📦
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">
            {carregandoResumo ? "--" : resumo.totalItens}
          </p>
          <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">
            Soma de quantidade atual
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-gray-500 text-[10px] md:text-sm font-bold uppercase truncate">
              Entregas Hoje
            </h3>
            <span className="p-1.5 md:p-2 bg-purple-50 text-purple-600 rounded-lg text-xs md:text-base">
              🚀
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">
            {carregandoResumo ? "--" : resumo.entregasHoje}
          </p>
          <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">
            Registros de hoje
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-gray-500 text-[10px] md:text-sm font-bold uppercase truncate">
              Alertas
            </h3>
            <span className="p-1.5 md:p-2 bg-orange-50 text-orange-600 rounded-lg text-xs md:text-base">
              ⚠️
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">
            {carregandoResumo ? "--" : resumo.alertas}
          </p>
          <p className="text-[10px] md:text-xs text-orange-600 mt-1 md:mt-2 font-bold">
            Estoque baixo
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-gray-500 text-[10px] md:text-sm font-bold uppercase truncate">
              Valor em Estoque
            </h3>
            <span className="p-1.5 md:p-2 bg-green-50 text-green-600 rounded-lg text-xs md:text-base">
              💲
            </span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-gray-800">
            {carregandoResumo ? "--" : formatarMoeda(resumo.valorTotal)}
          </p>
          <p className="text-[10px] md:text-xs text-gray-400 mt-1 md:mt-2">
            Baseado em quantidade atual
          </p>
        </div>
      </div>

      <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          📌 Resumo rápido
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-gray-500">EPIs cadastrados</p>
            <p className="text-lg font-bold text-gray-800">
              {carregandoResumo ? "--" : epis.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-gray-500">Entradas registradas</p>
            <p className="text-lg font-bold text-gray-800">
              {carregandoResumo ? "--" : entradas.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-gray-500">Devoluções hoje</p>
            <p className="text-lg font-bold text-gray-800">
              {carregandoResumo ? "--" : resumo.devolucoesHoje}
            </p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        ⚡ Ações Rápidas
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => setModalAberto("entrada")}
          className="group flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-base md:text-lg">Registrar Entrada</span>
            <span className="text-xs text-emerald-100 group-hover:text-white transition">
              Repor estoque / Compras
            </span>
          </div>
          <div className="bg-white/10 p-2 md:p-3 rounded-lg group-hover:bg-white/20 transition">
            <span className="text-xl md:text-2xl">➕</span>
          </div>
        </button>

        <button
          onClick={() => setModalAberto("entrega")}
          className="group flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-base md:text-lg">Realizar Entrega</span>
            <span className="text-xs text-blue-100 group-hover:text-white transition">
              Entregar EPI ao funcionário
            </span>
          </div>
          <div className="bg-white/10 p-2 md:p-3 rounded-lg group-hover:bg-white/20 transition">
            <span className="text-xl md:text-2xl">👷</span>
          </div>
        </button>

        <button
          onClick={() => setModalAberto("baixa")}
          className="group flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-base md:text-lg">Devolução / Baixa</span>
            <span className="text-xs text-rose-100 group-hover:text-white transition">
              Registrar devolução, dano ou descarte
            </span>
          </div>
          <div className="bg-white/10 p-2 md:p-3 rounded-lg group-hover:bg-white/20 transition">
            <span className="text-xl md:text-2xl">📉</span>
          </div>
        </button>

        <button
          onClick={() => setModalAberto("busca")}
          className="sm:col-span-2 lg:col-span-3 group flex items-center justify-center gap-3 p-4 md:p-5 bg-white border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
        >
          <span className="text-xl md:text-2xl">🔍</span>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-base md:text-lg">Consultar Estoque Rápido</span>
            <span className="text-xs text-gray-400 group-hover:text-blue-400 transition">
              Pesquisar por CA, nome, fabricante ou lote
            </span>
          </div>
        </button>
      </div>

      {modalAberto === "entrada" && <ModalEntrada onClose={fecharModal} />}
      {modalAberto === "entrega" && <ModalEntrega onClose={fecharModal} />}
      {modalAberto === "baixa" && <ModalBaixa onClose={fecharModal} />}
      {modalAberto === "busca" && <ModalBusca onClose={fecharModal} />}
    </div>
  );
}

export default Dashboard;