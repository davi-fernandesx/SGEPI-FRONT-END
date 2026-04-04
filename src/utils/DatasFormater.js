export default function formatarData(data) {
  if (!data) return "--";

  // 1. Se já estiver no formato DD/MM/AAAA (vinda do Go configs.DataBr)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return data;
  }

  // 2. Se vier no formato ISO do banco (AAAA-MM-DD...)
  const texto = String(data).substring(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // 3. Fallback para outros formatos de objeto Date
  const dataObj = new Date(data);
  if (!isNaN(dataObj.getTime())) {
    return dataObj.toLocaleDateString("pt-BR");
  }

  return data; // Se nada funcionar, retorna o que veio em vez de esconder
}