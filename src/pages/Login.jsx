import { useState } from "react";
// 1. Importe a sua configuração da API (Ajuste o caminho conforme seu projeto)
import { api } from "../services/api"; 

function Login({ onLogin }) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    const loginLimpo = login.trim();
    const senhaLimpa = senha.trim();

    if (!loginLimpo || !senhaLimpa) {
      setErro("Preencha login e senha.");
      return;
    }

    try {
      setCarregando(true);

      // 2. Faz a requisição real para a sua API em /login
      // Verifique se o seu back-end espera a chave "email" ou "login"
      const resposta = await api.post("/login", {
        email: loginLimpo, 
        senha: senhaLimpa, 
      });

      // 3. Extrai o token e os dados do usuário da resposta do seu back-end
      // (Ajuste "resposta.token" e "resposta.usuario" conforme o formato que seu back-end devolve)
      const token = resposta.token;
      const usuario = resposta.usuario; 

      if (!token) {
        throw new Error("Token de acesso não retornado pelo servidor.");
      }

      // 4. Salva no localStorage real
      localStorage.setItem("token", token);
      if (usuario) {
        localStorage.setItem("usuario", JSON.stringify(usuario));
      }

      // 5. Continua o fluxo normal do seu app
      if (onLogin) {
        onLogin({
          token,
          usuario,
        });
      }
    } catch (err) {
      // O tratamento de erro já vai pegar a mensagem correta que vem da função da API
      setErro(err?.message || "Erro ao realizar login.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-500 p-4 bg-slate-900">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-[380px] animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-500"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            SGEPI
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
            Login de Acesso
          </p>
        </div>

        {erro && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2 font-medium">
            ⚠️ {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Login
            </label>
            <input
              type="text"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition"
              placeholder="Digite seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition text-center text-xl tracking-widest"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition transform hover:-translate-y-0.5 ${
              carregando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-10 text-center border-t pt-4">
          <p className="text-[10px] text-gray-300 font-bold uppercase">
            SGEPI - Gestão de Estoque © 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;