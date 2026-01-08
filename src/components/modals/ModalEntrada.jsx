import { useState } from "react";

// MOCK DATA (Simulação do Banco de Dados)
const mockEpis = [
  { id: 1, nome: "Capacete de Segurança", tamanhos: ["P", "M", "G"] },
  { id: 2, nome: "Luva de Proteção", tamanhos: ["P", "M", "G", "GG"] },
  { id: 3, nome: "Sapato de Segurança", tamanhos: ["38", "40", "42", "44"] },
  { id: 4, nome: "Óculos de Proteção", tamanhos: ["Único"] },
];

const mockFuncionarios = [
  { id: 1, nome: "Maria Santos" },
  { id: 2, nome: "João Silva" },
  { id: 3, nome: "Carlos Oliveira" },
];

function ModalEntrada({ onClose }) {
  // STATES DO FORMULÁRIO
  const [epi, setEpi] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [lote, setLote] = useState("");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [responsavel, setResponsavel] = useState("");

  const epiSelecionadoObj = mockEpis.find((e) => e.id === Number(epi));

  function salvarEntrada() {
    // Validação básica
    if (!epi || !quantidade || !responsavel) {
      alert("Preencha os campos obrigatórios (EPI, Quantidade e Responsável).");
      return;
    }

    if (epiSelecionadoObj?.tamanhos.length > 0 && !tamanho) {
        alert("Selecione o tamanho do EPI.");
        return;
    }

    const novaEntrada = {
      id_epi: Number(epi),
      tamanho: tamanho || "Único",
      quantidade: Number(quantidade),
      preco: Number(preco),
      fornecedor,
      lote,
      nota_fiscal: notaFiscal,
      id_responsavel: Number(responsavel),
      data: new Date().toISOString(),
    };

    console.log("Entrada Salva:", novaEntrada);
    // Aqui faria o POST para a API
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* CABEÇALHO (VERDE) */}
        <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-green-100 p-2 rounded-lg text-green-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-green-800">
              Nova Entrada de Estoque
            </h2>
          </div>
          <button onClick={onClose} className="text-green-600 hover:text-green-800 transition">✕</button>
        </div>

        {/* FORMULÁRIO */}
        <div className="p-6 overflow-y-auto space-y-4">
            
            {/* LINHA 1: EPI e Tamanho */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">EPI / Material</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        value={epi}
                        onChange={(e) => {
                            setEpi(e.target.value);
                            setTamanho("");
                        }}
                    >
                        <option value="">Selecione o item...</option>
                        {mockEpis.map((e) => (
                            <option key={e.id} value={e.id}>{e.nome}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
                        value={tamanho}
                        onChange={(e) => setTamanho(e.target.value)}
                        disabled={!epiSelecionadoObj}
                    >
                        <option value="">-</option>
                        {epiSelecionadoObj?.tamanhos.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                    <input
                        type="number"
                        min="1"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Ex: 100"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                    />
                </div>
            </div>

            {/* LINHA 2: Financeiro e Rastreabilidade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="0.00"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nota Fiscal</label>
                    <input
                        type="text"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Nº da NF"
                        value={notaFiscal}
                        onChange={(e) => setNotaFiscal(e.target.value)}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lote / Validade</label>
                    <input
                        type="text"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Ex: LT-2025"
                        value={lote}
                        onChange={(e) => setLote(e.target.value)}
                    />
                </div>
            </div>

            {/* LINHA 3: Fornecedor e Responsável */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                    <input
                        type="text"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Nome da empresa"
                        value={fornecedor}
                        onChange={(e) => setFornecedor(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recebido Por</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)}
                    >
                        <option value="">Selecione o funcionário...</option>
                        {mockFuncionarios.map((f) => (
                            <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

        </div>

        {/* RODAPÉ */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={salvarEntrada}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition"
          >
            Salvar Entrada
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalEntrada;