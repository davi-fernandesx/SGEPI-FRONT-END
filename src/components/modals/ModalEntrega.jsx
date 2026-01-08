import { useState } from "react";

// MOCK DATA (Simulação)
const mockFuncionarios = [
  { id: 1, nome: "João Silva", cargo: "Operador" },
  { id: 2, nome: "Maria Santos", cargo: "Técnica" },
  { id: 3, nome: "Carlos Oliveira", cargo: "Supervisor" },
  { id: 4, nome: "Ana Pereira", cargo: "Engenheira" },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança", tamanhos: ["P", "M", "G"] },
  { id: 2, nome: "Luva de Raspa", tamanhos: ["P", "M", "G", "GG"] },
  { id: 3, nome: "Sapato de Segurança", tamanhos: ["38", "40", "42", "44"] },
  { id: 4, nome: "Óculos de Proteção", tamanhos: ["Único"] },
  { id: 5, nome: "Protetor Auricular", tamanhos: ["Único"] },
];

function ModalEntrega({ onClose }) {
  // DADOS GERAIS DA ENTREGA
  const [funcionario, setFuncionario] = useState("");
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split('T')[0]);
  
  // LISTA DE ITENS A ENTREGAR
  const [itensParaEntregar, setItensParaEntregar] = useState([]);

  // CAMPOS TEMPORÁRIOS (Para adicionar um item na lista)
  const [epiTemp, setEpiTemp] = useState("");
  const [tamanhoTemp, setTamanhoTemp] = useState("");
  const [qtdTemp, setQtdTemp] = useState(1);

  const epiSelecionadoObj = mockEpis.find((e) => e.id === Number(epiTemp));

  // Função para colocar o item na lista de entrega
  function adicionarItem() {
    if (!epiTemp || !qtdTemp) return;

    if (epiSelecionadoObj?.tamanhos.length > 0 && !tamanhoTemp) {
        alert("Selecione o tamanho.");
        return;
    }

    const novoItem = {
      id: Date.now(), // ID temporário único
      epiNome: epiSelecionadoObj.nome,
      tamanho: tamanhoTemp || "Único",
      quantidade: Number(qtdTemp)
    };

    setItensParaEntregar([...itensParaEntregar, novoItem]);
    
    // Limpa os campos temporários para adicionar o próximo
    setEpiTemp("");
    setTamanhoTemp("");
    setQtdTemp(1);
  }

  // Remove item da lista antes de salvar
  function removerItem(id) {
    setItensParaEntregar(itensParaEntregar.filter(i => i.id !== id));
  }

  function salvarEntrega() {
    if (!funcionario || itensParaEntregar.length === 0) {
      alert("Selecione o funcionário e adicione pelo menos um EPI.");
      return;
    }

    const entregaFinal = {
      id_funcionario: Number(funcionario),
      data: dataEntrega,
      itens: itensParaEntregar,
      assinatura: "Assinatura Digital Capturada"
    };

    console.log("Entrega Realizada:", entregaFinal);
    // Aqui seria o POST para a API
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* CABEÇALHO (AZUL) */}
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-blue-800">
              Entrega de EPI
            </h2>
          </div>
          <button onClick={onClose} className="text-blue-400 hover:text-blue-600 transition">✕</button>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <div className="p-6 overflow-y-auto space-y-6">

            {/* SEÇÃO 1: QUEM E QUANDO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={funcionario}
                        onChange={(e) => setFuncionario(e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        {mockFuncionarios.map((f) => (
                            <option key={f.id} value={f.id}>{f.nome} - {f.cargo}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Entrega</label>
                    <input
                        type="date"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={dataEntrega}
                        onChange={(e) => setDataEntrega(e.target.value)}
                    />
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* SEÇÃO 2: ADICIONAR ITENS (CARRINHO) */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    🛠️ Adicionar Materiais
                </h3>
                
                <div className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs text-gray-500 mb-1 block">EPI</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={epiTemp}
                            onChange={(e) => {
                                setEpiTemp(e.target.value);
                                setTamanhoTemp("");
                            }}
                        >
                            <option value="">Selecione...</option>
                            {mockEpis.map((e) => (
                                <option key={e.id} value={e.id}>{e.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-24">
                        <label className="text-xs text-gray-500 mb-1 block">Tamanho</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                            value={tamanhoTemp}
                            onChange={(e) => setTamanhoTemp(e.target.value)}
                            disabled={!epiSelecionadoObj}
                        >
                            <option value="">-</option>
                            {epiSelecionadoObj?.tamanhos.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-20">
                        <label className="text-xs text-gray-500 mb-1 block">Qtd.</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={qtdTemp}
                            onChange={(e) => setQtdTemp(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={adicionarItem}
                        className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition shadow-sm text-sm"
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* LISTA DE ITENS ADICIONADOS */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Itens a Entregar ({itensParaEntregar.length})
                </label>
                
                {itensParaEntregar.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-2 pl-4">Item</th>
                                    <th className="p-2 text-center">Tam.</th>
                                    <th className="p-2 text-center">Qtd.</th>
                                    <th className="p-2 text-right pr-4">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {itensParaEntregar.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-2 pl-4">{item.epiNome}</td>
                                        <td className="p-2 text-center text-gray-500">{item.tamanho}</td>
                                        <td className="p-2 text-center font-bold">{item.quantidade}</td>
                                        <td className="p-2 text-right pr-4">
                                            <button 
                                                onClick={() => removerItem(item.id)}
                                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                                            >
                                                REMOVER
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                        Nenhum item adicionado à lista.
                    </div>
                )}
            </div>

            {/* ÁREA DE ASSINATURA */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assinatura do Colaborador
                </label>
                <div className="border-2 border-dashed border-gray-300 h-24 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition cursor-pointer">
                    <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="text-xs">Clique para assinar digitalmente</span>
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
            onClick={salvarEntrega}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition"
          >
            Confirmar Entrega
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalEntrega;