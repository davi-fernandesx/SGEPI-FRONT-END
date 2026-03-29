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
    id: Number(item?.id ?? item?.ID ?? 0),
    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.epiId ??
        item?.id_epi ??
        item?.produto_id ??
        item?.idProduto ??
        item?.epi?.id ??
        item?.produto?.id ??
        0
    ),
    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.tamanhoId ??
        item?.id_tamanho ??
        item?.tamanho?.id ??
        0
    ),
    quantidade: Number(item?.quantidade ?? 0),
    epiNome: item?.epiNome ?? item?.nomeEpi ?? item?.epi?.nome ?? "",
    tamanhoNome:
      item?.tamanhoNome ?? item?.nomeTamanho ?? item?.tamanho?.tamanho ?? "",
  };
}

export function normalizarEntrega(item) {
  const itensOriginais =
    item?.itens ??
    item?.epis ??
    item?.epis_entregues ??
    item?.itens_entrega ??
    [];

  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.id_funcionario ??
        item?.funcionario?.id ??
        item?.funcionario ??
        0
    ),
    data_entrega:
      item?.data_entrega ??
      item?.dataEntrega ??
      item?.created_at ??
      item?.data ??
      "",
    assinatura: item?.assinatura ?? "",
    token_validacao:
      item?.token_validacao ?? item?.tokenValidacao ?? item?.token ?? "",
    nome_funcionario:
      item?.nome_funcionario ??
      item?.nomeFuncionario ??
      item?.funcionario?.nome ??
      "",
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