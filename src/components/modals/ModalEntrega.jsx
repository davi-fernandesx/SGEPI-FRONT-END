import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../services/api";

const mockFuncionarios = [
  { id: 1, nome: "João Silva", matricula: "483920" },
  { id: 2, nome: "Maria Santos", matricula: "739104" },
  { id: 3, nome: "Carlos Oliveira", matricula: "102938" },
  { id: 4, nome: "Ana Pereira", matricula: "564738" },
  { id: 5, nome: "Roberto Costa", matricula: "998877" },
];

const mockEpis = [
  { id: 1, nome: "Capacete de Segurança" },
  { id: 2, nome: "Luva de Raspa" },
  { id: 3, nome: "Sapato de Segurança" },
  { id: 4, nome: "Óculos de Proteção" },
  { id: 5, nome: "Protetor Auricular" },
];

const mockTamanhos = [
  { id: 1, tamanho: "P" },
  { id: 2, tamanho: "M" },
  { id: 3, tamanho: "G" },
  { id: 4, tamanho: "GG" },
  { id: 5, tamanho: "38" },
  { id: 6, tamanho: "40" },
  { id: 7, tamanho: "42" },
  { id: 8, tamanho: "44" },
  { id: 9, tamanho: "Único" },
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

function gerarTokenValidacao() {
  try {
    return crypto.randomUUID();
  } catch (erro) {
    return `token-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
}

function aplicarEstiloCaneta(ctx) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.2;
}

function preencherCanvasBranco(ctx, largura, altura) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, largura, altura);
}

function ModalEntrega({ onClose, onSalvar }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);

  const [funcionario, setFuncionario] = useState("");
  const [buscaFuncionario, setBuscaFuncionario] = useState("");
  const [dataEntrega, setDataEntrega] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [itensParaEntregar, setItensParaEntregar] = useState([]);
  const [idEpiTemp, setIdEpiTemp] = useState("");
  const [idTamanhoTemp, setIdTamanhoTemp] = useState("");
  const [qtdTemp, setQtdTemp] = useState(1);

  const [carregando, setCarregando] = useState(false);

  const [modalAssinaturaAberto, setModalAssinaturaAberto] = useState(false);
  const [assinaturaPreview, setAssinaturaPreview] = useState("");
  const assinaturaPreviewRef = useRef("");

  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [assinaturaVazia, setAssinaturaVazia] = useState(true);

  useEffect(() => {
    assinaturaPreviewRef.current = assinaturaPreview;
  }, [assinaturaPreview]);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      const [listaFuncionarios, listaEpis, listaTamanhos] = await Promise.all([
        buscarPrimeiraLista(["/funcionarios"], mockFuncionarios),
        buscarPrimeiraLista(["/epis", "/epi", "/produtos"], mockEpis),
        buscarPrimeiraLista(["/tamanhos", "/tamanho"], mockTamanhos),
      ]);

      if (!ativo) return;

      setFuncionarios(listaFuncionarios.map(normalizarFuncionario));
      setEpis(listaEpis.map(normalizarEpi));
      setTamanhos(listaTamanhos.map(normalizarTamanho));
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!modalAssinaturaAberto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function configurarCanvas() {
      const canvas = canvasRef.current;
      const wrapper = canvasWrapperRef.current;
      if (!canvas || !wrapper) return;

      const ratio = window.devicePixelRatio || 1;
      const largura = Math.max(wrapper.clientWidth, 320);
      const altura = Math.max(wrapper.clientHeight, 320);

      canvas.width = largura * ratio;
      canvas.height = altura * ratio;
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);

      aplicarEstiloCaneta(ctx);
      preencherCanvasBranco(ctx, largura, altura);
      contextRef.current = ctx;

      if (assinaturaPreviewRef.current) {
        const imagem = new Image();
        imagem.onload = () => {
          preencherCanvasBranco(ctx, largura, altura);
          ctx.drawImage(imagem, 0, 0, largura, altura);
          aplicarEstiloCaneta(ctx);
        };
        imagem.src = assinaturaPreviewRef.current;
        setAssinaturaVazia(false);
      } else {
        setAssinaturaVazia(true);
      }
    }

    const id = requestAnimationFrame(configurarCanvas);
    window.addEventListener("resize", configurarCanvas);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", configurarCanvas);
      document.body.style.overflow = overflowAnterior;
    };
  }, [modalAssinaturaAberto]);

  const funcionarioSelecionado = useMemo(() => {
    return funcionarios.find((f) => Number(f.id) === Number(funcionario)) || null;
  }, [funcionarios, funcionario]);

  const funcionariosFiltrados = useMemo(() => {
    const termo = buscaFuncionario.toLowerCase().trim();

    if (!termo) return funcionarios;

    return funcionarios.filter((f) => {
      return (
        (f.nome || "").toLowerCase().includes(termo) ||
        String(f.matricula || "").includes(termo)
      );
    });
  }, [funcionarios, buscaFuncionario]);

  const epiSelecionadoObj = useMemo(() => {
    return epis.find((e) => Number(e.id) === Number(idEpiTemp)) || null;
  }, [epis, idEpiTemp]);

  const tamanhoSelecionadoObj = useMemo(() => {
    return tamanhos.find((t) => Number(t.id) === Number(idTamanhoTemp)) || null;
  }, [tamanhos, idTamanhoTemp]);

  function getCoordenadas(event) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(event) {
    const ponto = getCoordenadas(event);
    if (!ponto || !contextRef.current) return;

    event.preventDefault();

    if (event.target.setPointerCapture) {
      try {
        event.target.setPointerCapture(event.pointerId);
      } catch (erro) {
        // ignora
      }
    }

    contextRef.current.beginPath();
    contextRef.current.moveTo(ponto.x, ponto.y);
    contextRef.current.lineTo(ponto.x + 0.01, ponto.y + 0.01);
    contextRef.current.stroke();

    setIsDrawing(true);
    setAssinaturaVazia(false);
  }

  function draw(event) {
    if (!isDrawing || !contextRef.current) return;

    const ponto = getCoordenadas(event);
    if (!ponto) return;

    event.preventDefault();

    contextRef.current.lineTo(ponto.x, ponto.y);
    contextRef.current.stroke();
    setAssinaturaVazia(false);
  }

  function finishDrawing(event) {
    if (!contextRef.current) return;

    if (event?.target?.releasePointerCapture) {
      try {
        event.target.releasePointerCapture(event.pointerId);
      } catch (erro) {
        // ignora
      }
    }

    contextRef.current.closePath();
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas && !assinaturaVazia) {
      setAssinaturaPreview(canvas.toDataURL("image/png"));
    }
  }

  function limparAssinatura() {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    setIsDrawing(false);
    setAssinaturaPreview("");
    assinaturaPreviewRef.current = "";
    setAssinaturaVazia(true);

    if (!canvas || !ctx) return;

    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    preencherCanvasBranco(ctx, largura, altura);
    aplicarEstiloCaneta(ctx);
  }

  function adicionarItem() {
    if (!idEpiTemp || !idTamanhoTemp || !qtdTemp) {
      alert("Selecione o EPI, o tamanho e a quantidade.");
      return;
    }

    const quantidade = Number(qtdTemp);
    if (Number.isNaN(quantidade) || quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    const novoItem = {
      id: Date.now() + Math.random(),
      idEpi: Number(idEpiTemp),
      idTamanho: Number(idTamanhoTemp),
      quantidade,
      epiNome: epiSelecionadoObj?.nome || "EPI",
      tamanhoNome: tamanhoSelecionadoObj?.tamanho || "-",
    };

    setItensParaEntregar((prev) => [...prev, novoItem]);
    setIdEpiTemp("");
    setIdTamanhoTemp("");
    setQtdTemp(1);
  }

  function removerItem(id) {
    setItensParaEntregar((prev) => prev.filter((item) => item.id !== id));
  }

  function salvarEntrega() {
    if (!funcionario) {
      alert("Selecione o funcionário.");
      return;
    }

    if (itensParaEntregar.length === 0) {
      alert("Adicione pelo menos um item para entrega.");
      return;
    }

    if (!assinaturaPreview) {
      alert("Peça para o colaborador assinar antes de confirmar.");
      return;
    }

    const tokenValidacao = gerarTokenValidacao();

    const entregaFinal = {
      id: Date.now(),

      idFuncionario: Number(funcionario),
      data_entrega: dataEntrega,
      assinatura_digital: assinaturaPreview,
      token_validacao: tokenValidacao,

      itens: itensParaEntregar.map((item) => ({
        id: item.id,
        idEpi: item.idEpi,
        idTamanho: item.idTamanho,
        quantidade: item.quantidade,
        epiNome: item.epiNome,
        tamanhoNome: item.tamanhoNome,
      })),

      funcionario: Number(funcionario),
      nome_funcionario: funcionarioSelecionado?.nome || "",
      dataEntrega: dataEntrega,
      assinatura: assinaturaPreview,
    };

    if (onSalvar) {
      onSalvar(entregaFinal);
    }

    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg text-blue-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </span>

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Nova Entrega com Assinatura
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Entrega com funcionário, itens e assinatura digital.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition text-xl font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-slate-700">
                  Colaborador
                </label>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Buscar nome ou matrícula..."
                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-t-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm bg-slate-50"
                    value={buscaFuncionario}
                    onChange={(e) => setBuscaFuncionario(e.target.value)}
                  />
                </div>

                <div className="w-full border border-slate-300 rounded-b-lg -mt-2 bg-white max-h-40 overflow-y-auto border-t-0">
                  {funcionariosFiltrados.length === 0 ? (
                    <div className="p-3 text-sm text-gray-400 text-center italic">
                      Nenhum colaborador encontrado
                    </div>
                  ) : (
                    funcionariosFiltrados.map((f) => {
                      const isSelected = Number(funcionario) === Number(f.id);

                      return (
                        <button
                          type="button"
                          key={f.id}
                          onClick={() => setFuncionario(f.id)}
                          className={`w-full text-left p-2.5 border-b border-gray-50 last:border-0 transition-colors ${
                            isSelected
                              ? "bg-blue-100 text-blue-800 font-medium"
                              : "text-slate-600 hover:bg-blue-50"
                          }`}
                        >
                          <span className="font-mono text-xs text-slate-400 mr-2">
                            [{f.matricula}]
                          </span>
                          {f.nome}
                        </button>
                      );
                    })
                  )}
                </div>

                {funcionarioSelecionado && (
                  <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    Selecionado: <b>{funcionarioSelecionado.nome}</b> — Mat.{" "}
                    {funcionarioSelecionado.matricula}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data da Entrega
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-slate-700"
                  value={dataEntrega}
                  onChange={(e) => setDataEntrega(e.target.value)}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-3">
                🛠️ Adicionar itens à entrega
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_100px_auto] gap-3 items-end">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">
                    EPI
                  </label>
                  <select
                    className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    value={idEpiTemp}
                    onChange={(e) => setIdEpiTemp(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {epis.map((epi) => (
                      <option key={epi.id} value={epi.id}>
                        {epi.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">
                    Tamanho
                  </label>
                  <select
                    className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    value={idTamanhoTemp}
                    onChange={(e) => setIdTamanhoTemp(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {tamanhos.map((tamanho) => (
                      <option key={tamanho.id} value={tamanho.id}>
                        {tamanho.tamanho}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block uppercase font-bold">
                    Qtd.
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    value={qtdTemp}
                    onChange={(e) => setQtdTemp(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={adicionarItem}
                  className="w-full md:w-auto px-4 py-2.5 bg-blue-700 text-white font-bold rounded hover:bg-blue-800 transition text-sm"
                >
                  + Adicionar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Itens na entrega ({itensParaEntregar.length})
              </label>

              {itensParaEntregar.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-3 pl-4">Item</th>
                        <th className="p-3 text-center">Tam.</th>
                        <th className="p-3 text-center">Qtd.</th>
                        <th className="p-3 text-right pr-4">Ação</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                      {itensParaEntregar.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 pl-4 text-slate-700">
                            {item.epiNome}
                          </td>
                          <td className="p-3 text-center text-slate-500">
                            {item.tamanhoNome}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-800">
                            {item.quantidade}
                          </td>
                          <td className="p-3 text-right pr-4">
                            <button
                              type="button"
                              onClick={() => removerItem(item.id)}
                              className="text-red-500 hover:text-red-700 font-bold text-xs"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400 text-sm">
                  Nenhum item adicionado.
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Assinatura digital do colaborador
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Abra a tela de assinatura para o colaborador assinar em tela
                    cheia.
                  </p>
                </div>

                <div className="flex gap-2">
                  {assinaturaPreview && (
                    <button
                      type="button"
                      onClick={limparAssinatura}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Limpar assinatura
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setModalAssinaturaAberto(true)}
                    className="px-4 py-2 bg-blue-700 text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition"
                  >
                    {assinaturaPreview
                      ? "Abrir novamente a assinatura"
                      : "Abrir área de assinatura"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-300 bg-slate-50 p-3">
                {assinaturaPreview ? (
                  <>
                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                      <img
                        src={assinaturaPreview}
                        alt="Assinatura do colaborador"
                        className="w-full h-40 object-contain bg-white"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Pré-visualização da assinatura capturada</span>
                      <span className="text-emerald-600 font-medium">
                        Assinatura capturada
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white h-40 flex items-center justify-center">
                      <div className="text-center text-slate-300">
                        <div className="text-3xl mb-2">✍️</div>
                        <div className="text-sm font-medium">
                          Nenhuma assinatura capturada
                        </div>
                        <div className="text-xs mt-1">
                          Toque no botão acima para abrir a tela cheia
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Área destinada à assinatura do colaborador</span>
                      <span>Assinatura pendente</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition"
            >
              Cancelar
            </button>

            <button
              onClick={salvarEntrega}
              disabled={carregando}
              className="px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 shadow-md transition flex items-center gap-2 disabled:opacity-60"
            >
              <span>💾</span> Confirmar Entrega
            </button>
          </div>
        </div>
      </div>

      {modalAssinaturaAberto && (
        <div className="fixed inset-0 z-[80] bg-white flex flex-col">
          <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Assinatura do colaborador
              </h3>
              <p className="text-xs text-slate-500">
                Esta área ocupa toda a tela para facilitar a assinatura no celular.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalAssinaturaAberto(false)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
            >
              Sair ✕
            </button>
          </div>

          <div className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col bg-slate-100">
            <div className="shrink-0 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs sm:text-sm text-slate-600">
                Peça para o colaborador assinar no espaço abaixo usando o dedo,
                mouse ou caneta.
              </div>

              <button
                type="button"
                onClick={limparAssinatura}
                className="self-start sm:self-auto px-3 py-2 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 transition"
              >
                Limpar
              </button>
            </div>

            <div className="flex-1 min-h-[320px] rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-sm">
              <div ref={canvasWrapperRef} className="relative w-full h-full">
                <canvas
                  ref={canvasRef}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={finishDrawing}
                  onPointerLeave={finishDrawing}
                  onPointerCancel={finishDrawing}
                  className="block w-full h-full cursor-crosshair touch-none"
                />

                {assinaturaVazia && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-slate-300 px-4">
                      <div className="text-4xl mb-3">✍️</div>
                      <div className="text-base sm:text-lg font-semibold">
                        Assine aqui
                      </div>
                      <div className="text-xs sm:text-sm mt-1">
                        A área ocupa a tela toda para facilitar no celular
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 mt-3 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
              <div className="text-xs text-slate-500">
                {assinaturaVazia
                  ? "Assinatura pendente"
                  : "Assinatura capturada"}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalAssinaturaAberto(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100 transition"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (assinaturaVazia) {
                      alert("Peça para o colaborador assinar antes de concluir.");
                      return;
                    }
                    setModalAssinaturaAberto(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 transition"
                >
                  Concluir assinatura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalEntrega;