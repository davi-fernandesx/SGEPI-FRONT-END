const mockEpis = [
  {
    id: 1,
    nome: "Bota de Segurança",
    fabricante: "Bracol",
    CA: "15432",
    descricao: "Bota ocupacional para uso industrial",
    validade_CA: "2027-12-31T00:00:00Z",
    idTipoProtecao: 6,
    alerta_minimo: 10,
  },
  {
    id: 2,
    nome: "Óculos de Proteção Incolor",
    fabricante: "3M",
    CA: "10346",
    descricao: "Proteção visual contra partículas",
    validade_CA: "2028-06-30T00:00:00Z",
    idTipoProtecao: 4,
    alerta_minimo: 20,
  },
  {
    id: 3,
    nome: "Luva de Raspa",
    fabricante: "Danny",
    CA: "90876",
    descricao: "Luva para proteção mecânica",
    validade_CA: "2028-10-15T00:00:00Z",
    idTipoProtecao: 2,
    alerta_minimo: 15,
  },
];

const mockTamanhos = [
  { id: 7, tamanho: "38" },
  { id: 8, tamanho: "39" },
  { id: 9, tamanho: "Único" },
  { id: 10, tamanho: "M" },
  { id: 11, tamanho: "G" },
];

const mockFuncionarios = [
  { id: 1, nome: "João Silva", matricula: "483920" },
  { id: 2, nome: "Maria Santos", matricula: "739104" },
  { id: 3, nome: "Carlos Oliveira", matricula: "102938" },
  { id: 4, nome: "Ana Pereira", matricula: "998877" },
];

const mockEntradas = [
  {
    id: 101,
    idEpi: 1,
    idTamanho: 7,
    idFornecedor: 2,
    data_entrada: "2026-03-01",
    quantidade: 30,
    quantidadeAtual: 18,
    data_fabricacao: "2026-01-10",
    data_validade: "2027-12-31",
    lote: "BOTA-001",
    valor_unitario: 129.9,
  },
  {
    id: 102,
    idEpi: 2,
    idTamanho: 9,
    idFornecedor: 1,
    data_entrada: "2026-03-02",
    quantidade: 100,
    quantidadeAtual: 65,
    data_fabricacao: "2026-02-01",
    data_validade: "2028-06-30",
    lote: "OCULOS-003",
    valor_unitario: 15.5,
  },
  {
    id: 103,
    idEpi: 3,
    idTamanho: 10,
    idFornecedor: 1,
    data_entrada: "2026-03-03",
    quantidade: 40,
    quantidadeAtual: 12,
    data_fabricacao: "2026-02-10",
    data_validade: "2028-08-20",
    lote: "LUVA-009",
    valor_unitario: 8.9,
  },
  {
    id: 104,
    idEpi: 3,
    idTamanho: 11,
    idFornecedor: 1,
    data_entrada: "2026-03-03",
    quantidade: 35,
    quantidadeAtual: 9,
    data_fabricacao: "2026-02-10",
    data_validade: "2028-08-20",
    lote: "LUVA-010",
    valor_unitario: 9.5,
  },
];

const hojeMock = (() => {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
})();

const mockEntregas = [
  {
    id: 201,
    idFuncionario: 1,
    data_entrega: hojeMock,
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 202,
    idFuncionario: 2,
    data_entrega: hojeMock,
    assinatura: null,
    token_validacao: null,
  },
  {
    id: 203,
    idFuncionario: 3,
    data_entrega: "2026-03-01",
    assinatura: null,
    token_validacao: null,
  },
];

const mockItensEntregues = [
  { id: "ie1", idEntrega: 201, idEpi: 1, idTamanho: 7, quantidade: 1 },
  { id: "ie2", idEntrega: 201, idEpi: 3, idTamanho: 10, quantidade: 2 },
  { id: "ie3", idEntrega: 202, idEpi: 2, idTamanho: 9, quantidade: 1 },
  { id: "ie4", idEntrega: 203, idEpi: 3, idTamanho: 11, quantidade: 1 },
];

const mockDevolucoes = [
  {
    id: 301,
    idFuncionario: 1,
    idEpi: 1,
    idMotivo: 1,
    data_devolucao: "2026-03-01",
    idTamanho: 7,
    quantidadeADevolver: 1,
    idEpiNovo: 1,
    idTamanhoNovo: 7,
    quantidadeNova: 1,
    assinatura_digital: null,
    token_validacao: null,
  },
];

export {
  mockEpis,
  mockTamanhos,
  mockFuncionarios,
  mockEntradas,
  mockEntregas,
  mockItensEntregues,
  mockDevolucoes,
};