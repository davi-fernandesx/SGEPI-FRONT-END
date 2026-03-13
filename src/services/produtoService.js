import { api } from "./api";

export async function criarProduto(produto) {
  return await api.post("/produto", {
    nome: produto.nome,
    descricao: produto.descricao,
    preco: Number(produto.preco),
    lote: produto.lote,
    quantidade: Number(produto.quantidade),
    validade: new Date(produto.validade).toISOString(),
    status: Number(produto.status),
    categoria: Number(produto.categoria),
    dataChegada: new Date(produto.dataChegada).toISOString(),
  });
}