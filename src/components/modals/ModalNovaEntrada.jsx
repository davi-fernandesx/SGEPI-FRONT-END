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

      onSucesso();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar entrada.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 space-y-4">
        <h2 className="font-bold text-lg">Nova Entrada</h2>

        <select
          value={form.idEpi}
          onChange={(e) => atualizar("idEpi", e.target.value)}
        >
          <option value="">Selecione EPI</option>
          {epis.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>

        <select
          value={form.idFornecedor}
          onChange={(e) => atualizar("idFornecedor", e.target.value)}
        >
          <option value="">Fornecedor</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome_fantasia || f.razao_social}
            </option>
          ))}
        </select>

        <select
          value={form.idTamanho}
          onChange={(e) => atualizar("idTamanho", e.target.value)}
        >
          <option value="">Tamanho</option>
          {tamanhos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.tamanho}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={(e) => atualizar("quantidade", e.target.value)}
        />

        <input
          type="number"
          placeholder="Valor unitário"
          value={form.valorUnitario}
          onChange={(e) => atualizar("valorUnitario", e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={salvar} disabled={carregando}>
            {carregando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNovaEntrada;