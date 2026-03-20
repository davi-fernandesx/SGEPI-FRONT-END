import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

import {
  mockEpis,
  mockTamanhos,
  mockFuncionarios,
  mockEntradas,
  mockEntregas,
  mockItensEntregues,
  mockDevolucoes,
} from "../mocks/dashboardMocks";

import { obterHojeISO, formatarData } from "../utils/dashboardFormatters";

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

export function useDashboardResumo() {
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [itensEntregues, setItensEntregues] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);
  const [carregandoResumo, setCarregandoResumo] = useState(true);

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

  const episMap = useMemo(() => {
    return Object.fromEntries(
      epis.map((item) => [Number(item.id), item])
    );
  }, [epis]);

  const tamanhosMap = useMemo(() => {
    return Object.fromEntries(
      tamanhos.map((item) => [Number(item.id), item])
    );
  }, [tamanhos]);

  const funcionariosMap = useMemo(() => {
    return Object.fromEntries(
      funcionarios.map((item) => [Number(item.id), item])
    );
  }, [funcionarios]);

  const itensEntreguesPorEntrega = useMemo(() => {
    return itensEntregues.reduce((acc, item) => {
      const idEntrega = Number(item.idEntrega);
      if (!acc[idEntrega]) {
        acc[idEntrega] = [];
      }
      acc[idEntrega].push(item);
      return acc;
    }, {});
  }, [itensEntregues]);

  const estoqueDetalhado = useMemo(() => {
    const mapa = {};

    entradas.forEach((entrada) => {
      const epi = episMap[Number(entrada.idEpi)];
      const tamanho = tamanhosMap[Number(entrada.idTamanho)];

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
  }, [entradas, episMap, tamanhosMap]);

  const entregasHojeDetalhadas = useMemo(() => {
    const hoje = obterHojeISO();
    const linhas = [];

    const entregasDoDia = entregas.filter(
      (entrega) => String(entrega.data_entrega || "").substring(0, 10) === hoje
    );

    entregasDoDia.forEach((entrega) => {
      const funcionario = funcionariosMap[Number(entrega.idFuncionario)];
      const itensDaEntrega =
        itensEntreguesPorEntrega[Number(entrega.id)] || [];

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
          const epi = episMap[Number(itemEntregue.idEpi)];
          const tamanho = tamanhosMap[Number(itemEntregue.idTamanho)];

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
  }, [
    entregas,
    funcionariosMap,
    itensEntreguesPorEntrega,
    episMap,
    tamanhosMap,
  ]);

  const alertasDetalhados = useMemo(() => {
    return estoqueDetalhado
      .map((linha) => {
        const epi = episMap[Number(linha.idEpi)];
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
  }, [estoqueDetalhado, episMap]);

  const valorEstoqueDetalhado = useMemo(() => {
    const mapa = {};

    entradas.forEach((entrada) => {
      const epi = episMap[Number(entrada.idEpi)];
      const tamanho = tamanhosMap[Number(entrada.idTamanho)];

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
  }, [entradas, episMap, tamanhosMap]);

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

  return {
    epis,
    entradas,
    carregandoResumo,
    resumo,
    estoqueDetalhado,
    entregasHojeDetalhadas,
    alertasDetalhados,
    valorEstoqueDetalhado,
    carregarResumo,
  };
}