import { useState } from "react";

// 1. MOCK DATA (Simulando o que virá do Banco de Dados)
const mockEstoqueCompleto = [
  {
    id: "CAP-001",
    nome: "Capacete de Segurança",
    tamanhoAtual: "M",
    variacoes: {
      P: { quantidade: 8, fabricante: "3M", validade: "2024-10-01" },
      M: { quantidade: 120, fabricante: "3M", validade: "2025-12-01" },
      G: { quantidade: 15, fabricante: "MSA", validade: "2024-06-01" },
    },
  },
  {
    id: "SAP-002",
    nome: "Sapato de Segurança",
    tamanhoAtual: "42",
    variacoes: {
      "40": { quantidade: 5, fabricante: "Bracol", validade: "2024-08-01" },
      "42": { quantidade: 35, fabricante: "Bracol", validade: "2025-05-01" },
      "44": { quantidade: 12, fabricante: "Marluvas", validade: "2024-11-01" },
    },
  },
  {
    id: "LUV-003",
    nome: "Luva de Proteção",
    tamanhoAtual: "M",
    variacoes: {
      P: { quantidade: 50, fabricante: "Danny", validade: "2026-01-01" },
      M: { quantidade: 18, fabricante: "Danny", validade: "2025-09-01" },
      G: { quantidade: 6, fabricante: "Volk", validade: "2024-12-01" },
    },
  },
  {
    id: "OCU-004",
    nome: "Óculos de Proteção",
    tamanhoAtual: "Único",
    variacoes: {
      Único: { quantidade: 22, fabricante: "Kalipso", validade: "2026-03-01" },
    },
  },
  {
    id: "PRO-005",
    nome: "Protetor Auricular",
    tamanhoAtual: "Único",
    variacoes: {
      Único: { quantidade: 0, fabricante: "3M", validade: "2024-07-01" },
    },
  },
];

function Estoque() {
  const [epis, setEpis] = useState(mockEstoqueCompleto);
  const [busca, setBusca] = useState("");
  const [filtrar, setFiltrar] = useState(false);

  // 2. FUNÇÕES AUXILIARES (Padronizadas com o Dashboard)
  
  // Formata data para MM/AAAA (mais comum para validade de EPI)
  const formatarValidade = (dataString) => {
    if (!dataString) return "--";
    const data = new Date(dataString);
    // O 'utc' evita problemas de fuso horário mudando o mês
    return data.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  };

  const getStatusColor = (qtd) => {
    if (qtd === 0) return "bg-red-100 text-red-700 border-red-200";
    if (qtd <= 20) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getStatusTexto = (qtd) => {
    if (qtd === 0) return "ESGOTADO";
    if (qtd <= 20) return "BAIXO";
    return "OK";
  };

  // Lógica de Troca de Tamanho 
  function trocarTamanho(epiId, novoTamanho) {
    setEpis((prev) =>
      prev.map((epi) =>
        epi.id === epiId ? { ...epi, tamanhoAtual: novoTamanho } : epi
      )
    );
  }

  // Lógica de Filtro
  const listaExibida = epis.filter((epi) => {
    if (!filtrar && busca === "") return true; // Se não tiver filtro nem busca, mostra tudo
    
    const termo = busca.toLowerCase();
    const dadosAtuais = epi.variacoes[epi.tamanhoAtual];
    
    // Busca pelo nome, tamanho atual ou status
    const matchNome = epi.nome.toLowerCase().includes(termo);
    const matchTamanho = epi.tamanhoAtual.toLowerCase().includes(termo);
    const matchFabricante = dadosAtuais.fabricante.toLowerCase().includes(termo);

    return matchNome || matchTamanho || matchFabricante;
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📦 Controle de Estoque Detalhado
          </h2>
          <p className="text-sm text-gray-500">Gerencie tamanhos, validades e quantidades.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setBusca("");
              setFiltrar(false);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, fabricante ou tamanho..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <button
          onClick={() => setFiltrar(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm"
        >
          Filtrar
        </button>
      </div>

      {/* TABELA */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Item / EPI</th>
              <th className="p-4 font-semibold text-center">Tamanho</th>
              <th className="p-4 font-semibold">Fabricante</th>
              <th className="p-4 font-semibold text-center">Qtd.</th>
              <th className="p-4 font-semibold text-center">Validade</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {listaExibida.length > 0 ? (
              listaExibida.map((epi) => {
                const dados = epi.variacoes[epi.tamanhoAtual];
                
                return (
                  <tr key={epi.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="p-4 font-medium text-gray-800">{epi.nome}</td>

                    <td className="p-4 text-center">
                      {/* O Select só aparece se tiver mais de uma variação, senão mostra texto fixo */}
                      {Object.keys(epi.variacoes).length > 1 ? (
                        <select
                          value={epi.tamanhoAtual}
                          onChange={(e) => trocarTamanho(epi.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                        >
                          {Object.keys(epi.variacoes).map((tam) => (
                            <option key={tam} value={tam}>
                              {tam}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-600 font-medium">{epi.tamanhoAtual}</span>
                      )}
                    </td>

                    <td className="p-4 text-gray-600">{dados.fabricante}</td>
                    
                    <td className="p-4 text-center font-semibold text-gray-700">
                      {dados.quantidade}
                    </td>
                    
                    <td className="p-4 text-center text-gray-600">
                      {formatarValidade(dados.validade)}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(dados.quantidade)}`}>
                        {getStatusTexto(dados.quantidade)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  Nenhum item encontrado para sua busca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Estoque;