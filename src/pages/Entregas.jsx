import { useState } from "react";

// 1. DADOS MOCKADOS (Simulação do Banco de Dados)
const mockFuncionarios = [
  { id: 1, nome: "João Silva", setor: "Produção" },
  { id: 2, nome: "Maria Santos", setor: "Segurança" },
  { id: 3, nome: "Carlos Oliveira", setor: "Manutenção" },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança", tamanhos: ["P", "M", "G"] },
  { id: 2, nome: "Luva de Raspa", tamanhos: ["P", "M", "G", "GG"] },
  { id: 3, nome: "Sapato de Segurança", tamanhos: ["38", "40", "42", "44"] },
  { id: 4, nome: "Óculos de Proteção", tamanhos: ["Único"] },
];

const mockEntregasInicial = [
  {
    id: 101,
    funcionario: 1, // João
    dataEntrega: "2024-01-20",
    assinatura: "Assinado digitalmente via Tablet",
    itens: [
      { id: "abc-1", epi: 1, tamanho: "M", quantidade: 1 },
      { id: "abc-2", epi: 2, tamanho: "G", quantidade: 2 },
    ]
  }
];

function Entregas() {
  const [entregas, setEntregas] = useState(mockEntregasInicial);
  const [modalAberto, setModalAberto] = useState(false);

  // States do Cabeçalho da Entrega
  const [funcionario, setFuncionario] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [assinatura, setAssinatura] = useState("");

  // States dos Itens da Entrega
  const [itens, setItens] = useState([]);
  
  // States do Item sendo adicionado agora
  const [epi, setEpi] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  // Helpers
  const formatarData = (data) => {
    if (!data) return "--";
    return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  function abrirModal() {
    setFuncionario("");
    setDataEntrega(new Date().toISOString().split('T')[0]); // Data de hoje
    setAssinatura("");
    setItens([]);
    
    // Reseta form de item
    setEpi("");
    setTamanho("");
    setQuantidade(1);
    
    setModalAberto(true);
  }

  function adicionarItem() {
    if (!epi || !quantidade) {
      alert("Selecione um EPI e a quantidade.");
      return;
    }
    
    // Se o EPI tem tamanhos e não foi selecionado, alerta
    const epiObj = mockEpis.find(e => e.id === Number(epi));
    if (epiObj?.tamanhos.length > 0 && !tamanho) {
      alert("Selecione o tamanho do EPI.");
      return;
    }

    setItens((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        epi: Number(epi),
        tamanho: tamanho || "Único",
        quantidade: Number(quantidade),
      },
    ]);

    // Limpa apenas os campos de item para adicionar o próximo
    setEpi("");
    setTamanho("");
    setQuantidade(1);
  }

  function removerItem(id) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function salvarEntrega() {
    if (!funcionario || !dataEntrega || itens.length === 0) {
      alert("Preencha o funcionário, data e adicione pelo menos um item.");
      return;
    }

    const novaEntrega = {
      id: Date.now(),
      funcionario: Number(funcionario),
      dataEntrega,
      assinatura: assinatura || "Assinatura Manual",
      itens,
    };

    setEntregas((prev) => [novaEntrega, ...prev]);
    setModalAberto(false);
  }

  // Encontra o objeto do EPI selecionado para carregar os tamanhos
  const epiSelecionadoObj = mockEpis.find((e) => e.id === Number(epi));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Entregas de EPIs
          </h2>
          <p className="text-sm text-gray-500">Registre a saída de materiais para os colaboradores.</p>
        </div>

        <button
          onClick={abrirModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <span>➕</span> Nova Entrega
        </button>
      </div>

      {/* TABELA DE ENTREGAS REALIZADAS */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Colaborador</th>
              <th className="p-4 font-semibold">Itens Entregues</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entregas.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  Nenhuma entrega registrada.
                </td>
              </tr>
            ) : (
              entregas.map((e) => {
                const funcNome = mockFuncionarios.find(f => f.id === e.funcionario)?.nome || "Desconhecido";
                
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600 font-mono text-sm">
                      {formatarData(e.dataEntrega)}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{funcNome}</td>
                    
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {e.itens.map((i) => {
                           const epiNome = mockEpis.find(ep => ep.id === i.epi)?.nome;
                           return (
                             <span key={i.id} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">
                               {epiNome} ({i.tamanho}) <span className="font-bold">x{i.quantidade}</span>
                             </span>
                           )
                        })}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                       <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                         CONCLUÍDO
                       </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE NOVA ENTREGA */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in flex flex-col">
            
            {/* Cabeçalho Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0">
              <h3 className="text-lg font-bold text-gray-800">👷 Nova Entrega de EPI</h3>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* SEÇÃO 1: DADOS GERAIS */}
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
                      <option key={f.id} value={f.id}>{f.nome} - {f.setor}</option>
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

              {/* SEÇÃO 2: ADICIONAR ITENS */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  🛠️ Adicionar Itens à Entrega
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">EPI</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={epi} 
                      onChange={(e) => {
                        setEpi(e.target.value);
                        setTamanho("");
                      }}
                    >
                      <option value="">Selecione o EPI...</option>
                      {mockEpis.map((e) => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                     <label className="block text-xs text-gray-500 mb-1">Tam.</label>
                     <select 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white disabled:bg-gray-100"
                        value={tamanho} 
                        onChange={(e) => setTamanho(e.target.value)}
                        disabled={!epiSelecionadoObj}
                      >
                        <option value="">-</option>
                        {epiSelecionadoObj?.tamanhos.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Qtd.</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={quantidade}
                      min="1"
                      onChange={(e) => setQuantidade(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={adicionarItem}
                  className="mt-3 w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 p-2 rounded-lg font-bold text-sm transition flex justify-center items-center gap-2"
                >
                  ➕ Incluir na Lista
                </button>
              </div>

              {/* SEÇÃO 3: LISTA DE ITENS ADICIONADOS */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-2">Itens desta entrega ({itens.length})</h4>
                
                {itens.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-600">
                        <tr>
                          <th className="p-2 pl-3">Item</th>
                          <th className="p-2 text-center">Tam.</th>
                          <th className="p-2 text-center">Qtd.</th>
                          <th className="p-2 text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {itens.map((i) => {
                          const nomeItem = mockEpis.find(ep => ep.id === i.epi)?.nome;
                          return (
                            <tr key={i.id} className="bg-white">
                              <td className="p-2 pl-3">{nomeItem}</td>
                              <td className="p-2 text-center">{i.tamanho}</td>
                              <td className="p-2 text-center font-bold">{i.quantidade}</td>
                              <td className="p-2 text-center">
                                <button 
                                  onClick={() => removerItem(i.id)}
                                  className="text-red-500 hover:text-red-700 font-bold px-2"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400 text-sm">
                    Nenhum item adicionado ainda.
                  </div>
                )}
              </div>

            </div>

            {/* Rodapé do Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t mt-auto sticky bottom-0">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEntrega}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition flex items-center gap-2"
              >
                💾 Confirmar Entrega
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Entregas;