import { api } from "./api";

function extrairLista(resp) {
  const dados = resp?.data ?? resp;

  if (Array.isArray(dados)) return dados;

  // Fiz o mapeamento EXATO baseado no seu log do console
  const listaExtraida = 
    dados?.entregas ??    // Entregas veio minúsculo
    dados?.funcionario ?? // Funcionários veio como 'funcionario' (singular)
    dados?.Epis ??        // Epis veio com E maiúsculo
    dados?.tamanhos ??    // Tamanhos veio minúsculo
    null;

  return Array.isArray(listaExtraida) ? listaExtraida : [];
}

async function buscarPrimeiraLista(rotas) {
  for (const rota of rotas) {
    try {
      const resp = await api.get(rota);
      
      // LOG DE DEBUG: Vamos ver o que está chegando aqui
      console.log(`Resposta da rota ${rota}:`, resp?.data ?? resp);

      const lista = extrairLista(resp);

      // Só retorna se a lista realmente tiver algo ou se for a última tentativa
      if (lista.length > 0) return lista;
      
    } catch (erro) {
      console.error(`Erro na rota ${rota}:`, erro);
      continue;
    }
  }
  // Se percorreu tudo e voltou vazio, retorna array vazio em vez de erro 
  // para a tela não travar, apenas mostrar "Nenhum registro"
  return [];
}

export async function listarEntregas() {
  return buscarPrimeiraLista(["/entregas"]);
}

export async function listarFuncionariosEntrega() {
  return buscarPrimeiraLista(["/funcionarios"]);
}

export async function listarEpisEntrega() {
  return buscarPrimeiraLista(["/epis"]);
}

export async function listarTamanhosEntrega() {
  return buscarPrimeiraLista(["/tamanhos"]);
}

export async function criarEntrega(payload) {
  const rotas = ["/cadastro-entregas"];
  let ultimoErro = null;

  for (const rota of rotas) {
    try {
      const resposta = await api.post(rota, payload);
      return resposta?.data ?? resposta;
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  throw ultimoErro || new Error("Não foi possível registrar a entrega.");
}