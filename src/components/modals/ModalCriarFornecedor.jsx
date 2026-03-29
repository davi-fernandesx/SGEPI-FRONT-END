import { useState } from "react";
import { criarFornecedor } from "../../services/fornecedorService";

function ModalCriarFornecedor({ aberto, onClose, onSucesso }) {
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [inscricaoEstadual, setInscricaoEstadual] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  if (!aberto) return null;

  const limparFormulario = () => {
    setRazaoSocial("");
    setNomeFantasia("");
    setCnpj("");
    setInscricaoEstadual("");
    setErro("");
  };

  const handleClose = () => {
    if (!salvando) {
      limparFormulario();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!razaoSocial.trim()) {
      setErro("A Razão Social é obrigatória.");
      return;
    }

    try {
      setSalvando(true);

      await criarFornecedor({
        razao_social: razaoSocial.trim(),
        nome_fantasia: nomeFantasia.trim(),
        cnpj: cnpj.trim(),
        inscricao_estadual: inscricaoEstadual.trim(),
      });

      limparFormulario();
      onSucesso();
      onClose();
    } catch (err) {
      console.error("❌ ERRO AO SALVAR FORNECEDOR:", err);
      console.log("Detalhes extras do erro:", err?.message);
      setErro(err?.message || "Erro ao salvar o fornecedor.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Novo Fornecedor</h3>
            <p className="text-sm text-indigo-100 mt-1">
              Cadastre um novo fornecedor no sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="bg-white/10 hover:bg-white/20 transition rounded-lg px-3 py-2 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
              ⚠️ {erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Razão Social *
            </label>
            <input
              type="text"
              required
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: Empresa Silva LTDA"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Nome Fantasia
            </label>
            <input
              type="text"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: Mercadinho Silva"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Insc. Estadual
              </label>
              <input
                type="text"
                value={inscricaoEstadual}
                onChange={(e) => setInscricaoEstadual(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="000.000.000.000"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 gap-2 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className={`px-4 py-2 rounded-xl text-white font-bold transition ${
                salvando
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {salvando ? "Salvando..." : "Salvar Fornecedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCriarFornecedor;