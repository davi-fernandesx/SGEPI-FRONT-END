export function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: String(item?.nome ?? ""),
    alerta_minimo: Number(item?.alerta_minimo ?? 0),
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
    nome: String(item?.nome ?? ""),
    matricula: String(item?.matricula ?? ""),
  };
}

export function normalizarEntrada(item) {
  return {
    id: Number(item?.id ?? 0),
    idEpi: Number(item?.idEpi ?? 0),
    idTamanho: Number(item?.idTamanho ?? 0),
    quantidadeAtual: Number(item?.quantidadeAtual ?? 0),
    valor_unitario: Number(item?.valor_unitario ?? 0),
    // Os campos abaixo não são estritamente usados para os cálculos do dashboard principal, 
    // mas mantive caso você os use dentro dos modais de detalhes
    quantidade: Number(item?.quantidade ?? 0),
    data_entrada: String(item?.data_entrada ?? ""),
    lote: String(item?.lote ?? ""),
  };
}

export function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    idFuncionario: Number(item?.idFuncionario ?? 0),
    data_entrega: String(item?.data_entrega ?? ""),
    // Mantido para os modais, caso você use
    assinatura: item?.assinatura ?? null,
    token_validacao: item?.token_validacao ?? null,
  };
}

export function normalizarItemEntregue(item) {
  return {
    id: item?.id ?? Date.now() + Math.random(), // Fallback de ID caso a API não mande ID do item
    idEntrega: Number(item?.idEntrega ?? 0),
    idEpi: Number(item?.idEpi ?? 0),
    idTamanho: Number(item?.idTamanho ?? 0),
    quantidade: Number(item?.quantidade ?? 0),
  };
}

export function normalizarDevolucao(item) {
  return {
    id: Number(item?.id ?? 0),
    data_devolucao: String(item?.data_devolucao ?? ""),
  };
}