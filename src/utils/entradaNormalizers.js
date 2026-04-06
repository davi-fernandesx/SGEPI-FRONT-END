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
    ca: item?.ca || "",
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
    
    // IDs (Prioriza o campo direto, mas garante o mapeamento)
    Idfornecedor: Number(item?.id_fornecedor ?? item?.fornecedor?.id ?? 0),
    IdEpi: Number(item?.id_epi ?? item?.epi?.id ?? 0),
    IdTamanho: Number(item?.id_tamanho ?? item?.tamanho?.id ?? 0),
    
    // Fallbacks pegando do objeto aninhado que vem no seu JSON
    // Note que agora acessamos item.epi.nome e item.tamanho.tamanho
    epi_nome_back: item?.epi?.nome || "", 
    epi_ca_back: item?.epi?.ca || "",
    tamanho_nome_back: item?.tamanho?.tamanho || "",
    fornecedor_nome_back: item?.fornecedor?.nome_fantasia || item?.fornecedor?.razao_social || "",

    data_entrada: item?.data_entrada ?? "",
    quantidade: Number(item?.quantidade ?? 0),
    quantidade_atual: Number(item?.quantidade_atual ?? 0),
    lote: item?.lote ?? "",
    valor_unitario: Number(item?.valor_unitario ?? 0),
    nota_fiscal_numero: item?.nota_fiscal_numero ?? "",
    nota_fiscal_serie: item?.nota_fiscal_serie ?? ""
  };
}