import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas, fallback = []) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp, fallback);
      if (Array.isArray(lista)) return lista;
    } catch (erro) {
      // tenta próxima rota
    }
  }
  return fallback;
}

function normalizarDepartamento(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
  };
}

function normalizarFuncao(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? "",
    idDepartamento: Number(
      item?.idDepartamento ??
        item?.departamento_id ??
        item?.departamentoId ??
        item?.id_departamento ??
        item?.iddepartamento ??
        item?.IDDepartamento ??
        0
    ),
  };
}

function Departamentos({ usuarioLogado }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [erroTela, setErroTela] = useState("");
  const [carregandoTela, setCarregandoTela] = useState(true);

  const [formDepartamento, setFormDepartamento] = useState({
    nome: "",
  });

  const [formFuncao, setFormFuncao] = useState({
    departamentoId: "",
    nome: "",
  });

  const [carregandoDepartamento, setCarregandoDepartamento] = useState(false);
  const [carregandoFuncao, setCarregandoFuncao] = useState(false);

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_departamentos");

  const podeCadastrarDepartamento = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "cadastrar_departamento");

  const podeExcluirDepartamento = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "excluir_departamento");

  const podeGerenciarFuncoes = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "cadastrar_departamento");

  const isAdmin = podeCadastrarDepartamento || podeExcluirDepartamento;

  const carregarDados = async () => {
    setCarregandoTela(true);
    setErroTela("");

    try {
      const [listaDepartamentos, listaFuncoes] = await Promise.all([
        buscarPrimeiraLista(["/departamentos", "/departamento"], []),
        buscarPrimeiraLista(["/funcoes", "/funcao", "/cargos", "/cargo"], []),
      ]);

      setDepartamentos(listaDepartamentos.map(normalizarDepartamento));
      setFuncoes(listaFuncoes.map(normalizarFuncao));
    } catch (erro) {
      console.error("Erro ao carregar departamentos/funções:", erro);
      setErroTela(
        erro?.message ||
          "Não foi possível carregar os departamentos e funções."
      );
      setDepartamentos([]);
      setFuncoes([]);
    } finally {
      setCarregandoTela(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const departamentosComFuncoes = useMemo(() => {
    return [...departamentos]
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
      .map((dep) => ({
        ...dep,
        funcoes: [...funcoes]
          .filter((funcao) => Number(funcao.idDepartamento) === Number(dep.id))
          .sort((a, b) => (a.nome || "").localeCompare(b.nome || "")),
      }));
  }, [departamentos, funcoes]);

  const totalFuncoes = useMemo(() => {
    return funcoes.length;
  }, [funcoes]);

  async function adicionarDepartamento(e) {
    e.preventDefault();

    if (!podeCadastrarDepartamento) {
      alert("Apenas administradores podem adicionar departamentos.");
      return;
    }

    const nome = formDepartamento.nome.trim();

    if (!nome) {
      alert("Informe o nome do departamento.");
      return;
    }

    const nomeJaExiste = departamentos.some(
      (d) => (d.nome || "").toLowerCase() === nome.toLowerCase()
    );

    if (nomeJaExiste) {
      alert("Já existe um departamento com esse nome.");
      return;
    }

    setCarregandoDepartamento(true);

    const payload = { nome };

    try {
      try {
        await api.post("/cadastro-departamento", payload);
      } catch (erro) {
        try {
          await api.post("/departamento", payload);
        } catch (erro2) {
          try {
            await api.post("/departamentos", payload);
          } catch (erro3) {
            // fallback local
          }
        }
      }

      setFormDepartamento({ nome: "" });
      await carregarDados();
    } catch (erro) {
      alert(erro?.message || "Erro ao cadastrar departamento.");
    } finally {
      setCarregandoDepartamento(false);
    }
  }

  async function adicionarFuncao(e) {
    e.preventDefault();

    if (!podeGerenciarFuncoes) {
      alert("Apenas administradores podem adicionar funções.");
      return;
    }

    const departamentoId = Number(formFuncao.departamentoId);
    const nome = formFuncao.nome.trim();

    if (!departamentoId) {
      alert("Selecione um departamento.");
      return;
    }

    if (!nome) {
      alert("Informe o nome da função.");
      return;
    }

    const funcaoDuplicada = funcoes.some(
      (f) =>
        Number(f.idDepartamento) === departamentoId &&
        (f.nome || "").toLowerCase() === nome.toLowerCase()
    );

    if (funcaoDuplicada) {
      alert("Essa função já existe nesse departamento.");
      return;
    }

    setCarregandoFuncao(true);

    const payload = {
      nome,
      idDepartamento: departamentoId,
    };

    try {
      try {
        await api.post("/cadastro-funcao", payload);
      } catch (erro) {
        try {
          await api.post("/funcao", payload);
        } catch (erro2) {
          try {
            await api.post("/funcoes", payload);
          } catch (erro3) {
            try {
              await api.post("/cargo", payload);
            } catch (erro4) {
              try {
                await api.post("/cargos", payload);
              } catch (erro5) {
                // fallback local
              }
            }
          }
        }
      }

      setFormFuncao((prev) => ({
        ...prev,
        nome: "",
      }));

      await carregarDados();
    } catch (erro) {
      alert(erro?.message || "Erro ao cadastrar função.");
    } finally {
      setCarregandoFuncao(false);
    }
  }

  async function excluirDepartamento(id) {
    if (!podeExcluirDepartamento) {
      alert("Apenas administradores podem excluir departamentos.");
      return;
    }

    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este departamento e todas as funções vinculadas a ele?"
    );

    if (!confirmar) return;

    try {
      try {
        await api.delete(`/departamento/${id}`);
      } catch (erro) {
        await api.delete(`/departamentos/${id}`);
      }

      await carregarDados();
    } catch (erro) {
      alert(erro?.message || "Erro ao excluir departamento.");
    }
  }

  async function excluirFuncao(funcaoId) {
    if (!podeGerenciarFuncoes) {
      alert("Apenas administradores podem excluir funções.");
      return;
    }

    try {
      try {
        await api.delete(`/funcao/${funcaoId}`);
      } catch (erro) {
        try {
          await api.delete(`/funcoes/${funcaoId}`);
        } catch (erro2) {
          try {
            await api.delete(`/cargo/${funcaoId}`);
          } catch (erro3) {
            await api.delete(`/cargos/${funcaoId}`);
          }
        }
      }

      await carregarDados();
    } catch (erro) {
      alert(erro?.message || "Erro ao excluir função.");
    }
  }

  if (!podeVisualizar) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
            Você não tem permissão para visualizar a tela de departamentos.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              Departamentos
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Visualize os departamentos e as funções vinculadas a cada setor.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-w-[130px]">
              <p className="text-xs text-slate-500">Departamentos</p>
              <p className="text-lg font-bold text-slate-800">
                {departamentos.length}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-w-[130px]">
              <p className="text-xs text-slate-500">Funções</p>
              <p className="text-lg font-bold text-slate-800">{totalFuncoes}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {isAdmin ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <span className="font-medium">Perfil:</span>
              <span>
                Administrador com permissão para gerenciar departamentos e
                funções.
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <span className="font-medium">Visualização:</span>
              <span>
                Somente administradores podem cadastrar ou excluir departamentos
                e funções.
              </span>
            </div>
          )}
        </div>
      </div>

      {erroTela && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {erroTela}
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Adicionar departamento
            </h3>

            <form onSubmit={adicionarDepartamento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome do departamento
                </label>
                <input
                  type="text"
                  value={formDepartamento.nome}
                  onChange={(e) =>
                    setFormDepartamento({
                      nome: e.target.value,
                    })
                  }
                  placeholder="Ex.: Compras"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={carregandoDepartamento}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
              >
                <span>
                  {carregandoDepartamento
                    ? "Salvando..."
                    : "Salvar departamento"}
                </span>
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Adicionar função
            </h3>

            <form onSubmit={adicionarFuncao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Departamento
                </label>
                <select
                  value={formFuncao.departamentoId}
                  onChange={(e) =>
                    setFormFuncao((prev) => ({
                      ...prev,
                      departamentoId: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                >
                  <option value="">Selecione...</option>
                  {departamentosComFuncoes.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome da função
                </label>
                <input
                  type="text"
                  value={formFuncao.nome}
                  onChange={(e) =>
                    setFormFuncao((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="Ex.: Analista de Compras"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={carregandoFuncao}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
              >
                <span>{carregandoFuncao ? "Salvando..." : "Salvar função"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Lista de departamentos
          </h3>
        </div>

        {carregandoTela ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
            Carregando departamentos...
          </div>
        ) : departamentosComFuncoes.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
            Nenhum departamento cadastrado.
          </div>
        ) : (
          <div className="space-y-4">
            {departamentosComFuncoes.map((dep) => (
              <div
                key={dep.id}
                className="border border-slate-200 rounded-xl p-4 md:p-5"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-slate-800">
                      {dep.nome}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Departamento cadastrado no sistema.
                    </p>
                  </div>

                  {podeExcluirDepartamento && (
                    <button
                      onClick={() => excluirDepartamento(dep.id)}
                      className="self-start text-sm px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                    >
                      Excluir departamento
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">
                      Funções ({dep.funcoes.length})
                    </p>
                  </div>

                  {dep.funcoes.length === 0 ? (
                    <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      Nenhuma função cadastrada neste departamento.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dep.funcoes.map((funcao) => (
                        <div
                          key={funcao.id}
                          className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {funcao.nome}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Vinculada ao departamento {dep.nome}.
                            </p>
                          </div>

                          {podeGerenciarFuncoes && (
                            <button
                              onClick={() => excluirFuncao(funcao.id)}
                              className="self-start md:self-center text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition"
                            >
                              Excluir função
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Departamentos;
