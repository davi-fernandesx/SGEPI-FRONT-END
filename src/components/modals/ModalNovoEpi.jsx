import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";

const tamanhosPadrao = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "Único",
];

const mockTiposProtecao = [
  { id: 1, nome: "Proteção da Cabeça" },
  { id: 2, nome: "Proteção Auditiva" },
  { id: 3, nome: "Proteção Respiratória" },
  { id: 4, nome: "Proteção Visual" },
  { id: 5, nome: "Proteção de Mãos" },
  { id: 6, nome: "Proteção de Pés" },
  { id: 7, nome: "Proteção contra Quedas" },
];

function extrairLista(resp, fallback = []) {
  const dados = resp?.data ?? resp ?? fallback;
  return Array.isArray(dados) ? dados : fallback;
}

async function buscarPrimeiraLista(rotas, fallback = []) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      const lista = extrairLista(resp, fallback);
      if (Array.isArray(lista)) return lista;
    } catch (erro) {
      // tenta a próxima rota
    }
  }
  return fallback;
}

function normalizarTipoProtecao(item) {
  return {
    id: Number(item?.id ?? item?.ID ?? 0),
    nome: item?.nome ?? item?.Nome ?? item?.descricao ?? "",
  };
}

function ModalNovoEpi({ onClose, onSalvar }) {
  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [tiposProtecao, setTiposProtecao] = useState([]);

  const [form, setForm] = useState({
    nome: "",
    idTipoProtecao: "",
    fabricante: "",
    CA: "",
    alerta_minimo: "",
    descricao: "",
    validade_CA: "",
    tamanhos: [],
  });

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregandoTipos(true);
      setErroCarregamento("");

      try {
        const listaTipos = await buscarPrimeiraLista(
          ["/tipo-protecao", "/tipos-protecao", "/tipos_protecao"],
          mockTiposProtecao
        );

        if (!ativo) return;

        setTiposProtecao(listaTipos.map(normalizarTipoProtecao));
      } catch (erro) {
        if (!ativo) return;

        setTiposProtecao(mockTiposProtecao.map(normalizarTipoProtecao));
        setErroCarregamento(
          "Não foi possível carregar os tipos de proteção do servidor. Usando lista local."
        );
      } finally {
        if (ativo) {
          setCarregandoTipos(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const tamanhosSelecionadosTexto = useMemo(() => {
    if (!form.tamanhos.length) return "Nenhum tamanho selecionado";
    return form.tamanhos.join(", ");
  }, [form.tamanhos]);

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function alternarTamanho(tamanho) {
    setForm((prev) => {
      const jaSelecionado = prev.tamanhos.includes(tamanho);

      return {
        ...prev,
        tamanhos: jaSelecionado
          ? prev.tamanhos.filter((item) => item !== tamanho)
          : [...prev.tamanhos, tamanho],
      };
    });
  }

  function limparTamanhos() {
    setForm((prev) => ({
      ...prev,
      tamanhos: [],
    }));
  }

  function limparFormulario() {
    setForm({
      nome: "",
      idTipoProtecao: "",
      fabricante: "",
      CA: "",
      alerta_minimo: "",
      descricao: "",
      validade_CA: "",
      tamanhos: [],
    });
  }

  async function salvarEpi() {
    const nome = form.nome.trim();
    const fabricante = form.fabricante.trim();
    const CA = form.CA.trim();
    const descricao = form.descricao.trim();

    if (!nome) {
      alert("Preencha o nome do EPI.");
      return;
    }

    if (!form.idTipoProtecao) {
      alert("Selecione o tipo de proteção.");
      return;
    }

    if (Number(form.alerta_minimo || 0) < 0) {
      alert("O alerta mínimo não pode ser negativo.");
      return;
    }

    const tamanhosUnicos = [...new Set(form.tamanhos.map((t) => String(t).trim()).filter(Boolean))];

    const payload = {
      nome,
      fabricante,
      CA,
      descricao,
      validade_CA: form.validade_CA || null,
      idTipoProtecao: Number(form.idTipoProtecao),
      alerta_minimo: Number(form.alerta_minimo || 0),
      tamanhos: tamanhosUnicos,
      tamanhos_disponiveis: tamanhosUnicos,
    };

    setSalvando(true);

    try {
      let resposta = null;

      try {
        resposta = await api.post("/epi", payload);
      } catch (erro1) {
        try {
          resposta = await api.post("/epis", payload);
        } catch (erro2) {
          resposta = await api.post("/produtos", payload);
        }
      }

      const epiSalvo = {
        id: Number(resposta?.id ?? Date.now()),
        ...payload,
      };

      if (onSalvar) {
        await onSalvar(epiSalvo);
      } else {
        limparFormulario();
        onClose?.();
      }
    } catch (erro) {
      alert(erro.message || "Erro ao cadastrar EPI.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[95vh] flex flex-col">
        <div className="px-6 py-5 border-b bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 text-2xl">
              +
            </div>

            <div>
              <h3 className="text-[18px] md:text-[20px] font-bold text-slate-800">
                Cadastrar Novo EPI
              </h3>
              <p className="text-sm text-slate-500">
                Cadastro base conforme a tabela epi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-4xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {erroCarregamento && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {erroCarregamento}
            </div>
          )}

          <div className="space-y-10">
            <section>
              <h4 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase mb-5">
                Identificação do EPI
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[15px] font-semibold text-slate-700 mb-2">
                    Nome do EPI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => atualizarCampo("nome", e.target.value)}
                    placeholder="Ex: Bota de Segurança"
                    className="w-full h-14 px-4 border border-slate-300 rounded-xl text-lg text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-slate-700 mb-2">
                    Tipo de Proteção <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.idTipoProtecao}
                    onChange={(e) => atualizarCampo("idTipoProtecao", e.target.value)}
                    disabled={carregandoTipos}
                    className="w-full h-14 px-4 border border-slate-300 rounded-xl text-lg text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  >
                    <option value="">
                      {carregandoTipos ? "Carregando..." : "Selecione..."}
                    </option>
                    {tiposProtecao.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-slate-700 mb-2">
                    Fabricante
                  </label>
                  <input
                    type="text"
                    value={form.fabricante}
                    onChange={(e) => atualizarCampo("fabricante", e.target.value)}
                    placeholder="Ex: Bracol"
                    className="w-full h-14 px-4 border border-slate-300 rounded-xl text-lg text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-slate-700 mb-2">
                    CA
                  </label>
                  <input
                    type="text"
                    value={form.CA}
                    onChange={(e) => atualizarCampo("CA", e.target.value)}
                    placeholder="Ex: 15432"
                    className="w-full h-14 px-4 border border-slate-300 rounded-xl text-lg text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-slate-700 mb-2">
                    Alerta mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.alerta_minimo}
                    onChange={(e) => atualizarCampo("alerta_minimo", e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full h-14 px-4 border border-slate-300 rounded-xl text-lg text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[15px] font-semibold text-slate-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => atualizarCampo("descricao", e.target.value)}
                    placeholder="Descreva o EPI, finalidade ou observações importantes..."
                    className="w-full min-h-[120px] p-4 border border-slate-300 rounded-xl text-lg text-slate-700 placeholder:text-slate-400 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <label className="block text-[15px] font-semibold text-slate-700">
                      Tamanho ou tamanhos do EPI
                    </label>

                    <button
                      type="button"
                      onClick={limparTamanhos}
                      className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition"
                    >
                      Limpar seleção
                    </button>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-4 bg-slate-50">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {tamanhosPadrao.map((tamanho) => {
                        const ativo = form.tamanhos.includes(tamanho);

                        return (
                          <button
                            key={tamanho}
                            type="button"
                            onClick={() => alternarTamanho(tamanho)}
                            className={`h-11 rounded-xl border text-sm font-bold transition ${
                              ativo
                                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-600"
                            }`}
                          >
                            {tamanho}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400 block mb-1">
                        Selecionados
                      </span>
                      <p className="text-sm text-slate-700">
                        {tamanhosSelecionadosTexto}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase mb-5">
                Controle do Certificado
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[15px] font-semibold text-slate-700 mb-2">
                    Validade do CA
                  </label>
                  <input
                    type="date"
                    value={form.validade_CA}
                    onChange={(e) => atualizarCampo("validade_CA", e.target.value)}
                    className="w-full h-14 px-4 border border-slate-300 rounded-xl text-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-white flex justify-end items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-3 text-slate-700 text-sm md:text-base font-semibold hover:text-slate-900 transition disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvarEpi}
            disabled={salvando || carregandoTipos}
            className="min-w-[190px] h-12 px-6 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition shadow-md disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "💾 Salvar EPI"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNovoEpi;
