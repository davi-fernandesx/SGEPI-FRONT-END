
````
# Rotas do Front-End - SGEPI

Este documento descreve as rotas consumidas pelo front-end do sistema **SGEPI**.  
O objetivo é centralizar quais endpoints cada tela utiliza, quais dados espera receber e quais ações executa no backend.

---

## Base da API

O front-end utiliza a URL base definida em:

env
REACT_APP_API_URL=http://empresa.lvh.me:8080/api
````

Caso a variável não exista, o sistema usa por padrão:

```js
http://empresa.lvh.me:8080/api
```

---

## Autenticação

### Login

**Tela:** `Login.jsx`

#### Rota

```http
POST /login
```

#### Envio

```json
{
  "email": "usuario@empresa.com",
  "senha": "123456"
}
```

#### Resposta esperada

```json
{
  "token": "jwt_token",
  "usuario": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email": "usuario@empresa.com",
    "perfil": "admin"
  }
}
```

#### Uso no front-end

* Salva o token no `localStorage`
* Salva o usuário no `localStorage`
* Libera o acesso ao sistema

---

# Dashboard

**Tela:** `Dashboard.jsx`

## Rotas consultadas

### EPIs

```http
GET /epis
GET /epi
GET /produtos
```

### Tamanhos

```http
GET /tamanhos
GET /tamanho
```

### Funcionários

```http
GET /funcionarios
```

### Entradas

```http
GET /entrada-epi
GET /entrada_epi
GET /entradas
```

### Entregas

```http
GET /entrega-epi
GET /entrega_epi
GET /entregas
```

### Itens entregues

```http
GET /epis-entregues
GET /epis_entregues
```

### Devoluções

```http
GET /devolucoes
GET /devolucao
```

## Função da tela

* Exibir resumo do sistema
* Mostrar total em estoque
* Mostrar entregas do dia
* Mostrar alertas de estoque baixo
* Mostrar valor estimado do estoque
* Abrir modais de entrada, entrega, devolução e busca rápida

---

# Estoque

**Tela:** `Estoque.jsx`

## Rotas consultadas

### Tipos de proteção

```http
GET /tipo-protecao
GET /tipos-protecao
GET /tipos_protecao
```

### Tamanhos

```http
GET /tamanhos
GET /tamanho
```

### EPIs

```http
GET /epis
GET /epi
GET /produtos
```

### Entradas de estoque

```http
GET /entrada-epi
GET /entrada_epi
GET /entradas-epi
GET /entradas_epis
GET /entradas
```

## Função da tela

* Exibir os lotes disponíveis em estoque
* Relacionar EPI, tamanho, lote, validade e quantidade
* Exibir alertas visuais quando a quantidade estiver baixa
* Permitir abertura do modal de cadastro de EPI

---

# Funcionários

**Tela:** `Funcionarios.jsx`

## Rotas consultadas

### Departamentos

```http
GET /departamentos
```

### Funções

```http
GET /funcoes
GET /cargos
```

### Funcionários

```http
GET /funcionarios
```

## Função da tela

* Listar funcionários cadastrados
* Exibir matrícula, nome, departamento e função
* Permitir busca textual
* Permitir impressão da lista

---

# Fornecedores

**Tela:** `Fornecedores.jsx`

## Rotas consultadas

### Fornecedores

```http
GET /fornecedores
```

## Função da tela

* Listar fornecedores cadastrados
* Exibir razão social, nome fantasia, CNPJ e inscrição estadual
* Permitir busca textual
* Exibir dados em modo responsivo

---

# Entradas

**Tela:** `Entradas.jsx`

## Rotas consultadas

### Fornecedores

```http
GET /fornecedores
```

### EPIs

```http
GET /epis
GET /epi
GET /produtos
```

### Tamanhos

```http
GET /tamanhos
GET /tamanho
```

### Entradas

```http
GET /entrada-epi
GET /entrada_epi
GET /entradas
```

## Rotas de gravação

### Registrar entrada

```http
POST /entrada-epi
POST /entrada_epi
```

## Exemplo de payload

```json
{
  "idFornecedor": 1,
  "idEpi": 2,
  "idTamanho": 3,
  "quantidade": 50,
  "quantidadeAtual": 50,
  "data_entrada": "2026-03-14",
  "data_fabricacao": "2026-01-01",
  "data_validade": "2027-01-01",
  "lote": "L-001",
  "valor_unitario": 12.5,
  "nota_fiscal_numero": "12345",
  "nota_fiscal_serie": "1"
}
```

## Função da tela

* Listar entradas já registradas
* Cadastrar novas entradas
* Relacionar entrada com fornecedor, EPI, tamanho e lote
* Exibir total por item

---

# Entregas

**Tela:** `Entregas.jsx`

## Rotas consultadas

### Funcionários

```http
GET /funcionarios
```

### EPIs

```http
GET /epis
GET /epi
GET /produtos
```

### Tamanhos

```http
GET /tamanhos
GET /tamanho
```

### Entregas

```http
GET /entregas
GET /entrega-epi
GET /entrega_epi
```

### Itens entregues

```http
GET /epis-entregues
GET /epis_entregues
```

## Função da tela

* Listar histórico de entregas
* Filtrar por funcionário, item e data
* Gerar relatório geral
* Gerar relatório individual por funcionário
* Abrir modal de nova entrega

---

# Devoluções

**Tela:** `Devolucoes.jsx`

## Rotas consultadas

### Funcionários

```http
GET /funcionarios
```

### EPIs

```http
GET /epis
GET /epi
GET /produtos
```

### Tamanhos

```http
GET /tamanhos
GET /tamanho
```

### Motivos de devolução

```http
GET /motivos-devolucao
GET /motivo-devolucao
GET /motivos
```

### Devoluções

```http
GET /devolucoes
GET /devolucao
```

## Rotas de gravação

### Registrar devolução

```http
POST /devolucao
POST /devolucoes
```

## Exemplo de payload

```json
{
  "idFuncionario": 1,
  "idEpi": 2,
  "idMotivo": 3,
  "data_devolucao": "2026-03-14",
  "idTamanho": 5,
  "quantidadeADevolver": 1,
  "idEpiNovo": 2,
  "idTamanhoNovo": 5,
  "quantidadeNova": 1,
  "assinatura_digital": "base64...",
  "token_validacao": "uuid..."
}
```

## Função da tela

* Exibir devoluções registradas
* Filtrar por funcionário, item, motivo e período
* Registrar devoluções com ou sem troca
* Gerar relatórios por período
* Abrir modal de devolução

---

# Departamentos

**Tela:** `Departamentos.jsx`

## Rotas consultadas

### Departamentos

```http
GET /departamentos
```

### Funções

```http
GET /funcoes
```

## Rotas de gravação

### Cadastrar departamento

```http
POST /cadastro-departamento
```

### Cadastrar função

```http
POST /cadastro-funcao
```

## Rotas de exclusão

### Excluir departamento

```http
DELETE /departamento/:id
```

### Excluir função

```http
DELETE /funcao/:id
```

## Função da tela

* Exibir departamentos cadastrados
* Exibir funções vinculadas
* Permitir criação de departamentos
* Permitir criação de funções
* Permitir exclusão de ambos

---

# Administração

**Tela:** `Administracao.jsx`

## Abas e rotas utilizadas

---

## Fornecedores

### Buscar

```http
GET /fornecedores
```

### Cadastrar

```http
POST /fornecedor
POST /fornecedores
```

### Excluir

```http
DELETE /fornecedor/:id
DELETE /fornecedores/:id
```

---

## Departamentos

### Buscar

```http
GET /departamentos
```

### Cadastrar

```http
POST /departamento
POST /departamentos
```

### Excluir

```http
DELETE /departamento/:id
DELETE /departamentos/:id
```

---

## Funções

### Buscar

```http
GET /funcoes
GET /cargos
```

### Cadastrar

```http
POST /funcao
POST /funcoes
POST /cargo
```

### Excluir

```http
DELETE /funcao/:id
DELETE /funcoes/:id
DELETE /cargo/:id
```

---

## Funcionários

### Buscar

```http
GET /funcionarios
```

### Cadastrar

```http
POST /funcionario
POST /funcionarios
```

### Editar

```http
PUT /funcionario/:id
PUT /funcionarios/:id
```

### Excluir

```http
DELETE /funcionario/:id
DELETE /funcionarios/:id
```

---

## Tipos de proteção

### Buscar

```http
GET /tipo-protecao
GET /tipos-protecao
GET /tipos_protecao
```

---

## EPIs

### Buscar

```http
GET /epis
GET /epi
GET /produtos
```

### Cadastrar

```http
POST /epi
POST /epis
POST /produtos
```

---

## Usuários / acessos

### Buscar

```http
GET /usuarios-sistema
GET /usuarios
GET /acessos
```

### Cadastrar

```http
POST /usuario-sistema
POST /usuarios
POST /acessos
```

### Excluir

```http
DELETE /usuario-sistema/:id
DELETE /usuarios/:id
DELETE /acessos/:id
```

## Função da tela

* Centralizar os cadastros principais
* Gerenciar fornecedores
* Gerenciar departamentos e funções
* Gerenciar funcionários
* Gerenciar EPIs
* Gerenciar acessos ao sistema

---

# ModalNovoEpi

**Arquivo:** `ModalNovoEpi.jsx`

## Rotas consultadas

```http
GET /tipo-protecao
GET /tipos-protecao
GET /tipos_protecao
```

## Rotas de gravação

```http
POST /epi
POST /epis
```

## Função

* Cadastrar novo EPI
* Selecionar tipo de proteção
* Informar fabricante, CA, descrição, validade e tamanhos

---

# ModalEntrega

**Arquivo:** `ModalEntrega.jsx`

## Rotas consultadas

```http
GET /funcionarios
GET /epis
GET /epi
GET /produtos
GET /tamanhos
GET /tamanho
```

## Função

* Selecionar funcionário
* Adicionar EPIs e tamanhos para entrega
* Capturar assinatura digital
* Montar o objeto final da entrega

---

# ModalEntrada

**Arquivo:** `ModalEntrada.jsx`

## Rotas consultadas

```http
GET /fornecedores
GET /epis
GET /epi
GET /produtos
GET /tamanhos
GET /tamanho
```

## Rotas de gravação

```http
POST /entrada-epi
POST /entrada_epi
POST /entrada
```

## Função

* Selecionar fornecedor
* Adicionar vários itens à entrada
* Informar lote, valor, fabricação e validade
* Registrar a entrada

---

# ModalBusca

**Arquivo:** `ModalBusca.jsx`

## Rotas consultadas

```http
GET /epis
GET /epi
GET /produtos
```

## Função

* Pesquisar EPI por nome, fabricante, CA, descrição ou tipo
* Exibir validade do CA
* Mostrar se o item está válido ou vencido

---

# ModalBaixa

**Arquivo:** `ModalBaixa.jsx`

## Rotas consultadas

```http
GET /funcionarios
GET /epis
GET /epi
GET /produtos
GET /tamanhos
GET /tamanho
GET /motivos-devolucao
GET /motivo-devolucao
GET /motivos_baixa
GET /motivos
```

## Rotas de gravação

```http
POST /devolucao
POST /devolucoes
POST /baixa
```

## Função

* Registrar devolução
* Registrar troca de item
* Capturar assinatura digital
* Informar motivo e observação

---

# Serviços auxiliares

## api.js

Centraliza todas as chamadas HTTP do front-end.

### Métodos disponíveis

```js
api.get(rota)
api.post(rota, dados)
api.put(rota, dados)
api.patch(rota, dados)
api.delete(rota)
```

### Função

* Montar headers
* Enviar token JWT
* Tratar respostas da API
* Padronizar mensagens de erro

---

## categoriaService.js

### Rota

```http
POST /categoria
```

### Função

* Criar categoria

---

## produtoService.js

### Rota

```http
POST /produto
```

### Função

* Criar produto

---

## statusService.js

### Rota

```http
POST /status
```

### Função

* Criar status

---
