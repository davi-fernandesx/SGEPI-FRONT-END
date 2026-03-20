function QuickActionCard({
  titulo,
  descricao,
  icone,
  onClick,
  className = "",
  fullWidth = false,
  descricaoClassName = "",
  iconBoxClassName = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${fullWidth ? "sm:col-span-2 lg:col-span-3" : ""} group flex items-center justify-between p-4 md:p-5 rounded-xl transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col items-start text-left">
        <span className="font-bold text-base md:text-lg">{titulo}</span>
        <span className={`text-xs transition ${descricaoClassName}`}>
          {descricao}
        </span>
      </div>

      <div className={`p-2 md:p-3 rounded-lg transition ${iconBoxClassName}`}>
        <span className="text-xl md:text-2xl">{icone}</span>
      </div>
    </button>
  );
}

export default QuickActionCard;