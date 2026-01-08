import { useState } from "react";

// 1. DADOS MOCKADOS (Simulação do Banco de Dados)
const mockUsuarios = [
  { id: 1, nome: "Maria Santos (Almoxarifado)" },
  { id: 2, nome: "João Silva (Supervisor)" },
  { id: 3, nome: "Carlos Oliveira (Gerente)" },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança", tamanhos: ["P", "M", "G"] },
  { id: 2, nome: "Luva de Proteção", tamanhos: ["P", "M", "G", "GG"] },
  { id: 3, nome: "Sapato de Segurança", tamanhos: ["38", "40", "42", "44"] },
  { id: 4, nome: "Óculos de Proteção", tamanhos: ["Único"] },
];

// Dados iniciais para a tabela não ficar vazia
const mockEntradasInicial = [
  {
    id: 101,
    dataEntrada: "2024-01-15",
    responsavel: 1, // Maria
    epi: 1, // Capacete
    tamanho: "M",
    quantidade: 50,
    fornecedor: "3M do Brasil",
    lote: "L-2024-A",
    valorUnitario: 45.90,
  },
  {
    id: 102,
    dataEntrada: "2024-01-18",
    responsavel: 2, // João
    epi: 3, // Sapato
    tamanho: "42",
    quantidade: 20,
    fornecedor: "Bracol",
    lote: "L-998-B",
    valorUnitario: 120.00,
  },
];

function Entradas() {
  const [entradas, setEntradas] = useState(mockEntradasInicial);
  const [modalAberto, setModalAberto] = useState(false);

  // States do Formulário
  const [responsavel, setResponsavel] = useState("");
  const [epi, setEpi] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [dataEntrada, setDataEntrada] = useState("");
  const [lote, setLote] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");

  // Helpers
  const formatarData = (data) => {
    if (!data) return "--";
    return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  const formatarMoeda = (valor) => {
    if (!valor) return "R$ 0,00";
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  function abrirModal() {
    // Limpa o formulário ao abrir
    setResponsavel("");
    setEpi("");
    setTamanho("");
    setQuantidade("");
    setDataEntrada(new Date().toISOString().split('T')[0]); // Já sugere a data de hoje
    setLote("");
    setFornecedor("");
    setValorUnitario("");
    setModalAberto(true);
  }

  function salvarEntrada() {
    if (!responsavel || !epi || !quantidade || !dataEntrada) {
      alert("Preencha os campos obrigatórios!");
      return;
    }

    const novaEntrada = {
      id: Date.now(),
      responsavel: Number(responsavel),
      epi: Number(epi),
      tamanho,
      quantidade: Number(quantidade),
      dataEntrada,
      fornecedor,
      lote,
      valorUnitario: Number(valorUnitario),
    };

    setEntradas((prev) => [novaEntrada, ...prev]); // Adiciona no topo da lista
    setModalAberto(false);
  }

  // Encontra o objeto do EPI selecionado para carregar os tamanhos corretos
  const epiSelecionadoObj = mockEpis.find((e) => e.id === Number(epi));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📥 Registro de Entradas
          </h2>
          <p className="text-sm text-gray-500">Histórico de compras e reposição de estoque.</p>
        </div>

        <button
          onClick={abrirModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
        >
          <span>➕</span> Nova Entrada
        </button>
      </div>

      {/* TABELA */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">EPI / Item</th>
              <th className="p-4 font-semibold text-center">Tam.</th>
              <th className="p-4 font-semibold text-center">Qtd.</th>
              <th className="p-4 font-semibold">Fornecedor</th>
              <th className="p-4 font-semibold text-right">Valor Un.</th>
              <th className="p-4 font-semibold">Responsável</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {entradas.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  Nenhuma entrada registrada no sistema.
                </td>
              </tr>
            ) : (
              entradas.map((e) => {
                // Buscamos os nomes baseados nos IDs salvos
                const nomeEpi = mockEpis.find(item => item.id === e.epi)?.nome || "Desconhecido";
                const nomeUser = mockUsuarios.find(u => u.id === e.responsavel)?.nome.split(' ')[0] || "Sistema";

                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600 font-mono text-sm">
                      {formatarData(e.dataEntrada)}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{nomeEpi}</td>
                    <td className="p-4 text-center text-gray-600">{e.tamanho || "-"}</td>
                    <td className="p-4 text-center">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                        +{e.quantidade}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{e.fornecedor}</td>
                    <td className="p-4 text-right text-gray-600 font-mono text-sm">
                      {formatarMoeda(e.valorUnitario)}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{nomeUser}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
            
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">📦 Nova Entrada de Estoque</h3>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Linha 1 */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o EPI</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={epi}
                  onChange={(e) => {
                    setEpi(e.target.value);
                    setTamanho(""); // Reseta tamanho se trocar o EPI
                  }}
                >
                  <option value="">Selecione...</option>
                  {mockEpis.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </div>

              {/* Linha 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
                  value={tamanho}
                  onChange={(e) => setTamanho(e.target.value)}
                  disabled={!epiSelecionadoObj}
                >
                  <option value="">Selecione...</option>
                  {epiSelecionadoObj?.tamanhos.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <input
                  type="number"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Ex: 50"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>

              {/* Linha 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Entrada</label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={dataEntrada}
                  onChange={(e) => setDataEntrada(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="0.00"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                />
              </div>

              {/* Linha 4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Ex: 3M Brasil"
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Lote</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Ex: LT-2024"
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                />
              </div>

              {/* Linha 5 */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável pelo Recebimento</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                >
                  <option value="">Selecione o funcionário...</option>
                  {mockUsuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEntrada}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition"
              >
                Registrar Entrada
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Entradas;