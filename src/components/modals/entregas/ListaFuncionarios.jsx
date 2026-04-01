function ListaFuncionarios({
  buscaFuncionario,
  setBuscaFuncionario,
  funcionariosFiltrados,
  funcionario,
  setFuncionario,
  funcionarioSelecionado,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-slate-700">
        Colaborador
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          🔍
        </span>

        <input
          type="text"
          placeholder="Buscar nome ou matrícula..."
          className="w-full pl-9 p-2.5 border border-slate-300 rounded-t-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm bg-slate-50"
          value={buscaFuncionario}
          onChange={(e) => setBuscaFuncionario(e.target.value)}
        />
      </div>

      <div className="w-full border border-slate-300 rounded-b-lg -mt-2 bg-white max-h-40 overflow-y-auto border-t-0">
        {funcionariosFiltrados.length === 0 ? (
          <div className="p-3 text-sm text-gray-400 text-center italic">
            Nenhum colaborador encontrado
          </div>
        ) : (
          funcionariosFiltrados.map((item) => {
            const isSelected = Number(funcionario) === Number(item.id);

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setFuncionario(item.id)}
                className={`w-full text-left p-2.5 border-b border-gray-50 last:border-0 transition-colors ${
                  isSelected
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "text-slate-600 hover:bg-blue-50"
                }`}
              >
                <span className="font-mono text-xs text-slate-400 mr-2">
                  [{item.matricula}]
                </span>
                {item.nome}
              </button>
            );
          })
        )}
      </div>

      {funcionarioSelecionado && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Selecionado: <b>{funcionarioSelecionado.nome}</b> — Mat.{" "}
          {funcionarioSelecionado.matricula}
        </div>
      )}
    </div>
  );
}

export default ListaFuncionarios;