export function normalizarFornecedorEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    // Use exatamente o que aparece no console.log
    razao_social: item?.razao_social || "", 
    nome_fantasia: item?.nome_fantasia || ""
  };
}

export function normalizarEpiEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome || "",
    CA: item?.CA || "",
    // Adicione esta linha para capturar os tamanhos permitidos
    tamanhos: item?.tamanhos || [] 
  };
}



export function normalizarTamanhoEntrada(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    tamanho: String(item?.tamanho || item?.Tamanho || ""),
  };
}

export function normalizarEntrada(item) {
  return {
    id: Number(item?.id ?? 0),
    idEpi: Number(item?.epi?.id ?? 0),
    idFornecedor: Number(item?.fornecedor?.id ?? 0),

    // Agora buscamos a chave exata que você definiu na Struct de listagem do Go
    idTamanho: Number(item?.id_tamanho ?? 0), 

    data_entrada: item?.data_entrada ?? "",
    quantidade: Number(item?.quantidade ?? 0),
    quantidadeAtual: Number(item?.quantidadeAtual ?? 0),
    lote: item?.lote ?? "",
    valor_unitario: Number(item?.valor_unitario ?? 0),
    nota_fiscal_numero: item?.notaFiscalNumero ?? "",
    nota_fiscal_serie: item?.nota_fiscal_serie ?? ""
  };
}