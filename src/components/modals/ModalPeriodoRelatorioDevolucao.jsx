import {
  obterDataMenosDiasISO,
  obterHojeISO,
  obterPrimeiroDiaAnoISO,
  obterPrimeiroDiaMesISO,
  obterTextoPeriodo,
} from "../../utils/devolucoes";

export default function ModalPeriodoRelatorioDevolucao({
  aberto,
  tipo,
  funcionario,
  inicio,
  fim,
  erro,
  resumo,
  onClose,
  onChangeInicio,
  onChangeFim,
  onConfirmar,
  onLimpar,
  onAplicarAtalho,
}) {
  if (!aberto) return null;

  const titulo =
    tipo === "funcionario"
      ? "Selecionar período do funcionário"
      : "Selecionar período geral";

  const subtitulo =
    tipo === "funcionario"
      ? `Escolha o intervalo de devoluções para ${funcionario?.nome || "o funcionário"}`
      : "Escolha o intervalo para imprimir o relatório geral de devoluções";

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-rose-700 text-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{titulo}</h3>
              <p className="text-sm text-red-100 mt-1">{subtitulo}</p>

              {tipo === "funcionario" && funcionario && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold">{funcionario.nome}</span>
                  <span className="text-xs text-red-100">
                    Matrícula: {funcionario.matricula || "--"}
                  </span>
                </div>
              )}
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

        <div className="p-6">
          <div className="mb-5">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500 block mb-3">
              Atalhos rápidos
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAplicarAtalho({ inicio: "", fim: "" })}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Todo o período
              </button>

              <button
                type="button"
                onClick={() =>
                  onAplicarAtalho({
                    inicio: obterPrimeiroDiaMesISO(),
                    fim: obterHojeISO(),
                  })
                }
                className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition"
              >
                Mês atual
              </button>

              <button
                type="button"
                onClick={() =>
                  onAplicarAtalho({
                    inicio: obterDataMenosDiasISO(30),
                    fim: obterHojeISO(),
                  })
                }
                className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition"
              >
                Últimos 30 dias
              </button>

              <button
                type="button"
                onClick={() =>
                  onAplicarAtalho({
                    inicio: obterPrimeiroDiaAnoISO(),
                    fim: obterHojeISO(),
                  })
                }
                className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition"
              >
                Ano atual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">
                Data inicial
              </label>
              <input
                type="date"
                value={inicio}
                onChange={(e) => onChangeInicio(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">
                Data final
              </label>
              <input
                type="date"
                value={fim}
                onChange={(e) => onChangeFim(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
          </div>

          {erro ? (
            <div className="mt-4 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
              {erro}
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Período selecionado
              </span>
              <strong className="text-sm text-gray-800">
                {obterTextoPeriodo(inicio, fim)}
              </strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Devoluções encontradas
              </span>
              <strong className="text-2xl text-red-700">
                {resumo.totalDevolucoes}
              </strong>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 font-bold block mb-1">
                Trocas no período
              </span>
              <strong className="text-2xl text-emerald-700">
                {resumo.totalTrocas}
              </strong>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
            <button
              type="button"
              onClick={onLimpar}
              className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
            >
              Limpar datas
            </button>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onConfirmar}
                className="px-5 py-3 rounded-xl bg-red-700 text-white font-bold hover:bg-red-800 transition shadow-sm"
              >
                🖨️ Gerar relatório
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}