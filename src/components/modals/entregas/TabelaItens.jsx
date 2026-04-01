function TabelaItens({ itensParaEntregar, removerItem }) {
  if (itensParaEntregar.length === 0) {
    return (
      <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400 text-sm">
        Nenhum item adicionado.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-semibold">
          <tr>
            <th className="p-3 pl-4">Item</th>
            <th className="p-3 text-center">Tam.</th>
            <th className="p-3 text-center">Qtd.</th>
            <th className="p-3 text-right pr-4">Ação</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {itensParaEntregar.map((item) => (
            <tr key={item.id}>
              <td className="p-3 pl-4 text-slate-700">{item.epiNome}</td>
              <td className="p-3 text-center text-slate-500">
                {item.tamanhoNome}
              </td>
              <td className="p-3 text-center font-bold text-slate-800">
                {item.quantidade}
              </td>
              <td className="p-3 text-right pr-4">
                <button
                  type="button"
                  onClick={() => removerItem(item.id)}
                  className="text-red-500 hover:text-red-700 font-bold text-xs"
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaItens;