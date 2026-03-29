export function normalizarFornecedorEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    razao_social: item?.razao_social ?? item?.razaoSocial ?? item?.nome ?? "",
    nome_fantasia: item?.nome_fantasia ?? item?.nomeFantasia ?? "",
  };
}

export function normalizarEpiEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    fabricante: item?.fabricante ?? "",
    CA: item?.CA ?? item?.ca ?? "",
  };
}

export function normalizarTamanhoEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    tamanho: String(item?.tamanho ?? item?.Tamanho ?? ""),
  };
}

export function normalizarEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    idEpi: Number(item?.idEpi ?? item?.epi_id ?? item?.epi?.id ?? 0),
    idTamanho: Number(item?.idTamanho ?? item?.tamanho_id ?? item?.tamanho?.id ?? 0),
    idFornecedor: Number(item?.idFornecedor ?? item?.fornecedor_id ?? item?.fornecedor?.id ?? 0),

    data_entrada: item?.data_entrada ?? item?.dataEntrada ?? "",
    quantidade: Number(item?.quantidade ?? 0),
    quantidadeAtual: Number(item?.quantidadeAtual ?? item?.quantidade ?? 0),

    data_fabricacao: item?.data_fabricacao ?? "",
    data_validade: item?.data_validade ?? "",
    lote: item?.lote ?? "",
    valor_unitario: Number(item?.valor_unitario ?? 0),

    nota_fiscal_numero: item?.nota_fiscal_numero ?? "",
    nota_fiscal_serie: item?.nota_fiscal_serie ?? "",
  };
}