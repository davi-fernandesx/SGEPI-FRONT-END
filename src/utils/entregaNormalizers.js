export function normalizarFuncionarioEntrega(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    matricula: String(item?.matricula ?? item?.Matricula ?? ""),
  };
}

export function normalizarEpiEntrega(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
  };
}

export function normalizarTamanhoEntrega(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    tamanho: String(item?.tamanho ?? item?.Tamanho ?? ""),
  };
}

function normalizarItemEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    // No seu Go, o ID do EPI está dentro do objeto 'epi'
    idEpi: Number(item?.epi?.id ?? item?.id_epi ?? 0),
    idTamanho: Number(item?.tamanho?.id ?? item?.id_tamanho ?? 0),
    quantidade: Number(item?.quantidade ?? 0),
    
    // Nomes para exibição na tabela
    epiNome: item?.epi?.nome ?? "EPI não identificado",
    tamanhoNome: item?.tamanho?.tamanho ?? "-",
  };
}

export function normalizarEntrega(item) {
  // O seu log mostrou que a chave no plural é 'itens'
  const itensOriginais = item?.itens ?? [];

  return {
    id: Number(item?.id ?? 0),
    idFuncionario: Number(item?.funcionario?.id ?? 0),
    
    // Verifique se no log 'data_entrega' está vindo assim mesmo
    data_entrega: item?.data_entrega ?? "",
    
    // No seu Go a struct usa 'assinatura_digital'
    assinatura: item?.assinatura_digital ?? "",
    
    // Se o Token estiver vindo zerado, verifique se o nome no JSON é 'token_validacao'
    token_validacao: item?.token_validacao ?? item?.token ?? "---",
    
    // Dados do funcionário (que já estão funcionando, mas vamos garantir)
    nome_funcionario: item?.funcionario?.nome ?? "",
    matricula_funcionario: item?.funcionario?.matricula ?? "",

    // Aqui ele chama o tradutor de itens acima
    itens: Array.isArray(itensOriginais) 
      ? itensOriginais.map(normalizarItemEntrega) 
      : [],
  };
}

export function gerarTokenValidacaoEntrega() {
  try {
    return crypto.randomUUID();
  } catch {
    return `token-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
}