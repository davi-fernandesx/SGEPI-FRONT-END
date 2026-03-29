export function normalizarTipoProtecao(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? item?.descricao ?? "",
  };
}

export function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    tamanho: String(item?.tamanho ?? item?.Tamanho ?? ""),
  };
}

export function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    fabricante: item?.fabricante ?? item?.Fabricante ?? "",
    CA: item?.CA ?? item?.ca ?? item?.Ca ?? "",
    descricao: item?.descricao ?? item?.Descricao ?? "",
    validade_CA:
      item?.validade_CA ??
      item?.validadeCA ??
      item?.validade_ca ??
      item?.ValidadeCA ??
      null,
    idTipoProtecao: Number(
      item?.idTipoProtecao ??
        item?.tipo_protecao_id ??
        item?.tipoProtecaoId ??
        item?.categoria?.id ??
        item?.categoria ??
        item?.id_tipo_protecao ??
        0
    ),
    alerta_minimo: Number(
      item?.alerta_minimo ?? item?.alertaMinimo ?? item?.AlertaMinimo ?? 0
    ),
  };
}

export function normalizarEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.idProduto ??
        item?.produto_id ??
        item?.id_produto ??
        item?.epi?.id ??
        item?.produto?.id ??
        0
    ),
    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.id_tamanho ??
        item?.tamanho?.id ??
        0
    ),
    data_entrada: item?.data_entrada ?? item?.dataEntrada ?? null,
    quantidade: Number(item?.quantidade ?? 0),
    quantidadeAtual: Number(
      item?.quantidadeAtual ??
        item?.quantidade_atual ??
        item?.estoqueAtual ??
        item?.estoque_atual ??
        item?.quantidade ??
        0
    ),
    data_fabricacao: item?.data_fabricacao ?? item?.dataFabricacao ?? null,
    data_validade:
      item?.data_validade ?? item?.dataValidade ?? item?.validade ?? null,
    lote: item?.lote ?? "",
    valor_unitario: Number(
      item?.valor_unitario ?? item?.valorUnitario ?? item?.preco ?? 0
    ),
  };
}