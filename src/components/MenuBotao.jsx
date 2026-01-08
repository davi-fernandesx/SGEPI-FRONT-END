function MenuBotao({label, ativo, onClick}){
  return(
    <button onClick={onClick} className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-medium ${ativo ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"}`} >
      {label}
    </button>
  );
}