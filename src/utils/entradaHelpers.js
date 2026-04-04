export function formatarDataEntrada(data) {
  if (!data) return "--";

  const texto = String(data).substring(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return "--";

  return dataObj.toLocaleDateString("pt-BR");
}

export function formatarMoedaEntrada(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarDataParaGo(dataISO) {
  // Se a data for vazia, null ou undefined, retorna string vazia ou null
  // para o Go não reclamar de formato "undefined/undefined/..."
  if (!dataISO || dataISO === "" || typeof dataISO !== "string") {
    return null; 
  }

  // Verifica se a data realmente está no formato YYYY-MM-DD
  if (!dataISO.includes("-")) return dataISO;

  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}