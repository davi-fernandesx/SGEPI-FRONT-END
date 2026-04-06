import { useState, useEffect, useMemo } from "react";
// Ajuste o caminho da importação da api dependendo da sua estrutura de pastas
import { api } from "../../services/api"; 

export default function AbaDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [novoDepto, setNovoDepto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // --- NOVOS ESTADOS PARA PAGINAÇÃO ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 7;

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  const carregarDepartamentos = async () => {
    try {
      const resposta = await api.get("/departamentos");
      
      // Pega a lista direto da chave 'departamentos', ou usa [] se falhar
      setDepartamentos(resposta?.departamentos || []);
      
    } catch (erro) {
      console.error("Erro ao carregar departamentos:", erro);
      setDepartamentos([]); 
    }
  };

  // --- LÓGICA DE PAGINAÇÃO ---
  const totalPaginas = Math.ceil(departamentos.length / itensPorPagina);

  const departamentosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return departamentos.slice(inicio, fim);
  }, [departamentos, paginaAtual]);

  // Substitua a função adicionarDepartamento por esta:
  const salvarDepartamento = async () => {
    if (!novoDepto.trim()) return;

    try {
      setCarregando(true);
      
      if (editandoId) {
        // Se tem ID, é edição (PUT)
        await api.put(`/gerencial/departamento/${editandoId}`, { departamento: novoDepto });
      } else {
        // Se não tem ID, é cadastro novo (POST)
        await api.post("/gerencial/cadastro-departamento", { departamento: novoDepto }); 
      }
      
      setNovoDepto("");
      setEditandoId(null); // Sai do modo de edição
      carregarDepartamentos(); 
    } catch (erro) {
      alert(erro?.message || "Erro ao salvar departamento.");
    } finally {
      setCarregando(false);
    }
  };

  // Crie esta função curtinha para jogar os dados no input:
  const iniciarEdicao = (depto) => {
    setNovoDepto(depto.departamento);
    setEditandoId(depto.id);
  };

  const cancelarEdicao = () => {
    setNovoDepto("");
    setEditandoId(null);
  };

  const removerDepartamento = async (id) => {
    if (!window.confirm("Deseja realmente excluir este departamento?")) return;

    try {
      await api.delete(`/gerencial/departamento/${id}`);
      carregarDepartamentos(); // Atualiza a tela
    } catch (erro) {
      alert(erro?.message || "Erro ao remover departamento.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-500 mb-1 block">
            {editandoId ? "✏️ Editando Departamento" : "Nome do Departamento"}
          </label>
          <input
            className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
            value={novoDepto}
            onChange={(e) => setNovoDepto(e.target.value)}
            placeholder="Ex: Produção"
          />
        </div>

        {/* Agrupamos os botões para organizar o Cancelar e o Salvar */}
        <div className="flex gap-2 w-full md:w-auto">
          {editandoId && (
            <button
              onClick={cancelarEdicao}
              disabled={carregando}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold rounded transition text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          
          <button
            // Atenção: Mude para a sua nova função que faz POST ou PUT
            onClick={salvarDepartamento} 
            disabled={carregando}
            className={`w-full md:w-auto px-6 text-white font-bold py-2 rounded transition text-sm disabled:opacity-50 ${
              editandoId 
                ? "bg-blue-600 hover:bg-blue-700" // Fica Azul na edição
                : "bg-emerald-600 hover:bg-emerald-700" // Fica Verde no cadastro
            }`}
          >
            {carregando 
              ? "Salvando..." 
              : editandoId 
              ? "Salvar Alteração" 
              : "+ Adicionar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {!Array.isArray(departamentos) || departamentos.length === 0 ? (
          <div className="col-span-full p-4 text-center text-slate-400 italic text-sm">
            Nenhum departamento cadastrado.
          </div>
        ) : (
          departamentosPaginados.map((d) => (
            <div
              key={d.id}
              className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
              <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {d.departamento}
              </span>

              {/* Botões de Ação do Card */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => iniciarEdicao(d)}
                  className="text-blue-500 hover:text-blue-700 font-bold text-xs transition"
                  title="Editar departamento"
                >
                  Editar
                </button>
                <button
                  onClick={() => removerDepartamento(d.id)}
                  className="text-slate-300 hover:text-red-500 font-bold transition"
                  title="Excluir departamento"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- CONTROLES DE PAGINAÇÃO --- */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className="px-3 py-1 rounded border bg-white text-slate-600 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 transition"
          >
            ← Anterior
          </button>
          
          <span className="text-xs font-bold text-slate-500">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <button
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            className="px-3 py-1 rounded border bg-white text-slate-600 disabled:opacity-50 text-sm font-bold hover:bg-slate-50 transition"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}