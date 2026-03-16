import { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";

export default function AbaFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  
  const [form, setForm] = useState({
    id: null,
    nome: "",
    matricula: "",
    id_departamento: "",
    id_funcao: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [respFunc, respDepto, respFuncs] = await Promise.all([
        api.get("/funcionarios"),
        api.get("/departamentos"),
        api.get("/funcoes"),
      ]);

      // Pegando a chave exata que o Raio-X mostrou (singular)
      setFuncionarios(respFunc?.funcionario || []);
      setDepartamentos(respDepto?.departamentos || []);
      setFuncoes(respFuncs?.funcoes || []);
    } catch (erro) {
      console.error("Erro ao carregar dados de funcionários:", erro);
    } finally {
      setCarregando(false);
    }
  };

  // Filtro Inteligente (Agora lendo do caminho exato do Raio-X)
  const funcionariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return funcionarios;

    return funcionarios.filter((f) => {
      const nomeDepto = f.funcao?.departamento?.departamento || "";
      const nomeFuncao = f.funcao?.cargo || "";

      return (
        (f.nome || "").toLowerCase().includes(termo) ||
        (f.matricula || "").toLowerCase().includes(termo) ||
        nomeDepto.toLowerCase().includes(termo) ||
        nomeFuncao.toLowerCase().includes(termo)
      );
    });
  }, [funcionarios, busca]);

  // Filtra funções no Modal
  const funcoesDisponiveisForm = funcoes.filter(
    (f) => String(f.departamento?.id) === String(form.id_departamento)
  );

 // Função que gera 4 dígitos numéricos aleatórios (0000 a 9999)
  const gerarMatricula = () => {
    return Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  };

  const abrirModalNovo = () => {
    setEditando(false);
    setForm({ 
      id: null, 
      nome: "", 
      matricula: gerarMatricula(), // 👇 Injeta a matrícula gerada aqui!
      id_departamento: "", 
      id_funcao: "" 
    });
    setModalAberto(true);
  };

  const abrirModalEditar = (func) => {
    setEditando(true);
    // Pegando os IDs que vieram aninhados do banco!
    setForm({
      id: func.id,
      nome: func.nome || "",
      matricula: func.matricula || "",
      id_departamento: func.funcao?.departamento?.id || "",
      id_funcao: func.funcao?.id || "",
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const salvarFuncionario = async () => {
    if (!form.nome || !form.matricula || !form.id_departamento || !form.id_funcao) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSalvando(true);
      
      const payload = {
        nome: form.nome,
        matricula: form.matricula,
        id_departamento: Number(form.id_departamento),
        id_funcao: Number(form.id_funcao),
      };

      if (editando) {
        await api.patch(`/gerencial/funcionario/${form.id}`, payload);
      } else {
        await api.post("/gerencial/cadastro-funcionario", payload);
      }

      fecharModal();
      carregarDados();
    } catch (erro) {
      alert(erro?.message || "Erro ao salvar funcionário.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirFuncionario = async (id) => {
    if (!window.confirm("Deseja realmente excluir este funcionário?")) return;

    try {
      await api.delete(`/gerencial/funcionario/${id}`);
      carregarDados();
    } catch (erro) {
      alert(erro?.message || "Erro ao excluir funcionário.");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* HEADER DA PÁGINA */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
          <div className="w-full lg:max-w-md">
            <label className="text-xs text-slate-500 mb-1 block">
              Buscar funcionário
            </label>
            <input
              className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome, matrícula, departamento ou função"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="text-sm text-slate-500 flex items-center">
              Total:
              <b className="text-slate-800 ml-1">
                {carregando ? "..." : funcionariosFiltrados.length}
              </b>
            </div>

            <button
              onClick={abrirModalNovo}
              className="px-4 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition text-sm shadow-sm"
            >
              👥 Cadastrar Funcionário
            </button>
          </div>
        </div>
      </div>

      {/* VERSÃO COMPUTADOR */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
            <tr>
              <th className="p-3">Matrícula</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Departamento</th>
              <th className="p-3">Função</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {funcionariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400 italic">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            ) : (
              funcionariosFiltrados.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-500 font-mono text-xs">
                    {f.matricula}
                  </td>
                  <td className="p-3 font-medium text-slate-800">{f.nome}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {f.funcao?.departamento?.departamento || "-"}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 capitalize">
                    {f.funcao?.cargo || "-"}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => abrirModalEditar(f)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirFuncionario(f.id)}
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

      {/* VERSÃO CELULAR */}
      <div className="lg:hidden space-y-4">
        {funcionariosFiltrados.length === 0 ? (
          <div className="p-4 text-center text-gray-400 italic border rounded-lg">
            Nenhum funcionário encontrado.
          </div>
        ) : (
          funcionariosFiltrados.map((f) => (
            <div key={f.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800">{f.nome}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Mat: {f.matricula}
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {f.funcao?.departamento?.departamento || "-"}
                  </span>
                </div>

                <div className="text-sm text-slate-600 capitalize">
                  <b>Função:</b> {f.funcao?.cargo || "-"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => abrirModalEditar(f)}
                  className="py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluirFuncionario(f.id)}
                  className="py-2 rounded-lg bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editando ? "✏️ Editar Funcionário" : "👥 Cadastrar Funcionário"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Dados conforme a tabela funcionario.
                </p>
              </div>
              <button
                onClick={fecharModal}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">
                  Nome completo
                </label>
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Matrícula (gerada Autom.)
                </label>
                <input
                  // 👇 Colocamos um bg-slate-100, text-slate-500 e cursor-not-allowed para indicar que está bloqueado
                  className="w-full p-3 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed outline-none text-sm font-mono font-bold"
                  value={form.matricula}
                  onChange={(e) => setForm({ ...form, matricula: e.target.value })}
                  disabled // 👇 Impede que o usuário digite
                  placeholder="Ex: 4839"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Departamento
                </label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
                  value={form.id_departamento}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      id_departamento: e.target.value,
                      id_funcao: "", 
                    });
                  }}
                >
                  <option value="">Selecione...</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id} className="uppercase">
                      {d.departamento}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">
                  Função
                </label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white disabled:bg-slate-50"
                  value={form.id_funcao}
                  onChange={(e) => setForm({ ...form, id_funcao: e.target.value })}
                  disabled={!form.id_departamento}
                >
                  <option value="">Selecione...</option>
                  {funcoesDisponiveisForm.map((fn) => (
                    <option key={fn.id} value={fn.id} className="capitalize">
                      {fn.cargo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={fecharModal}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={salvarFuncionario}
                disabled={salvando}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-700 text-white hover:bg-blue-800 transition disabled:opacity-60"
              >
                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Salvar Alterações"
                  : "Cadastrar Funcionário"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}