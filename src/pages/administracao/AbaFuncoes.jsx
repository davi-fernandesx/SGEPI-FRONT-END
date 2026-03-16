import { useState, useEffect } from "react";
// Ajuste o caminho da api se necessário
import { api } from "../../services/api";

export default function AbaFuncoes() {
  const [funcoes, setFuncoes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novaFuncao, setNovaFuncao] = useState({
    funcao: "",
    id_departamento: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

 const carregarDados = async () => {
    try {
      const [respFuncoes, respDepartamentos] = await Promise.all([
        api.get("/funcoes"),
        api.get("/departamentos"),
      ]);

      const listaFuncoes = respFuncoes?.funcoes || [];
      setFuncoes(listaFuncoes);
      setDepartamentos(respDepartamentos?.departamentos || []);
      
      // 👇 COLOCA ESSE ESPIÃO AQUI!
      console.log("A primeira função da lista é:", listaFuncoes[0]);

    } catch (erro) {
      console.error("Erro ao carregar dados de funções:", erro);
    }
  };

const salvarFuncao = async () => {
    // 👇 Usamos a chave correta (.funcao) e o ?.trim() por segurança extrema
    if (!novaFuncao.funcao?.trim() || !novaFuncao.id_departamento) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);
      
      const payload = {
        funcao: novaFuncao.funcao, // O nosso React lê 'funcao', mas o Go exige 'cargo'
        id_departamento: Number(novaFuncao.id_departamento),
      };

      if (editandoId) {
        await api.put(`/gerencial/funcao/${editandoId}`, payload);
      } else {
        await api.post("/gerencial/cadastro-funcao", payload);
      }

      // Limpa os campos após salvar
      setNovaFuncao({ funcao: "", id_departamento: "" });
      setEditandoId(null);
      carregarDados();
      
    } catch (erro) {
      alert(erro?.message || "Erro ao salvar função.");
    } finally {
      setCarregando(false);
    }
  };

 const iniciarEdicao = (f) => {
    setNovaFuncao({ 
      // O || "" no final é o que salva o dia! Se vier nulo do Go, vira string vazia.
      funcao: f.cargo || f.funcao || "", 
      id_departamento: f.departamento?.id || f.id_departamento || "" 
    });
    setEditandoId(f.id);
  };

  const cancelarEdicao = () => {
    setNovaFuncao({ funcao: "", id_departamento: "" });
    setEditandoId(null);
  };

  const removerFuncao = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta função?")) return;

    try {
      await api.delete(`/gerencial/funcao/${id}`);
      carregarDados();
    } catch (erro) {
      alert(erro?.message || "Erro ao remover função.");
    }
  };

  

return (
    <div className="animate-fade-in">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
          {editandoId ? "✏️ Editando Função" : "Nova Função"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Departamento Vinculado
            </label>
            <select
              className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
              value={novaFuncao.id_departamento}
              onChange={(e) =>
                setNovaFuncao((prev) => ({
                  ...prev,
                  id_departamento: e.target.value,
                }))
              }
            >
              <option value="">Selecione...</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id} className="uppercase">
                  {d.departamento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Nome da Função
            </label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
              value={novaFuncao.funcao}
              onChange={(e) =>
                setNovaFuncao((prev) => ({
                  ...prev,
                  funcao: e.target.value,
                }))
              }
              placeholder="Ex: Operador"
            />
          </div>

          {/* 👇 Coluna dos botões ajustada com flexbox */}
          <div className="flex gap-2">
            {editandoId && (
              <button
                onClick={cancelarEdicao}
                disabled={carregando}
                className="w-1/3 md:w-auto px-4 text-slate-500 hover:text-slate-700 font-bold py-2 rounded transition text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            
            <button
              onClick={salvarFuncao} // Certifique-se de que a função tem este nome
              disabled={carregando}
              className={`flex-1 text-white font-bold py-2 rounded transition text-sm disabled:opacity-50 ${
                editandoId 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {carregando 
                ? "Salvando..." 
                : editandoId 
                ? "Salvar Alteração" 
                : "+ Salvar Função"}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
            <tr>
              <th className="p-3">Função</th>
              <th className="p-3">Departamento</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {funcoes.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-400 italic">
                  Nenhuma função cadastrada.
                </td>
              </tr>
            ) : (
              funcoes.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800 capitalize">
                    {f.cargo}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {f.departamento?.departamento || "Sem departamento"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {/* 👇 Agrupamos os dois botões no centro */}
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => iniciarEdicao(f)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removerFuncao(f.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}