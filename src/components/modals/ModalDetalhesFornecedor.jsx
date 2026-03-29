function ModalDetalhesFornecedor({ aberto, fornecedor, onClose }) {
  if (!aberto || !fornecedor) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Detalhes do fornecedor</h3>
              <p className="text-sm text-slate-200 mt-1">
                Informações completas do cadastro.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 transition rounded-lg px-3 py-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
              Razão social
            </span>
            <strong className="text-slate-800">
              {fornecedor.razao_social || "-"}
            </strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
                Nome fantasia
              </span>
              <strong className="text-slate-800">
                {fornecedor.nome_fantasia || "-"}
              </strong>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
                CNPJ
              </span>
              <strong className="text-slate-800 font-mono">
                {fornecedor.cnpj || "-"}
              </strong>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold block mb-1">
                Inscrição estadual
              </span>
              <strong className="text-slate-800">
                {fornecedor.inscricao_estadual || "-"}
              </strong>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalhesFornecedor;