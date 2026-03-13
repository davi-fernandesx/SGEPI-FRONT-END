import { api } from "./api";

export async function criarCategoria(nome) {
  return await api.post("/categoria", { nome });
}