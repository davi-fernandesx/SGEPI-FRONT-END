import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  buscarPrimeiraLista,
  normalizarEpi,
  normalizarFuncionario,
  normalizarMotivo,
  normalizarTamanho,
} from "../utils/modalBaixaUtils";

export function useBaixaData() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [motivos, setMotivos] = useState([]);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      const [listaFuncionarios, listaEpis, listaTamanhos, listaMotivos] =
        await Promise.all([
          buscarPrimeiraLista(api, ["/funcionarios"], []),
          buscarPrimeiraLista(api, ["/epis", "/epi", "/produtos"], []),
          buscarPrimeiraLista(api, ["/tamanhos", "/tamanho"], []),
          buscarPrimeiraLista(
            api,
            ["/motivos-devolucao", "/motivo-devolucao", "/motivos_baixa", "/motivos"],
            []
          ),
        ]);

      if (!ativo) return;

      setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
      setEpis(listaEpis.map(normalizarEpi));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
      setMotivos(listaMotivos.map(normalizarMotivo));
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  return { funcionarios, epis, tamanhos, motivos };
}