import ToolbarDesktop from "./ToolbarDesktop";
import ToolbarMobile from "./ToolbarMobile";

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

function ModalAssinatura({
  aberto,
  isMobileViewport,
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
  if (!aberto) return null;

  return (
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
          fecharAssinatura={fecharAssinatura}
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
          fecharAssinatura={fecharAssinatura}
          painelFerramentasAberto={painelFerramentasAberto}
          setPainelFerramentasAberto={setPainelFerramentasAberto}
        />
      )}
    </div>
  );
}

export default ModalAssinatura;