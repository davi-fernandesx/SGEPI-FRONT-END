# SGEPI Front-End

Interface web do sistema **SGEPI** (Sistema de Gestão de Equipamentos de Proteção Individual), desenvolvida para controlar o cadastro, visualização e movimentação de EPIs dentro da empresa.

Este projeto permite visualizar estoque, entradas, entregas, devoluções, colaboradores, departamentos, fornecedores e outras informações administrativas por meio de uma interface moderna e responsiva.

---

## Objetivo do projeto

O objetivo deste front-end é oferecer uma interface prática para o uso diário do sistema de gestão de EPIs, facilitando o controle de estoque, a entrega para funcionários, o registro de devoluções, a consulta rápida de itens e a organização dos cadastros principais.

---

## Funcionalidades

- Login de usuário
- Dashboard com resumo do sistema
- Visualização de estoque
- Consulta de funcionários
- Consulta de fornecedores
- Consulta de departamentos e funções
- Registro de entradas de estoque
- Registro de entregas com assinatura
- Registro de devoluções e trocas com assinatura
- Busca rápida de EPIs
- Cadastro de EPIs
- Área administrativa com gestão de cadastros
- Integração com API por meio de rotas HTTP
- Interface responsiva para desktop e mobile

---

## Tecnologias utilizadas

- React
- JavaScript
- Tailwind CSS
- Fetch API
- LocalStorage
- Componentização com React Hooks

---

## Estrutura do projeto

```bash
src/
 ├── components/
 │   └── modals/
 │       ├── ModalNovoEpi.jsx
 │       ├── ModalEntrega.jsx
 │       ├── ModalEntrada.jsx
 │       ├── ModalBusca.jsx
 │       └── ModalBaixa.jsx
 │
 ├── pages/
 │   ├── Dashboard.jsx
 │   ├── Estoque.jsx
 │   ├── Funcionarios.jsx
 │   ├── Fornecedores.jsx
 │   ├── Entradas.jsx
 │   ├── Entregas.jsx
 │   ├── Devolucoes.jsx
 │   ├── Departamentos.jsx
 │   ├── Administracao.jsx
 │   └── Login.jsx
 │
 ├── services/
 │   ├── api.js
 │   ├── categoriaService.js
 │   ├── produtoService.js
 │   └── statusService.js
 │
 ├── utils/
 │   └── permissoes.js
 │
 └── components/
     ├── Header.jsx
     └── Toast.jsx
```

# Como executar o projeto

1. Clone o repositório  
   `git clone URL_DO_SEU_REPOSITORIO`

2. Acesse a pasta do projeto  
   `cd nome-do-projeto`

3. Instale as dependências  
   `npm install`

4. Execute o projeto  
   `npm start`


- O sistema será iniciado normalmente em ambiente local.

# Configuração da API

O front-end utiliza a variável:

`REACT_APP_API_URL`


Caso ela não esteja definida, o projeto usa por padrão:

`http://empresa.lvh.me:8080/api`


Exemplo de arquivo .env:

`REACT_APP_API_URL=http://empresa.lvh.me:8080/api`

# Autenticação

- O login do sistema é feito por token JWT.

- Após autenticação:

- O token é salvo no localStorage

- Os dados do usuário também são salvos no localStorage

- O token é enviado automaticamente no header Authorization nas requisições protegidas

Exemplo:

`Authorization: Bearer SEU_TOKEN`

# Principais telas

- Login

Tela de autenticação do usuário.

- Dashboard

Resumo geral do sistema com indicadores de estoque, entregas, alertas e valor estimado em estoque.

- Estoque

Visualização dos EPIs disponíveis, quantidades, tamanhos, fabricantes, validade e lotes.

- Funcionários

Listagem de colaboradores cadastrados.

- Fornecedores

Listagem de fornecedores cadastrados.

- Entradas

Registro e visualização das entradas de estoque.

- Entregas

Registro de entregas de EPIs para funcionários, incluindo assinatura.

- Devoluções

Registro de devoluções e trocas de EPIs, também com assinatura.

- Departamentos

Visualização e gerenciamento de departamentos e funções.

- Administração

Painel administrativo com gerenciamento de fornecedores, funcionários, departamentos, funções, usuários e EPIs.

# Padrão de integração com API

O projeto centraliza as requisições no arquivo:

`src/services/api.js`


- Métodos disponíveis:
```
api.get

api.post

api.put

api.patch

api.delete
```
Esses métodos já:

- Montam headers automaticamente

- Enviam o token JWT quando existir

- Tratam respostas JSON

- Lançam erros padronizados

