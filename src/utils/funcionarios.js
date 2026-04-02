export function extrairLista(resp) {
  const dados = resp?.data ?? resp ?? [];
  return Array.isArray(dados) ? dados : [];
}

export function normalizarFuncionario(item) {
  // Garante que entregas e devoluções sejam sempre listas (mesmo se o back-end mandar null)
  const entregas = Array.isArray(item?.entregas) ? item.entregas : [];
  const devolucoes = Array.isArray(item?.devolucoes) ? item.devolucoes : [];

  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? "-"),
    
    // Pegando os dados que já vêm embutidos do Back-end (JSON aninhado)
    idFuncao: Number(item?.funcao?.id ?? 0),
    funcaoNome: item?.funcao?.cargo ?? "Sem função",
    
    idDepartamento: Number(item?.funcao?.departamento?.id ?? 0),
    departamentoNome: item?.funcao?.departamento?.departamento ?? "Sem departamento",

    // Salvamos as listas completas para usar no Modal de Detalhes depois
    entregas: entregas,
    devolucoes: devolucoes,

    // Calculando os totais diretamente no Front-end para os Badges da tabela
    totalEntregas: entregas.length,
    totalDevolucoes: devolucoes.length,
    
    // Pega a data da última entrega (assumindo que o back-end mandou ordenado)
    ultimaMovimentacao: entregas.length > 0 
      ? formatarData(entregas[entregas.length - 1].data_entrega) 
      : "-"
  };
}

export function normalizarDepartamento(item) {
  return {
    id: Number(item?.id ?? 0),
    // O seu JSON do Go chama o campo de "departamento", mas mantemos "nome" como fallback
    nome: item?.departamento ?? item?.nome ?? "", 
  };
}

export function normalizarFuncao(item) {
  return {
    id: Number(item?.id ?? 0),
    // O seu JSON do Go chama o campo de "cargo"
    nome: item?.cargo ?? item?.nome ?? "", 
    idDepartamento: Number(item?.departamento?.id ?? item?.idDepartamento ?? 0),
  };
}

export function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    data_entrega: formatarData(item?.data_entrega ?? item?.created_at),
    assinatura: item?.assinatura_digital ?? "",
    itens: Array.isArray(item?.itens) ? item.itens : []
  };
}

export function normalizarDevolucao(item) {
  return {
    id: Number(item?.id ?? 0),
    data_devolucao: formatarData(item?.data_devolucao ?? item?.created_at),
    assinatura: item?.assinatura_digital ?? "",
    itens: Array.isArray(item?.itens) ? item.itens : []
  };
}

export function formatarData(data) {
  if (!data) return "-";

  const valor = String(data).substring(0, 10);

  // Se vier no padrão internacional YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  
  // Se vier no padrão BR (DD/MM/YYYY) do seu configs.DataBr
  if (data.includes("/")) {
    return data;
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return "-";
  }

  return dataObj.toLocaleDateString("pt-BR");
}