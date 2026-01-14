import { useState } from "react";

// 1. DADOS MOCKADOS
const mockFuncionarios = [
  { id: 1, nome: "João Silva", setor: "Produção", matricula: "483920", cargo: "Operador" },
  { id: 2, nome: "Maria Santos", setor: "Segurança", matricula: "739104", cargo: "Técnica" },
  { id: 3, nome: "Carlos Oliveira", setor: "Manutenção", matricula: "102938", cargo: "Eletricista" },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança", ca: "32.145", tamanhos: ["P", "M", "G"] },
  { id: 2, nome: "Luva de Raspa", ca: "15.400", tamanhos: ["P", "M", "G", "GG"] },
  { id: 3, nome: "Sapato de Segurança", ca: "40.222", tamanhos: ["38", "40", "42", "44"] },
];

const mockEntregasInicial = [
  {
    id: 101,
    funcionario: 1, // João
    dataEntrega: "2024-01-20",
    itens: [{ id: "a1", epi: 1, tamanho: "M", quantidade: 1 }]
  },
  {
    id: 102,
    funcionario: 2, // Maria
    dataEntrega: "2024-02-15", 
    itens: [{ id: "a2", epi: 2, tamanho: "P", quantidade: 5 }]
  },
  {
    id: 103,
    funcionario: 3, // Carlos
    dataEntrega: "2024-03-10",
    itens: [{ id: "a3", epi: 3, tamanho: "42", quantidade: 1 }]
  }
];

function Entregas() {
  const [entregas, setEntregas] = useState(mockEntregasInicial);
  const [modalAberto, setModalAberto] = useState(false);
  
  // ESTADOS DE FILTRO
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // States do Modal de Cadastro
  const [funcionario, setFuncionario] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [itens, setItens] = useState([]);
  const [epi, setEpi] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  // Helpers
  const formatarData = (data) => {
    if (!data) return "--";
    // Ajuste para fuso horário brasileiro na exibição
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // --- LÓGICA DE FILTRAGEM AVANÇADA ---
  const entregasFiltradas = entregas.filter((entrega) => {
    const func = mockFuncionarios.find(f => f.id === entrega.funcionario);
    if (!func) return false;

    // 1. Filtro por Texto (Nome ou Matrícula)
    const termo = busca.toLowerCase();
    const matchTexto = func.nome.toLowerCase().includes(termo) || func.matricula.includes(termo);

    // 2. Filtro por Data (Se estiverem preenchidas)
    let matchData = true;
    if (dataInicio) {
        matchData = matchData && entrega.dataEntrega >= dataInicio;
    }
    if (dataFim) {
        matchData = matchData && entrega.dataEntrega <= dataFim;
    }

    return matchTexto && matchData;
  });

  // --- FUNÇÃO: GERAR RELATÓRIO GERAL (TABELA) ---
  const imprimirRelatorioGeral = () => {
    const periodo = dataInicio && dataFim 
        ? `Período: ${formatarData(dataInicio)} até ${formatarData(dataFim)}`
        : "Relatório Geral (Todo o Período)";

    const conteudoHTML = `
      <html>
        <head>
          <title>Relatório de Entregas</title>
          <style>
            body { font-family: sans-serif; padding: 20px; font-size: 12px; }
            h1 { text-align: center; margin-bottom: 5px; }
            p { text-align: center; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #eee; text-align: left; padding: 8px; border: 1px solid #999; font-size: 11px; text-transform: uppercase;}
            td { padding: 8px; border: 1px solid #ccc; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .total { font-weight: bold; text-align: right; padding-top: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>RELATÓRIO DE SAÍDA DE EPIs</h1>
          <p>${periodo}</p>
          
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Colaborador / Matrícula</th>
                <th>Setor</th>
                <th>Itens Entregues (Descrição - Tam - Qtd)</th>
              </tr>
            </thead>
            <tbody>
              ${entregasFiltradas.map(ent => {
                const func = mockFuncionarios.find(f => f.id === ent.funcionario);
                const listaItens = ent.itens.map(i => {
                    const nomeEpi = mockEpis.find(e => e.id === i.epi)?.nome;
                    return `${nomeEpi} (${i.tamanho}) - <b>${i.quantidade}un</b>`;
                }).join('<br/>');

                return `
                  <tr>
                    <td style="white-space:nowrap">${formatarData(ent.dataEntrega)}</td>
                    <td>${func?.nome}<br/><small style="color:#666">${func?.matricula}</small></td>
                    <td>${func?.setor}</td>
                    <td>${listaItens}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="total">Total de Registros: ${entregasFiltradas.length}</div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const win = window.open('', '', 'width=900,height=600');
    win.document.write(conteudoHTML);
    win.document.close();
  };

  // Funções do Modal
  function abrirModal() {
    setFuncionario(""); setDataEntrega(new Date().toISOString().split('T')[0]);
    setItens([]); setEpi(""); setTamanho(""); setQuantidade(1);
    setModalAberto(true);
  }
  function adicionarItem() {
    if (!epi || !quantidade) return;
    setItens((prev) => [...prev, { id: Date.now(), epi: Number(epi), tamanho: tamanho || "Único", quantidade: Number(quantidade) }]);
    setEpi(""); setTamanho(""); setQuantidade(1);
  }
  function removerItem(id) { setItens((prev) => prev.filter((i) => i.id !== id)); }
  function salvarEntrega() {
    if (!funcionario || itens.length === 0) return;
    const nova = { id: Date.now(), funcionario: Number(funcionario), dataEntrega, itens };
    setEntregas((prev) => [nova, ...prev]); setModalAberto(false);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in">

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📋 Histórico e Relatórios</h2>
          <p className="text-sm text-gray-500">Consulte, filtre e imprima relatórios de entrega.</p>
        </div>
        <button onClick={abrirModal} className="bg-blue-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition shadow-sm flex items-center gap-2">
          <span>➕</span> Nova Entrega
        </button>
      </div>

      {/* --- ÁREA DE FILTROS AVANÇADOS --- */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Filtros do Relatório</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Filtro Nome */}
            <div className="md:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Buscar Colaborador</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Nome ou Matrícula..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-9 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="text-xs text-gray-500 mb-1 block">De (Data Inicial)</label>
                <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
            </div>

            <div>
                <label className="text-xs text-gray-500 mb-1 block">Até (Data Final)</label>
                <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
            </div>
        </div>

        {/* Botões de Ação do Filtro */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">
                Mostrando <b>{entregasFiltradas.length}</b> registros
            </span>
            
            <div className="flex gap-2">
                {(busca || dataInicio || dataFim) && (
                    <button 
                        onClick={() => { setBusca(""); setDataInicio(""); setDataFim(""); }}
                        className="text-xs text-red-500 font-bold hover:underline px-3"
                    >
                        Limpar Filtros
                    </button>
                )}
                
                {/* BOTÃO MÁGICO DE RELATÓRIO */}
                <button 
                    onClick={imprimirRelatorioGeral}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition shadow-sm text-sm flex items-center gap-2"
                >
                    <span>🖨️</span> Gerar Relatório PDF
                </button>
            </div>
        </div>
      </div>

      {/* TABELA DE DADOS */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Colaborador</th>
              <th className="p-4 font-semibold">Itens Entregues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {entregasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-500 italic">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              entregasFiltradas.map((e) => {
                const func = mockFuncionarios.find(f => f.id === e.funcionario);
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600 font-mono text-sm whitespace-nowrap">
                      {formatarData(e.dataEntrega)}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{func?.nome || "Desconhecido"}</div>
                      <div className="text-xs text-gray-500">Mat: {func?.matricula || "--"}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {e.itens.map((i) => {
                          const epiNome = mockEpis.find(ep => ep.id === i.epi)?.nome || "Item";
                          return (
                            <span key={i.id} className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded border border-blue-100">
                              {epiNome} ({i.tamanho}) <b>x{i.quantidade}</b>
                            </span>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
            <h3 className="font-bold text-xl mb-4 text-gray-800">Nova Entrega</h3>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <select className="w-full border p-2 rounded" value={funcionario} onChange={e => setFuncionario(e.target.value)}>
                        <option value="">Colaborador...</option>
                        {mockFuncionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>
                    <input type="date" className="w-full border p-2 rounded" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <select className="border p-2 rounded flex-1" value={epi} onChange={e => setEpi(e.target.value)}>
                        <option value="">EPI...</option>
                        {mockEpis.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                    <input type="number" placeholder="Qtd" className="border p-2 rounded w-20" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
                    <button onClick={adicionarItem} className="bg-blue-600 text-white px-3 rounded font-bold">+</button>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">Itens na lista: {itens.length}</div>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                    <button onClick={salvarEntrega} className="px-4 py-2 bg-blue-700 text-white rounded font-bold hover:bg-blue-800">Salvar</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Entregas;