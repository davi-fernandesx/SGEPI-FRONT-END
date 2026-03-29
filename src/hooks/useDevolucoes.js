import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarDadosDevolucoes } from "../services/devolucoesService";
import {
  normalizarDevolucao,
  normalizarEpi,
  normalizarFuncionario,
  normalizarMotivo,
  normalizarTamanho,
  resolverDevolucoes,
} from "../utils/devolucoes";

export function useDevolucoes() {
  const [devolucoes, setDevolucoes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [motivos, setMotivos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const dados = await buscarDadosDevolucoes();

      setFuncionarios(dados.funcionarios.map(normalizarFuncionario));
      setEpis(dados.epis.map(normalizarEpi));
      setTamanhos(dados.tamanhos.map(normalizarTamanho));
      setMotivos(dados.motivos.map(normalizarMotivo));
      setDevolucoes(dados.devolucoes.map(normalizarDevolucao));
    } catch (error) {
      console.error("Erro ao carregar devoluções:", error);
      setErro(error?.message || "Não foi possível carregar os registros de devolução.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const devolucoesResolvidas = useMemo(() => {
    return resolverDevolucoes(devolucoes, funcionarios, epis, tamanhos, motivos);
  }, [devolucoes, funcionarios, epis, tamanhos, motivos]);

  const salvarLocal = useCallback((novaDevolucao) => {
    const itemLocal = normalizarDevolucao({
      id: novaDevolucao?.id ?? Date.now(),
      ...novaDevolucao,
    });

    setDevolucoes((prev) => {
      const semDuplicado = prev.filter((item) => Number(item.id) !== Number(itemLocal.id));
      return [itemLocal, ...semDuplicado];
    });
  }, []);

  return {
    carregando,
    erro,
    devolucoes,
    devolucoesResolvidas,
    funcionarios,
    epis,
    tamanhos,
    motivos,
    carregar,
    salvarLocal,
  };
}