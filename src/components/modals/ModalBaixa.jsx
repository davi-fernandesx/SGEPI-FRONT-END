import { useState } from "react";

// MOCK DATA (Simulação)
const mockEpis = [
  { id: 1, nome: "Capacete de Segurança", tamanhos: ["M", "G"] },
  { id: 2, nome: "Luva de Proteção", tamanhos: ["P", "M", "G"] },
  { id: 3, nome: "Sapato de Segurança", tamanhos: ["40", "42", "44"] },
];

const motivosBaixa = [
  "Vencimento / Validade Expirada",
  "Dano / Quebra no Estoque",
  "Perda / Roubo",
  "Descarte Técnico",
  "Ajuste de Inventário (Balanço)",
];

function ModalBaixa({ onClose }) {
  // FORM STATES
  const [epi, setEpi] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [dataBaixa, setDataBaixa] = useState(new Date().toISOString().split('T')[0]); // Hoje
  const [observacao, setObservacao] = useState("");

  const epiSelecionadoObj = mockEpis.find((e) => e.id === Number(epi));

  function salvarBaixa() {
    // Validação
    if (!epi || !motivo || !quantidade || !dataBaixa) {
        alert("Preencha os campos obrigatórios: EPI, Quantidade, Motivo e Data.");
        return;
    }
    
    if (epiSelecionadoObj?.tamanhos.length > 0 && !tamanho) {
        alert("Selecione o tamanho do EPI.");
        return;
    }

    const baixa = {
      id_epi: Number(epi),
      tamanho: tamanho || "Único",
      quantidade: Number(quantidade),
      motivo,
      data_baixa: dataBaixa,
      observacao,
    };

    console.log("Baixa Registrada:", baixa);
    // Aqui virá o fetch para o backend
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* CABEÇALHO (VERMELHO PARA ALERTA) */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-red-100 p-2 rounded-lg text-red-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </span>
            <h2 className="text-xl font-bold text-red-800">
              Registrar Baixa / Perda
            </h2>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition">✕</button>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <div className="p-6 overflow-y-auto space-y-4">
            
            {/* Linha 1: EPI e Tamanho */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Item</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={epi}
                        onChange={(e) => {
                            setEpi(e.target.value);
                            setTamanho("");
                        }}
                    >
                        <option value="">Selecione...</option>
                        {mockEpis.map((e) => (
                            <option key={e.id} value={e.id}>{e.nome}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Perdida</label>
                    <input
                        type="number"
                        min="1"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                    />
                </div>
            </div>

            {/* Linha 2: Motivo e Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Baixa</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                    >
                        <option value="">Selecione o motivo...</option>
                        {motivosBaixa.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Ocorrência</label>
                    <input
                        type="date"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={dataBaixa}
                        onChange={(e) => setDataBaixa(e.target.value)}
                    />
                </div>
            </div>

            {/* Observação */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações Adicionais</label>
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                    rows="3"
                    placeholder="Descreva detalhes do dano ou motivo do descarte..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                />
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
            onClick={salvarBaixa}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition flex items-center gap-2"
          >
            Confirmar Baixa
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalBaixa;