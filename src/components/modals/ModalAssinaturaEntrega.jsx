import { useEffect, useRef, useState } from "react";
import {
  aplicarFerramentaNoContexto,
  canvasEstaEmBranco,
  gerarAssinaturaAjustada,
  preencherCanvasBranco,
} from "../../utils/assinaturaCanvas";

function ModalAssinaturaEntrega({
  aberto,
  assinaturaPreview,
  assinaturaEdicao,
  onClose,
  onConcluir,
  onLimpar,
  setAssinaturaPreview,
  setAssinaturaEdicao,
}) {
  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const contextRef = useRef(null);
  const assinaturaPreviewRef = useRef(assinaturaPreview);
  const assinaturaEdicaoRef = useRef(assinaturaEdicao);

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
    if (!aberto) return;

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
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;

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
  }, [aberto, ferramentaAtiva, isMobileViewport]);

  useEffect(() => {
    if (!contextRef.current) return;
    aplicarFerramentaNoContexto(contextRef.current, ferramentaAtiva);
  }, [ferramentaAtiva]);

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
      } catch {}
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
      } catch {}
    }

    ctx.closePath();
    setIsDrawing(false);

    const vaziaAgora = canvasEstaEmBranco(canvas);
    setAssinaturaVazia(vaziaAgora);

    if (vaziaAgora) {
      setAssinaturaPreview("");
      setAssinaturaEdicao("");
    } else {
      const imagemEdicao = canvas.toDataURL("image/png");
      const imagemAjustada = gerarAssinaturaAjustada(canvas);

      setAssinaturaEdicao(imagemEdicao);
      setAssinaturaPreview(imagemAjustada);
    }
  }

  function limparAssinaturaInterna() {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    setIsDrawing(false);
    setAssinaturaPreview("");
    setAssinaturaEdicao("");
    setAssinaturaVazia(true);
    onLimpar?.();

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

    onConcluir();
  }

  function renderBotoesSidebarMobile() {
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
            onClick={limparAssinaturaInterna}
            className="w-[64px] h-[42px] rounded-xl border border-red-200 bg-white text-red-600 text-[10px] font-bold hover:bg-red-50 transition rotate-90 flex items-center justify-center"
          >
            Limpar
          </button>
        </div>

        <div className="flex flex-col items-center gap-6 pb-4">
          <button
            type="button"
            onClick={onClose}
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

  function renderFerramentasDesktop() {
    return painelFerramentasAberto ? (
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
              onClick={limparAssinaturaInterna}
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
              onClick={onClose}
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
    ) : (
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

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 overflow-hidden">
      {isMobileViewport ? (
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

          {renderBotoesSidebarMobile()}
        </div>
      ) : (
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

          {renderFerramentasDesktop()}
        </div>
      )}
    </div>
  );
}

export default ModalAssinaturaEntrega;