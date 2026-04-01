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

export default ToolbarDesktop;