import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { temPermissao } from "../utils/permissoes";
import ModalNovoEpi from "../components/modals/ModalNovoEpi";

const SENHA_ADMINISTRACAO = "123";

const mockDepartamentosInicial = [
  { id: 1, nome: "Produção" },
  { id: 2, nome: "Logística" },
  { id: 3, nome: "Segurança do Trabalho" },
];

const mockFuncoesInicial = [
  { id: 1, nome: "Almoxarife", idDepartamento: 2 },
  { id: 2, nome: "Técnico de Segurança", idDepartamento: 3 },
  { id: 3, nome: "Operador de Máquinas", idDepartamento: 1 },
];

const mockFornecedoresInicial = [
  {
    id: 1,
    razao_social: "3M do Brasil Ltda",
    nome_fantasia: "3M",
    cnpj: "45.985.371/0001-08",
    inscricao_estadual: "123.456.789.000",
  },
  {
    id: 2,
    razao_social: "Bracol Calçados de Segurança Ltda",
    nome_fantasia: "Bracol",
    cnpj: "12.345.678/0001-90",
    inscricao_estadual: "987.654.321.000",
  },
];

const mockFuncionariosInicial = [
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

const mockTiposProtecaoInicial = [
  { id: 1, nome: "Proteção da Cabeça" },
  { id: 2, nome: "Proteção Auditiva" },
  { id: 3, nome: "Proteção Respiratória" },
  { id: 4, nome: "Proteção Visual" },
  { id: 5, nome: "Proteção de Mãos" },
  { id: 6, nome: "Proteção de Pés" },
  { id: 7, nome: "Proteção contra Quedas" },
];

const mockUsuariosSistemaInicial = [
  {
    id: 1,
    nome: "Administrador Geral",
    matricula: "1000001",
    email: "admin@empresa.com",
    senha: "123",
    perfil: "admin",
    status: "ativo",
  },
];

const mockEpisInicial = [
  {
    id: 1,
    nome: "Bota de Segurança",
    fabricante: "Bracol",
    CA: "15432",
    descricao: "Bota ocupacional para uso industrial",
    validade_CA: "2027-12-31T00:00:00Z",
    idTipoProtecao: 6,
    alerta_minimo: 10,
    tamanhos: ["38", "39", "40", "41", "42"],
  },
  {
    id: 2,
    nome: "Óculos de Proteção Incolor",
    fabricante: "3M",
    CA: "10346",
    descricao: "Proteção visual contra partículas",
    validade_CA: "2028-06-30T00:00:00Z",
    idTipoProtecao: 4,
    alerta_minimo: 20,
    tamanhos: ["Único"],
  },
];

function gerarMatricula() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

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
      // tenta a próxima rota
    }
  }
  return fallback;
}

async function tentarPost(rotas, payload) {
  for (const rota of rotas) {
    try {
      return await api.post(rota, payload);
    } catch (erro) {
      // tenta a próxima rota
    }
  }
  return null;
}

async function tentarPut(rotas, payload) {
  for (const rota of rotas) {
    try {
      return await api.put(rota, payload);
    } catch (erro) {
      // tenta a próxima rota
    }
  }
  return null;
}

async function tentarDelete(rotas) {
  for (const rota of rotas) {
    try {
      return await api.delete(rota);
    } catch (erro) {
      // tenta a próxima rota
    }
  }
  return null;
}

function normalizarDepartamento(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
  };
}

function normalizarFuncao(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    idDepartamento: Number(
      item?.idDepartamento ??
        item?.departamento_id ??
        item?.departamentoId ??
        item?.idDepto ??
        item?.id_departamento ??
        0
    ),
  };
}

function normalizarFornecedor(item) {
  return {
    id: Number(item?.id ?? 0),
    razao_social: item?.razao_social ?? item?.razaoSocial ?? "",
    nome_fantasia: item?.nome_fantasia ?? item?.nomeFantasia ?? "",
    cnpj: item?.cnpj ?? "",
    inscricao_estadual:
      item?.inscricao_estadual ?? item?.inscricaoEstadual ?? "",
  };
}

function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? Date.now()),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? ""),
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

function normalizarTipoProtecao(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
  };
}

function normalizarUsuarioSistema(item) {
  return {
    id: Number(item?.id ?? Date.now()),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? ""),
    email: item?.email ?? "",
    senha: item?.senha ?? "",
    perfil: item?.perfil ?? "colaborador",
    status: item?.status ?? "ativo",
  };
}

function normalizarEpi(item) {
  const tamanhosBrutos =
    item?.tamanhos ??
    item?.tamanhos_disponiveis ??
    item?.tamanhosDisponiveis ??
    item?.grade ??
    [];

  const tamanhos = Array.isArray(tamanhosBrutos)
    ? tamanhosBrutos.map((t) => String(t).trim()).filter(Boolean)
    : String(tamanhosBrutos || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  return {
    id: Number(item?.id ?? Date.now()),
    nome: item?.nome ?? "",
    fabricante: item?.fabricante ?? "",
    CA: item?.CA ?? item?.ca ?? "",
    descricao: item?.descricao ?? "",
    validade_CA:
      item?.validade_CA ?? item?.validadeCA ?? item?.validade_ca ?? null,
    idTipoProtecao: Number(
      item?.idTipoProtecao ??
        item?.tipo_protecao_id ??
        item?.tipoProtecaoId ??
        item?.idTipo ??
        0
    ),
    alerta_minimo: Number(item?.alerta_minimo ?? item?.alertaMinimo ?? 0),
    tamanhos,
  };
}

function formatarData(valor) {
  if (!valor) return "-";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";
  return data.toLocaleDateString("pt-BR");
}

function formatarTamanhos(tamanhos) {
  if (!Array.isArray(tamanhos) || tamanhos.length === 0) return "Sem tamanhos";
  return tamanhos.join(", ");
}

function Administracao({ usuarioLogado }) {
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [senhaAcesso, setSenhaAcesso] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const [abaAtiva, setAbaAtiva] = useState("fornecedores");

  const [fornecedores, setFornecedores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [tiposProtecao, setTiposProtecao] = useState([]);
  const [epis, setEpis] = useState([]);
  const [usuariosSistema, setUsuariosSistema] = useState([]);

  const [carregando, setCarregando] = useState(false);
  const [salvandoFuncionario, setSalvandoFuncionario] = useState(false);

  const [novoForn, setNovoForn] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    inscricao_estadual: "",
  });

  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    matricula: "",
    email: "",
    senha: "",
    perfil: "colaborador",
    status: "ativo",
  });

  const [novoDepto, setNovoDepto] = useState("");
  const [novaFuncao, setNovaFuncao] = useState({
    nome: "",
    idDepartamento: "",
  });

  const [buscaFuncionario, setBuscaFuncionario] = useState("");
  const [buscaEpi, setBuscaEpi] = useState("");

  const [modalFuncionarioAberto, setModalFuncionarioAberto] = useState(false);
  const [modalEpiAberto, setModalEpiAberto] = useState(false);

  const [funcionarioEditando, setFuncionarioEditando] = useState(null);

  const [formFuncNome, setFormFuncNome] = useState("");
  const [formFuncMatricula, setFormFuncMatricula] = useState("");
  const [formFuncDepartamento, setFormFuncDepartamento] = useState("");
  const [formFuncFuncao, setFormFuncFuncao] = useState("");

  const adminPorPerfil =
    usuarioLogado?.perfil === "admin" || usuarioLogado?.role === "admin";

  const adminPorPermissao = usuarioLogado
    ? temPermissao(usuarioLogado, "visualizar_fornecedores")
    : false;

  const podeAcessarPainel = adminPorPerfil || adminPorPermissao || acessoLiberado;

  const carregarDadosAdm = async () => {
    setCarregando(true);

    try {
      const [
        listaFornecedores,
        listaDepartamentos,
        listaFuncoes,
        listaFuncionarios,
        listaTiposProtecao,
        listaEpis,
        listaUsuariosSistema,
      ] = await Promise.all([
        buscarPrimeiraLista(["/fornecedores"], mockFornecedoresInicial),
        buscarPrimeiraLista(["/departamentos"], mockDepartamentosInicial),
        buscarPrimeiraLista(["/funcoes", "/cargos"], mockFuncoesInicial),
        buscarPrimeiraLista(["/funcionarios"], mockFuncionariosInicial),
        buscarPrimeiraLista(
          ["/tipo-protecao", "/tipos-protecao", "/tipos_protecao"],
          mockTiposProtecaoInicial
        ),
        buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpisInicial),
        buscarPrimeiraLista(
          ["/usuarios-sistema", "/usuarios", "/acessos"],
          mockUsuariosSistemaInicial
        ),
      ]);

      setFornecedores(listaFornecedores.map(normalizarFornecedor));
      setDepartamentos(listaDepartamentos.map(normalizarDepartamento));
      setFuncoes(listaFuncoes.map(normalizarFuncao));
      setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
      setTiposProtecao(listaTiposProtecao.map(normalizarTipoProtecao));
      setEpis(listaEpis.map(normalizarEpi));
      setUsuariosSistema(listaUsuariosSistema.map(normalizarUsuarioSistema));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (podeAcessarPainel) {
      carregarDadosAdm();
    }
  }, [podeAcessarPainel]);

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

  const getTipoProtecaoNome = (id) => {
    return tiposProtecao.find((t) => Number(t.id) === Number(id))?.nome || "Sem tipo";
  };

  const getDepartamentoNome = (id) => {
    return departamentos.find((d) => Number(d.id) === Number(id))?.nome || "-";
  };

  const departamentosOrdenados = useMemo(() => {
    return [...departamentos].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );
  }, [departamentos]);

  const funcoesOrdenadas = useMemo(() => {
    return [...funcoes].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }, [funcoes]);

  const fornecedoresOrdenados = useMemo(() => {
    return [...fornecedores].sort((a, b) =>
      (a.razao_social || "").localeCompare(b.razao_social || "")
    );
  }, [fornecedores]);

  const usuariosSistemaOrdenados = useMemo(() => {
    return [...usuariosSistema].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );
  }, [usuariosSistema]);

  const funcoesDisponiveisForm = useMemo(() => {
    return funcoesOrdenadas.filter(
      (funcao) => Number(funcao.idDepartamento) === Number(formFuncDepartamento)
    );
  }, [funcoesOrdenadas, formFuncDepartamento]);

  const funcionariosResolvidos = useMemo(() => {
    return funcionarios.map((f) => ({
      ...f,
      departamento: departamentos.find(
        (d) => Number(d.id) === Number(f.idDepartamento)
      ),
      funcao: funcoes.find((fn) => Number(fn.id) === Number(f.idFuncao)),
    }));
  }, [funcionarios, departamentos, funcoes]);

  const funcionariosFiltrados = useMemo(() => {
    const termo = buscaFuncionario.trim().toLowerCase();

    const lista = [...funcionariosResolvidos].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "")
    );

    if (!termo) return lista;

    return lista.filter((f) => {
      const nome = (f.nome || "").toLowerCase();
      const matricula = String(f.matricula || "");
      const departamento = (f.departamento?.nome || "").toLowerCase();
      const funcao = (f.funcao?.nome || "").toLowerCase();

      return (
        nome.includes(termo) ||
        matricula.includes(termo) ||
        departamento.includes(termo) ||
        funcao.includes(termo)
      );
    });
  }, [funcionariosResolvidos, buscaFuncionario]);

  const episFiltrados = useMemo(() => {
    const termo = buscaEpi.trim().toLowerCase();

    const lista = [...epis]
      .map((epi) => ({
        ...epi,
        tipoProtecaoNome: getTipoProtecaoNome(epi.idTipoProtecao),
      }))
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

    if (!termo) return lista;

    return lista.filter((epi) => {
      return (
        (epi.nome || "").toLowerCase().includes(termo) ||
        (epi.fabricante || "").toLowerCase().includes(termo) ||
        String(epi.CA || "").toLowerCase().includes(termo) ||
        (epi.descricao || "").toLowerCase().includes(termo) ||
        (epi.tipoProtecaoNome || "").toLowerCase().includes(termo) ||
        formatarTamanhos(epi.tamanhos).toLowerCase().includes(termo)
      );
    });
  }, [epis, buscaEpi, tiposProtecao]);

  const adicionarFornecedor = async () => {
    const razaoSocial = novoForn.razao_social.trim();
    const nomeFantasia = novoForn.nome_fantasia.trim();
    const cnpj = novoForn.cnpj.trim();
    const inscricaoEstadual = novoForn.inscricao_estadual.trim();

    if (!razaoSocial || !cnpj) {
      alert("Preencha a razão social e o CNPJ.");
      return;
    }

    const cnpjJaExiste = fornecedores.some(
      (item) => String(item.cnpj || "").trim() === cnpj
    );

    if (cnpjJaExiste) {
      alert("Já existe um fornecedor com esse CNPJ.");
      return;
    }

    setCarregando(true);

    const payload = {
      razao_social: razaoSocial,
      nome_fantasia: nomeFantasia,
      cnpj,
      inscricao_estadual: inscricaoEstadual,
    };

    try {
      await tentarPost(["/fornecedor", "/fornecedores"], payload);

      const item = normalizarFornecedor({ id: Date.now(), ...payload });
      setFornecedores((prev) => [item, ...prev]);
      setNovoForn({
        razao_social: "",
        nome_fantasia: "",
        cnpj: "",
        inscricao_estadual: "",
      });
    } finally {
      setCarregando(false);
    }
  };

  const adicionarUsuarioSistema = async () => {
    const nome = novoUsuario.nome.trim();
    const matricula = novoUsuario.matricula.trim();
    const email = novoUsuario.email.trim();
    const senha = novoUsuario.senha.trim();

    if (!nome || !matricula || !email || !senha) {
      alert("Preencha nome, matrícula, e-mail e senha do colaborador.");
      return;
    }

    const emailJaExiste = usuariosSistema.some(
      (u) => (u.email || "").toLowerCase() === email.toLowerCase()
    );

    if (emailJaExiste) {
      alert("Já existe um login cadastrado com esse e-mail.");
      return;
    }

    const matriculaJaExiste = usuariosSistema.some(
      (u) => String(u.matricula || "") === matricula
    );

    if (matriculaJaExiste) {
      alert("Já existe um login cadastrado com essa matrícula.");
      return;
    }

    setCarregando(true);

    const payload = {
      nome,
      matricula,
      email,
      senha,
      perfil: novoUsuario.perfil,
      status: novoUsuario.status,
    };

    try {
      await tentarPost(
        ["/usuario-sistema", "/usuarios", "/acessos", "/cadastro-user"],
        payload
      );

      const novoRegistro = normalizarUsuarioSistema({
        id: Date.now(),
        ...payload,
      });

      setUsuariosSistema((prev) => [novoRegistro, ...prev]);

      setNovoUsuario({
        nome: "",
        matricula: "",
        email: "",
        senha: "",
        perfil: "colaborador",
        status: "ativo",
      });
    } finally {
      setCarregando(false);
    }
  };

  const adicionarDepartamento = async () => {
    const nome = novoDepto.trim();

    if (!nome) {
      alert("Digite o nome do departamento.");
      return;
    }

    const jaExiste = departamentos.some(
      (item) => (item.nome || "").toLowerCase() === nome.toLowerCase()
    );

    if (jaExiste) {
      alert("Já existe um departamento com esse nome.");
      return;
    }

    setCarregando(true);

    const payload = { nome };

    try {
      await tentarPost(
        ["/departamento", "/departamentos", "/cadastro-departamento"],
        payload
      );

      const item = normalizarDepartamento({ id: Date.now(), ...payload });
      setDepartamentos((prev) => [item, ...prev]);
      setNovoDepto("");
    } finally {
      setCarregando(false);
    }
  };

  const adicionarFuncao = async () => {
    const nome = novaFuncao.nome.trim();
    const idDepartamento = Number(novaFuncao.idDepartamento);

    if (!nome || !idDepartamento) {
      alert("Preencha o nome da função e selecione o departamento.");
      return;
    }

    const jaExiste = funcoes.some(
      (item) =>
        Number(item.idDepartamento) === idDepartamento &&
        (item.nome || "").toLowerCase() === nome.toLowerCase()
    );

    if (jaExiste) {
      alert("Essa função já existe nesse departamento.");
      return;
    }

    setCarregando(true);

    const payload = {
      nome,
      idDepartamento,
    };

    try {
      await tentarPost(
        ["/funcao", "/funcoes", "/cargo", "/cadastro-funcao"],
        payload
      );

      const item = normalizarFuncao({ id: Date.now(), ...payload });
      setFuncoes((prev) => [item, ...prev]);
      setNovaFuncao({ nome: "", idDepartamento: "" });
    } finally {
      setCarregando(false);
    }
  };

  const removerFornecedor = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este fornecedor?")) return;

    await tentarDelete([`/fornecedor/${id}`, `/fornecedores/${id}`]);

    setFornecedores((prev) =>
      prev.filter((item) => Number(item.id) !== Number(id))
    );
  };

  const removerUsuarioSistema = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este acesso?")) return;

    await tentarDelete([
      `/usuario-sistema/${id}`,
      `/usuarios/${id}`,
      `/acessos/${id}`,
    ]);

    setUsuariosSistema((prev) =>
      prev.filter((item) => Number(item.id) !== Number(id))
    );
  };

  const removerDepartamento = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este departamento?")) return;

    await tentarDelete([`/departamento/${id}`, `/departamentos/${id}`]);

    setDepartamentos((prev) =>
      prev.filter((item) => Number(item.id) !== Number(id))
    );
    setFuncoes((prev) =>
      prev.filter((item) => Number(item.idDepartamento) !== Number(id))
    );
  };

  const removerFuncao = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta função?")) return;

    await tentarDelete([`/funcao/${id}`, `/funcoes/${id}`, `/cargo/${id}`]);

    setFuncoes((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
  };

  const abrirModalNovoFuncionario = () => {
    setFuncionarioEditando(null);
    setFormFuncNome("");
    setFormFuncMatricula(gerarMatricula());
    setFormFuncDepartamento("");
    setFormFuncFuncao("");
    setModalFuncionarioAberto(true);
  };

  const abrirModalEditarFuncionario = (funcionario) => {
    setFuncionarioEditando(funcionario);
    setFormFuncNome(funcionario.nome || "");
    setFormFuncMatricula(String(funcionario.matricula || ""));
    setFormFuncDepartamento(String(funcionario.idDepartamento || ""));
    setFormFuncFuncao(String(funcionario.idFuncao || ""));
    setModalFuncionarioAberto(true);
  };

  const fecharModalFuncionario = () => {
    setModalFuncionarioAberto(false);
    setFuncionarioEditando(null);
    setFormFuncNome("");
    setFormFuncMatricula("");
    setFormFuncDepartamento("");
    setFormFuncFuncao("");
  };

  const salvarFuncionario = async () => {
    const nome = formFuncNome.trim();
    const matricula = formFuncMatricula.trim();
    const idDepartamento = Number(formFuncDepartamento);
    const idFuncao = Number(formFuncFuncao);

    if (!nome || !matricula || !idDepartamento || !idFuncao) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const matriculaJaExiste = funcionarios.some((f) => {
      if (funcionarioEditando && Number(f.id) === Number(funcionarioEditando.id)) {
        return false;
      }
      return String(f.matricula || "") === matricula;
    });

    if (matriculaJaExiste) {
      alert("Já existe um funcionário com essa matrícula.");
      return;
    }

    setSalvandoFuncionario(true);

    const payload = {
      nome,
      matricula,
      idDepartamento,
      idFuncao,
    };

    try {
      if (funcionarioEditando) {
        await tentarPut(
          [
            `/funcionario/${funcionarioEditando.id}`,
            `/funcionarios/${funcionarioEditando.id}`,
          ],
          payload
        );

        setFuncionarios((prev) =>
          prev.map((f) =>
            Number(f.id) === Number(funcionarioEditando.id)
              ? { ...f, ...payload }
              : f
          )
        );

        fecharModalFuncionario();
        return;
      }

      await tentarPost(
        ["/funcionario", "/funcionarios", "/cadastro-funcionario"],
        payload
      );

      setFuncionarios((prev) => [
        normalizarFuncionario({ id: Date.now(), ...payload }),
        ...prev,
      ]);

      fecharModalFuncionario();
    } finally {
      setSalvandoFuncionario(false);
    }
  };

  const excluirFuncionario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este funcionário?")) return;

    await tentarDelete([`/funcionario/${id}`, `/funcionarios/${id}`]);

    setFuncionarios((prev) => prev.filter((f) => Number(f.id) !== Number(id)));
  };

  const aoSalvarEpi = async (payload) => {
    const novoEpi = normalizarEpi({
      id: Date.now(),
      ...payload,
      validade_CA: payload.validade_CA || null,
    });

    setEpis((prev) => [novoEpi, ...prev]);
    setModalEpiAberto(false);
    setAbaAtiva("epis");
  };

  if (!podeAcessarPainel) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
        <div className="max-w-md mx-auto py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              🔒 Área Administrativa
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Digite a senha para acessar esta seção.
            </p>
          </div>

          <form
            onSubmit={validarAcesso}
            className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4"
          >
            {erroSenha && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {erroSenha}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-500 mb-1 block">
                Senha de acesso
              </label>
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
              Gerencie os cadastros base conforme a estrutura do banco.
            </p>
          </div>

          {!adminPorPerfil && !adminPorPermissao && (
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
          )}
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
            onClick={() => setAbaAtiva("funcoes")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              abaAtiva === "funcoes"
                ? "bg-slate-800 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            💼 Funções
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
          <div className="animate-fade-in space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Novo Fornecedor
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Razão Social
                  </label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoForn.razao_social}
                    onChange={(e) =>
                      setNovoForn((prev) => ({
                        ...prev,
                        razao_social: e.target.value,
                      }))
                    }
                    placeholder="Ex: Empresa X Ltda"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Nome Fantasia
                  </label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoForn.nome_fantasia}
                    onChange={(e) =>
                      setNovoForn((prev) => ({
                        ...prev,
                        nome_fantasia: e.target.value,
                      }))
                    }
                    placeholder="Ex: Empresa X"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    CNPJ
                  </label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoForn.cnpj}
                    onChange={(e) =>
                      setNovoForn((prev) => ({
                        ...prev,
                        cnpj: e.target.value,
                      }))
                    }
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Inscrição Estadual
                  </label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoForn.inscricao_estadual}
                    onChange={(e) =>
                      setNovoForn((prev) => ({
                        ...prev,
                        inscricao_estadual: e.target.value,
                      }))
                    }
                    placeholder="Ex: 123.456.789.000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={adicionarFornecedor}
                  disabled={carregando}
                  className="w-full md:w-auto bg-emerald-600 text-white font-bold py-2 px-5 rounded hover:bg-emerald-700 transition text-sm"
                >
                  {carregando ? "..." : "+ Cadastrar fornecedor"}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase">
                  Fornecedores cadastrados
                </h3>
                <span className="text-xs text-slate-400">
                  {fornecedoresOrdenados.length} registro(s)
                </span>
              </div>

              {fornecedoresOrdenados.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-gray-400 italic">
                  Nenhum fornecedor registrado.
                </div>
              ) : (
                <>
                  <div className="md:hidden space-y-3">
                    {fornecedoresOrdenados.map((f) => (
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
                              Inscrição Estadual
                            </span>
                            <span className="text-slate-600">
                              {f.inscricao_estadual || "-"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => removerFornecedor(f.id)}
                            className="w-full py-2 rounded-lg border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                        <tr>
                          <th className="p-3">Razão Social</th>
                          <th className="p-3">Nome Fantasia</th>
                          <th className="p-3">CNPJ</th>
                          <th className="p-3">Inscrição Estadual</th>
                          <th className="p-3 text-center">Ação</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {fornecedoresOrdenados.map((f) => (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-800">
                              {f.razao_social || "-"}
                            </td>
                            <td className="p-3 text-slate-600">
                              {f.nome_fantasia || "-"}
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-xs">
                              {f.cnpj || "-"}
                            </td>
                            <td className="p-3 text-slate-600">
                              {f.inscricao_estadual || "-"}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => removerFornecedor(f.id)}
                                className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Login de Colaboradores
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Nome
                  </label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoUsuario.nome}
                    onChange={(e) =>
                      setNovoUsuario((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Matrícula
                  </label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoUsuario.matricula}
                    onChange={(e) =>
                      setNovoUsuario((prev) => ({
                        ...prev,
                        matricula: e.target.value,
                      }))
                    }
                    placeholder="Ex: 483920"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoUsuario.email}
                    onChange={(e) =>
                      setNovoUsuario((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="colaborador@empresa.com"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Senha
                  </label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={novoUsuario.senha}
                    onChange={(e) =>
                      setNovoUsuario((prev) => ({
                        ...prev,
                        senha: e.target.value,
                      }))
                    }
                    placeholder="Digite uma senha"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Perfil
                  </label>
                  <select
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
                    value={novoUsuario.perfil}
                    onChange={(e) =>
                      setNovoUsuario((prev) => ({
                        ...prev,
                        perfil: e.target.value,
                      }))
                    }
                  >
                    <option value="colaborador">Colaborador</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Status
                  </label>
                  <select
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
                    value={novoUsuario.status}
                    onChange={(e) =>
                      setNovoUsuario((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={adicionarUsuarioSistema}
                  disabled={carregando}
                  className="w-full md:w-auto bg-slate-800 text-white font-bold py-2 px-5 rounded hover:bg-slate-900 transition text-sm"
                >
                  {carregando ? "..." : "+ Adicionar login"}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase">
                  Colaboradores com acesso
                </h3>
                <span className="text-xs text-slate-400">
                  {usuariosSistemaOrdenados.length} registro(s)
                </span>
              </div>

              {usuariosSistemaOrdenados.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-gray-400 italic">
                  Nenhum login cadastrado.
                </div>
              ) : (
                <>
                  <div className="md:hidden space-y-3">
                    {usuariosSistemaOrdenados.map((u) => (
                      <div
                        key={u.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                      >
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="block text-[11px] uppercase font-bold text-slate-400">
                              Nome
                            </span>
                            <span className="text-slate-800 font-medium">
                              {u.nome || "-"}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[11px] uppercase font-bold text-slate-400">
                              Matrícula
                            </span>
                            <span className="text-slate-600">
                              {u.matricula || "-"}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[11px] uppercase font-bold text-slate-400">
                              E-mail
                            </span>
                            <span className="text-slate-600 break-all">
                              {u.email || "-"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="block text-[11px] uppercase font-bold text-slate-400">
                                Perfil
                              </span>
                              <span className="text-slate-600">
                                {u.perfil || "-"}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[11px] uppercase font-bold text-slate-400">
                                Status
                              </span>
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${
                                  u.status === "ativo"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {u.status || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => removerUsuarioSistema(u.id)}
                            className="w-full py-2 rounded-lg border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition"
                          >
                            Remover acesso
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                        <tr>
                          <th className="p-3">Nome</th>
                          <th className="p-3">Matrícula</th>
                          <th className="p-3">E-mail</th>
                          <th className="p-3">Perfil</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-center">Ação</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {usuariosSistemaOrdenados.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-800">
                              {u.nome || "-"}
                            </td>
                            <td className="p-3 text-slate-600">
                              {u.matricula || "-"}
                            </td>
                            <td className="p-3 text-slate-600">
                              {u.email || "-"}
                            </td>
                            <td className="p-3 text-slate-600">
                              {u.perfil || "-"}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${
                                  u.status === "ativo"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {u.status || "-"}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => removerUsuarioSistema(u.id)}
                                className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                              >
                                Remover
                              </button>
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
        )}

        {abaAtiva === "departamentos" && (
          <div className="animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs text-slate-500 mb-1 block">
                  Nome do Departamento
                </label>
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
              {departamentosOrdenados.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
                >
                  <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {d.nome}
                  </span>

                  <button
                    onClick={() => removerDepartamento(d.id)}
                    className="text-gray-300 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === "funcoes" && (
          <div className="animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Nova Função
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    Departamento Vinculado
                  </label>
                  <select
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
                    value={novaFuncao.idDepartamento}
                    onChange={(e) =>
                      setNovaFuncao((prev) => ({
                        ...prev,
                        idDepartamento: e.target.value,
                      }))
                    }
                  >
                    <option value="">Selecione...</option>
                    {departamentosOrdenados.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
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
                    value={novaFuncao.nome}
                    onChange={(e) =>
                      setNovaFuncao((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    placeholder="Ex: Operador"
                  />
                </div>

                <div>
                  <button
                    onClick={adicionarFuncao}
                    disabled={carregando}
                    className="w-full bg-emerald-600 text-white font-bold py-2 rounded hover:bg-emerald-700 transition text-sm"
                  >
                    + Salvar Função
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
                    <th className="p-3 text-center">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {funcoesOrdenadas.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">
                        {f.nome}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {getDepartamentoNome(f.idDepartamento)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removerFuncao(f.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  <label className="text-xs text-slate-500 mb-1 block">
                    Buscar funcionário
                  </label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={buscaFuncionario}
                    onChange={(e) => setBuscaFuncionario(e.target.value)}
                    placeholder="Nome, matrícula, departamento ou função"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="text-sm text-slate-500 flex items-center">
                    Total:
                    <b className="text-slate-800 ml-1">
                      {funcionariosFiltrados.length}
                    </b>
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
                    <th className="p-3">Função</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {funcionariosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-4 text-center text-gray-400 italic"
                      >
                        Nenhum funcionário encontrado.
                      </td>
                    </tr>
                  ) : (
                    funcionariosFiltrados.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500 font-mono text-xs">
                          {f.matricula}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {f.nome}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {f.departamento?.nome || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          {f.funcao?.nome || "-"}
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
                  <div
                    key={f.id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800">{f.nome}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        Mat: {f.matricula}
                      </p>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div>
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {f.departamento?.nome || "-"}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600">
                        <b>Função:</b> {f.funcao?.nome || "-"}
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
                  <label className="text-xs text-slate-500 mb-1 block">
                    Buscar EPI
                  </label>
                  <input
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                    value={buscaEpi}
                    onChange={(e) => setBuscaEpi(e.target.value)}
                    placeholder="Nome, tipo, fabricante, CA, tamanho ou descrição"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="text-sm text-slate-500 flex items-center">
                    Total:
                    <b className="text-slate-800 ml-1">{episFiltrados.length}</b>
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
                    <th className="p-3">Tipo de Proteção</th>
                    <th className="p-3">Tamanhos</th>
                    <th className="p-3">Fabricante</th>
                    <th className="p-3">CA</th>
                    <th className="p-3">Alerta Mínimo</th>
                    <th className="p-3">Validade do CA</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {episFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-4 text-center text-gray-400 italic"
                      >
                        Nenhum EPI encontrado.
                      </td>
                    </tr>
                  ) : (
                    episFiltrados.map((epi) => (
                      <tr key={epi.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-medium text-slate-800">
                            {epi.nome}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {epi.descricao || "Sem descrição"}
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">
                          {epi.tipoProtecaoNome}
                        </td>
                        <td className="p-3 text-slate-600">
                          <div className="flex flex-wrap gap-1">
                            {epi.tamanhos?.length ? (
                              epi.tamanhos.map((tam) => (
                                <span
                                  key={tam}
                                  className="px-2 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {tam}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">
                                Sem tamanhos
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">
                          {epi.fabricante || "-"}
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-xs">
                          {epi.CA || "-"}
                        </td>
                        <td className="p-3 text-slate-600">
                          {epi.alerta_minimo}
                        </td>
                        <td className="p-3 text-slate-600">
                          {formatarData(epi.validade_CA)}
                        </td>
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
                  <div
                    key={epi.id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800">{epi.nome}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {epi.tipoProtecaoNome}
                        </p>
                      </div>

                      <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 h-fit">
                        CA: {epi.CA || "-"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div>
                        <b>Fabricante:</b> {epi.fabricante || "-"}
                      </div>
                      <div>
                        <b>Tamanhos:</b> {formatarTamanhos(epi.tamanhos)}
                      </div>
                      <div>
                        <b>Alerta mínimo:</b> {epi.alerta_minimo}
                      </div>
                      <div>
                        <b>Validade do CA:</b> {formatarData(epi.validade_CA)}
                      </div>
                      <div>
                        <b>Descrição:</b> {epi.descricao || "Sem descrição"}
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
                  {funcionarioEditando
                    ? "✏️ Editar Funcionário"
                    : "👥 Cadastrar Funcionário"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Dados conforme a tabela funcionario.
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
                <label className="text-xs text-slate-500 mb-1 block">
                  Nome completo
                </label>
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  value={formFuncNome}
                  onChange={(e) => setFormFuncNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Matrícula
                </label>
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  value={formFuncMatricula}
                  onChange={(e) => setFormFuncMatricula(e.target.value)}
                  placeholder="Ex: 4839201"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Departamento
                </label>
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm bg-white"
                  value={formFuncDepartamento}
                  onChange={(e) => {
                    setFormFuncDepartamento(e.target.value);
                    setFormFuncFuncao("");
                  }}
                >
                  <option value="">Selecione...</option>
                  {departamentosOrdenados.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
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
                  value={formFuncFuncao}
                  onChange={(e) => setFormFuncFuncao(e.target.value)}
                  disabled={!formFuncDepartamento}
                >
                  <option value="">Selecione...</option>
                  {funcoesDisponiveisForm.map((fn) => (
                    <option key={fn.id} value={fn.id}>
                      {fn.nome}
                    </option>
                  ))}
                </select>
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
