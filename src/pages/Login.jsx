import { useState } from "react";
import { api } from "../services/api";

function extrairToken(dados) {
  return (
    dados?.token ??
    dados?.access_token ??
    dados?.accessToken ??
    dados?.jwt ??
    dados?.data?.token ??
    dados?.data?.access_token ??
    dados?.data?.accessToken ??
    ""
  );
}

function extrairUsuario(dados, fallbackEmail = "") {
  const usuario =
    dados?.usuario ??
    dados?.user ??
    dados?.usuarioLogado ??
    dados?.data?.usuario ??
    dados?.data?.user ??
    null;

  if (usuario && typeof usuario === "object") {
    return {
      id: usuario?.id ?? usuario?.ID ?? 0,
      nome: usuario?.nome ?? usuario?.name ?? "Usuário",
      email: usuario?.email ?? fallbackEmail,
      perfil:
        usuario?.perfil ??
        usuario?.role ??
        usuario?.tipo ??
        usuario?.cargo ??
        "colaborador",
    };
  }

  return {
    id: 0,
    nome: "Usuário",
    email: fallbackEmail,
    perfil: "colaborador",
  };
}

async function fazerLoginNasRotas(payload) {
  const rotas = ["/login", "/auth/login"];

  let ultimoErro = null;

  for (const rota of rotas) {
    try {
      const resposta = await api.post(rota, payload);
      return resposta;
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  throw ultimoErro || new Error("Não foi possível realizar login.");
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    const emailLimpo = email.trim();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fazerLoginNasRotas({
        email: emailLimpo,
        senha: senhaLimpa,
      });

      const token = extrairToken(resposta);
      const usuario = extrairUsuario(resposta, emailLimpo);

      if (!token) {
        throw new Error("Token não recebido no login.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      if (onLogin) {
        onLogin({
          token,
          usuario,
        });
      }
    } catch (err) {
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
              E-mail
            </label>
            <input
              type="email"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition"
              placeholder="seuemail@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
