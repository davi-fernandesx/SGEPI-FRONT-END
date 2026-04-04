import { useState } from "react";
import { temPermissao } from "../utils/permissoes";
import { useDepartamentos } from "../hooks/useDepartamentos";

// Componente auxiliar para os botões de paginação para manter o código limpo
const PaginacaoBotao = ({ atual, total, onChange }) => (
  <div className="flex items-center gap-2 mt-4">
    <button
      disabled={atual === 1}
      onClick={() => onChange(atual - 1)}
      className="px-3 py-1 text-xs font-medium rounded-md border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
    >
      Anterior
    </button>
    <span className="text-xs text-slate-500">Página {atual} de {total}</span>
    <button
      disabled={atual === total}
      onClick={() => onChange(atual + 1)}
      className="px-3 py-1 text-xs font-medium rounded-md border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
    >
      Próxima
    </button>
  </div>
);

function Departamentos({ usuarioLogado }) {
  const {
    departamentos,
    funcoes,
    departamentosComFuncoes,
    totalFuncoes,
    erroTela,
    carregandoTela,
    carregandoDepartamento,
    carregandoFuncao,
    adicionarDepartamento,
    adicionarFuncao,
    excluirDepartamento,
    excluirFuncao,
  } = useDepartamentos();

  // Estados de Paginação
  const [paginaDep, setPaginaDep] = useState(1);
  const [paginasFuncoes, setPaginasFuncoes] = useState({}); // { departamentoId: paginaAtual }
  
  const itensPorPaginaDep = 3;
  const itensPorPaginaFun = 2;

  // Lógica de Paginação de Departamentos
  const totalPaginasDep = Math.ceil(departamentosComFuncoes.length / itensPorPaginaDep);
  const departamentosPaginados = departamentosComFuncoes.slice(
    (paginaDep - 1) * itensPorPaginaDep,
    paginaDep * itensPorPaginaDep
  );

  const [formDepartamento, setFormDepartamento] = useState({ nome: "" });
  const [formFuncao, setFormFuncao] = useState({ departamentoId: "", nome: "" });

  // Permissões
  const podeVisualizar = !usuarioLogado ? true : temPermissao(usuarioLogado, "visualizar_departamentos");
  const podeCadastrarDepartamento = !usuarioLogado ? true : temPermissao(usuarioLogado, "cadastrar_departamento");
  const podeExcluirDepartamento = !usuarioLogado ? true : temPermissao(usuarioLogado, "excluir_departamento");
  const podeGerenciarFuncoes = !usuarioLogado ? true : temPermissao(usuarioLogado, "cadastrar_departamento");
  const isAdmin = podeCadastrarDepartamento || podeExcluirDepartamento;

  // Handlers
  async function handleAdicionarDepartamento(e) {
    e.preventDefault();
    if (!podeCadastrarDepartamento) return alert("Sem permissão");
    const nome = formDepartamento.nome.trim();
    if (!nome) return alert("Informe o nome");
    
    try {
      await adicionarDepartamento(nome);
      setFormDepartamento({ nome: "" });
    } catch (erro) { alert(erro?.message); }
  }

  async function handleAdicionarFuncao(e) {
    e.preventDefault();
    if (!podeGerenciarFuncoes) return alert("Sem permissão");
    const { departamentoId, nome } = formFuncao;
    if (!departamentoId || !nome.trim()) return alert("Preencha todos os campos");

    try {
      await adicionarFuncao({ nome: nome.trim(), departamentoId: Number(departamentoId) });
      setFormFuncao((prev) => ({ ...prev, nome: "" }));
    } catch (erro) { alert(erro?.message); }
  }

  async function handleExcluirDepartamento(id) {
    if (!window.confirm("Excluir departamento e funções vinculadas?")) return;
    try { await excluirDepartamento(id); } catch (erro) { alert(erro?.message); }
  }

  if (!podeVisualizar) {
    return (
      <div className="p-6 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
        Sem permissão para visualizar.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER E STATS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Departamentos</h2>
            <p className="text-sm text-slate-500 mt-1">Gerenciamento de setores e cargos.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">Total Departamentos</p>
              <p className="text-lg font-bold text-slate-800">{departamentos.length}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">Total Funções</p>
              <p className="text-lg font-bold text-slate-800">{totalFuncoes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FORMULÁRIOS (SÓ PARA ADMIN) */}
      {isAdmin && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form Dep */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Novo Departamento</h3>
            <form onSubmit={handleAdicionarDepartamento} className="flex gap-2">
              <input
                type="text"
                value={formDepartamento.nome}
                onChange={(e) => setFormDepartamento({ nome: e.target.value })}
                placeholder="Ex: TI"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button disabled={carregandoDepartamento} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                {carregandoDepartamento ? "..." : "Adicionar"}
              </button>
            </form>
          </div>

          {/* Form Fun */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Nova Função</h3>
            <form onSubmit={handleAdicionarFuncao} className="space-y-3">
              <select
                value={formFuncao.departamentoId}
                onChange={(e) => setFormFuncao({ ...formFuncao, departamentoId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione o Departamento</option>
                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formFuncao.nome}
                  onChange={(e) => setFormFuncao({ ...formFuncao, nome: e.target.value })}
                  placeholder="Ex: Desenvolvedor"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button disabled={carregandoFuncao} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  {carregandoFuncao ? "..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LISTAGEM PAGINADA */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Lista de Departamentos</h3>

        {carregandoTela ? (
          <div className="p-8 text-center text-slate-500">Carregando...</div>
        ) : departamentosPaginados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl">Nenhum dado encontrado.</div>
        ) : (
          <div className="space-y-6">
            {departamentosPaginados.map((dep) => {
              // Lógica de Paginação de Funções para este departamento específico
              const pagAtualFun = paginasFuncoes[dep.id] || 1;
              const totalPaginasFun = Math.ceil(dep.funcoes.length / itensPorPaginaFun);
              const funcoesPaginadas = dep.funcoes.slice(
                (pagAtualFun - 1) * itensPorPaginaFun,
                pagAtualFun * itensPorPaginaFun
              );

              return (
                <div key={dep.id} className="border border-slate-200 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{dep.nome}</h4>
                      <p className="text-xs text-slate-500">ID: {dep.id}</p>
                    </div>
                    {podeExcluirDepartamento && (
                      <button onClick={() => handleExcluirDepartamento(dep.id)} className="text-red-600 text-xs hover:underline">Excluir Setor</button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Funções ({dep.funcoes.length})</p>
                    {funcoesPaginadas.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded-lg">Sem funções.</p>
                    ) : (
                      funcoesPaginadas.map(f => (
                        <div key={f.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-sm text-slate-700 font-medium">{f.nome}</span>
                          {podeGerenciarFuncoes && (
                            <button onClick={() => excluirFuncao(f.id)} className="text-red-500 text-xs p-1 hover:bg-red-50 rounded">Remover</button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Paginação de Funções (dentro do departamento) */}
                  {totalPaginasFun > 1 && (
                    <PaginacaoBotao 
                      atual={pagAtualFun} 
                      total={totalPaginasFun} 
                      onChange={(novaPag) => setPaginasFuncoes({ ...paginasFuncoes, [dep.id]: novaPag })}
                    />
                  )}
                </div>
              );
            })}

            {/* Paginação de Departamentos (Global) */}
            {totalPaginasDep > 1 && (
              <div className="border-t pt-4">
                <PaginacaoBotao 
                  atual={paginaDep} 
                  total={totalPaginasDep} 
                  onChange={setPaginaDep} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Departamentos;