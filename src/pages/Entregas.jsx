import { useEffect, useMemo, useState } from "react";
import ModalEntrega from "../components/modals/ModalEntrega";
import { temPermissao } from "../utils/permissoes";
import {
  listarEntregas,
  listarFuncionariosEntrega,
  listarEpisEntrega,
  listarTamanhosEntrega,
} from "../services/entregaService";
import {
  normalizarEntrega,
  normalizarEpiEntrega,
  normalizarFuncionarioEntrega,
  normalizarTamanhoEntrega,
} from "../utils/entregaNormalizers";

function formatarData(data) {
  if (!data) return "--";

  // 1. Se já estiver no formato DD/MM/AAAA (vinda do Go configs.DataBr)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return data;
  }

  // 2. Se vier no formato ISO do banco (AAAA-MM-DD...)
  const texto = String(data).substring(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  // 3. Fallback para outros formatos de objeto Date
  const dataObj = new Date(data);
  if (!isNaN(dataObj.getTime())) {
    return dataObj.toLocaleDateString("pt-BR");
  }

  return data; // Se nada funcionar, retorna o que veio em vez de esconder
}

function resumirItens(entrega) {
  const itens = Array.isArray(entrega?.itens) ? entrega.itens : [];

  if (itens.length === 0) return "Sem itens";

  return itens
    .map((item) => {
      const nome = item?.epiNome || item?.nomeEpi || "Item";
      const tamanho = item?.tamanhoNome || item?.tamanho || "-";
      const quantidade = Number(item?.quantidade || 0);

      return `${nome} (${tamanho}) x${quantidade}`;
    })
    .join(", ");
}

function totalItensEntrega(entrega) {
  const itens = Array.isArray(entrega?.itens) ? entrega.itens : [];

  return itens.reduce((acc, item) => acc + Number(item?.quantidade || 0), 0);
}

function Entregas({ usuarioLogado }) {
  const [entregas, setEntregas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erroTela, setErroTela] = useState("");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);

  const itensPorPagina = 6;

  const podeVisualizar = !usuarioLogado
    ? true
    : temPermissao(usuarioLogado, "visualizar_entregas") ||
      temPermissao(usuarioLogado, "visualizar_estoque");

  const perfilUsuario = usuarioLogado?.perfil || usuarioLogado?.role || "";
  const podeCadastrar = !usuarioLogado
    ? true
    : perfilUsuario === "admin" || perfilUsuario === "gerente";

  const carregarDados = async () => {
    setCarregando(true);
    setErroTela("");

    try {
      const [listaEntregas, listaFuncionarios, listaEpis, listaTamanhos] =
        await Promise.all([
          listarEntregas(),
          listarFuncionariosEntrega(),
          listarEpisEntrega(),
          listarTamanhosEntrega(),
        ]);

      setEntregas(listaEntregas.map(normalizarEntrega));
      setFuncionarios(listaFuncionarios.map(normalizarFuncionarioEntrega));
      setEpis(listaEpis.map(normalizarEpiEntrega));
      setTamanhos(listaTamanhos.map(normalizarTamanhoEntrega));
    } catch (erro) {
      console.error("Erro ao carregar entregas:", erro);
      setErroTela(
        erro?.message || "Não foi possível carregar os registros de entrega."
      );
      setEntregas([]);
      setFuncionarios([]);
      setEpis([]);
      setTamanhos([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const entregasResolvidas = useMemo(() => {
    return entregas.map((entrega) => {
      const funcionario = funcionarios.find(
        (item) => Number(item.id) === Number(entrega.idFuncionario)
      );

      const itensResolvidos = Array.isArray(entrega.itens)
        ? entrega.itens.map((item) => {
            const epi = epis.find(
              (epiItem) => Number(epiItem.id) === Number(item.idEpi)
            );
            const tamanho = tamanhos.find(
              (tamItem) => Number(tamItem.id) === Number(item.idTamanho)
            );

            return {
              ...item,
              epiNome: item.epiNome || epi?.nome || "EPI",
              tamanhoNome: item.tamanhoNome || tamanho?.tamanho || "-",
            };
          })
        : [];

      return {
        ...entrega,
        nomeFuncionario:
          entrega.nome_funcionario ||
          entrega.nomeFuncionario ||
          funcionario?.nome ||
          "Funcionário não identificado",
        matriculaFuncionario:
          funcionario?.matricula || entrega.matriculaFuncionario || "-",
        itens: itensResolvidos,
      };
    });
  }, [entregas, funcionarios, epis, tamanhos]);

  const entregasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return entregasResolvidas;

    return entregasResolvidas.filter((entrega) => {
      const resumoItens = resumirItens(entrega).toLowerCase();

      return (
        String(entrega.id || "").includes(termo) ||
        String(entrega.token_validacao || "").toLowerCase().includes(termo) ||
        String(entrega.nomeFuncionario || "").toLowerCase().includes(termo) ||
        String(entrega.matriculaFuncionario || "").includes(termo) ||
        resumoItens.includes(termo)
      );
    });
  }, [entregasResolvidas, busca]);

  const entregasOrdenadas = useMemo(() => {
  return [...entregasFiltradas].sort((a, b) => {
    // Função auxiliar para transformar "26/03/2026" em "20260326" para comparar números
    const converterParaSort = (d) => {
      if (!d || !d.includes('/')) return 0;
      const [dia, mes, ano] = d.split('/');
      return Number(ano + mes + dia);
    };

    const dataA = converterParaSort(a.data_entrega);
    const dataB = converterParaSort(b.data_entrega);

    if (dataA !== dataB) return dataB - dataA; // Data mais recente primeiro
    
    return Number(b.id || 0) - Number(a.id || 0); // Critério de desempate por ID
  });
}, [entregasFiltradas]);

  const resumoTela = useMemo(() => {
    return {
      totalEntregas: entregasOrdenadas.length,
      totalItens: entregasOrdenadas.reduce(
        (acc, entrega) => acc + totalItensEntrega(entrega),
        0
      ),
      colaboradoresUnicos: new Set(
        entregasOrdenadas.map((item) => Number(item.idFuncionario || 0))
      ).size,
    };
  }, [entregasOrdenadas]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(entregasOrdenadas.length / itensPorPagina)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;

  const entregasVisiveis = entregasOrdenadas.slice(
    indexPrimeiroItem,
    indexUltimoItem
  );

  async function handleSalvarNovaEntrega(novaEntrega) {
    setEntregas((prev) => [normalizarEntrega(novaEntrega), ...prev]);
    await carregarDados();
    setPaginaAtual(1);
  }

  if (!podeVisualizar) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-amber-700">
          Você não tem permissão para visualizar a tela de entregas.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              📤 Registro de Entregas
            </h2>
            <p className="text-sm text-gray-500">
              Controle das entregas realizadas para os colaboradores.
            </p>
          </div>

          {podeCadastrar && (
            <button
              onClick={() => setModalAberto(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm w-full lg:w-auto"
            >
              + Nova Entrega
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <span className="text-[11px] text-blue-700 uppercase font-bold tracking-wide block mb-1">
              Entregas visíveis
            </span>
            <strong className="text-2xl text-blue-900">
              {carregando ? "--" : resumoTela.totalEntregas}
            </strong>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <span className="text-[11px] text-emerald-700 uppercase font-bold tracking-wide block mb-1">
              Itens entregues
            </span>
            <strong className="text-2xl text-emerald-900">
              {carregando ? "--" : resumoTela.totalItens}
            </strong>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[11px] text-slate-600 uppercase font-bold tracking-wide block mb-1">
              Colaboradores atendidos
            </span>
            <strong className="text-2xl text-slate-900">
              {carregando ? "--" : resumoTela.colaboradoresUnicos}
            </strong>
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
            placeholder="Buscar por funcionário, matrícula, token, ID ou itens..."
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
            Carregando entregas...
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-semibold">Data</th>
                    <th className="p-4 font-semibold">Colaborador</th>
                    <th className="p-4 font-semibold">Itens</th>
                    <th className="p-4 font-semibold text-center">Qtd. total</th>
                    <th className="p-4 font-semibold">Token</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {entregasVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        Nenhuma entrega encontrada.
                      </td>
                    </tr>
                  ) : (
                    entregasVisiveis.map((entrega) => (
                      <tr key={entrega.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-600 font-mono text-sm">
                          {formatarData(entrega.data_entrega)}
                        </td>

                        <td className="p-4">
                          <div className="font-medium text-gray-800">
                            {entrega.nomeFuncionario}
                          </div>
                          <div className="text-xs text-gray-400">
                            Matrícula: {entrega.matriculaFuncionario}
                          </div>
                        </td>

                        <td className="p-4 text-gray-600 text-sm max-w-[420px]">
                          <span className="line-clamp-2">
                            {resumirItens(entrega)}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                            {totalItensEntrega(entrega)}
                          </span>
                        </td>

                        <td className="p-4 text-gray-500 font-mono text-xs">
                          {entrega.token_validacao || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {entregasVisiveis.length > 0 ? (
                entregasVisiveis.map((entrega) => (
                  <div
                    key={entrega.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {formatarData(entrega.data_entrega)}
                      </span>

                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded border border-blue-200">
                        {totalItensEntrega(entrega)} itens
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {entrega.nomeFuncionario}
                    </h3>

                    <p className="text-sm text-gray-500 mb-3">
                      Matrícula:{" "}
                      <strong className="text-gray-700">
                        {entrega.matriculaFuncionario}
                      </strong>
                    </p>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                      <div className="mb-2">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">
                          Itens entregues
                        </span>
                        <span className="text-gray-700">
                          {resumirItens(entrega)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">
                          Token de validação
                        </span>
                        <span className="text-gray-700 font-mono text-xs break-all">
                          {entrega.token_validacao || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  Nenhuma entrega encontrada.
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

      {modalAberto && (
        <ModalEntrega
          onClose={() => setModalAberto(false)}
          onSalvar={handleSalvarNovaEntrega}
        />
      )}
    </>
  );
}

export default Entregas;