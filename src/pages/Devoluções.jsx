import { useEffect, useMemo, useState } from "react";
import ModalBaixa from "../components/modals/ModalBaixa";
import { api } from "../services/api";

const mockFuncionarios = [
  { id: 1, nome: "João Silva", matricula: "483920" },
  { id: 2, nome: "Maria Santos", matricula: "739104" },
  { id: 3, nome: "Carlos Oliveira", matricula: "102938" },
  { id: 4, nome: "Ana Pereira", matricula: "554433" },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança" },
  { id: 2, nome: "Sapato de Segurança" },
  { id: 3, nome: "Luva de Proteção" },
  { id: 4, nome: "Protetor Auricular" },
];

const mockTamanhos = [
  { id: 1, tamanho: "P" },
  { id: 2, tamanho: "M" },
  { id: 3, tamanho: "G" },
  { id: 4, tamanho: "38" },
  { id: 5, tamanho: "40" },
  { id: 6, tamanho: "42" },
  { id: 7, tamanho: "44" },
  { id: 8, tamanho: "Único" },
];

const mockMotivos = [
  { id: 1, nome: "Desgaste Natural" },
  { id: 2, nome: "Desligamento / Demissão" },
  { id: 3, nome: "Dano / Quebra Acidental" },
];

const mockDevolucoesInicial = [
  {
    id: 101,
    idFuncionario: 1,
    idEpi: 1,
    idMotivo: 1,
    data_devolucao: "2024-01-22",
    idTamanho: 2,
    quantidadeADevolver: 1,
    idEpiNovo: 1,
    idTamanhoNovo: 2,
    quantidadeNova: 1,
    assinatura_digital: null,
    token_validacao: null,
  },
  {
    id: 102,
    idFuncionario: 2,
    idEpi: 3,
    idMotivo: 2,
    data_devolucao: "2024-01-25",
    idTamanho: 1,
    quantidadeADevolver: 1,
    idEpiNovo: null,
    idTamanhoNovo: null,
    quantidadeNova: null,
    assinatura_digital: null,
    token_validacao: null,
  },
  {
    id: 103,
    idFuncionario: 3,
    idEpi: 2,
    idMotivo: 3,
    data_devolucao: "2024-02-10",
    idTamanho: 6,
    quantidadeADevolver: 1,
    idEpiNovo: 2,
    idTamanhoNovo: 6,
    quantidadeNova: 1,
    assinatura_digital: null,
    token_validacao: null,
  },
];

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas, fallback) {
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

function normalizarFuncionario(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
    matricula: String(item?.matricula ?? ""),
  };
}

function normalizarEpi(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? "",
  };
}

function normalizarTamanho(item) {
  return {
    id: Number(item?.id ?? 0),
    tamanho: String(item?.tamanho ?? ""),
  };
}

function normalizarMotivo(item) {
  return {
    id: Number(item?.id ?? 0),
    nome: item?.nome ?? item?.descricao ?? "",
  };
}

function normalizarDevolucao(item) {
  const trocaLegada = item?.troca || null;

  return {
    id: Number(item?.id ?? Date.now() + Math.random()),

    idFuncionario: Number(
      item?.idFuncionario ??
        item?.funcionario_id ??
        item?.funcionarioId ??
        item?.id_funcionario ??
        item?.funcionario ??
        item?.funcionario?.id ??
        0
    ),

    idEpi: Number(
      item?.idEpi ??
        item?.epi_id ??
        item?.epiId ??
        item?.id_epi ??
        item?.epi ??
        item?.epi?.id ??
        0
    ),

    idMotivo: Number(
      item?.idMotivo ??
        item?.motivo_id ??
        item?.motivoId ??
        item?.id_motivo ??
        item?.motivo?.id ??
        0
    ),

    data_devolucao:
      item?.data_devolucao ??
      item?.dataDevolucao ??
      item?.data ??
      "",

    idTamanho: Number(
      item?.idTamanho ??
        item?.tamanho_id ??
        item?.tamanhoId ??
        item?.id_tamanho ??
        0
    ),

    quantidadeADevolver: Number(
      item?.quantidadeADevolver ??
        item?.quantidade_a_devolver ??
        item?.quantidade ??
        0
    ),

    idEpiNovo: Number(
      item?.idEpiNovo ??
        item?.epi_novo_id ??
        item?.epiNovoId ??
        trocaLegada?.novoEpi ??
        0
    ),

    idTamanhoNovo: Number(
      item?.idTamanhoNovo ??
        item?.tamanho_novo_id ??
        item?.tamanhoNovoId ??
        0
    ),

    quantidadeNova: Number(
      item?.quantidadeNova ??
        item?.quantidade_nova ??
        trocaLegada?.novaQuantidade ??
        0
    ),

    assinatura_digital:
      item?.assinatura_digital ??
      item?.assinaturaDigital ??
      item?.assinatura ??
      null,

    token_validacao:
      item?.token_validacao ??
      item?.tokenValidacao ??
      null,

    motivoTextoFallback:
      typeof item?.motivo === "string"
        ? item.motivo
        : item?.motivo?.nome || "",

    tamanhoTextoFallback:
      typeof item?.tamanho === "string"
        ? item.tamanho
        : "",

    novoTamanhoTextoFallback:
      trocaLegada?.novoTamanho ??
      item?.novoTamanho ??
      "",

    trocaLegada: trocaLegada,
  };
}

function Devolucoes() {
  const [devolucoes, setDevolucoes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [motivos, setMotivos] = useState([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 5;

  const carregarDevolucoes = async () => {
    try {
      const [
        listaFuncionarios,
        listaEpis,
        listaTamanhos,
        listaMotivos,
        listaDevolucoes,
      ] = await Promise.all([
        buscarPrimeiraLista(["/funcionarios"], mockFuncionarios),
        buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
        buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
        buscarPrimeiraLista(
          ["/motivos-devolucao", "/motivo-devolucao", "/motivos-devolucao", "/motivos"],
          mockMotivos
        ),
        buscarPrimeiraLista(["/devolucoes", "/devolucao"], mockDevolucoesInicial),
      ]);

      setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
      setEpis(listaEpis.map(normalizarEpi));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
      setMotivos(listaMotivos.map(normalizarMotivo));
      setDevolucoes(listaDevolucoes.map(normalizarDevolucao));
    } catch (erro) {
      setFuncionarios(mockFuncionarios.map(normalizarFuncionario));
      setEpis(mockEpis.map(normalizarEpi));
      setTamanhos(mockTamanhos.map(normalizarTamanho));
      setMotivos(mockMotivos.map(normalizarMotivo));
      setDevolucoes(mockDevolucoesInicial.map(normalizarDevolucao));
    }
  };

  useEffect(() => {
    carregarDevolucoes();
  }, []);

  const formatarData = (data) => {
    if (!data) return "--";
    const dataObj = new Date(data);
    if (Number.isNaN(dataObj.getTime())) return "--";
    return dataObj.toLocaleDateString("pt-BR");
  };

  const devolucoesResolvidas = useMemo(() => {
    return devolucoes.map((d) => {
      const funcionario = funcionarios.find(
        (f) => Number(f.id) === Number(d.idFuncionario)
      );
      const epi = epis.find((e) => Number(e.id) === Number(d.idEpi));
      const tamanho = tamanhos.find(
        (t) => Number(t.id) === Number(d.idTamanho)
      );
      const motivo = motivos.find(
        (m) => Number(m.id) === Number(d.idMotivo)
      );

      const epiNovo = epis.find((e) => Number(e.id) === Number(d.idEpiNovo));
      const tamanhoNovo = tamanhos.find(
        (t) => Number(t.id) === Number(d.idTamanhoNovo)
      );

      const houveTroca =
        Number(d.idEpiNovo || 0) > 0 ||
        Number(d.idTamanhoNovo || 0) > 0 ||
        Number(d.quantidadeNova || 0) > 0 ||
        !!d.trocaLegada;

      return {
        ...d,
        funcionarioNome: funcionario?.nome || "Desconhecido",
        funcionarioMatricula: funcionario?.matricula || "--",
        epiNome: epi?.nome || "EPI não identificado",
        tamanhoNome: tamanho?.tamanho || d.tamanhoTextoFallback || "-",
        motivoNome: motivo?.nome || d.motivoTextoFallback || "Motivo não identificado",
        houveTroca,
        epiNovoNome: epiNovo?.nome || (houveTroca ? "EPI de troca" : null),
        tamanhoNovoNome:
          tamanhoNovo?.tamanho || d.novoTamanhoTextoFallback || "-",
      };
    });
  }, [devolucoes, funcionarios, epis, tamanhos, motivos]);

  const devolucoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return devolucoesResolvidas;

    return devolucoesResolvidas.filter((d) => {
      return (
        (d.funcionarioNome || "").toLowerCase().includes(termo) ||
        String(d.funcionarioMatricula || "").includes(termo) ||
        (d.motivoNome || "").toLowerCase().includes(termo) ||
        (d.epiNome || "").toLowerCase().includes(termo) ||
        (d.epiNovoNome || "").toLowerCase().includes(termo) ||
        String(d.tamanhoNome || "").toLowerCase().includes(termo) ||
        String(d.tamanhoNovoNome || "").toLowerCase().includes(termo)
      );
    });
  }, [devolucoesResolvidas, busca]);

  const devolucoesOrdenadas = useMemo(() => {
    return [...devolucoesFiltradas].sort((a, b) => {
      if (a.data_devolucao < b.data_devolucao) return 1;
      if (a.data_devolucao > b.data_devolucao) return -1;
      return 0;
    });
  }, [devolucoesFiltradas]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(devolucoesOrdenadas.length / itensPorPagina));
    if (paginaAtual > total) setPaginaAtual(total);
  }, [paginaAtual, devolucoesOrdenadas.length]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const devolucoesVisiveis = devolucoesOrdenadas.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.max(1, Math.ceil(devolucoesOrdenadas.length / itensPorPagina));

  const receberNovaDevolucao = async (novaDevolucao) => {
    const payload = {
      idFuncionario: Number(
        novaDevolucao?.idFuncionario ?? novaDevolucao?.funcionario ?? 0
      ),
      idEpi: Number(novaDevolucao?.idEpi ?? novaDevolucao?.epi ?? 0),
      idMotivo: Number(
        novaDevolucao?.idMotivo ??
          novaDevolucao?.motivo_id ??
          novaDevolucao?.motivoId ??
          0
      ),
      data_devolucao:
        novaDevolucao?.data_devolucao ??
        novaDevolucao?.dataDevolucao ??
        novaDevolucao?.data ??
        new Date().toISOString().split("T")[0],
      idTamanho: Number(
        novaDevolucao?.idTamanho ??
          novaDevolucao?.tamanho_id ??
          novaDevolucao?.tamanhoId ??
          0
      ),
      quantidadeADevolver: Number(
        novaDevolucao?.quantidadeADevolver ??
          novaDevolucao?.quantidade ??
          0
      ),
      idEpiNovo: Number(
        novaDevolucao?.idEpiNovo ??
          novaDevolucao?.troca?.novoEpi ??
          0
      ) || null,
      idTamanhoNovo: Number(
        novaDevolucao?.idTamanhoNovo ??
          novaDevolucao?.tamanhoNovoId ??
          0
      ) || null,
      quantidadeNova: Number(
        novaDevolucao?.quantidadeNova ??
          novaDevolucao?.troca?.novaQuantidade ??
          0
      ) || null,
      assinatura_digital:
        novaDevolucao?.assinatura_digital ??
        novaDevolucao?.assinatura ??
        null,
      token_validacao:
        novaDevolucao?.token_validacao ??
        novaDevolucao?.tokenValidacao ??
        null,
    };

    const itemLocal = normalizarDevolucao({
      id: Date.now(),
      ...novaDevolucao,
      ...payload,
    });

    try {
      await api.post("/devolucao", payload);
      setDevolucoes((prev) => [itemLocal, ...prev]);
      setPaginaAtual(1);
    } catch (erro) {
      try {
        await api.post("/devolucoes", payload);
        setDevolucoes((prev) => [itemLocal, ...prev]);
        setPaginaAtual(1);
      } catch (erro2) {
        setDevolucoes((prev) => [itemLocal, ...prev]);
        setPaginaAtual(1);
      }
    }
  };

  const imprimirRelatorioDevolucoes = () => {
    const conteudo = `
      <html>
        <head>
          <title>Relatório de Devoluções de EPI</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #b91c1c; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #b91c1c; font-size: 24px; text-transform: uppercase; }
            .header .meta { text-align: right; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f3f4f6; color: #1f2937; text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
            .badge-sim { background-color: #dcfce7; color: #166534; }
            .badge-nao { background-color: #f3f4f6; color: #4b5563; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .assinatura-box { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 10px; font-size: 12px; margin-top: 40px; }
            @media print {
              .no-print { display: none; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Relatório de Devoluções</h1>
              <p style="margin: 5px 0 0; font-size: 14px;">Controle de Estoque e Segurança do Trabalho</p>
            </div>
            <div class="meta">
              <p>Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}</p>
              <p>Total de Registros: ${devolucoesOrdenadas.length}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Colaborador</th>
                <th>Item Devolvido</th>
                <th>Motivo</th>
                <th>Houve Troca?</th>
              </tr>
            </thead>
            <tbody>
              ${devolucoesOrdenadas
                .map((d) => {
                  const trocaClass = d.houveTroca ? "badge-sim" : "badge-nao";
                  const trocaTexto = d.houveTroca ? "SIM" : "NÃO";

                  return `
                    <tr>
                      <td>${formatarData(d.data_devolucao)}</td>
                      <td><b>${d.funcionarioNome}</b><br/><span style="color:#666; font-size:11px;">Mat: ${d.funcionarioMatricula}</span></td>
                      <td>${d.epiNome} (${d.tamanhoNome}) - <b>${d.quantidadeADevolver} un</b></td>
                      <td>${d.motivoNome}</td>
                      <td><span class="badge ${trocaClass}">${trocaTexto}</span></td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            <div class="assinatura-box">Responsável pelo Almoxarifado</div>
            <div class="assinatura-box">Técnico de Segurança do Trabalho</div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=900,height=600");
    win.document.write(conteudo);
    win.document.close();
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in max-w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
            🔄 Devoluções e Trocas
          </h2>
          <p className="text-sm text-gray-500">
            Registre e consulte devoluções conforme a tabela devolucao.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <button
            onClick={imprimirRelatorioDevolucoes}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition shadow-sm border border-gray-300 flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            <span>🖨️</span> Relatório
          </button>

          <button
            onClick={() => setModalAberto(true)}
            className="bg-red-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-800 transition flex items-center gap-2 shadow-sm justify-center w-full sm:w-auto"
          >
            <span>➕</span> Registrar Devolução
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar por funcionário, matrícula, motivo, EPI ou troca..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition text-sm lg:text-base"
        />
      </div>

      <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Funcionário</th>
              <th className="p-4 font-semibold">Item Devolvido</th>
              <th className="p-4 font-semibold">Motivo</th>
              <th className="p-4 font-semibold text-center">Troca?</th>
              <th className="p-4 font-semibold text-center">Assinatura</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {devolucoesVisiveis.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  Nenhuma devolução encontrada no banco de dados.
                </td>
              </tr>
            ) : (
              devolucoesVisiveis.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-600 font-mono text-sm">
                    {formatarData(d.data_devolucao)}
                  </td>

                  <td className="p-4 font-medium text-gray-800">
                    {d.funcionarioNome}
                    <span className="block text-xs text-gray-400">
                      Mat: {d.funcionarioMatricula}
                    </span>
                  </td>

                  <td className="p-4 text-gray-700">
                    <div>
                      {d.epiNome} <span className="text-gray-400 text-xs">({d.tamanhoNome})</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Quantidade: {d.quantidadeADevolver}
                    </div>
                    {d.houveTroca && (
                      <div className="text-xs text-green-700 mt-1">
                        Troca por: <b>{d.epiNovoNome}</b> ({d.tamanhoNovoNome}) x{d.quantidadeNova || 0}
                      </div>
                    )}
                  </td>

                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200 text-xs font-semibold">
                      {d.motivoNome}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {d.houveTroca ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        ✅ SIM
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
                        ❌ NÃO
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {d.assinatura_digital || d.token_validacao ? (
                      <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-200" title="Assinado Digitalmente">
                        ✍️ OK
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {devolucoesVisiveis.length > 0 ? (
          devolucoesVisiveis.map((d) => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
              <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    {formatarData(d.data_devolucao)}
                  </span>

                  {d.houveTroca ? (
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 py-0.5 rounded border border-green-100">
                      🔄 Troca
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
                      ↩️ Devolução
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <h3 className="font-bold text-gray-800 text-lg">{d.funcionarioNome}</h3>
                <span className="text-xs text-gray-500 block">
                  Matrícula: {d.funcionarioMatricula}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Item:</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {d.epiNome} <small className="text-gray-400">({d.tamanhoNome})</small>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Quantidade:</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {d.quantidadeADevolver}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Motivo:</span>
                  <span className="text-xs font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {d.motivoNome}
                  </span>
                </div>

                {d.houveTroca && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1">
                      Item da troca
                    </span>
                    <span className="text-sm text-green-700 font-semibold">
                      {d.epiNovoNome} ({d.tamanhoNovoNome}) x{d.quantidadeNova || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Nenhuma devolução encontrada.
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
                : "bg-white text-red-700 hover:bg-red-50 border-red-200"
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
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-red-700 hover:bg-red-50 border-red-200"
            }`}
          >
            Próxima →
          </button>
        </div>
      )}

      {modalAberto && (
        <ModalBaixa
          onClose={() => setModalAberto(false)}
          onSalvar={receberNovaDevolucao}
        />
      )}
    </div>
  );
}

export default Devolucoes;