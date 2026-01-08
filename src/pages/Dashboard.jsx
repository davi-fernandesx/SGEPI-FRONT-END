import { useState, useMemo } from "react";
import ModalEntrada from "../components/modals/ModalEntrada";
import ModalEntrega from "../components/modals/ModalEntrega";
import ModalBaixa from "../components/modals/ModalBaixa";
import ModalBusca from "../components/modals/ModalBusca";
import ModalNovoEpi from "../components/modals/ModalNovoEpi";

// 1. SIMULAÇÃO DO BANCO DE DADOS 
const mockEstoqueInicial = [
  { id: 1, item: "Capacete de Segurança", fabricante: "3M", quantidade: 45, validade: "2025-12-01" },
  { id: 2, item: "Luvas de Raspa", fabricante: "Volk", quantidade: 15, validade: "2024-06-01" }, // Quantidade baixa
  { id: 3, item: "Máscara PFF2", fabricante: "Delta", quantidade: 100, validade: "2024-02-10" }, // Vencimento próximo
  { id: 4, item: "Cinto Paraquedista", fabricante: "Hercules", quantidade: 0, validade: "2026-01-01" }, // Zerado
  { id: 5, item: "Protetor Auricular", fabricante: "3M", quantidade: 200, validade: "2025-11-20" },
];

function Dashboard() {
  const [estoque, setEstoque] = useState(mockEstoqueInicial);
  
  // States dos Modais
  const [modalEntrada, setModalEntrada] = useState(false);
  const [modalEntrega, setModalEntrega] = useState(false);
  const [modalBaixa, setModalBaixa] = useState(false);
  const [modalBusca, setModalBusca] = useState(false);
  const [modalNovoEpi, setModalNovoEpi] = useState(false);

  // 2. FUNÇÕES AUXILIARES (A "Inteligência" visual)
  // Formata a data para ficar bonitinha (dd/mm/aaaa)
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Define a cor do status baseado na quantidade
  const getStatusColor = (qtd) => {
    if (qtd === 0) return "text-red-600 font-bold";
    if (qtd <= 20) return "text-yellow-600 font-bold";
    return "text-green-600 font-bold";
  };

  // Define o texto do status
  const getStatusTexto = (qtd) => {
    if (qtd === 0) return "ESGOTADO";
    if (qtd <= 20) return "BAIXO";
    return "OK";
  };

  // 3. LOGICA PARA FILTRAR OS ALERTAS AUTOMATICAMENTE
  // O useMemo serve para não recalcular isso toda hora, só quando o 'estoque' mudar
  const alertasGerados = useMemo(() => {
    const alertas = [];
    const hoje = new Date();

    estoque.forEach((produto) => {
      const dataValidade = new Date(produto.validade);
      const diferencaTempo = dataValidade - hoje;
      const diasParaVencer = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

      // Regra 1: Acabou o estoque
      if (produto.quantidade === 0) {
        alertas.push({
          tipo: 'erro', // vermelho
          mensagem: `❗ ${produto.item.toUpperCase()}: Não há mais no estoque`
        });
      } 
      // Regra 2: Estoque Baixo (menos de 20)
      else if (produto.quantidade <= 20) {
        alertas.push({
          tipo: 'atencao', // amarelo
          mensagem: `⚠️ ${produto.item.toUpperCase()}: Quantidade Baixa (${produto.quantidade})`
        });
      }

      // Regra 3: Vai vencer em menos de 30 dias
      if (diasParaVencer > 0 && diasParaVencer <= 30) {
        alertas.push({
          tipo: 'erro',
          mensagem: `📅 ${produto.item.toUpperCase()}: Vencimento Próximo (${formatarData(produto.validade)})`
        });
      }
    });
    return alertas;
  }, [estoque]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* TABELA DE ESTOQUE */}
      <div className="bg-white rounded-xl shadow p-6 lg:col-span-2 overflow-x-auto">
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Estoque Atual de EPIs
        </h2>

        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-3 rounded-tl-lg">Item</th>
              <th className="p-3">Fabricante</th>
              <th className="p-3">Qtd.</th>
              <th className="p-3">Validade</th>
              <th className="p-3 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {/* Aqui usa o .map para gerar as linhas baseado nos dados */}
            {estoque.map((produto) => (
              <tr key={produto.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 font-medium">{produto.item}</td>
                <td className="p-3">{produto.fabricante}</td>
                <td className="p-3">{produto.quantidade}</td>
                <td className="p-3">{formatarData(produto.validade)}</td>
                <td className={`p-3 ${getStatusColor(produto.quantidade)}`}>
                  {getStatusTexto(produto.quantidade)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LADO DIREITO */}
      <div className="space-y-6">

        {/* ALERTAS DINÂMICOS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-lg border-b pb-2">
            🔔 ALERTAS IMPORTANTES
          </h2>

          <ul className="text-sm space-y-3 font-medium">
            {alertasGerados.length === 0 ? (
              <li className="text-green-600 text-center py-4">Tudo certo! Nenhum alerta.</li>
            ) : (
              alertasGerados.map((alerta, index) => (
                <li 
                  key={index} 
                  className={`${alerta.tipo === 'erro' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'} p-2 rounded border border-opacity-20 border-current`}
                >
                  {alerta.mensagem}
                </li>
              ))
            )}
          </ul>
        </div>

        {/* AÇÕES RÁPIDAS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">
            ⚡ AÇÕES RÁPIDAS
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => setModalNovoEpi(true)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-sm hover:shadow-md"
            >
              🆕 Cadastrar Novo EPI
            </button>

            <button
              onClick={() => setModalEntrada(true)}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition shadow-sm hover:shadow-md"
            >
              ➕ Registrar Entrada
            </button>

            <button
              onClick={() => setModalEntrega(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
            >
              👷 Realizar Entrega
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModalBaixa(true)}
                className="w-full bg-red-600 text-white p-3 rounded-lg font-bold hover:bg-red-700 transition shadow-sm hover:shadow-md text-sm"
              >
                📉 Baixa/Perda
              </button>

              <button
                onClick={() => setModalBusca(true)}
                className="w-full bg-yellow-500 text-white p-3 rounded-lg font-bold hover:bg-yellow-600 transition shadow-sm hover:shadow-md text-sm"
              >
                🔍 Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAIS */}
      {modalNovoEpi && <ModalNovoEpi onClose={() => setModalNovoEpi(false)} />}
      {modalEntrada && <ModalEntrada onClose={() => setModalEntrada(false)} />}
      {modalEntrega && <ModalEntrega onClose={() => setModalEntrega(false)} />}
      {modalBaixa && <ModalBaixa onClose={() => setModalBaixa(false)} />}
      {modalBusca && <ModalBusca onClose={() => setModalBusca(false)} />}
    </div>
  );
}

export default Dashboard;