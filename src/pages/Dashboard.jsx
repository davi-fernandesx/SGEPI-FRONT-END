import { useMemo, useState } from "react";
import ModalEntrada from "../components/modals/ModalEntrada";
import ModalEntrega from "../components/modals/ModalEntrega";
import ModalBaixa from "../components/modals/ModalBaixa";
import ModalBusca from "../components/modals/ModalBusca";
import ModalDetalhesDashboard from "../components/modals/ModalDetalhesDashboard";
import DashboardCard from "../components/DashboardCard";
import QuickActionCard from "../components/QuickActionCard";
import { formatarMoeda } from "../utils/dashboardFormatters";
import { temPermissao } from "../utils/permissoes";
import { useDashboardResumo } from "../hooks/useDashboardResumo";

function Dashboard({ usuarioLogado }) {
  const [modalAberto, setModalAberto] = useState(null);
  const [detalheCardAberto, setDetalheCardAberto] = useState(null);

  const {
    epis,
    entradas,
    carregandoResumo,
    resumo,
    estoqueDetalhado,
    entregasHojeDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
    carregarResumo,
  } = useDashboardResumo();

  const fecharModal = () => setModalAberto(null);
  const fecharDetalheCard = () => setDetalheCardAberto(null);

  const nomeExibicao = usuarioLogado?.nome || "usuário";

  const podeVisualizarDashboard = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_dashboard");

  const aoSalvarModal = async () => {
    await carregarResumo();
    fecharModal();
  };

  const detalheCardAtual = useMemo(() => {
    if (detalheCardAberto === "estoque") {
      return {
        titulo: "Itens em estoque",
        subtitulo: "Visualização do estoque atual por item e tamanho.",
        icon: "📦",
        dados: estoqueDetalhado,
        colunas: [
          {
            key: "item",
            label: "Item",
            render: (item) => (
              <div className="font-semibold text-gray-800">{item.item}</div>
            ),
          },
          {
            key: "tamanho",
            label: "Tamanho",
            render: (item) => (
              <span className="inline-flex px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Total em Estoque",
            render: (item) => (
              <span className="font-bold text-gray-900">{item.quantidade}</span>
            ),
          },
        ],
      };
    }

    if (detalheCardAberto === "entregas") {
      return {
        titulo: "Entregas de hoje",
        subtitulo: "Lista do que foi entregue hoje e para quem foi entregue.",
        icon: "🚀",
        dados: entregasHojeDetalhadas,
        colunas: [
          {
            key: "data",
            label: "Data",
            render: (item) => <span className="font-medium">{item.data}</span>,
          },
          {
            key: "funcionario",
            label: "Para quem foi entregue",
            render: (item) => (
              <div>
                <div className="font-semibold text-gray-800">
                  {item.funcionario}
                </div>
                <div className="text-xs text-gray-500">
                  Matrícula: {item.matricula}
                </div>
              </div>
            ),
          },
          {
            key: "item",
            label: "Item entregue",
            render: (item) => (
              <div>
                <div className="font-medium">{item.item}</div>
                <div className="text-xs text-gray-500">
                  Tamanho: {item.tamanho}
                </div>
              </div>
            ),
          },
          {
            key: "quantidade",
            label: "Quantidade",
            render: (item) => (
              <span className="font-bold">{item.quantidade}</span>
            ),
          },
        ],
      };
    }

    if (detalheCardAberto === "alertas") {
      return {
        titulo: "Itens com alerta de estoque",
        subtitulo:
          "Itens que estão acabando com base no alerta mínimo configurado.",
        icon: "⚠️",
        dados: alertasDetalhados,
        colunas: [
          {
            key: "item",
            label: "Item",
            render: (item) => (
              <div className="font-semibold text-gray-800">{item.item}</div>
            ),
          },
          {
            key: "tamanho",
            label: "Tamanho",
            render: (item) => (
              <span className="inline-flex px-2 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Estoque Atual",
            render: (item) => (
              <span className="font-bold text-rose-600">{item.quantidade}</span>
            ),
          },
          {
            key: "alertaMinimo",
            label: "Alerta Mínimo",
            render: (item) => (
              <span className="font-semibold text-gray-800">
                {item.alertaMinimo}
              </span>
            ),
          },
        ],
      };
    }

    if (detalheCardAberto === "valor") {
      return {
        titulo: "Valor em estoque",
        subtitulo: "Valor total do estoque atual por item e tamanho.",
        icon: "💲",
        dados: valorEstoqueDetalhado,
        colunas: [
          {
            key: "item",
            label: "Item",
            render: (item) => (
              <div className="font-semibold text-gray-800">{item.item}</div>
            ),
          },
          {
            key: "tamanho",
            label: "Tamanho",
            render: (item) => (
              <span className="inline-flex px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                {item.tamanho}
              </span>
            ),
          },
          {
            key: "quantidade",
            label: "Quantidade",
            render: (item) => <span className="font-bold">{item.quantidade}</span>,
          },
          {
            key: "valorTotal",
            label: "Valor",
            render: (item) => (
              <span className="font-bold text-emerald-700">
                {formatarMoeda(item.valorTotal)}
              </span>
            ),
          },
        ],
      };
    }

    return {
      titulo: "",
      subtitulo: "",
      icon: "",
      dados: [],
      colunas: [],
    };
  }, [
    detalheCardAberto,
    estoqueDetalhado,
    entregasHojeDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
  ]);

  const cardsPrincipais = [
    {
      id: "estoque",
      titulo: "Total em Estoque",
      valor: carregandoResumo ? "--" : resumo.totalItens,
      descricao: "Clique para ver item por tamanho",
      icone: "📦",
      iconeBox: "bg-blue-50 text-blue-600",
      ring: "hover:border-blue-200 hover:bg-blue-50/40",
      badge: "Estoque atual detalhado",
    },
    {
      id: "entregas",
      titulo: "Entregas Hoje",
      valor: carregandoResumo ? "--" : resumo.entregasHoje,
      descricao: "Clique para ver o que foi entregue hoje",
      icone: "🚀",
      iconeBox: "bg-purple-50 text-purple-600",
      ring: "hover:border-purple-200 hover:bg-purple-50/40",
      badge: "Movimento do dia",
    },
    {
      id: "alertas",
      titulo: "Alertas",
      valor: carregandoResumo ? "--" : resumo.alertas,
      descricao: "Clique para ver os itens acabando",
      icone: "⚠️",
      iconeBox: "bg-orange-50 text-orange-600",
      ring: "hover:border-orange-200 hover:bg-orange-50/40",
      badge: "Estoque baixo",
    },
    {
      id: "valor",
      titulo: "Valor em Estoque",
      valor: carregandoResumo ? "--" : formatarMoeda(resumo.valorTotal),
      descricao: "Clique para ver item, tamanho, quantidade e valor",
      icone: "💲",
      iconeBox: "bg-green-50 text-green-600",
      ring: "hover:border-green-200 hover:bg-green-50/40",
      badge: "Financeiro do estoque",
    },
  ];

  if (!podeVisualizarDashboard) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
            Você não tem permissão para visualizar o dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in overflow-x-hidden pb-20 md:pb-0">
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
          <p className="text-xs font-bold text-gray-400 uppercase">
            Status do Sistema
          </p>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-700">
              {carregandoResumo ? "Carregando..." : "Operacional"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 ml-2 md:ml-1 flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800">
            Visão principal do dashboard
          </h3>
          <p className="text-sm text-gray-500">
            Clique em qualquer card para abrir os detalhes correspondentes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-8 md:mb-10">
        {cardsPrincipais.map((card) => (
          <DashboardCard
            key={card.id}
            card={card}
            onClick={() => setDetalheCardAberto(card.id)}
          />
        ))}
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
        <QuickActionCard
          titulo="Registrar Entrada"
          descricao="Repor estoque / Compras"
          icone="➕"
          onClick={() => setModalAberto("entrada")}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
          descricaoClassName="text-emerald-100 group-hover:text-white"
          iconBoxClassName="bg-white/10 group-hover:bg-white/20"
        />

        <QuickActionCard
          titulo="Realizar Entrega"
          descricao="Entregar EPI ao funcionário"
          icone="👷"
          onClick={() => setModalAberto("entrega")}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
          descricaoClassName="text-blue-100 group-hover:text-white"
          iconBoxClassName="bg-white/10 group-hover:bg-white/20"
        />

        <QuickActionCard
          titulo="Devolução / Baixa"
          descricao="Registrar devolução, dano ou descarte"
          icone="📉"
          onClick={() => setModalAberto("baixa")}
          className="bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
          descricaoClassName="text-rose-100 group-hover:text-white"
          iconBoxClassName="bg-white/10 group-hover:bg-white/20"
        />

        <QuickActionCard
          titulo="Consultar Estoque Rápido"
          descricao="Pesquisar por CA, nome, fabricante ou lote"
          icone="🔍"
          onClick={() => setModalAberto("busca")}
          fullWidth
          className="bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
          descricaoClassName="text-gray-400 group-hover:text-blue-400"
        />
      </div>

      <ModalDetalhesDashboard
        aberto={!!detalheCardAberto}
        titulo={detalheCardAtual.titulo}
        subtitulo={detalheCardAtual.subtitulo}
        icon={detalheCardAtual.icon}
        dados={detalheCardAtual.dados}
        colunas={detalheCardAtual.colunas}
        onClose={fecharDetalheCard}
      />

      {modalAberto === "entrada" && (
        <ModalEntrada onClose={fecharModal} onSalvar={aoSalvarModal} />
      )}

      {modalAberto === "entrega" && (
        <ModalEntrega onClose={fecharModal} onSalvar={aoSalvarModal} />
      )}

      {modalAberto === "baixa" && (
        <ModalBaixa onClose={fecharModal} onSalvar={aoSalvarModal} />
      )}

      {modalAberto === "busca" && <ModalBusca onClose={fecharModal} />}
    </div>
  );
}

export default Dashboard;