import { useState } from "react";

// Importando Componentes
import Login from "./pages/Login";
import Header from "./components/Header";

// Importando Páginas
import Dashboard from "./pages/Dashboard";
import Estoque from "./pages/Estoque";
import Funcionarios from "./pages/Funcionários"; 
import Entradas from "./pages/Entradas";
import Entregas from "./pages/Entregas";
import Devolucoes from "./pages/Devoluções";

function App() {
  const [logado, setLogado] = useState(false);
  const [pagina, setPagina] = useState("Dashboard");

  // Se não estiver logado, exibe apenas o Login
  if (!logado) {
    return <Login onLogin={() => setLogado(true)} />;
  }

  function renderizarPagina() {
    switch (pagina) {
      case "Dashboard":
        return <Dashboard />;
      case "Estoque":
        return <Estoque />;
      case "Funcionários":
        return <Funcionarios />;
      case "Entradas":
        return <Entradas />;
      case "Entregas":
        return <Entregas />;
      case "Devoluções":
        return <Devolucoes />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header 
        paginaAtual={pagina} 
        setPagina={setPagina} 
        onLogout={() => setLogado(false)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
        {renderizarPagina()}
      </main>
    </div>
  );
}

export default App;