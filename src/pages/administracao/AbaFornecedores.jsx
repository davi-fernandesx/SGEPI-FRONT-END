import { useState, useEffect } from "react";
// Lembre-se de ajustar o caminho da API se necessário
import { api } from "../../services/api";

export default function AbaFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  // Estado para agrupar os dados do novo fornecedor
  const [novoForn, setNovoForn] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    inscricao_estadual: "",
  });

  useEffect(() => {
    carregarFornecedores();
  }, []);

 const carregarFornecedores = async () => {
    try {
      const resposta = await api.get("/fornecedores");
      
      // 👇 A "Rede de Segurança": 
      // 1º Tenta achar Fornecedores (com F maiúsculo) dentro do .data do Axios
      // 2º Tenta achar Fornecedores (com F maiúsculo) direto na resposta
      // 3º Se falhar tudo, joga um array vazio para não quebrar a tela
      const listaFornecedores = resposta.data?.Fornecedores || resposta?.Fornecedores || [];
      
      setFornecedores(listaFornecedores);
      
    } catch (erro) {
      console.error("Erro ao carregar fornecedores:", erro);
    }
  };

const adicionarFornecedor = async () => {
    if (!novoForn.razao_social.trim()) {
      alert("A Razão Social é obrigatória.");
      return;
    }

    try {
      setCarregando(true);

      const payload = {
        ...novoForn,
        // Limpa tudo que não for número do CNPJ (deixa só os 14 dígitos)
        cnpj: novoForn.cnpj.replace(/\D/g, ""),
        
        // Bônus: Já limpa a Inscrição Estadual também caso o Go exija só números lá!
        inscricao_estadual: novoForn.inscricao_estadual.replace(/\D/g, ""),
      };
      
      if (editandoId) {
        // Se tem editandoId, faz um PUT para atualizar
        await api.patch(`/gerencial/fornecedor/${editandoId}`, novoForn);
      } else {
        // Se não tem, faz um POST para criar
        await api.post("/gerencial/cadastro-fornecedores", novoForn);
      }
      
      // Limpa a tela
      setNovoForn({
        razao_social: "",
        nome_fantasia: "",
        cnpj: "",
        inscricao_estadual: "",
      });
      setEditandoId(null); // Sai do modo edição
      
      carregarFornecedores();
    } catch (erro) {
      alert(erro?.message || "Erro ao salvar fornecedor.");
    } finally {
      setCarregando(false);
    }
  };

  const removerFornecedor = async (id) => {
    if (!window.confirm("Deseja realmente excluir este fornecedor?")) return;

    try {
      await api.delete(`/gerencial/fornecedor/${id}`);
      carregarFornecedores();
    } catch (erro) {
      alert(erro?.message || "Erro ao remover fornecedor.");
    }
  };


  // 2. A função para preencher os inputs ao clicar em "Editar"
const iniciarEdicao = (f) => {
  setNovoForn({
    razao_social: f.razao_social || "",
    nome_fantasia: f.nome_fantasia || "",
    cnpj: f.cnpj || "",
    inscricao_estadual: f.inscricao_estadual || "",
  });
  setEditandoId(f.id);
};

// 3. A função para limpar a tela
const cancelarEdicao = () => {
  setNovoForn({ razao_social: "", nome_fantasia: "", cnpj: "", inscricao_estadual: "" });
  setEditandoId(null);
};

 return (
    <div className="animate-fade-in space-y-6">
      {/* FORMULÁRIO DE NOVO/EDITAR FORNECEDOR */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
          {editandoId ? "✏️ Editando Fornecedor" : "Novo Fornecedor"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Razão Social</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
              value={novoForn.razao_social}
              onChange={(e) =>
                setNovoForn((prev) => ({ ...prev, razao_social: e.target.value }))
              }
              placeholder="Ex: Empresa X Ltda"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Nome Fantasia</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
              value={novoForn.nome_fantasia}
              onChange={(e) =>
                setNovoForn((prev) => ({ ...prev, nome_fantasia: e.target.value }))
              }
              placeholder="Ex: Empresa X"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">CNPJ</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm font-mono"
              value={novoForn.cnpj}
              onChange={(e) =>
                setNovoForn((prev) => ({ ...prev, cnpj: e.target.value }))
              }
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Inscrição Estadual</label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
              value={novoForn.inscricao_estadual}
              onChange={(e) =>
                setNovoForn((prev) => ({ ...prev, inscricao_estadual: e.target.value }))
              }
              placeholder="Ex: 123.456.789/000"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {editandoId && (
            <button
              onClick={cancelarEdicao}
              disabled={carregando}
              className="w-full md:w-auto px-5 py-2 text-slate-500 hover:text-slate-700 font-bold rounded transition text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
          )}

          <button
            onClick={adicionarFornecedor} // Lembre-se de que esta função agora deve fazer POST ou PUT!
            disabled={carregando}
            className={`w-full md:w-auto text-white font-bold py-2 px-5 rounded transition text-sm disabled:opacity-50 ${
              editandoId
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {carregando
              ? "Salvando..."
              : editandoId
              ? "Salvar Alterações"
              : "+ Cadastrar Fornecedor"}
          </button>
        </div>
      </div>

      {/* LISTA DE FORNECEDORES CADASTRADOS */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase">
            Fornecedores Cadastrados
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            {fornecedores.length} registro(s)
          </span>
        </div>

        {fornecedores.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-gray-400 italic">
            Nenhum fornecedor registrado.
          </div>
        ) : (
          <>
            {/* VERSÃO CELULAR (CARDS) */}
            <div className="md:hidden space-y-3">
              {fornecedores.map((f) => (
                <div
                  key={f.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="block text-[11px] uppercase font-bold text-slate-400">
                        Razão Social
                      </span>
                      <span className="text-slate-800 font-medium">
                        {f.razao_social || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase font-bold text-slate-400">
                        Nome Fantasia
                      </span>
                      <span className="text-slate-600">
                        {f.nome_fantasia || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[11px] uppercase font-bold text-slate-400">
                          CNPJ
                        </span>
                        <span className="text-slate-500 font-mono text-xs">
                          {f.cnpj || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] uppercase font-bold text-slate-400">
                          Insc. Estadual
                        </span>
                        <span className="text-slate-600 text-xs">
                          {f.inscricao_estadual || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => iniciarEdicao(f)}
                      className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => removerFornecedor(f.id)}
                      className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* VERSÃO COMPUTADOR (TABELA) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">Razão Social</th>
                    <th className="p-3">Nome Fantasia</th>
                    <th className="p-3">CNPJ</th>
                    <th className="p-3">Insc. Estadual</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fornecedores.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">
                        {f.razao_social || "-"}
                      </td>
                      <td className="p-3 text-slate-600 capitalize">
                        {f.nome_fantasia || "-"}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-xs">
                        {f.cnpj || "-"}
                      </td>
                      <td className="p-3 text-slate-600">
                        {f.inscricao_estadual || "-"}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => iniciarEdicao(f)}
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => removerFornecedor(f.id)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}