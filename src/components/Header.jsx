import React, { useEffect, useMemo, useRef, useState } from "react";

function Header({ paginaAtual, setPagina, onLogout, usuario }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuMaisAberto, setMenuMaisAberto] = useState(false);
  const menuMaisRef = useRef(null);

  const perfilUsuario = useMemo(() => {
    return usuario?.perfil || usuario?.role || "colaborador";
  }, [usuario]);

  const isAdmin = perfilUsuario === "admin";

  useEffect(() => {
    function handleClickFora(event) {
      if (menuMaisRef.current && !menuMaisRef.current.contains(event.target)) {
        setMenuMaisAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  function Botao({ label, icone, nomePagina, isMobile = false }) {
    const ativo = paginaAtual === nomePagina;

    return (
      <button
        onClick={() => {
          setPagina(nomePagina);
          setMenuMaisAberto(false);
          if (isMobile) setMenuAberto(false);
        }}
        className={`
          shrink-0 flex items-center gap-2.5 rounded-xl font-medium whitespace-nowrap transition-all
          ${
            isMobile
              ? "w-full justify-start px-4 py-3 text-sm"
              : "px-4 py-2.5 text-sm"
          }
          ${
            ativo
              ? "bg-white text-blue-900 shadow-md"
              : "text-blue-100 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        <span className="shrink-0">{icone}</span>
        <span>{label}</span>
      </button>
    );
  }

  const todosItens = [
    {
      label: "Dashboard",
      nome: "Dashboard",
      principal: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      label: "Estoque",
      nome: "Estoque",
      principal: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      label: "Funcionários",
      nome: "Funcionários",
      principal: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: "Departamentos",
      nome: "Departamentos",
      principal: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"
          />
        </svg>
      ),
    },
    {
      label: "Fornecedores",
      nome: "Fornecedores",
      principal: true,
      somenteAdmin: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      label: "Entradas",
      nome: "Entradas",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      ),
    },
    {
      label: "Entregas",
      nome: "Entregas",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    {
      label: "Devoluções",
      nome: "Devoluções",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
    {
      label: "Administração",
      nome: "Administracao",
      somenteAdmin: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0-5l1.09 2.26 2.49.36-1.8 1.75.42 2.47L12 8.77 9.8 9.84l.42-2.47-1.8-1.75 2.49-.36L12 3zm0 14l1.09 2.26 2.49.36-1.8 1.75.42 2.47L12 22.77l-2.2 1.07.42-2.47-1.8-1.75 2.49-.36L12 17z"
          />
        </svg>
      ),
    },
  ];

  const navItems = todosItens.filter((item) => {
    if (item.somenteAdmin && !isAdmin) return false;
    return true;
  });

  const menuPrincipal = navItems.filter((item) => item.principal);
  const menuSecundario = navItems.filter((item) => !item.principal);
  const paginaNoMenuSecundario = menuSecundario.some((item) => item.nome === paginaAtual);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-blue-900 text-white shadow-xl">
      <div className="px-4 lg:px-6 py-3">
        {/* DESKTOP */}
        <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center gap-6 xl:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 xl:w-11 xl:h-11 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-sm">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="leading-tight">
              <h1 className="text-lg xl:text-xl font-bold tracking-tight">SGEPI</h1>
              <p className="hidden xl:block text-[10px] text-blue-300 uppercase tracking-[0.22em] font-semibold mt-0.5">
                Gestão de Estoque
              </p>
            </div>
          </div>

          {/* Menu centralizado */}
          <div className="flex justify-center min-w-0">
            <nav className="flex items-center gap-2.5 flex-wrap justify-center">
              {menuPrincipal.map((item) => (
                <Botao
                  key={item.nome}
                  label={item.label}
                  nomePagina={item.nome}
                  icone={item.icon}
                />
              ))}

              {menuSecundario.length > 0 && (
                <div className="relative" ref={menuMaisRef}>
                  <button
                    onClick={() => setMenuMaisAberto((prev) => !prev)}
                    className={`
                      shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${
                        paginaNoMenuSecundario || menuMaisAberto
                          ? "bg-white text-blue-900 shadow-md"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <span>Mais</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${menuMaisAberto ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuMaisAberto && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[230px] rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-2xl p-2">
                      <div className="flex flex-col gap-1">
                        {menuSecundario.map((item) => {
                          const ativo = paginaAtual === item.nome;

                          return (
                            <button
                              key={item.nome}
                              onClick={() => {
                                setPagina(item.nome);
                                setMenuMaisAberto(false);
                              }}
                              className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition
                                ${
                                  ativo
                                    ? "bg-white text-blue-900"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                                }
                              `}
                            >
                              <span className="shrink-0">{item.icon}</span>
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* Usuário / sair */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            <div className="hidden 2xl:flex flex-col items-end justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 min-w-[180px]">
              <span className="text-sm text-blue-100 whitespace-nowrap">
                Olá, <b>{usuario?.nome}</b>
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-blue-300 mt-0.5">
                {perfilUsuario}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-200 border border-red-500/30 px-4 py-2.5 rounded-xl font-medium transition text-sm whitespace-nowrap"
            >
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* MOBILE */}
        <div className="flex lg:hidden items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-sm">
              <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight">SGEPI</h1>
              <p className="text-[10px] text-blue-300 uppercase tracking-[0.22em] font-semibold mt-0.5">
                Gestão de Estoque
              </p>
            </div>
          </div>

          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="ml-auto p-2.5 text-blue-100 hover:text-white border border-white/10 rounded-xl hover:bg-white/10 transition shrink-0"
          >
            {menuAberto ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuAberto && (
          <div className="lg:hidden mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-3 shadow-lg">
            <div className="px-2 pb-3 mb-3 border-b border-white/10">
              <p className="text-sm text-blue-100">
                Olá, <b>{usuario?.nome}</b>
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-blue-300 mt-1">
                Perfil: {perfilUsuario}
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Botao
                  key={item.nome}
                  label={item.label}
                  nomePagina={item.nome}
                  icone={item.icon}
                  isMobile={true}
                />
              ))}
            </nav>

            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-red-200 hover:bg-red-600 hover:text-white transition"
              >
                <span>Sair do Sistema</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;