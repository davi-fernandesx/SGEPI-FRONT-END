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

export default ToolbarMobile;