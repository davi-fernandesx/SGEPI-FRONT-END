import { useState } from "react";

// MOCK DATA
const tiposProtecao = [
  { id: 1, nome: "Proteção da Cabeça (Capacetes/Toucas)" },
  { id: 2, nome: "Proteção Auditiva (Protetores/Abafadores)" },
  { id: 3, nome: "Proteção Respiratória (Máscaras/Filtros)" },
  { id: 4, nome: "Proteção Visual (Óculos/Viseiras)" },
  { id: 5, nome: "Proteção de Mãos (Luvas)" },
  { id: 6, nome: "Proteção de Pés (Botinas/Sapatos)" },
  { id: 7, nome: "Proteção contra Quedas (Cintos)" },
];

const tamanhosDisponiveis = [
  "Único", "PP", "P", "M", "G", "GG", "XG",
  "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"
];

function ModalNovoEpi({ onClose }) {
  // FORM STATES
  const [nome, setNome] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [ca, setCa] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataValidadeCa, setDataValidadeCa] = useState("");
  const [protecao, setProtecao] = useState("");
  const [alertaMinimo, setAlertaMinimo] = useState(10);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");

  function salvarEpi() {
    // Validação
    if (!nome || !fabricante || !ca || !protecao || !tamanhoSelecionado) {
      alert("Por favor, preencha os campos obrigatórios (*)");
      return;
    }

    const epi = {
      id: Date.now(),
      nome,
      fabricante,
      ca,
      descricao,
      data_validade_ca: dataValidadeCa,
      id_protecao: Number(protecao),
      alerta_minimo: Number(alertaMinimo),
      tamanho: tamanhoSelecionado,
    };

    console.log("Novo EPI Cadastrado:", epi);
    // Fetch API aqui...
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* CABEÇALHO (ROXO) */}
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 p-2 rounded-lg text-purple-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-purple-800">
              Cadastrar Novo Item
            </h2>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-600 transition">✕</button>
        </div>

        {/* FORMULÁRIO */}
        <div className="p-6 overflow-y-auto space-y-6">

            {/* SEÇÃO 1: DADOS BÁSICOS */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dados do Produto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do EPI <span className="text-red-500">*</span></label>
                        <input
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Ex: Luva de Vaqueta"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante <span className="text-red-500">*</span></label>
                        <input
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Ex: 3M"
                            value={fabricante}
                            onChange={(e) => setFabricante(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proteção <span className="text-red-500">*</span></label>
                        <select
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            value={protecao}
                            onChange={(e) => setProtecao(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {tiposProtecao.map((p) => (
                                <option key={p.id} value={p.id}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: DADOS TÉCNICOS */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dados Técnicos (CA)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número do CA <span className="text-red-500">*</span></label>
                        <input
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Ex: 12345"
                            value={ca}
                            onChange={(e) => setCa(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validade do CA</label>
                        <input
                            type="date"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            value={dataValidadeCa}
                            onChange={(e) => setDataValidadeCa(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                        <textarea
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            rows="2"
                            placeholder="Detalhes técnicos, material, cor..."
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* SEÇÃO 3: ESTOQUE E VARIAÇÃO */}
            <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Configuração de Estoque</h3>
                 
                 <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho Principal <span className="text-red-500">*</span></label>
                 <div className="flex flex-wrap gap-2 mb-4">
                    {tamanhosDisponiveis.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTamanhoSelecionado(t)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                                tamanhoSelecionado === t
                                    ? "bg-purple-600 text-white border-purple-600 shadow-md transform scale-105"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alerta de Estoque Mínimo</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="1"
                            className="w-24 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            value={alertaMinimo}
                            onChange={(e) => setAlertaMinimo(Number(e.target.value))}
                        />
                        <span className="text-sm text-gray-500">unidades (O sistema avisará quando chegar neste valor)</span>
                    </div>
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
            onClick={salvarEpi}
            className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md transition"
          >
            Salvar Produto
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalNovoEpi;