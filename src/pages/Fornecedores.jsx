import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const mockFornecedores = [
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

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

function normalizarFornecedor(fornecedor) {
  return {
    id: fornecedor?.id ?? Date.now() + Math.random(),
    razao_social: fornecedor?.razao_social ?? fornecedor?.razaoSocial ?? "",
    nome_fantasia: fornecedor?.nome_fantasia ?? fornecedor?.nomeFantasia ?? "",
    cnpj: fornecedor?.cnpj ?? "",
    inscricao_estadual:
      fornecedor?.inscricao_estadual ??
      fornecedor?.inscricaoEstadual ??
      "",
  };
}

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 5;

  const carregarFornecedores = async () => {
    try {
      const resp = await api.get("/fornecedores");
      const lista = extrairLista(resp, mockFornecedores).map(normalizarFornecedor);
      setFornecedores(lista);
    } catch (erro) {
      console.log("Backend não tem a rota de fornecedores ainda. A usar dados falsos (mock).");
      setFornecedores(mockFornecedores.map(normalizarFornecedor));
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const listaFiltrada = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return fornecedores;

    return fornecedores.filter((f) => {
      const razaoSocial = (f.razao_social || "").toLowerCase();
      const nomeFantasia = (f.nome_fantasia || "").toLowerCase();
      const cnpj = String(f.cnpj || "");
      const inscricaoEstadual = String(f.inscricao_estadual || "").toLowerCase();

      return (
        razaoSocial.includes(termo) ||
        nomeFantasia.includes(termo) ||
        cnpj.includes(termo) ||
        inscricaoEstadual.includes(termo)
      );
    });
  }, [fornecedores, busca]);

  const listaOrdenada = useMemo(() => {
    return [...listaFiltrada].sort((a, b) =>
      (a.razao_social || "").localeCompare(b.razao_social || "")
    );
  }, [listaFiltrada]);

  const totalPaginas = Math.max(1, Math.ceil(listaOrdenada.length / itensPorPagina));

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const fornecedoresVisiveis = listaOrdenada.slice(indexPrimeiroItem, indexUltimoItem);

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 max-w-full relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
            🏭 Fornecedores
          </h2>
          <p className="text-sm text-gray-500">
            Visualize os fornecedores cadastrados no sistema.
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar por razão social, nome fantasia, CNPJ ou inscrição estadual..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm lg:text-base"
        />
      </div>

      <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Razão Social</th>
              <th className="p-4 font-semibold">Nome Fantasia</th>
              <th className="p-4 font-semibold">CNPJ</th>
              <th className="p-4 font-semibold">Inscrição Estadual</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {fornecedoresVisiveis.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  Nenhum fornecedor encontrado.
                </td>
              </tr>
            ) : (
              fornecedoresVisiveis.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{f.razao_social || "-"}</td>
                  <td className="p-4 text-gray-600 text-sm">{f.nome_fantasia || "-"}</td>
                  <td className="p-4 text-gray-600 font-mono text-xs">{f.cnpj || "-"}</td>
                  <td className="p-4 text-gray-600 text-sm">{f.inscricao_estadual || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {fornecedoresVisiveis.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Nenhum fornecedor encontrado.
          </div>
        ) : (
          fornecedoresVisiveis.map((f) => (
            <div
              key={f.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
            >
              <div className="mb-3">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">
                  {f.razao_social || "-"}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 mt-1 inline-block">
                  Fantasia: {f.nome_fantasia || "-"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🧾</span> CNPJ: {f.cnpj || "-"}
                </div>
                <div className="flex items-center gap-2">
                  <span>🏷️</span> IE: {f.inscricao_estadual || "-"}
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
                : "bg-white text-indigo-700 border-indigo-200"
            }`}
          >
            ← Anterior
          </button>

          <span className="text-xs lg:text-sm text-gray-600">
            Pág. <b className="text-gray-900">{paginaAtual}</b> de <b>{totalPaginas}</b>
          </span>

          <button
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            className={`px-4 py-2 rounded text-sm font-bold border ${
              paginaAtual === totalPaginas
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-indigo-700 border-indigo-200"
            }`}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

export default Fornecedores;