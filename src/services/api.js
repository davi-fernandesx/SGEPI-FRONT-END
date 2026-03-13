const BASE_URL = "http://localhost:8080/api";

async function tratarResposta(resposta, rota, mensagemErroPadrao) {
  const contentType = resposta.headers.get("content-type");
  let dados;

  if (contentType && contentType.includes("application/json")) {
    dados = await resposta.json();
  } else {
    dados = await resposta.text();
  }

  if (!resposta.ok) {
    throw new Error(
      typeof dados === "string" && dados
        ? dados
        : `${mensagemErroPadrao} ${rota}`
    );
  }

  return dados;
}

export const api = {
  get: async (rota) => {
    const resposta = await fetch(`${BASE_URL}${rota}`);
    return await tratarResposta(
      resposta,
      rota,
      "Erro ao buscar dados de"
    );
  },

  post: async (rota, dados) => {
    const resposta = await fetch(`${BASE_URL}${rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    return await tratarResposta(
      resposta,
      rota,
      "Erro ao salvar dados em"
    );
  },

  put: async (rota, dados) => {
    const resposta = await fetch(`${BASE_URL}${rota}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    return await tratarResposta(
      resposta,
      rota,
      "Erro ao atualizar dados em"
    );
  },

  delete: async (rota) => {
    const resposta = await fetch(`${BASE_URL}${rota}`, {
      method: "DELETE",
    });

    return await tratarResposta(
      resposta,
      rota,
      "Erro ao excluir dados em"
    );
  },
};