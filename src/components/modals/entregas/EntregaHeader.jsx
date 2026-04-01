function EntregaHeader({ onClose }) {
  return (
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
  );
}

export default EntregaHeader;