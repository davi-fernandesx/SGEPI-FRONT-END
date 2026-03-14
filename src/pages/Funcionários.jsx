import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";

const mockFuncionarios = [
  {
    id: 1,
    nome: "João Silva",
    matricula: "4839201",
    idDepartamento: 1,
    idFuncao: 3,
  },
  {
    id: 2,
    nome: "Maria Santos",
    matricula: "7391046",
    idDepartamento: 3,
    idFuncao: 2,
  },
  {
    id: 3,
    nome: "Carlos Lima",
    matricula: "5827410",
    idDepartamento: 2,
    idFuncao: 1,
  },
];

const mockDepartamentos = [
  { id: 1, nome: "Produção" },
  { id: 2, nome: "Logística" },
  { id: 3, nome: "Segurança do Trabalho" },
];

const mockFuncoes = [
  { id: 1, nome: "Almoxarife", idDepartamento: 2 },
  { id: 2, nome: "Técnico de Segurança", idDepartamento: 3 },
  { id: 3, nome: "Operador de Máquinas", idDepartamento: 1 },
];

const mockEntregas = [
  { id: 1, idFuncionario: 1, data_entrega: "2026-03-01" },
  { id: 2, idFuncionario: 1, data_entrega: "2026-03-06" },
  { id: 3, idFuncionario: 2, data_entrega: "2026-03-04" },
];

const mockDevolucoes = [
  { id: 1, idFuncionario: 1, data_devolucao: "2026-03-08" },
  { id: 2, idFuncionario: 3, data_devolucao: "2026-03-10" },
];

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

function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? Date.now()),
    nome: item?.nome ?? item?.Nome ?? "",
    matricula: String(item?.matricula ?? item?.Matricula ?? ""),
    idDepartamento: Number(
      item?.idDepartamento ??
        item?.departamento_id ??
        item?.departamentoId ??
        item?.id_departamento ??
        item?.departamento?.id ??
        0
    ),
    idFuncao: Number(
      item?.idFuncao ??
        item?.funcao_id ??
        item?.funcaoId ??
        item?.id_funcao ??
        item?.cargo_id ??
        item?.cargoId ??
        item?.funcao?.id ??
        item?.cargo?.id ??
        0
    ),
  };
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
        item?.IDDepartamento ??
        0
    ),
  };
}

function normalizarEntrega(item) {
  return {
    id: Number(item?.id ?? 0),
    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.id_funcionario ??
        item?.funcionario?.id ??
        0
    ),
    data_entrega: item?.data_entrega ?? item?.dataEntrega ?? item?.data ?? "",
  };
}

function normalizarDevolucao(item) {
  return {
    id: Number(item?.id ?? 0),
    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.id_funcionario ??
        item?.funcionario?.id ??
        0
    ),
    data_devolucao:
      item?.data_devolucao ?? item?.dataDevolucao ?? item?.data ?? "",
  };
}

function formatarData(data) {
  if (!data) return "-";

  const valor = String(data).substring(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return "-";

  return dataObj.toLocaleDateString("pt-BR");
}

function ModalDetalhesFuncionario({ aberto, funcionario, onClose }) {
  if (!aberto || !funcionario) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-slate-800 text-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Detalhes do funcionário</h3>
              <p className="text-sm text-blue-100 mt-1">
                Informações consolidadas do colaborador.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 transition rounded-lg px-3 py-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
                Nome
              </span>
              <strong className="text-slate-800">{funcionario.nome}</strong>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
                Matrícula
              </span>
              <strong className="text-slate-800">{funcionario.matricula || "-"}</strong>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
                Departamento
              </span>
              <strong className="text-slate-800">
                {funcionario.departamentoNome || "-"}
              </strong>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
                Função
              </span>
              <strong className="text-slate-800">{funcionario.funcaoNome || "-"}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-blue-700 font-bold block mb-1">
                Entregas
              </span>
              <strong className="text-2xl text-blue-800">
                {funcionario.totalEntregas}
              </strong>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-red-700 font-bold block mb-1">
                Devoluções
              </span>
              <strong className="text-2xl text-red-800">
                {funcionario.totalDevolucoes}
              </strong>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-emerald-700 font-bold block mb-1">
                Última movimentação
              </span>
              <strong className="text-sm text-emerald-800">
                {funcionario.ultimaMovimentacao || "-"}
              </strong>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Funcionarios({ usuarioLogado }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);

  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");
  const [funcionarioDetalhe, setFuncionarioDetalhe] = useState(null);

  const itensPorPagina = 6;

  const podeVisualizar = temPermissao(usuarioLogado, "visualizar_departamentos");

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      setErroTela("");

      try {
        const [
          listaFuncionarios,
          listaDepartamentos,
          listaFuncoes,
          listaEntregas,
          listaDevolucoes,
        ] = await Promise.all([
          buscarPrimeiraLista(["/funcionarios"], mockFuncionarios),
          buscarPrimeiraLista(["/departamentos"], mockDepartamentos),
          buscarPrimeiraLista(["/funcoes", "/cargos"], mockFuncoes),
          buscarPrimeiraLista(
            ["/entrega-epi", "/entrega_epi", "/entregas"],
            mockEntregas
          ),
          buscarPrimeiraLista(["/devolucao", "/devolucoes"], mockDevolucoes),
        ]);

        setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
        setDepartamentos(listaDepartamentos.map(normalizarDepartamento));
        setFuncoes(listaFuncoes.map(normalizarFuncao));
        setEntregas(listaEntregas.map(normalizarEntrega));
        setDevolucoes(listaDevolucoes.map(normalizarDevolucao));
      } catch (erro) {
        setErroTela(
          erro?.message || "Não foi possível carregar a tela de funcionários."
        );

        setFuncionarios(mockFuncionarios.map(normalizarFuncionario));
        setDepartamentos(mockDepartamentos.map(normalizarDepartamento));
        setFuncoes(mockFuncoes.map(normalizarFuncao));
        setEntregas(mockEntregas.map(normalizarEntrega));
        setDevolucoes(mockDevolucoes.map(normalizarDevolucao));
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const funcionariosResolvidos = useMemo(() => {
    return funcionarios.map((funcionario) => {
      const departamento = departamentos.find(
        (dep) => Number(dep.id) === Number(funcionario.idDepartamento)
      );

      const funcao = funcoes.find(
        (fn) => Number(fn.id) === Number(funcionario.idFuncao)
      );

      const entregasDoFuncionario = entregas.filter(
        (entrega) =>
          Number(entrega.idFuncionario) === Number(funcionario.id)
      );

      const devolucoesDoFuncionario = devolucoes.filter(
        (devolucao) =>
          Number(devolucao.idFuncionario) === Number(funcionario.id)
      );

      const datasMovimentacao = [
        ...entregasDoFuncionario.map((item) => item.data_entrega),
        ...devolucoesDoFuncionario.map((item) => item.data_devolucao),
      ]
        .filter(Boolean)
        .sort((a, b) => String(b).localeCompare(String(a)));

      return {
        ...funcionario,
        departamentoNome: departamento?.nome || "-",
        funcaoNome: funcao?.nome || "-",
        totalEntregas: entregasDoFuncionario.length,
        totalDevolucoes: devolucoesDoFuncionario.length,
        ultimaMovimentacao: datasMovimentacao.length
          ? formatarData(datasMovimentacao[0])
          : "-",
      };
    });
  }, [funcionarios, departamentos, funcoes, entregas, devolucoes]);

  const funcionariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    const listaOrdenada = [...funcionariosResolvidos].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );

    if (!termo) return listaOrdenada;

    return listaOrdenada.filter((f) => {
      return (
        (f.nome || "").toLowerCase().includes(termo) ||
        String(f.matricula || "").includes(termo) ||
        (f.departamentoNome || "").toLowerCase().includes(termo) ||
        (f.funcaoNome || "").toLowerCase().includes(termo)
      );
    });
  }, [funcionariosResolvidos, busca]);

  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(funcionariosFiltrados.length / itensPorPagina)
    );
    if (paginaAtual > total) setPaginaAtual(total);
  }, [paginaAtual, funcionariosFiltrados.length]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(funcionariosFiltrados.length / itensPorPagina)
  );

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;

  const funcionariosVisiveis = funcionariosFiltrados.slice(
    indexPrimeiroItem,
    indexUltimoItem
  );

  const resumo = useMemo(() => {
    const totalFuncionarios = funcionariosResolvidos.length;

    const departamentosAtivos = new Set(
      funcionariosResolvidos
        .map((item) => item.departamentoNome)
        .filter((item) => item && item !== "-")
    ).size;

    const comMovimentacao = funcionariosResolvidos.filter(
      (item) => item.totalEntregas > 0 || item.totalDevolucoes > 0
    ).length;

    return {
      totalFuncionarios,
      departamentosAtivos,
      comMovimentacao,
    };
  }, [funcionariosResolvidos]);

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de funcionários.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              👥 Funcionários
            </h2>
            <p className="text-sm text-gray-500">
              Consulte colaboradores, setor, função e movimentações no sistema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">
              Total de funcionários
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {carregando ? "--" : resumo.totalFuncionarios}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">
            <p className="text-xs text-blue-600 uppercase font-bold tracking-wide">
              Departamentos ativos
            </p>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {carregando ? "--" : resumo.departamentosAtivos}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4">
            <p className="text-xs text-emerald-600 uppercase font-bold tracking-wide">
              Com movimentação
            </p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">
              {carregando ? "--" : resumo.comMovimentacao}
            </p>
          </div>
        </div>

        {erroTela && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {erroTela}
          </div>
        )}

        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, matrícula, departamento ou função..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm lg:text-base"
          />
        </div>

        {carregando ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500">
            Carregando funcionários...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">Matrícula</th>
                    <th className="p-4 font-semibold">Nome</th>
                    <th className="p-4 font-semibold">Departamento</th>
                    <th className="p-4 font-semibold">Função</th>
                    <th className="p-4 font-semibold text-center">Entregas</th>
                    <th className="p-4 font-semibold text-center">Devoluções</th>
                    <th className="p-4 font-semibold">Última Movimentação</th>
                    <th className="p-4 font-semibold text-center">Detalhes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {funcionariosVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        Nenhum funcionário encontrado.
                      </td>
                    </tr>
                  ) : (
                    funcionariosVisiveis.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500 font-mono text-sm">
                          {f.matricula || "-"}
                        </td>

                        <td className="p-4">
                          <div className="font-medium text-gray-800">{f.nome}</div>
                        </td>

                        <td className="p-4 text-gray-600">{f.departamentoNome}</td>

                        <td className="p-4 text-gray-600">{f.funcaoNome}</td>

                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                            {f.totalEntregas}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                            {f.totalDevolucoes}
                          </span>
                        </td>

                        <td className="p-4 text-gray-600 text-sm">
                          {f.ultimaMovimentacao}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setFuncionarioDetalhe(f)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                          >
                            Ver mais
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {funcionariosVisiveis.length > 0 ? (
                funcionariosVisiveis.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{f.nome}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          Matrícula: {f.matricula || "-"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFuncionarioDetalhe(f)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition shrink-0"
                      >
                        Ver mais
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">
                          Departamento
                        </span>
                        <span className="text-gray-700 font-medium">
                          {f.departamentoNome}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">
                          Função
                        </span>
                        <span className="text-gray-700 font-medium">
                          {f.funcaoNome}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-blue-500 font-bold uppercase">
                          Entregas
                        </span>
                        <span className="text-blue-700 font-bold">
                          {f.totalEntregas}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-red-500 font-bold uppercase">
                          Devoluções
                        </span>
                        <span className="text-red-700 font-bold">
                          {f.totalDevolucoes}
                        </span>
                      </div>

                      <div className="col-span-2 pt-2 border-t border-gray-200">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">
                          Última movimentação
                        </span>
                        <span className="text-gray-700">
                          {f.ultimaMovimentacao}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  Nenhum funcionário encontrado.
                </div>
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-between items-center mt-6 px-1">
                <button
                  onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className={`px-4 py-2 rounded text-sm font-bold border ${
                    paginaAtual === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
                  }`}
                >
                  ← Anterior
                </button>

                <span className="text-xs lg:text-sm text-gray-600">
                  Pág. <b className="text-gray-900">{paginaAtual}</b> de{" "}
                  <b>{totalPaginas}</b>
                </span>

                <button
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className={`px-4 py-2 rounded text-sm font-bold border ${
                    paginaAtual === totalPaginas
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
                  }`}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ModalDetalhesFuncionario
        aberto={!!funcionarioDetalhe}
        funcionario={funcionarioDetalhe}
        onClose={() => setFuncionarioDetalhe(null)}
      />
    </>
  );
}

export default Funcionarios;