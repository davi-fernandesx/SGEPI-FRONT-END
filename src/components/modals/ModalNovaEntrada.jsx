import { useState } from "react";
import { criarEntrada } from "../../services/entradaService";

function ModalNovaEntrada({
  aberto,
  onClose,
  onSucesso,
  fornecedores,
  epis,
  tamanhos,
}) {
  const [form, setForm] = useState({
    idFornecedor: "",
    idEpi: "",
    idTamanho: "",
    quantidade: "",
    dataEntrada: new Date().toISOString().split("T")[0],
    dataFabricacao: "",
    dataValidade: "",
    lote: "",
    valorUnitario: "",
    notaFiscalNumero: "",
    notaFiscalSerie: "",
  });

  const [carregando, setCarregando] = useState(false);

  if (!aberto) return null;

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function limparFormulario() {
    setForm({
      idFornecedor: "",
      idEpi: "",
      idTamanho: "",
      quantidade: "",
      dataEntrada: new Date().toISOString().split("T")[0],
      dataFabricacao: "",
      dataValidade: "",
      lote: "",
      valorUnitario: "",
      notaFiscalNumero: "",
      notaFiscalSerie: "",
    });
  }

  async function salvar() {
    if (
      !form.idFornecedor ||
      !form.idEpi ||
      !form.idTamanho ||
      !form.quantidade
    ) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    setCarregando(true);

    try {
      await criarEntrada({
        idFornecedor: Number(form.idFornecedor),
        idEpi: Number(form.idEpi),
        idTamanho: Number(form.idTamanho),
        quantidade: Number(form.quantidade),
        quantidadeAtual: Number(form.quantidade),
        data_entrada: form.dataEntrada,
        data_fabricacao: form.dataFabricacao || null,
        data_validade: form.dataValidade || null,
        lote: form.lote,
        valor_unitario: Number(form.valorUnitario || 0),
        nota_fiscal_numero: form.notaFiscalNumero,
        nota_fiscal_serie: form.notaFiscalSerie,
      });

      limparFormulario();

      if (onSucesso) {
        onSucesso();
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar entrada.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in flex flex-col max-h-[95vh]">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Nova Entrada</h2>
              <p className="text-emerald-100 text-xs">
                Preencha os dados da entrada de estoque
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-emerald-700 rounded-full p-2 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
              Dados principais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fornecedor <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.idFornecedor}
                  onChange={(e) => atualizar("idFornecedor", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                >
                  <option value="">Selecione o fornecedor</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome_fantasia || f.razao_social}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data da Entrada
                </label>
                <input
                  type="date"
                  value={form.dataEntrada}
                  onChange={(e) => atualizar("dataEntrada", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex.: 10"
                  value={form.quantidade}
                  onChange={(e) => atualizar("quantidade", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  EPI <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.idEpi}
                  onChange={(e) => atualizar("idEpi", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                >
                  <option value="">Selecione o EPI</option>
                  {epis.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tamanho <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.idTamanho}
                  onChange={(e) => atualizar("idTamanho", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                >
                  <option value="">Selecione o tamanho</option>
                  {tamanhos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tamanho}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Valor Unitário
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.valorUnitario}
                  onChange={(e) => atualizar("valorUnitario", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">
              Informações complementares
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lote
                </label>
                <input
                  type="text"
                  placeholder="Ex.: LT-2026-01"
                  value={form.lote}
                  onChange={(e) => atualizar("lote", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de Fabricação
                </label>
                <input
                  type="date"
                  value={form.dataFabricacao}
                  onChange={(e) => atualizar("dataFabricacao", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de Validade
                </label>
                <input
                  type="date"
                  value={form.dataValidade}
                  onChange={(e) => atualizar("dataValidade", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número da Nota Fiscal
                </label>
                <input
                  type="text"
                  placeholder="Ex.: 12345"
                  value={form.notaFiscalNumero}
                  onChange={(e) => atualizar("notaFiscalNumero", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Série da Nota Fiscal
                </label>
                <input
                  type="text"
                  placeholder="Ex.: 1"
                  value={form.notaFiscalSerie}
                  onChange={(e) => atualizar("notaFiscalSerie", e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <div className="text-xs text-slate-400">
            * Preencha os campos obrigatórios para salvar a entrada
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvar}
              disabled={carregando}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition disabled:opacity-60"
            >
              {carregando ? "Salvando..." : "Salvar Entrada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalNovaEntrada;