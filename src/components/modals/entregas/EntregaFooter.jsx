function EntregaFooter({ onClose, onSalvar, carregando }) {
  return (
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
        onClick={onSalvar}
        disabled={carregando}
        className="px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 shadow-md transition flex items-center gap-2 disabled:opacity-60"
      >
        <span>💾</span>
        {carregando ? "Salvando..." : "Confirmar Entrega"}
      </button>
    </div>
  );
}

export default EntregaFooter;