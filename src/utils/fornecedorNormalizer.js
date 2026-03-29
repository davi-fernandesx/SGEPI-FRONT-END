export function normalizarFornecedor(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? Date.now()),
    razao_social:
      item?.razao_social ??
      item?.razaoSocial ??
      item?.razao ??
      item?.nome ??
      "",

    nome_fantasia:
      item?.nome_fantasia ??
      item?.nomeFantasia ??
      item?.fantasia ??
      "",

    cnpj: item?.cnpj ?? "",

    inscricao_estadual:
      item?.inscricao_estadual ??
      item?.inscricaoEstadual ??
      item?.ie ??
      "",
  };
}