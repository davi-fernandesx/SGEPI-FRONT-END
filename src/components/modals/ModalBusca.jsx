import { useState } from "react";

// MOCK DATA (Simulação de um banco de dados de CAs do Ministério do Trabalho)
const mockBancoCA = [
  { id: 1, nome: "Capacete de Segurança Aba Frontal", ca: "12345", fabricante: "3M do Brasil", validade: "2028-10-15", status: "VÁLIDO" },
  { id: 2, nome: "Luva de Raspa Cano Longo", ca: "67890", fabricante: "Volk do Brasil", validade: "2023-05-20", status: "VENCIDO" },
  { id: 3, nome: "Máscara Respiratória PFF2", ca: "54321", fabricante: "Delta Plus", validade: "2025-12-01", status: "VÁLIDO" },
  { id: 4, nome: "Botina de Segurança Couro", ca: "98765", fabricante: "Marluvas", validade: "2026-03-10", status: "VÁLIDO" },
  { id: 5, nome: "Óculos de Proteção Incolor", ca: "11223", fabricante: "Kalipso", validade: "2027-01-30", status: "VÁLIDO" },
];

function ModalBusca({ onClose }) {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState([]);
  const [jaBuscou, setJaBuscou] = useState(false); // Para controlar msg de "não encontrado"

  // Helper para formatar data
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  // Helper para checar se está vencido
  const isVencido = (dataValidade) => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    return hoje > validade;
  };

  function buscar(e) {
    if(e) e.preventDefault(); // Evita recarregar se vier de um form submit
    
    if (!termo.trim()) {
      setResultados([]);
      setJaBuscou(false);
      return;
    }

    const termoLower = termo.toLowerCase();
    
    const filtrados = mockBancoCA.filter(item =>
      item.nome.toLowerCase().includes(termoLower) ||
      item.ca.includes(termoLower) ||
      item.fabricante.toLowerCase().includes(termoLower)
    );

    setResultados(filtrados);
    setJaBuscou(true);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">

        {/* CABEÇALHO (AMARELO PARA BUSCA) */}
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-yellow-800">
              Consultar CA / EPI
            </h2>
          </div>
          <button onClick={onClose} className="text-yellow-600 hover:text-yellow-800 transition">✕</button>
        </div>

        {/* CORPO */}
        <div className="p-6 overflow-y-auto">
          
          {/* CAMPO DE BUSCA */}
          <form onSubmit={buscar} className="flex gap-2 mb-6">
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    🔍
                </span>
                <input
                    type="text"
                    placeholder="Digite nome, fabricante ou número do CA..."
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition"
                    autoFocus
                />
            </div>
            <button
                type="submit"
                className="bg-yellow-500 text-white px-6 rounded-lg font-bold hover:bg-yellow-600 transition shadow-sm"
            >
                Buscar
            </button>
          </form>

          {/* ÁREA DE RESULTADOS */}
          <div className="space-y-3">
            {resultados.length > 0 ? (
              resultados.map((item) => {
                const vencido = isVencido(item.validade);

                return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50 group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{item.nome}</h3>
                                <p className="text-sm text-gray-500">{item.fabricante}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs text-gray-500 uppercase font-bold">CA</span>
                                <span className="text-xl font-mono font-bold text-gray-700 bg-white px-2 py-1 rounded border">
                                    {item.ca}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t pt-3 mt-2">
                            <div className="text-sm">
                                <span className="text-gray-500 mr-2">Validade:</span>
                                <span className={`font-semibold ${vencido ? "text-red-600" : "text-green-600"}`}>
                                    {formatarData(item.validade)}
                                </span>
                            </div>
                            
                            {vencido ? (
                                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                                    ⛔ VENCIDO
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                                    ✅ VÁLIDO
                                </span>
                            )}
                        </div>
                    </div>
                );
              })
            ) : (
                // MENSAGEM DE VAZIO OU INICIAL
                <div className="text-center py-8 text-gray-400">
                    {jaBuscou ? (
                        <>
                            <p className="text-4xl mb-2">😕</p>
                            <p>Nenhum EPI encontrado com esse termo.</p>
                        </>
                    ) : (
                        <>
                            <p className="text-4xl mb-2">🔎</p>
                            <p>Digite o número do CA ou nome do equipamento para pesquisar.</p>
                        </>
                    )}
                </div>
            )}
          </div>

        </div>

        {/* RODAPÉ */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalBusca;