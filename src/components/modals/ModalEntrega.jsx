import { useEffect, useMemo, useRef, useState } from "react";
import {
  criarEntrega,
  listarEpisEntrega,
  listarFuncionariosEntrega,
  listarTamanhosEntrega,
  salvarItensEntrega,
} from "../../services/entregaService";
import {
  gerarTokenValidacaoEntrega,
  normalizarEpiEntrega,
  normalizarFuncionarioEntrega,
  normalizarTamanhoEntrega,
} from "../../utils/entregaNormalizers";
import {
  aplicarFerramentaNoContexto,
  canvasEstaEmBranco,
  gerarAssinaturaAjustada,
  preencherCanvasBranco,
} from "../../utils/assinaturaCanvas";

function validarQuantidade(valor) {
  const numero = Number(valor);
  return !Number.isNaN(numero) && numero > 0;
}

function resolverIdEntrega(respostaEntrega) {
  return Number(
    respostaEntrega?.id ??
      respostaEntrega?.ID ??
      respostaEntrega?.entrega?.id ??
      respostaEntrega?.entregaId ??
      0
  );
}

function montarItemEntrega(item, epiSelecionadoObj, tamanhoSelecionadoObj) {
  return {
    id: Date.now() + Math.random(),
    idEpi: Number(item.idEpi),
    idTamanho: Number(item.idTamanho),
    quantidade: Number(item.quantidade),
    epiNome: epiSelecionadoObj?.nome || "EPI",
    tamanhoNome: tamanhoSelecionadoObj?.tamanho || "-",
  };
}

function ToolbarDesktop({
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
  painelFerramentasAberto,
  setPainelFerramentasAberto,
}) {
  if (!painelFerramentasAberto) {
    return (
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={() => setPainelFerramentasAberto(true)}
          className="rounded-full bg-blue-700 text-white shadow-lg px-4 py-2 text-xs sm:text-sm font-bold hover:bg-blue-800 transition"
        >
          Abrir opções
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10 max-w-[calc(100vw-2rem)]">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg p-2 sm:p-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setFerramentaAtiva("caneta")}
            className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition ${
              ferramentaAtiva === "caneta"
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            ✍️ Escrever
          </button>

          <button
            type="button"
            onClick={() => setFerramentaAtiva("borracha")}
            className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition ${
              ferramentaAtiva === "borracha"
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            🩹 Borracha
          </button>

          <button
            type="button"
            onClick={limparAssinatura}
            className="px-3 py-2 rounded-xl border border-red-200 bg-white text-red-600 text-xs sm:text-sm font-semibold hover:bg-red-50 transition"
          >
            Limpar
          </button>

          <button
            type="button"
            onClick={() => setPainelFerramentasAberto(false)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
          >
            Ocultar
          </button>

          <button
            type="button"
            onClick={fecharAssinatura}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
          >
            Sair
          </button>

          <button
            type="button"
            onClick={concluirAssinatura}
            className="px-3 py-2 rounded-xl bg-blue-700 text-white text-xs sm:text-sm font-bold hover:bg-blue-800 transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarMobile({
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
}) {
  return (
    <aside className="w-[78px] h-full absolute top-0 right-0 z-20 border-l border-slate-200 bg-white rounded-l-2xl shadow-lg flex flex-col items-center py-3 px-1">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide rotate-90 mt-4 mb-8">
        Opções
      </div>

      <div className="flex-1 flex flex-col items-center justify-start gap-6 w-full">
        <button
          type="button"
          onClick={() => setFerramentaAtiva("caneta")}
          className={`w-[64px] h-[42px] rounded-xl border text-[10px] font-bold transition rotate-90 flex items-center justify-center ${
            ferramentaAtiva === "caneta"
              ? "bg-blue-700 text-white border-blue-700"
              : "bg-white text-slate-700 border-slate-300"
          }`}
        >
          ✍️ Caneta
        </button>

        <button
          type="button"
          onClick={() => setFerramentaAtiva("borracha")}
          className={`w-[64px] h-[42px] rounded-xl border text-[10px] font-bold transition rotate-90 flex items-center justify-center ${
            ferramentaAtiva === "borracha"
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-700 border-slate-300"
          }`}
        >
          🩹 Borracha
        </button>

        <button
          type="button"
          onClick={limparAssinatura}
          className="w-[64px] h-[42px] rounded-xl border border-red-200 bg-white text-red-600 text-[10px] font-bold hover:bg-red-50 transition rotate-90 flex items-center justify-center"
        >
          Limpar
        </button>
      </div>

      <div className="flex flex-col items-center gap-6 pb-4">
        <button
          type="button"
          onClick={fecharAssinatura}
          className="w-[64px] h-[42px] rounded-xl border border-slate-300 bg-white text-slate-700 text-[10px] font-bold hover:bg-slate-50 transition rotate-90 flex items-center justify-center"
        >
          Sair
        </button>

        <button
          type="button"
          onClick={concluirAssinatura}
          className="w-[72px] h-[46px] rounded-xl bg-blue-700 text-white text-[10px] font-bold hover:bg-blue-800 transition shadow-sm rotate-90 flex items-center justify-center"
        >
          Concluir
        </button>
      </div>
    </aside>
  );
}

function ListaFuncionarios({
  buscaFuncionario,
  setBuscaFuncionario,
  funcionariosFiltrados,
  funcionario,
  setFuncionario,
  funcionarioSelecionado,
}) {
  return (
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
          funcionariosFiltrados.map((item) => {
            const isSelected = Number(funcionario) === Number(item.id);

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setFuncionario(item.id)}
                className={`w-full text-left p-2.5 border-b border-gray-50 last:border-0 transition-colors ${
                  isSelected
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "text-slate-600 hover:bg-blue-50"
                }`}
              >
                <span className="font-mono text-xs text-slate-400 mr-2">
                  [{item.matricula}]
                </span>
                {item.nome}
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
  );
}

function TabelaItens({ itensParaEntregar, removerItem }) {
  if (itensParaEntregar.length === 0) {
    return (
      <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400 text-sm">
        Nenhum item adicionado.
      </div>
    );
  }

  return (
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
              <td className="p-3 pl-4 text-slate-700">{item.epiNome}</td>
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
  );
}

function AssinaturaPreview({
  assinaturaPreview,
  limparAssinatura,
  abrirAssinatura,
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Assinatura digital do colaborador
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Abra a tela de assinatura para o colaborador assinar.
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
            onClick={abrirAssinatura}
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
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center min-h-[170px]">
              <img
                src={assinaturaPreview}
                alt="Assinatura do colaborador"
                className="max-w-full max-h-[160px] object-contain bg-white -rotate-90"
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
                  Toque no botão acima para abrir a área de assinatura
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
  );
}

function SignatureCanvasDesktop({
  canvasRef,
  canvasWrapperRef,
  startDrawing,
  draw,
  finishDrawing,
  assinaturaVazia,
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
  painelFerramentasAberto,
  setPainelFerramentasAberto,
}) {
  return (
    <div className="absolute inset-0 bg-slate-100">
      <div className="absolute inset-0 p-5">
        <div
          ref={canvasWrapperRef}
          className="relative h-full w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={finishDrawing}
            onPointerLeave={finishDrawing}
            onPointerCancel={finishDrawing}
            className="block w-full h-full touch-none bg-white"
          />

          <div className="absolute top-4 left-4 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-slate-200">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Assinatura do colaborador
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Assine normalmente.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center px-6">
            <div className="w-full max-w-5xl -mt-8">
              <div className="flex items-center gap-3 text-slate-300 mb-3">
                <div className="h-px flex-1 bg-slate-300" />
              </div>

              <div className="border-b-2 border-dashed border-slate-300" />

              {assinaturaVazia && (
                <div className="mt-8 text-center text-slate-300">
                  <div className="text-5xl mb-3">✍️</div>
                  <div className="text-lg font-semibold">
                    Escreva nesta área
                  </div>
                  <div className="text-sm mt-1">
                    A assinatura ficará ajustada normalmente.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToolbarDesktop
        ferramentaAtiva={ferramentaAtiva}
        setFerramentaAtiva={setFerramentaAtiva}
        limparAssinatura={limparAssinatura}
        concluirAssinatura={concluirAssinatura}
        fecharAssinatura={fecharAssinatura}
        painelFerramentasAberto={painelFerramentasAberto}
        setPainelFerramentasAberto={setPainelFerramentasAberto}
      />
    </div>
  );
}

function SignatureCanvasMobile({
  canvasRef,
  canvasWrapperRef,
  startDrawing,
  draw,
  finishDrawing,
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
}) {
  return (
    <div className="h-full w-full flex">
      <div className="relative flex-1 min-w-0 bg-slate-100">
        <div className="absolute inset-0 p-3 pr-2">
          <div
            ref={canvasWrapperRef}
            className="relative h-full w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={finishDrawing}
              onPointerLeave={finishDrawing}
              onPointerCancel={finishDrawing}
              className="absolute inset-0 block w-full h-full touch-none bg-white"
            />
          </div>
        </div>
      </div>

      <ToolbarMobile
        ferramentaAtiva={ferramentaAtiva}
        setFerramentaAtiva={setFerramentaAtiva}
        limparAssinatura={limparAssinatura}
        concluirAssinatura={concluirAssinatura}
        fecharAssinatura={fecharAssinatura}
      />
    </div>
  );
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
  const [carregandoDados, setCarregandoDados] = useState(true);

  const [modalAssinaturaAberto, setModalAssinaturaAberto] = useState(false);
  const [assinaturaPreview, setAssinaturaPreview] = useState("");
  const [assinaturaEdicao, setAssinaturaEdicao] = useState("");

  const assinaturaPreviewRef = useRef("");
  const assinaturaEdicaoRef = useRef("");

  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [assinaturaVazia, setAssinaturaVazia] = useState(true);
  const [ferramentaAtiva, setFerramentaAtiva] = useState("caneta");
  const [painelFerramentasAberto, setPainelFerramentasAberto] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    assinaturaPreviewRef.current = assinaturaPreview;
  }, [assinaturaPreview]);

  useEffect(() => {
    assinaturaEdicaoRef.current = assinaturaEdicao;
  }, [assinaturaEdicao]);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregandoDados(true);

      try {
        const [listaFuncionarios, listaEpis, listaTamanhos] =
          await Promise.all([
            listarFuncionariosEntrega(),
            listarEpisEntrega(),
            listarTamanhosEntrega(),
          ]);

        if (!ativo) return;

        setFuncionarios(listaFuncionarios.map(normalizarFuncionarioEntrega));
        setEpis(listaEpis.map(normalizarEpiEntrega));
        setTamanhos(listaTamanhos.map(normalizarTamanhoEntrega));
      } catch (erro) {
        console.error("Erro ao carregar dados da entrega:", erro);

        if (!ativo) return;

        setFuncionarios([]);
        setEpis([]);
        setTamanhos([]);
      } finally {
        if (ativo) {
          setCarregandoDados(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    function atualizarViewport() {
      setIsMobileViewport(window.innerWidth < 768);
    }

    atualizarViewport();
    window.addEventListener("resize", atualizarViewport);
    window.addEventListener("orientationchange", atualizarViewport);

    return () => {
      window.removeEventListener("resize", atualizarViewport);
      window.removeEventListener("orientationchange", atualizarViewport);
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
      const largura = Math.max(wrapper.clientWidth, 280);
      const altura = Math.max(wrapper.clientHeight, 280);

      canvas.width = largura * ratio;
      canvas.height = altura * ratio;
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);

      preencherCanvasBranco(ctx, largura, altura);
      contextRef.current = ctx;

      if (assinaturaEdicaoRef.current) {
        const imagem = new Image();
        imagem.onload = () => {
          preencherCanvasBranco(ctx, largura, altura);
          ctx.drawImage(imagem, 0, 0, largura, altura);
          aplicarFerramentaNoContexto(ctx, ferramentaAtiva);
          setAssinaturaVazia(false);
        };
        imagem.src = assinaturaEdicaoRef.current;
      } else {
        aplicarFerramentaNoContexto(ctx, ferramentaAtiva);
        setAssinaturaVazia(true);
      }
    }

    const id = requestAnimationFrame(configurarCanvas);

    window.addEventListener("resize", configurarCanvas);
    window.addEventListener("orientationchange", configurarCanvas);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", configurarCanvas);
      window.removeEventListener("orientationchange", configurarCanvas);
      document.body.style.overflow = overflowAnterior;
    };
  }, [modalAssinaturaAberto, ferramentaAtiva, isMobileViewport]);

  useEffect(() => {
    if (!contextRef.current) return;
    aplicarFerramentaNoContexto(contextRef.current, ferramentaAtiva);
  }, [ferramentaAtiva]);

  const funcionarioSelecionado = useMemo(() => {
    return (
      funcionarios.find((item) => Number(item.id) === Number(funcionario)) ||
      null
    );
  }, [funcionarios, funcionario]);

  const funcionariosFiltrados = useMemo(() => {
    const termo = buscaFuncionario.toLowerCase().trim();

    if (!termo) return funcionarios;

    return funcionarios.filter((item) => {
      return (
        (item.nome || "").toLowerCase().includes(termo) ||
        String(item.matricula || "").includes(termo)
      );
    });
  }, [funcionarios, buscaFuncionario]);

  const epiSelecionadoObj = useMemo(() => {
    return epis.find((item) => Number(item.id) === Number(idEpiTemp)) || null;
  }, [epis, idEpiTemp]);

  const tamanhoSelecionadoObj = useMemo(() => {
    return (
      tamanhos.find((item) => Number(item.id) === Number(idTamanhoTemp)) || null
    );
  }, [tamanhos, idTamanhoTemp]);

  function abrirModalAssinatura() {
    setPainelFerramentasAberto(true);
    setModalAssinaturaAberto(true);
  }

  function fecharModalAssinatura() {
    setModalAssinaturaAberto(false);
  }

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
    const ctx = contextRef.current;

    if (!ponto || !ctx) return;

    event.preventDefault();

    if (event.target.setPointerCapture) {
      try {
        event.target.setPointerCapture(event.pointerId);
      } catch {
        // ignora
      }
    }

    aplicarFerramentaNoContexto(ctx, ferramentaAtiva);
    ctx.beginPath();
    ctx.moveTo(ponto.x, ponto.y);
    ctx.lineTo(ponto.x + 0.01, ponto.y + 0.01);
    ctx.stroke();

    if (ferramentaAtiva === "caneta") {
      setAssinaturaVazia(false);
    }

    setIsDrawing(true);
  }

  function draw(event) {
    if (!isDrawing || !contextRef.current) return;

    const ponto = getCoordenadas(event);
    if (!ponto) return;

    event.preventDefault();

    contextRef.current.lineTo(ponto.x, ponto.y);
    contextRef.current.stroke();
  }

  function finishDrawing(event) {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (event?.target?.releasePointerCapture) {
      try {
        event.target.releasePointerCapture(event.pointerId);
      } catch {
        // ignora
      }
    }

    ctx.closePath();
    setIsDrawing(false);

    const vaziaAgora = canvasEstaEmBranco(canvas);
    setAssinaturaVazia(vaziaAgora);

    if (vaziaAgora) {
      setAssinaturaPreview("");
      setAssinaturaEdicao("");
      assinaturaPreviewRef.current = "";
      assinaturaEdicaoRef.current = "";
      return;
    }

    const imagemEdicao = canvas.toDataURL("image/png");
    const imagemAjustada = gerarAssinaturaAjustada(canvas);

    setAssinaturaEdicao(imagemEdicao);
    setAssinaturaPreview(imagemAjustada);
    assinaturaEdicaoRef.current = imagemEdicao;
    assinaturaPreviewRef.current = imagemAjustada;
  }

  function limparAssinatura() {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    setIsDrawing(false);
    setAssinaturaPreview("");
    setAssinaturaEdicao("");
    assinaturaPreviewRef.current = "";
    assinaturaEdicaoRef.current = "";
    setAssinaturaVazia(true);

    if (!canvas || !ctx) return;

    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    preencherCanvasBranco(ctx, largura, altura);
    aplicarFerramentaNoContexto(ctx, ferramentaAtiva);
  }

  function concluirAssinatura() {
    if (!assinaturaPreview) {
      alert("Peça para o colaborador assinar antes de concluir.");
      return;
    }

    fecharModalAssinatura();
  }

  function adicionarItem() {
    if (!idEpiTemp || !idTamanhoTemp || !qtdTemp) {
      alert("Selecione o EPI, o tamanho e a quantidade.");
      return;
    }

    if (!validarQuantidade(qtdTemp)) {
      alert("Informe uma quantidade válida.");
      return;
    }

    const itemDuplicado = itensParaEntregar.some(
      (item) =>
        Number(item.idEpi) === Number(idEpiTemp) &&
        Number(item.idTamanho) === Number(idTamanhoTemp)
    );

    if (itemDuplicado) {
      alert("Esse item com esse tamanho já foi adicionado à entrega.");
      return;
    }

    const novoItem = montarItemEntrega(
      {
        idEpi: idEpiTemp,
        idTamanho: idTamanhoTemp,
        quantidade: qtdTemp,
      },
      epiSelecionadoObj,
      tamanhoSelecionadoObj
    );

    setItensParaEntregar((prev) => [...prev, novoItem]);
    setIdEpiTemp("");
    setIdTamanhoTemp("");
    setQtdTemp(1);
  }

  function removerItem(id) {
    setItensParaEntregar((prev) => prev.filter((item) => item.id !== id));
  }

async function salvarEntrega() {
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

    setCarregando(true);
    const tokenValidacao = gerarTokenValidacaoEntrega();

    // 1. Prepara o Super JSON exatamente como a struct 'EntregaParaInserir' do Go espera
    const payloadFinal = {
      id_funcionario: Number(funcionario),
      id_user: 1, // DICA: Se tiver o ID do usuário logado no sistema, use-o aqui
      data_entrega: dataEntrega, // Formato YYYY-MM-DD que o configs.DataBr do Go entende
      assinatura_digital: assinaturaPreview, // Base64 da imagem
      itens: itensParaEntregar.map((item) => ({
        id_epi: Number(item.idEpi),
        id_tamanho: Number(item.idTamanho),
        quantidade: Number(item.quantidade),
      })),
      // Se o seu Go usar o Token para algo, você pode adicionar aqui, 
      // mas as structs que você mandou não o mencionam no 'Inserir'.
    };

    try {
      // 2. Faz uma única chamada para o servidor
      const resposta = await criarEntrega(payloadFinal);

      // 3. Resolve o ID que voltou do banco para atualizar a tela sem precisar de F5
      const idGerado = resolverIdEntrega(resposta);

      const objetoParaTela = {
        id: idGerado || Date.now(),
        idFuncionario: Number(funcionario),
        nome_funcionario: funcionarioSelecionado?.nome || "",
        data_entrega: dataEntrega,
        assinatura: assinaturaPreview,
        itens: itensParaEntregar, // Para o Front-end mostrar os nomes (EPI, Tamanho)
      };

      if (onSalvar) {
        await onSalvar(objetoParaTela);
      }

      onClose();
    } catch (erro) {
      console.error("Erro ao salvar entrega:", erro);
      alert(erro?.message || "Erro ao registrar entrega no servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
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
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition text-xl font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {carregandoDados && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Carregando funcionários, EPIs e tamanhos...
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ListaFuncionarios
                buscaFuncionario={buscaFuncionario}
                setBuscaFuncionario={setBuscaFuncionario}
                funcionariosFiltrados={funcionariosFiltrados}
                funcionario={funcionario}
                setFuncionario={setFuncionario}
                funcionarioSelecionado={funcionarioSelecionado}
              />

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
                    {epis.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome}
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
                    {tamanhos.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.tamanho}
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

              <TabelaItens
                itensParaEntregar={itensParaEntregar}
                removerItem={removerItem}
              />
            </div>

            <AssinaturaPreview
              assinaturaPreview={assinaturaPreview}
              limparAssinatura={limparAssinatura}
              abrirAssinatura={abrirModalAssinatura}
            />
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvarEntrega}
              disabled={carregando}
              className="px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 shadow-md transition flex items-center gap-2 disabled:opacity-60"
            >
              <span>💾</span>
              {carregando ? "Salvando..." : "Confirmar Entrega"}
            </button>
          </div>
        </div>
      </div>

      {modalAssinaturaAberto && (
        <div className="fixed inset-0 z-[100] bg-slate-100 overflow-hidden">
          {isMobileViewport ? (
            <SignatureCanvasMobile
              canvasRef={canvasRef}
              canvasWrapperRef={canvasWrapperRef}
              startDrawing={startDrawing}
              draw={draw}
              finishDrawing={finishDrawing}
              ferramentaAtiva={ferramentaAtiva}
              setFerramentaAtiva={setFerramentaAtiva}
              limparAssinatura={limparAssinatura}
              concluirAssinatura={concluirAssinatura}
              fecharAssinatura={fecharModalAssinatura}
            />
          ) : (
            <SignatureCanvasDesktop
              canvasRef={canvasRef}
              canvasWrapperRef={canvasWrapperRef}
              startDrawing={startDrawing}
              draw={draw}
              finishDrawing={finishDrawing}
              assinaturaVazia={assinaturaVazia}
              ferramentaAtiva={ferramentaAtiva}
              setFerramentaAtiva={setFerramentaAtiva}
              limparAssinatura={limparAssinatura}
              concluirAssinatura={concluirAssinatura}
              fecharAssinatura={fecharModalAssinatura}
              painelFerramentasAberto={painelFerramentasAberto}
              setPainelFerramentasAberto={setPainelFerramentasAberto}
            />
          )}
        </div>
      )}
    </>
  );
}

export default ModalEntrega;