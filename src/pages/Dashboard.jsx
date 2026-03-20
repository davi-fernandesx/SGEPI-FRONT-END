import { useEffect, useMemo, useState } from "react";
import ModalEntrada from "../components/modals/ModalEntrada";
import ModalEntrega from "../components/modals/ModalEntrega";
import ModalBaixa from "../components/modals/ModalBaixa";
import ModalBusca from "../components/modals/ModalBusca";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";

import {
  mockEpis,
  mockTamanhos,
  mockFuncionarios,
  mockEntradas,
  mockEntregas,
  mockItensEntregues,
  mockDevolucoes,
} from "../mocks/dashboardMocks";

import {
  obterHojeISO,
  formatarData,
  formatarMoeda,
} from "../utils/dashboardFormatters";

import {
  normalizarEpi,
  normalizarTamanho,
  normalizarFuncionario,
  normalizarEntrada,
  normalizarEntrega,
  normalizarItemEntregue,
  normalizarDevolucao,
} from "../utils/dashboardNormalizers";

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

function ModalDetalhesDashboard({
  aberto,
  titulo,
  subtitulo,
  icon,
  colunas = [],
  dados = [],
  tipo = "tabela",
  onClose,
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200 animate-fade-in">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 md:px-6 py-4 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  {icon}
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold truncate">
                    {titulo}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">{subtitulo}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-96px)]">
          {dados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              Nenhum registro encontrado.
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                    <tr>
                      {colunas.map((coluna) => (
                        <th
                          key={coluna.key}
                          className="p-4 font-semibold whitespace-nowrap"
                        >
                          {coluna.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {dados.map((item, index) => (
                      <tr
                        key={item.id ?? index}
                        className="hover:bg-gray-50 transition"
                      >
                        {colunas.map((coluna) => (
                          <td
                            key={`${coluna.key}-${item.id ?? index}`}
                            className="p-4 text-sm text-gray-700 align-top"
                          >
                            {typeof coluna.render === "function"
                              ? coluna.render(item)
                              : item[coluna.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {dados.map((item, index) => (
                  <div
                    key={item.id ?? index}
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4"
                  >
                    <div className="space-y-2">
                      {colunas.map((coluna) => (
                        <div
                          key={`${coluna.key}-${item.id ?? index}`}
                          className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                        >
                          <span className="text-[11px] uppercase font-bold tracking-wide text-gray-400">
                            {coluna.label}
                          </span>
                          <div className="text-sm text-gray-700">
                            {typeof coluna.render === "function"
                              ? coluna.render(item)
                              : item[coluna.key]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tipo === "lista" && dados.length > 0 && (
            <div className="mt-4 text-xs text-gray-400">
              Total de registros exibidos: <b>{dados.length}</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ usuarioLogado }) {
  const [modalAberto, setModalAberto] = useState(null);
  const [detalheCardAberto, setDetalheCardAberto] = useState(null);

  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [itensEntregues, setItensEntregues] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  const fecharModal = () => setModalAberto(null);
  const fecharDetalheCard = () => setDetalheCardAberto(null);

  const nomeExibicao = usuarioLogado?.nome || "usuário";

  const podeVisualizarDashboard = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_dashboard");

  const carregarResumo = async () => {
    setCarregandoResumo(true);

    try {
      const [
        listaEpis,
        listaTamanhos,
        listaFuncionarios,
        listaEntradas,
        listaEntregas,
        listaItensEntregues,
        listaDevolucoes,
      ] = await Promise.all([
        buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
        buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
        buscarPrimeiraLista(["/funcionarios"], mockFuncionarios),
        buscarPrimeiraLista(
          ["/entrada-epi", "/entrada_epi", "/entradas"],
          mockEntradas
        ),
        buscarPrimeiraLista(
          ["/entrega-epi", "/entrega_epi", "/entregas"],
          mockEntregas
        ),
        buscarPrimeiraLista(
          ["/epis-entregues", "/epis_entregues"],
          mockItensEntregues
        ),
        buscarPrimeiraLista(["/devolucoes", "/devolucao"], mockDevolucoes),
      ]);

      setEpis(listaEpis.map(normalizarEpi));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
      setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
      setEntradas(listaEntradas.map(normalizarEntrada));
      setEntregas(listaEntregas.map(normalizarEntrega));
      setItensEntregues(listaItensEntregues.map(normalizarItemEntregue));
      setDevolucoes(listaDevolucoes.map(normalizarDevolucao));
    } finally {
      setCarregandoResumo(false);
    }
  };

  useEffect(() => {
    carregarResumo();
  }, []);

  const estoqueDetalhado = useMemo(() => {
    const mapa = {};

    entradas.forEach((entrada) => {
      const epi = epis.find((item) => Number(item.id) === Number(entrada.idEpi));
      const tamanho = tamanhos.find(
        (item) => Number(item.id) === Number(entrada.idTamanho)
      );

      const nomeItem =
        entrada.epiNome || epi?.nome || `EPI #${entrada.idEpi || "--"}`;
      const tamanhoLabel =
        entrada.tamanhoTexto || tamanho?.tamanho || "Sem tamanho";

      const chave = `${entrada.idEpi}-${entrada.idTamanho}`;

      if (!mapa[chave]) {
        mapa[chave] = {
          id: chave,
          idEpi: Number(entrada.idEpi),
          idTamanho: Number(entrada.idTamanho),
          item: nomeItem,
          tamanho: tamanhoLabel,
          quantidade: 0,
        };
      }

      mapa[chave].quantidade += Number(entrada.quantidadeAtual || 0);
    });

    return Object.values(mapa)
      .filter((item) => Number(item.quantidade) > 0)
      .sort((a, b) => {
        if (a.item.localeCompare(b.item) !== 0) {
          return a.item.localeCompare(b.item);
        }
        return String(a.tamanho).localeCompare(String(b.tamanho));
      });
  }, [entradas, epis, tamanhos]);

  const entregasHojeDetalhadas = useMemo(() => {
    const hoje = obterHojeISO();
    const linhas = [];

    const entregasDoDia = entregas.filter(
      (entrega) => String(entrega.data_entrega || "").substring(0, 10) === hoje
    );

    entregasDoDia.forEach((entrega) => {
      const funcionario = funcionarios.find(
        (item) => Number(item.id) === Number(entrega.idFuncionario)
      );

      const itensDaEntrega = itensEntregues.filter(
        (item) => Number(item.idEntrega) === Number(entrega.id)
      );

      if (itensDaEntrega.length === 0) {
        linhas.push({
          id: `sem-item-${entrega.id}`,
          data: formatarData(entrega.data_entrega),
          funcionario: funcionario?.nome || "Funcionário não identificado",
          matricula: funcionario?.matricula || "--",
          item: "Sem item vinculado",
          tamanho: "-",
          quantidade: 0,
        });
      } else {
        itensDaEntrega.forEach((itemEntregue, index) => {
          const epi = epis.find(
            (epiItem) => Number(epiItem.id) === Number(itemEntregue.idEpi)
          );
          const tamanho = tamanhos.find(
            (tamItem) => Number(tamItem.id) === Number(itemEntregue.idTamanho)
          );

          linhas.push({
            id: `${entrega.id}-${index}-${itemEntregue.id}`,
            data: formatarData(entrega.data_entrega),
            funcionario: funcionario?.nome || "Funcionário não identificado",
            matricula: funcionario?.matricula || "--",
            item:
              itemEntregue.epiNome ||
              epi?.nome ||
              `EPI #${itemEntregue.idEpi || "--"}`,
            tamanho:
              itemEntregue.tamanhoTexto || tamanho?.tamanho || "Sem tamanho",
            quantidade: Number(itemEntregue.quantidade || 0),
          });
        });
      }
    });

    return linhas.sort((a, b) => a.funcionario.localeCompare(b.funcionario));
  }, [entregas, itensEntregues, funcionarios, epis, tamanhos]);

  const alertasDetalhados = useMemo(() => {
    return estoqueDetalhado
      .map((linha) => {
        const epi = epis.find((item) => Number(item.id) === Number(linha.idEpi));
        const alertaMinimo = Number(epi?.alerta_minimo || 0);

        return {
          id: linha.id,
          item: linha.item,
          tamanho: linha.tamanho,
          quantidade: Number(linha.quantidade || 0),
          alertaMinimo,
        };
      })
      .filter(
        (item) =>
          Number(item.alertaMinimo) > 0 &&
          Number(item.quantidade) <= Number(item.alertaMinimo)
      )
      .sort((a, b) => a.quantidade - b.quantidade);
  }, [estoqueDetalhado, epis]);

  const valorEstoqueDetalhado = useMemo(() => {
    const mapa = {};

    entradas.forEach((entrada) => {
      const epi = epis.find((item) => Number(item.id) === Number(entrada.idEpi));
      const tamanho = tamanhos.find(
        (item) => Number(item.id) === Number(entrada.idTamanho)
      );

      const nomeItem =
        entrada.epiNome || epi?.nome || `EPI #${entrada.idEpi || "--"}`;
      const tamanhoLabel =
        entrada.tamanhoTexto || tamanho?.tamanho || "Sem tamanho";

      const chave = `${entrada.idEpi}-${entrada.idTamanho}`;

      if (!mapa[chave]) {
        mapa[chave] = {
          id: chave,
          item: nomeItem,
          tamanho: tamanhoLabel,
          quantidade: 0,
          valorTotal: 0,
        };
      }

      mapa[chave].quantidade += Number(entrada.quantidadeAtual || 0);
      mapa[chave].valorTotal +=
        Number(entrada.quantidadeAtual || 0) *
        Number(entrada.valor_unitario || 0);
    });

    return Object.values(mapa)
      .filter((item) => Number(item.quantidade) > 0)
      .sort((a, b) => b.valorTotal - a.valorTotal);
  }, [entradas, epis, tamanhos]);

  const resumo = useMemo(() => {
    const hoje = obterHojeISO();

    const totalItens = entradas.reduce(
      (acc, entrada) => acc + Number(entrada.quantidadeAtual || 0),
      0
    );

    const entregasHoje = entregas.filter(
      (entrega) => String(entrega.data_entrega || "").substring(0, 10) === hoje
    ).length;

    const devolucoesHoje = devolucoes.filter(
      (devolucao) =>
        String(devolucao.data_devolucao || "").substring(0, 10) === hoje
    ).length;

    const valorTotal = entradas.reduce(
      (acc, entrada) =>
        acc +
        Number(entrada.quantidadeAtual || 0) *
          Number(entrada.valor_unitario || 0),
      0
    );

    const alertas = alertasDetalhados.length;

    return {
      totalItens,
      entregasHoje,
      devolucoesHoje,
      alertas,
      valorTotal,
    };
  }, [entradas, entregas, devolucoes, alertasDetalhados]);

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
          <button
            key={card.id}
            type="button"
            onClick={() => setDetalheCardAberto(card.id)}
            className={`group text-left bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${card.ring}`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <span className="inline-flex text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2">
                  {card.badge}
                </span>

                <h3 className="text-gray-600 text-sm md:text-sm font-bold uppercase leading-tight">
                  {card.titulo}
                </h3>
              </div>

              <span
                className={`shrink-0 p-2.5 rounded-xl text-base md:text-lg ${card.iconeBox}`}
              >
                {card.icone}
              </span>
            </div>

            <div className="mb-3">
              <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight break-words">
                {card.valor}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                {card.descricao}
              </p>

              <span className="text-blue-600 font-bold text-xs md:text-sm opacity-80 group-hover:translate-x-1 transition">
                Abrir →
              </span>
            </div>
          </button>
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
        <button
          onClick={() => setModalAberto("entrada")}
          className="group flex items-center justify-between p-4 md:p-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-base md:text-lg">
              Registrar Entrada
            </span>
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
            <span className="font-bold text-base md:text-lg">
              Realizar Entrega
            </span>
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
            <span className="font-bold text-base md:text-lg">
              Devolução / Baixa
            </span>
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
            <span className="font-bold text-base md:text-lg">
              Consultar Estoque Rápido
            </span>
            <span className="text-xs text-gray-400 group-hover:text-blue-400 transition">
              Pesquisar por CA, nome, fabricante ou lote
            </span>
          </div>
        </button>
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
        <ModalEntrada
          onClose={fecharModal}
          onSalvar={async () => {
            await carregarResumo();
            fecharModal();
          }}
        />
      )}

      {modalAberto === "entrega" && (
        <ModalEntrega
          onClose={fecharModal}
          onSalvar={async () => {
            await carregarResumo();
            fecharModal();
          }}
        />
      )}

      {modalAberto === "baixa" && (
        <ModalBaixa
          onClose={fecharModal}
          onSalvar={async () => {
            await carregarResumo();
            fecharModal();
          }}
        />
      )}

      {modalAberto === "busca" && <ModalBusca onClose={fecharModal} />}
    </div>
  );
}

export default Dashboard;