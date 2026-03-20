function DashboardCard({ card, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${card.ring}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <span className="inline-flex text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-2">
            {card.badge}
          </span>

          <h3 className="text-gray-600 text-sm md:text-sm font-bold uppercase leading-tight">
            {card.titulo}
          </h3>
        </div>

        <span
          className={`shrink-0 p-2.5 rounded-xl text-base md:text-lg ${card.iconeBox}`}
        >
          {card.icone}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight break-words">
          {card.valor}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          {card.descricao}
        </p>

        <span className="text-blue-600 font-bold text-xs md:text-sm opacity-80 group-hover:translate-x-1 transition">
          Abrir →
        </span>
      </div>
    </button>
  );
}

export default DashboardCard;