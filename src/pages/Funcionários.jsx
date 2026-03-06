import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const mockDepartamentos = [
  { id: 1, nome: "Produção", cor: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: 2, nome: "Segurança do Trabalho", cor: "bg-green-100 text-green-700 border-green-200" },
  { id: 3, nome: "Administrativo / RH", cor: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: 4, nome: "Logística", cor: "bg-orange-100 text-orange-700 border-orange-200" },
];

const mockFuncoes = [
  { id: 1, nome: "Operador de Máquinas", idDepartamento: 1 },
  { id: 2, nome: "Auxiliar de Produção", idDepartamento: 1 },
  { id: 3, nome: "Supervisor de Turno", idDepartamento: 1 },
  { id: 4, nome: "Técnico de Segurança", idDepartamento: 2 },
  { id: 5, nome: "Engenheiro de Segurança", idDepartamento: 2 },
  { id: 6, nome: "Analista de RH", idDepartamento: 3 },
  { id: 7, nome: "Auxiliar Administrativo", idDepartamento: 3 },
  { id: 8, nome: "Conferente", idDepartamento: 4 },
];

const mockFuncionariosInicial = [
  {
    id: 1,
    nome: "João Silva",
    matricula: "4839201",
    idDepartamento: 1,
    idFuncao: 1,
  },
  {
    id: 2,
    nome: "Maria Santos",
    matricula: "7391046",
    idDepartamento: 2,
    idFuncao: 4,
  },
];

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

function normalizarDepartamento(departamento) {
  return {
    id: Number(departamento?.id ?? 0),
    nome: departamento?.nome ?? "",
    cor:
      departamento?.cor ||
      "bg-slate-100 text-slate-700 border-slate-200",
  };
}

function normalizarFuncao(funcao) {
  return {
    id: Number(funcao?.id ?? 0),
    nome: funcao?.nome ?? "",
    idDepartamento: Number(
      funcao?.idDepartamento ??
        funcao?.departamento_id ??
        funcao?.departamentoId ??
        0
    ),
  };
}

function normalizarFuncionario(funcionario, listaDepartamentos, listaFuncoes) {
  const idDepartamento = Number(
    funcionario?.idDepartamento ??
      funcionario?.departamento_id ??
      funcionario?.departamentoId ??
      funcionario?.departamento?.id ??
      0
  );

  const idFuncao = Number(
    funcionario?.idFuncao ??
      funcionario?.funcao_id ??
      funcionario?.funcaoId ??
      funcionario?.cargo_id ??
      funcionario?.cargoId ??
      funcionario?.funcao?.id ??
      funcionario?.cargo?.id ??
      0
  );

  const departamentoObj =
    listaDepartamentos.find((d) => Number(d.id) === idDepartamento) ||
    (funcionario?.departamento
      ? normalizarDepartamento(funcionario.departamento)
      : null);

  const funcaoObj =
    listaFuncoes.find((f) => Number(f.id) === idFuncao) ||
    (funcionario?.funcao
      ? normalizarFuncao(funcionario.funcao)
      : funcionario?.cargo
      ? normalizarFuncao(funcionario.cargo)
      : null);

  return {
    id: funcionario?.id ?? Date.now() + Math.random(),
    nome: funcionario?.nome ?? "",
    matricula: String(funcionario?.matricula ?? ""),
    idDepartamento,
    idFuncao,
    departamento: departamentoObj,
    funcao: funcaoObj,
  };
}

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 5;

  const carregarFuncionarios = async () => {
    let listaDepartamentos = mockDepartamentos.map(normalizarDepartamento);
    let listaFuncoes = mockFuncoes.map(normalizarFuncao);
    let listaFuncionarios = mockFuncionariosInicial;

    try {
      const respDept = await api.get("/departamentos");
      listaDepartamentos = extrairLista(respDept, mockDepartamentos).map(normalizarDepartamento);
    } catch (erro) {
      listaDepartamentos = mockDepartamentos.map(normalizarDepartamento);
    }

    try {
      const respFuncoes = await api.get("/funcoes");
      listaFuncoes = extrairLista(respFuncoes, mockFuncoes).map(normalizarFuncao);
    } catch (erro) {
      try {
        const respCargos = await api.get("/cargos");
        listaFuncoes = extrairLista(respCargos, mockFuncoes).map(normalizarFuncao);
      } catch (erro2) {
        listaFuncoes = mockFuncoes.map(normalizarFuncao);
      }
    }

    try {
      const respFuncionarios = await api.get("/funcionarios");
      listaFuncionarios = extrairLista(respFuncionarios, mockFuncionariosInicial);
    } catch (erro) {
      listaFuncionarios = mockFuncionariosInicial;
    }

    setDepartamentos(listaDepartamentos);
    setFuncoes(listaFuncoes);
    setFuncionarios(
      listaFuncionarios.map((funcionario) =>
        normalizarFuncionario(funcionario, listaDepartamentos, listaFuncoes)
      )
    );
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const listaFiltrada = useMemo(() => {
    const term = busca.trim().toLowerCase();

    if (!term) return funcionarios;

    return funcionarios.filter((f) => {
      const nome = (f.nome || "").toLowerCase();
      const matricula = String(f.matricula || "");
      const departamento = (f.departamento?.nome || "").toLowerCase();
      const funcao = (f.funcao?.nome || "").toLowerCase();

      return (
        nome.includes(term) ||
        matricula.includes(term) ||
        departamento.includes(term) ||
        funcao.includes(term)
      );
    });
  }, [funcionarios, busca]);

  const funcionariosOrdenados = useMemo(() => {
    return [...listaFiltrada].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );
  }, [listaFiltrada]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(funcionariosOrdenados.length / itensPorPagina)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const funcionariosVisiveis = funcionariosOrdenados.slice(
    indexPrimeiroItem,
    indexUltimoItem
  );

  const imprimirListaColaboradores = () => {
    const dataEmissao = new Date().toLocaleDateString("pt-BR");
    const totalColaboradores = funcionariosOrdenados.length;

    const conteudoHTML = `
      <html>
        <head>
          <title>Relatório de Colaboradores</title>
        </head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h2>Quadro de Colaboradores - SGEPI</h2>
          <p>Emissão: ${dataEmissao} | Total: ${totalColaboradores}</p>

          <table border="1" style="width:100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #eee;">
                <th style="padding: 8px;">Matrícula</th>
                <th style="padding: 8px;">Nome</th>
                <th style="padding: 8px;">Departamento</th>
                <th style="padding: 8px;">Função</th>
              </tr>
            </thead>
            <tbody>
              ${funcionariosOrdenados
                .map(
                  (f) => `
                    <tr>
                      <td style="padding: 8px;">${String(f.matricula ?? "")}</td>
                      <td style="padding: 8px;">${String(f.nome ?? "")}</td>
                      <td style="padding: 8px;">${String(f.departamento?.nome ?? "")}</td>
                      <td style="padding: 8px;">${String(f.funcao?.nome ?? "")}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=900,height=600");
    win.document.write(conteudoHTML);
    win.document.close();
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
            👥 Colaboradores
          </h2>
          <p className="text-sm text-gray-500">
            Lista de colaboradores cadastrados no sistema.
          </p>
        </div>

        <button
          onClick={imprimirListaColaboradores}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition shadow-sm border border-gray-300 flex items-center gap-2 justify-center w-full sm:w-auto"
        >
          <span>🖨️</span> Imprimir
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
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
      </div>

      <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Matrícula</th>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Departamento</th>
              <th className="p-4 font-semibold">Função</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {funcionariosVisiveis.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            ) : (
              funcionariosVisiveis.map((func) => (
                <tr key={func.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-gray-600">{func.matricula || "-"}</td>
                  <td className="p-4 font-medium text-gray-800">{func.nome || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold border ${
                        func.departamento?.cor ||
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {func.departamento?.nome || "-"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{func.funcao?.nome || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {funcionariosVisiveis.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Nenhum funcionário encontrado.
          </div>
        ) : (
          funcionariosVisiveis.map((func) => (
            <div
              key={func.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{func.nome || "-"}</h3>
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    Mat: {func.matricula || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-[10px] font-bold border ${
                      func.departamento?.cor ||
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {func.departamento?.nome || "-"}
                  </span>
                </div>

                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="font-semibold text-gray-400 text-xs uppercase">
                    Função:
                  </span>
                  {func.funcao?.nome || "-"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-between items-center mt-6 px-1">
          <button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            className={`px-4 py-2 rounded text-sm font-bold border ${
              paginaAtual === 1
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-blue-700 border-blue-200"
            }`}
          >
            ← Anterior
          </button>

          <span className="text-xs lg:text-sm text-gray-600">
            Pág. <b className="text-gray-900">{paginaAtual}</b> de <b>{totalPaginas}</b>
          </span>

          <button
            onClick={() =>
              setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
            }
            disabled={paginaAtual === totalPaginas}
            className={`px-4 py-2 rounded text-sm font-bold border ${
              paginaAtual === totalPaginas
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-blue-700 border-blue-200"
            }`}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

export default Funcionarios;