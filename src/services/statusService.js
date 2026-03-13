import { api } from "./api";

export async function criarStatus(nome) {
  return await api.post("/status", { nome });
}