import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import ModalNovoEpi from "../../components/modals/ModalNovoEpi"; 

export default function AbaEpis() {
  const [epis, setEpis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [buscaEpi, setBuscaEpi] = useState("");
  const [modalEpiAberto, setModalEpiAberto] = useState(false);

  // --- CARREGAMENTO DE DADOS ---
  const carregarEpis = async () => {
    try {
      setCarregando(true);
      const resposta = await api.get("/epis");
      
      // Lógica de acesso direto ou via .data (conforme seu log)
      const dadosBrutos = resposta?.Epis || resposta?.data?.Epis || [];
      setEpis(dadosBrutos);
    } catch (erro) {
      console.error("Erro ao carregar EPIs:", erro);
      setEpis([]); 
    } finally {
      setCarregando(false);
    }
  };

  const aoSalvarEpi = () => {
    setModalEpiAberto(false);
    carregarEpis();
  };

  useEffect(() => {
    carregarEpis();
  }, []);

  // --- LÓGICA DE FILTRO ---
  const episFiltrados = useMemo(() => {
    const termo = buscaEpi.toLowerCase().trim();
    if (!termo) return epis;

    return epis.filter((epi) => (
      (epi?.nome || "").toLowerCase().includes(termo) ||
      (epi?.fabricante || "").toLowerCase().includes(termo) ||
      (epi?.ca || "").toLowerCase().includes(termo) ||
      (epi?.protecao?.nome || "").toLowerCase().includes(termo)
    ));
  }, [epis, buscaEpi]);

  return (
    <div className="animate-fade-in p-2 md:p-0">
      {/* Barra de Ferramentas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex-1 max-w-2xl">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Inventário de EPIs</h2>
            <div className="relative">
              <input
                className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                value={buscaEpi}
                onChange={(e) => setBuscaEpi(e.target.value)}
                placeholder="Pesquisar por nome, CA, fabricante ou proteção..."
              />
              <span className="absolute right-3 top-3 text-slate-400">🔍</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total</p>
              <p className="text-xl font-black text-slate-700">{carregando ? "..." : episFiltrados.length}</p>
            </div>
            <button
              onClick={() => setModalEpiAberto(true)}
              className="h-11 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 text-sm"
            >
              <span className="text-lg">+</span> Cadastrar Novo EPI
            </button>
          </div>
        </div>
      </div>

      {/* Tabela Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Equipamento</th>
              <th className="p-4">Proteção</th>
              <th className="p-4 text-center">Tamanhos</th>
              <th className="p-4">Fabricante</th>
              <th className="p-4 text-center">CA</th>
              <th className="p-4 text-center">Alerta Mín.</th>
              <th className="p-4">Validade CA</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {carregando ? (
               <tr><td colSpan="7" className="p-10 text-center text-slate-400 font-medium italic">Sincronizando dados...</td></tr>
            ) : episFiltrados.length === 0 ? (
              <tr><td colSpan="7" className="p-10 text-center text-slate-400 italic">Nenhum equipamento encontrado.</td></tr>
            ) : (
              episFiltrados.map((epi) => (
                <tr key={epi.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{epi.nome}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      {epi.descricao || "Sem observações"}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">
                      {epi.protecao?.nome || "-"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {epi.tamanhos?.map((tam, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                          {tam.tamanho}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{epi.fabricante}</td>
                  <td className="p-4 text-center">
                    <span className="font-mono text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">
                      {epi.ca}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {/* Renderização do Alerta Mínimo */}
                    <span className="font-bold text-slate-700">
                      {epi.alerta_minimo ?? 0}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-semibold">
                    {epi.data_validadeCa}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Versão Mobile (Cards) */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {carregando ? (
           <p className="text-center text-slate-400 py-10">Carregando...</p>
        ) : episFiltrados.map((epi) => (
          <div key={epi.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-black text-slate-800">{epi.nome}</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                  {epi.protecao?.nome || "Geral"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] block text-slate-400 font-bold uppercase">CA</span>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{epi.ca}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-t border-slate-50 pt-3">
              <div>
                <span className="text-slate-400 block">Fabricante:</span>
                <span className="font-bold text-slate-700">{epi.fabricante}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Validade:</span>
                <span className="font-bold text-slate-700">{epi.data_validadeCa}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Alerta Estoque:</span>
                <span className="font-bold text-red-600">{epi.alerta_minimo ?? 0} un.</span>
              </div>
              <div className="col-span-1">
                <span className="text-slate-400 block mb-1">Tamanhos:</span>
                <div className="flex flex-wrap gap-1">
                  {epi.tamanhos?.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                      {t.tamanho}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalEpiAberto && (
        <ModalNovoEpi
          onClose={() => setModalEpiAberto(false)}
          onSalvar={aoSalvarEpi}
        />
      )}
    </div>
  );
}