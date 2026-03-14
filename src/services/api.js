const DEFAULT_BASE_URL = "http://empresa.lvh.me:8080/api";

export const BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_BASE_URL).replace(
  /\/+$/,
  ""
);

function normalizarRota(rota = "") {
  if (!rota) return "";
  return rota.startsWith("/") ? rota : `/${rota}`;
}

function getToken() {
  return localStorage.getItem("token");
}

function isFormData(valor) {
  return typeof FormData !== "undefined" && valor instanceof FormData;
}

function montarHeaders(headersExtras = {}, body = null) {
  const token = getToken();
  const headers = { ...headersExtras };

  if (!isFormData(body) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function extrairMensagemErro(dados, fallback) {
  if (!dados) return fallback;

  if (typeof dados === "string") {
    return dados || fallback;
  }

  if (typeof dados === "object") {
    return (
      dados.error ||
      dados.erro ||
      dados.message ||
      dados.mensagem ||
      dados.detail ||
      dados.details ||
      fallback
    );
  }

  return fallback;
}

async function lerCorpoResposta(resposta) {
  if (resposta.status === 204) {
    return null;
  }

  const contentType = resposta.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await resposta.json();
    } catch {
      return null;
    }
  }

  try {
    return await resposta.text();
  } catch {
    return null;
  }
}

async function tratarResposta(resposta, rota, mensagemErroPadrao) {
  const dados = await lerCorpoResposta(resposta);

  if (!resposta.ok) {
    const fallback = `${mensagemErroPadrao} ${rota}`;
    throw new Error(extrairMensagemErro(dados, fallback));
  }

  return dados;
}

async function request(method, rota, dados = null, headersExtras = {}) {
  const rotaNormalizada = normalizarRota(rota);
  const url = `${BASE_URL}${rotaNormalizada}`;

  const opcoes = {
    method,
    headers: montarHeaders(headersExtras, dados),
  };

  if (dados !== null && dados !== undefined) {
    opcoes.body = isFormData(dados) ? dados : JSON.stringify(dados);
  }

  const resposta = await fetch(url, opcoes);

  return await tratarResposta(
    resposta,
    rotaNormalizada,
    `Erro ao processar a requisição em`
  );
}

export const api = {
  get: async (rota, headersExtras = {}) => {
    return await request("GET", rota, null, headersExtras);
  },

  post: async (rota, dados, headersExtras = {}) => {
    return await request("POST", rota, dados, headersExtras);
  },

  put: async (rota, dados, headersExtras = {}) => {
    return await request("PUT", rota, dados, headersExtras);
  },

  patch: async (rota, dados, headersExtras = {}) => {
    return await request("PATCH", rota, dados, headersExtras);
  },

  delete: async (rota, headersExtras = {}) => {
    return await request("DELETE", rota, null, headersExtras);
  },
};

export { getToken };
