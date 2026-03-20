export function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    alerta_minimo: Number(item?.alerta_minimo ?? item?.alertaMinimo ?? 0),
  };
}

export function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

export function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? ""),
  };
}

export function normalizarEntrada(item) {
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
    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.tamanhoId ??
        item?.id_tamanho ??
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
    valor_unitario: Number(
      item?.valor_unitario ?? item?.valorUnitario ?? item?.preco ?? 0
    ),
    data_entrada: item?.data_entrada ?? item?.dataEntrada ?? "",
    epiNome: item?.epiNome ?? item?.epi_nome ?? "",
    tamanhoTexto: item?.tamanho ?? item?.tamanhoTexto ?? "",
    lote: item?.lote ?? "",
  };
}

export function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.funcionario?.id ??
        item?.id_funcionario ??
        0
    ),
    data_entrega: item?.data_entrega ?? item?.dataEntrega ?? item?.data ?? "",
    assinatura: item?.assinatura ?? null,
    token_validacao: item?.token_validacao ?? item?.tokenValidacao ?? null,
  };
}

export function normalizarItemEntregue(item) {
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
    epiNome: item?.epiNome ?? item?.epi_nome ?? "",
    tamanhoTexto: item?.tamanho ?? item?.tamanhoTexto ?? "",
  };
}

export function normalizarDevolucao(item) {
  return {
    id: Number(item?.id ?? 0),
    data_devolucao:
      item?.data_devolucao ?? item?.dataDevolucao ?? item?.data ?? "",
  };
}