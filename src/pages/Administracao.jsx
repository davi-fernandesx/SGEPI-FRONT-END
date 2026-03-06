import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import ModalNovoEpi from "../components/modals/ModalNovoEpi";

const SENHA_ADMINISTRACAO = "123";

const mockDepartamentosInicial = [
  { id: 1, nome: "Produção", cor: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: 2, nome: "Logística", cor: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: 3, nome: "Segurança do Trabalho", cor: "bg-green-100 text-green-700 border-green-200" },
];

const mockCargosInicial = [
  { id: 1, nome: "Almoxarife", idDepto: 2 },
  { id: 2, nome: "Técnico de Segurança", idDepto: 3 },
  { id: 3, nome: "Operador de Máquinas", idDepto: 1 },
];

const PERFIS = [
  { value: "admin", label: "Administrador", badge: "bg-red-100 text-red-700 border-red-200" },
  { value: "gerente", label: "Gerente", badge: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "colaborador", label: "Colaborador", badge: "bg-slate-100 text-slate-700 border-slate-200" },
];

const CATEGORIAS_EPI = [
  { id: 1, nome: "Proteção da Cabeça (Capacetes/Toucas)" },
  { id: 2, nome: "Proteção Auditiva (Protetores/Abafadores)" },
  { id: 3, nome: "Proteção Respiratória (Máscaras/Filtros)" },
  { id: 4, nome: "Proteção Visual (Óculos/Viseiras)" },
  { id: 5, nome: "Proteção de Mãos (Luvas)" },
  { id: 6, nome: "Proteção de Pés (Botinas/Sapatos)" },
  { id: 7, nome: "Proteção contra Quedas (Cintos)" },
];

const mockFuncionariosInicial = [
  {
    id: 1,
    nome: "João Silva",
    matricula: "4839201",
    departamento: mockDepartamentosInicial[0],
    cargo: mockCargosInicial[2],
    perfil: "colaborador",
  },
  {
    id: 2,
    nome: "Maria Santos",
    matricula: "7391046",
    departamento: mockDepartamentosInicial[2],
    cargo: mockCargosInicial[1],
    perfil: "gerente",
  },
  {
    id: 3,
    nome: "Carlos Lima",
    matricula: "5827410",
    departamento: mockDepartamentosInicial[1],
    cargo: mockCargosInicial[0],
    perfil: "colaborador",
  },
];

const mockEpisInicial = [
  {
    id: 1,
    nome: "Bota de Segurança",
    categoria: 6,
    fabricante: "Bracol",
    ca: "15432",
    quantidade: 48,
    validade: "2027-12-31T00:00:00Z",
  },
  {
    id: 2,
    nome: "Óculos de Proteção Incolor",
    categoria: 4,
    fabricante: "3M",
    ca: "10346",
    quantidade: 120,
    validade: "2028-06-30T00:00:00Z",
  },
];

function gerarMatricula() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

function getCargoDeptId(cargo) {
  return Number(
    cargo?.idDepto ??
      cargo?.departamento_id ??
      cargo?.departamentoId ??
      cargo?.idDepartamento ??
      0
  );
}

function getPerfilBadge(perfil) {
  return PERFIS.find((p) => p.value === perfil)?.badge || "bg-slate-100 text-slate-700 border-slate-200";
}

function getPerfilLabel(perfil) {
  return PERFIS.find((p) => p.value === perfil)?.label || perfil;
}

function getCategoriaEpiLabel(categoria) {
  if (!categoria) return "Sem categoria";

  if (typeof categoria === "string") return categoria;
  if (typeof categoria === "object" && categoria?.nome) return categoria.nome;

  const id = Number(categoria?.id ?? categoria?.categoria_id ?? categoria);
  return CATEGORIAS_EPI.find((c) => c.id === id)?.nome || "Sem categoria";
}

function formatarData(valor) {
  if (!valor) return "-";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";
  return data.toLocaleDateString("pt-BR");
}

function normalizarFuncionario(funcionario, listaDepartamentos, listaCargos) {
  const deptId = Number(
    funcionario?.departamento_id ??
      funcionario?.departamentoId ??
      funcionario?.idDepartamento ??
      funcionario?.departamento?.id ??
      0
  );

  const cargoId = Number(
    funcionario?.cargo_id ??
      funcionario?.cargoId ??
      funcionario?.idCargo ??
      funcionario?.funcao_id ??
      funcionario?.funcaoId ??
      funcionario?.cargo?.id ??
      funcionario?.funcao?.id ??
      0
  );

  const departamentoObj =
    listaDepartamentos.find((d) => Number(d.id) === deptId) ||
    funcionario?.departamento ||
    null;

  const cargoObj =
    listaCargos.find((c) => Number(c.id) === cargoId) ||
    funcionario?.cargo ||
    funcionario?.funcao ||
    null;

  return {
    id: funcionario?.id ?? Date.now(),
    nome: funcionario?.nome ?? "",
    matricula: String(funcionario?.matricula ?? gerarMatricula()),
    departamento: departamentoObj,
    cargo: cargoObj,
    perfil: funcionario?.perfil || funcionario?.role || "colaborador",
  };
}

function normalizarEpi(produto) {
  return {
    id: produto?.id ?? Date.now() + Math.random(),
    nome: produto?.nome ?? "",
    categoriaLabel: getCategoriaEpiLabel(produto?.categoria ?? produto?.categoria_id ?? produto?.idCategoria),
    fabricante: produto?.fabricante ?? produto?.marca ?? "-",
    ca: produto?.ca ?? produto?.certificadoAprovacao ?? "-",
    quantidade: Number(produto?.quantidade ?? produto?.estoque ?? 0),
    validade: produto?.validade ?? null,
  };
}

function Administracao() {
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [senhaAcesso, setSenhaAcesso] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const [abaAtiva, setAbaAtiva] = useState("fornecedores");
  const [fornecedores, setFornecedores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);

  const [carregando, setCarregando] = useState(false);
  const [salvandoFuncionario, setSalvandoFuncionario] = useState(false);

  const [novoForn, setNovoForn] = useState({ nome: "", cnpj: "", contato: "" });
  const [novoDepto, setNovoDepto] = useState("");
  const [novoCargo, setNovoCargo] = useState({ nome: "", idDepto: "" });

  const [buscaFuncionario, setBuscaFuncionario] = useState("");
  const [buscaEpi, setBuscaEpi] = useState("");

  const [modalFuncionarioAberto, setModalFuncionarioAberto] = useState(false);
  const [modalEpiAberto, setModalEpiAberto] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);

  const [formFuncNome, setFormFuncNome] = useState("");
  const [formFuncMatricula, setFormFuncMatricula] = useState("");
  const [formFuncDepartamento, setFormFuncDepartamento] = useState("");
  const [formFuncCargo, setFormFuncCargo] = useState("");
  const [formFuncPerfil, setFormFuncPerfil] = useState("colaborador");
  const [formFuncSenha, setFormFuncSenha] = useState("");

  const carregarDadosAdm = async () => {
    let listaFornecedores = [];
    let listaDepartamentos = mockDepartamentosInicial;
    let listaCargos = mockCargosInicial;
    let listaFuncionarios = mockFuncionariosInicial;
    let listaEpis = mockEpisInicial;

    try {
      const resForn = await api.get("/fornecedores");
      listaFornecedores = extrairLista(resForn, []);
    } catch (erro) {
      listaFornecedores = [];
    }

    try {
      const resDept = await api.get("/departamentos");
      listaDepartamentos = extrairLista(resDept, mockDepartamentosInicial);
    } catch (erro) {
      listaDepartamentos = mockDepartamentosInicial;
    }

    try {
      const resCargos = await api.get("/cargos");
      listaCargos = extrairLista(resCargos, mockCargosInicial);
    } catch (erro) {
      listaCargos = mockCargosInicial;
    }

    try {
      const resFuncionarios = await api.get("/funcionarios");
      const dadosFuncionarios = extrairLista(resFuncionarios, mockFuncionariosInicial);
      listaFuncionarios = dadosFuncionarios.map((f) =>
        normalizarFuncionario(f, listaDepartamentos, listaCargos)
      );
    } catch (erro) {
      listaFuncionarios = mockFuncionariosInicial.map((f) =>
        normalizarFuncionario(f, listaDepartamentos, listaCargos)
      );
    }

    try {
      const resEpis = await api.get("/produtos");
      const dadosEpis = extrairLista(resEpis, mockEpisInicial);
      listaEpis = dadosEpis.map((epi) => normalizarEpi(epi));
    } catch (erro) {
      listaEpis = mockEpisInicial.map((epi) => normalizarEpi(epi));
    }

    setFornecedores(listaFornecedores);
    setDepartamentos(listaDepartamentos);
    setCargos(listaCargos);
    setFuncionarios(listaFuncionarios);
    setEpis(listaEpis);
  };

  useEffect(() => {
    if (acessoLiberado) {
      carregarDadosAdm();
    }
  }, [acessoLiberado]);

  const validarAcesso = (e) => {
    e.preventDefault();
    setErroSenha("");

    if (!senhaAcesso.trim()) {
      setErroSenha("Digite a senha para acessar.");
      return;
    }

    if (senhaAcesso === SENHA_ADMINISTRACAO) {
      setAcessoLiberado(true);
      setSenhaAcesso("");
      setErroSenha("");
    } else {
      setErroSenha("Senha incorreta.");
    }
  };

  const adicionarFornecedor = async () => {
    if (!novoForn.nome || !novoForn.cnpj) {
      alert("Preencha Nome e CNPJ!");
      return;
    }

    setCarregando(true);

    try {
      await api.post("/fornecedor", novoForn);
      const item = { id: Date.now(), ...novoForn };
      setFornecedores((prev) => [item, ...prev]);
      setNovoForn({ nome: "", cnpj: "", contato: "" });
    } catch (erro) {
      const item = { id: Date.now(), ...novoForn };
      setFornecedores((prev) => [item, ...prev]);
      setNovoForn({ nome: "", cnpj: "", contato: "" });
    } finally {
      setCarregando(false);
    }
  };

  const adicionarDepartamento = async () => {
    if (!novoDepto) {
      alert("Digite o nome do departamento!");
      return;
    }

    setCarregando(true);

    const payload = {
      nome: novoDepto,
      cor: "bg-gray-100 text-gray-700 border-gray-200",
    };

    try {
      await api.post("/departamento", payload);
      const item = { id: Date.now(), ...payload };
      setDepartamentos((prev) => [item, ...prev]);
      setNovoDepto("");
    } catch (erro) {
      const item = { id: Date.now(), ...payload };
      setDepartamentos((prev) => [item, ...prev]);
      setNovoDepto("");
    } finally {
      setCarregando(false);
    }
  };

  const adicionarCargo = async () => {
    if (!novoCargo.nome || !novoCargo.idDepto) {
      alert("Preencha o nome e selecione o departamento!");
      return;
    }

    setCarregando(true);

    const payload = {
      nome: novoCargo.nome,
      idDepto: Number(novoCargo.idDepto),
    };

    try {
      await api.post("/cargo", payload);
      const item = { id: Date.now(), ...payload };
      setCargos((prev) => [item, ...prev]);
      setNovoCargo({ nome: "", idDepto: "" });
    } catch (erro) {
      const item = { id: Date.now(), ...payload };
      setCargos((prev) => [item, ...prev]);
      setNovoCargo({ nome: "", idDepto: "" });
    } finally {
      setCarregando(false);
    }
  };

  const removerItem = async (id, setter, lista, endpoint) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await api.delete(`/${endpoint}/${id}`);
        setter(lista.filter((item) => item.id !== id));
      } catch (erro) {
        setter(lista.filter((item) => item.id !== id));
      }
    }
  };

  const abrirModalNovoFuncionario = () => {
    setFuncionarioEditando(null);
    setFormFuncNome("");
    setFormFuncMatricula(gerarMatricula());
    setFormFuncDepartamento("");
    setFormFuncCargo("");
    setFormFuncPerfil("colaborador");
    setFormFuncSenha("");
    setModalFuncionarioAberto(true);
  };

  const abrirModalEditarFuncionario = (funcionario) => {
    setFuncionarioEditando(funcionario);
    setFormFuncNome(funcionario.nome || "");
    setFormFuncMatricula(String(funcionario.matricula || ""));
    setFormFuncDepartamento(String(funcionario.departamento?.id || ""));
    setFormFuncCargo(String(funcionario.cargo?.id || ""));
    setFormFuncPerfil(funcionario.perfil || "colaborador");
    setFormFuncSenha("");
    setModalFuncionarioAberto(true);
  };

  const fecharModalFuncionario = () => {
    setModalFuncionarioAberto(false);
    setFuncionarioEditando(null);
    setFormFuncNome("");
    setFormFuncMatricula("");
    setFormFuncDepartamento("");
    setFormFuncCargo("");
    setFormFuncPerfil("colaborador");
    setFormFuncSenha("");
  };

  const cargosDisponiveisForm = useMemo(() => {
    return cargos.filter((cargo) => getCargoDeptId(cargo) === Number(formFuncDepartamento));
  }, [cargos, formFuncDepartamento]);

  const funcionariosFiltrados = useMemo(() => {
    const termo = buscaFuncionario.trim().toLowerCase();

    const lista = [...funcionarios].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

    if (!termo) return lista;

    return lista.filter((f) => {
      const nome = (f.nome || "").toLowerCase();
      const matricula = String(f.matricula || "");
      const departamento = (f.departamento?.nome || "").toLowerCase();
      const cargo = (f.cargo?.nome || "").toLowerCase();

      return (
        nome.includes(termo) ||
        matricula.includes(termo) ||
        departamento.includes(termo) ||
        cargo.includes(termo)
      );
    });
  }, [funcionarios, buscaFuncionario]);

  const episFiltrados = useMemo(() => {
    const termo = buscaEpi.trim().toLowerCase();

    const lista = [...epis].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

    if (!termo) return lista;

    return lista.filter((epi) => {
      const nome = (epi.nome || "").toLowerCase();
      const fabricante = (epi.fabricante || "").toLowerCase();
      const ca = String(epi.ca || "").toLowerCase();
      const categoria = (epi.categoriaLabel || "").toLowerCase();

      return (
        nome.includes(termo) ||
        fabricante.includes(termo) ||
        ca.includes(termo) ||
        categoria.includes(termo)
      );
    });
  }, [epis, buscaEpi]);

  const salvarFuncionario = async () => {
    if (!formFuncNome || !formFuncMatricula || !formFuncDepartamento || !formFuncCargo || !formFuncPerfil) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!funcionarioEditando && (!formFuncSenha || formFuncSenha.trim().length < 4)) {
      alert("Defina uma senha com pelo menos 4 caracteres.");
      return;
    }

    const departamentoObj = departamentos.find((d) => Number(d.id) === Number(formFuncDepartamento));
    const cargoObj = cargos.find((c) => Number(c.id) === Number(formFuncCargo));

    if (!departamentoObj || !cargoObj) {
      alert("Selecione um departamento e um cargo válidos.");
      return;
    }

    setSalvandoFuncionario(true);

    const payload = {
      nome: formFuncNome,
      matricula: formFuncMatricula,
      departamento_id: Number(formFuncDepartamento),
      cargo_id: Number(formFuncCargo),
      perfil: formFuncPerfil,
      senha: formFuncSenha || undefined,
    };

    if (funcionarioEditando) {
      try {
        await api.put(`/funcionario/${funcionarioEditando.id}`, payload);

        setFuncionarios((prev) =>
          prev.map((f) =>
            f.id === funcionarioEditando.id
              ? {
                  ...f,
                  nome: formFuncNome,
                  matricula: formFuncMatricula,
                  departamento: departamentoObj,
                  cargo: cargoObj,
                  perfil: formFuncPerfil,
                }
              : f
          )
        );

        fecharModalFuncionario();
      } catch (erro) {
        setFuncionarios((prev) =>
          prev.map((f) =>
            f.id === funcionarioEditando.id
              ? {
                  ...f,
                  nome: formFuncNome,
                  matricula: formFuncMatricula,
                  departamento: departamentoObj,
                  cargo: cargoObj,
                  perfil: formFuncPerfil,
                }
              : f
          )
        );

        fecharModalFuncionario();
      } finally {
        setSalvandoFuncionario(false);
      }

      return;
    }

    try {
      await api.post("/funcionario", payload);

      const novoFuncionario = {
        id: Date.now(),
        nome: formFuncNome,
        matricula: formFuncMatricula,
        departamento: departamentoObj,
        cargo: cargoObj,
        perfil: formFuncPerfil,
      };

      setFuncionarios((prev) => [novoFuncionario, ...prev]);
      fecharModalFuncionario();
    } catch (erro) {
      const novoFuncionario = {
        id: Date.now(),
        nome: formFuncNome,
        matricula: formFuncMatricula,
        departamento: departamentoObj,
        cargo: cargoObj,
        perfil: formFuncPerfil,
      };

      setFuncionarios((prev) => [novoFuncionario, ...prev]);
      fecharModalFuncionario();
    } finally {
      setSalvandoFuncionario(false);
    }
  };

  const excluirFuncionario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este funcionário?")) return;

    try {
      await api.delete(`/funcionario/${id}`);
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    } catch (erro) {
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const aoSalvarEpi = async () => {
    await carregarDadosAdm();
    setAbaAtiva("epis");
  };

  if (!acessoLiberado) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="max-w-md mx-auto py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              🔒 Área Administrativa
            </h2>
            <p className="text-sm text-gray-500 mt-2">Digite a senha para acessar esta seção.</p>
          </div>

          <form onSubmit={validarAcesso} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            {erroSenha && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {erroSenha}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Senha de acesso</label>
              <input
                type="password"
                value={senhaAcesso}
                onChange={(e) => setSenhaAcesso(e.target.value)}
                placeholder="Digite a senha"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition text-sm"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              ⚙️ Painel Administrativo
            </h2>
            <p className="text-sm text-gray-500">
              Gerencie tabelas auxiliares e cadastros base do sistema.
            </p>
          </div>

          <button
            onClick={() => {
              setAcessoLiberado(false);
              setSenhaAcesso("");
              setErroSenha("");
              setAbaAtiva("fornecedores");
            }}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition w-full sm:w-auto"
          >
            🔐 Bloquear Área
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-6">
          <button
            onClick={() => setAbaAtiva("fornecedores")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              abaAtiva === "fornecedores"
                ? "bg-slate-800 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🏭 Fornecedores
          </button>

          <button
            onClick={() => setAbaAtiva("departamentos")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              abaAtiva === "departamentos"
                ? "bg-slate-800 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🏢 Departamentos
          </button>

          <button
            onClick={() => setAbaAtiva("cargos")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              abaAtiva === "cargos"
                ? "bg-slate-800 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            💼 Cargos & Funções
          </button>

          <button
            onClick={() => setAbaAtiva("funcionarios")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              abaAtiva === "funcionarios"
                ? "bg-slate-800 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            👥 Funcionários
          </button>

          <button
            onClick={() => setAbaAtiva("epis")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              abaAtiva === "epis"
                ? "bg-slate-800 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🦺 EPIs
          </button>
        </div>

        {abaAtiva === "fornecedores" && (
          <div className="animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Novo Fornecedor</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Razão Social / Nome</label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoForn.nome}
                    onChange={(e) => setNovoForn({ ...novoForn, nome: e.target.value })}
                    placeholder="Ex: Empresa X Ltda"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">CNPJ</label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoForn.cnpj}
                    onChange={(e) => setNovoForn({ ...novoForn, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <button
                    onClick={adicionarFornecedor}
                    disabled={carregando}
                    className="w-full bg-emerald-600 text-white font-bold py-2 rounded hover:bg-emerald-700 transition text-sm"
                  >
                    {carregando ? "..." : "+ Cadastrar"}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs text-slate-500 mb-1 block">Email / Contato</label>
                <input
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  value={novoForn.contato}
                  onChange={(e) => setNovoForn({ ...novoForn, contato: e.target.value })}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">Empresa</th>
                    <th className="p-3">CNPJ</th>
                    <th className="p-3">Contato</th>
                    <th className="p-3 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fornecedores.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-400 italic">
                        Nenhum fornecedor registado.
                      </td>
                    </tr>
                  ) : (
                    fornecedores.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{f.nome}</td>
                        <td className="p-3 text-slate-500 font-mono text-xs">{f.cnpj}</td>
                        <td className="p-3 text-slate-500">{f.contato}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => removerItem(f.id, setFornecedores, fornecedores, "fornecedor")}
                            className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {abaAtiva === "departamentos" && (
          <div className="animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs text-slate-500 mb-1 block">Nome do Departamento</label>
                <input
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  value={novoDepto}
                  onChange={(e) => setNovoDepto(e.target.value)}
                  placeholder="Ex: Produção"
                />
              </div>

              <button
                onClick={adicionarDepartamento}
                disabled={carregando}
                className="w-full md:w-auto px-6 bg-emerald-600 text-white font-bold py-2 rounded hover:bg-emerald-700 transition text-sm"
              >
                + Adicionar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {departamentos.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
                >
                  <span className={`px-2 py-1 rounded text-xs font-bold ${d.cor}`}>{d.nome}</span>
                  <button
                    onClick={() => removerItem(d.id, setDepartamentos, departamentos, "departamento")}
                    className="text-gray-300 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === "cargos" && (
          <div className="animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Novo Cargo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Departamento Vinculado</label>
                  <select
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
                    value={novoCargo.idDepto}
                    onChange={(e) => setNovoCargo({ ...novoCargo, idDepto: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Nome do Cargo</label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoCargo.nome}
                    onChange={(e) => setNovoCargo({ ...novoCargo, nome: e.target.value })}
                    placeholder="Ex: Operador"
                  />
                </div>

                <div>
                  <button
                    onClick={adicionarCargo}
                    disabled={carregando}
                    className="w-full bg-emerald-600 text-white font-bold py-2 rounded hover:bg-emerald-700 transition text-sm"
                  >
                    + Salvar Cargo
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">Cargo</th>
                    <th className="p-3">Departamento</th>
                    <th className="p-3 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cargos.map((c) => {
                    const dept = departamentos.find((d) => Number(d.id) === getCargoDeptId(c));

                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{c.nome}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dept?.cor || "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {dept?.nome || "Sem Depto"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => removerItem(c.id, setCargos, cargos, "cargo")}
                            className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {abaAtiva === "funcionarios" && (
          <div className="animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
                <div className="w-full lg:max-w-md">
                  <label className="text-xs text-slate-500 mb-1 block">Buscar funcionário</label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={buscaFuncionario}
                    onChange={(e) => setBuscaFuncionario(e.target.value)}
                    placeholder="Nome, matrícula, departamento ou cargo"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="text-sm text-slate-500 flex items-center">
                    Total: <b className="text-slate-800 ml-1">{funcionariosFiltrados.length}</b>
                  </div>

                  <button
                    onClick={abrirModalNovoFuncionario}
                    className="px-4 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition text-sm shadow-sm"
                  >
                    👥 Cadastrar Funcionário
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">Matrícula</th>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Departamento</th>
                    <th className="p-3">Cargo</th>
                    <th className="p-3">Perfil</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {funcionariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-400 italic">
                        Nenhum funcionário encontrado.
                      </td>
                    </tr>
                  ) : (
                    funcionariosFiltrados.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500 font-mono text-xs">{f.matricula}</td>
                        <td className="p-3 font-medium text-slate-800">{f.nome}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.departamento?.cor || "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {f.departamento?.nome || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{f.cargo?.nome || "-"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPerfilBadge(
                              f.perfil
                            )}`}
                          >
                            {getPerfilLabel(f.perfil)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => abrirModalEditarFuncionario(f)}
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

            <div className="lg:hidden space-y-4">
              {funcionariosFiltrados.length === 0 ? (
                <div className="p-4 text-center text-gray-400 italic border rounded-lg">
                  Nenhum funcionário encontrado.
                </div>
              ) : (
                funcionariosFiltrados.map((f) => (
                  <div key={f.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800">{f.nome}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-1">Mat: {f.matricula}</p>
                      </div>

                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold border h-fit ${getPerfilBadge(
                          f.perfil
                        )}`}
                      >
                        {getPerfilLabel(f.perfil)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div>
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            f.departamento?.cor || "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {f.departamento?.nome || "-"}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600">
                        <b>Cargo:</b> {f.cargo?.nome || "-"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => abrirModalEditarFuncionario(f)}
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
          </div>
        )}

        {abaAtiva === "epis" && (
          <div className="animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
                <div className="w-full lg:max-w-md">
                  <label className="text-xs text-slate-500 mb-1 block">Buscar EPI</label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={buscaEpi}
                    onChange={(e) => setBuscaEpi(e.target.value)}
                    placeholder="Nome, categoria, fabricante ou CA"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="text-sm text-slate-500 flex items-center">
                    Total: <b className="text-slate-800 ml-1">{episFiltrados.length}</b>
                  </div>

                  <button
                    onClick={() => setModalEpiAberto(true)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition text-sm shadow-sm"
                  >
                    🦺 Cadastrar EPI
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">EPI</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Fabricante</th>
                    <th className="p-3">CA</th>
                    <th className="p-3">Quantidade</th>
                    <th className="p-3">Validade</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {episFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-400 italic">
                        Nenhum EPI encontrado.
                      </td>
                    </tr>
                  ) : (
                    episFiltrados.map((epi) => (
                      <tr key={epi.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{epi.nome}</td>
                        <td className="p-3 text-slate-600">{epi.categoriaLabel}</td>
                        <td className="p-3 text-slate-600">{epi.fabricante || "-"}</td>
                        <td className="p-3 text-slate-600 font-mono text-xs">{epi.ca || "-"}</td>
                        <td className="p-3 text-slate-600">{epi.quantidade}</td>
                        <td className="p-3 text-slate-600">{formatarData(epi.validade)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {episFiltrados.length === 0 ? (
                <div className="p-4 text-center text-gray-400 italic border rounded-lg">
                  Nenhum EPI encontrado.
                </div>
              ) : (
                episFiltrados.map((epi) => (
                  <div key={epi.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800">{epi.nome}</h3>
                        <p className="text-xs text-slate-500 mt-1">{epi.categoriaLabel}</p>
                      </div>

                      <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 h-fit">
                        Qtd: {epi.quantidade}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div>
                        <b>Fabricante:</b> {epi.fabricante || "-"}
                      </div>
                      <div>
                        <b>CA:</b> {epi.ca || "-"}
                      </div>
                      <div>
                        <b>Validade:</b> {formatarData(epi.validade)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {modalFuncionarioAberto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {funcionarioEditando ? "✏️ Editar Funcionário" : "👥 Cadastrar Funcionário"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {funcionarioEditando
                    ? "Atualize os dados do funcionário."
                    : "Preencha os dados para cadastrar um novo funcionário."}
                </p>
              </div>

              <button
                onClick={fecharModalFuncionario}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Nome completo</label>
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  value={formFuncNome}
                  onChange={(e) => setFormFuncNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Matrícula</label>
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  value={formFuncMatricula}
                  onChange={(e) => setFormFuncMatricula(e.target.value)}
                  placeholder="Ex: 4839201"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Perfil de acesso</label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
                  value={formFuncPerfil}
                  onChange={(e) => setFormFuncPerfil(e.target.value)}
                >
                  {PERFIS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Departamento</label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
                  value={formFuncDepartamento}
                  onChange={(e) => {
                    setFormFuncDepartamento(e.target.value);
                    setFormFuncCargo("");
                  }}
                >
                  <option value="">Selecione...</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Cargo / Função</label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white disabled:bg-slate-50"
                  value={formFuncCargo}
                  onChange={(e) => setFormFuncCargo(e.target.value)}
                  disabled={!formFuncDepartamento}
                >
                  <option value="">Selecione...</option>
                  {cargosDisponiveisForm.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">
                  {funcionarioEditando ? "Nova senha (opcional)" : "Senha de acesso"}
                </label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  value={formFuncSenha}
                  onChange={(e) => setFormFuncSenha(e.target.value)}
                  placeholder={
                    funcionarioEditando
                      ? "Deixe em branco para não alterar"
                      : "Digite a senha do funcionário"
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={fecharModalFuncionario}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>

              <button
                onClick={salvarFuncionario}
                disabled={salvandoFuncionario}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-700 text-white hover:bg-blue-800 transition disabled:opacity-60"
              >
                {salvandoFuncionario
                  ? "Salvando..."
                  : funcionarioEditando
                  ? "Salvar Alterações"
                  : "Cadastrar Funcionário"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEpiAberto && (
        <ModalNovoEpi
          onClose={() => setModalEpiAberto(false)}
          onSalvar={aoSalvarEpi}
        />
      )}
    </>
  );
}

export default Administracao;