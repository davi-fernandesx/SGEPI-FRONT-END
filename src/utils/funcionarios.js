export function extrairLista(resp) {
  const dados = resp?.data ?? resp ?? [];
  return Array.isArray(dados) ? dados : [];
}

export function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    matricula: String(item?.matricula ?? item?.Matricula ?? ""),
    idDepartamento: Number(
      item?.idDepartamento ??
        item?.departamento_id ??
        item?.departamentoId ??
        item?.id_departamento ??
        item?.departamento?.id ??
        0
    ),
    idFuncao: Number(
      item?.idFuncao ??
        item?.funcao_id ??
        item?.funcaoId ??
        item?.id_funcao ??
        item?.cargo_id ??
        item?.cargoId ??
        item?.funcao?.id ??
        item?.cargo?.id ??
        0
    ),
  };
}

export function normalizarDepartamento(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
  };
}

export function normalizarFuncao(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    idDepartamento: Number(
      item?.idDepartamento ??
        item?.departamento_id ??
        item?.departamentoId ??
        item?.id_departamento ??
        item?.IDDepartamento ??
        item?.departamento?.id ??
        0
    ),
  };
}

export function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.id_funcionario ??
        item?.funcionario?.id ??
        0
    ),
    data_entrega:
      item?.data_entrega ??
      item?.dataEntrega ??
      item?.data ??
      item?.created_at ??
      "",
  };
}

export function normalizarDevolucao(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.id_funcionario ??
        item?.funcionario?.id ??
        0
    ),
    data_devolucao:
      item?.data_devolucao ??
      item?.dataDevolucao ??
      item?.data ??
      item?.created_at ??
      "",
  };
}

export function formatarData(data) {
  if (!data) return "-";

  const valor = String(data).substring(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return "-";
  }

  return dataObj.toLocaleDateString("pt-BR");
}