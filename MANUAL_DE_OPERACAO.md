MANUAL DE OPERAÇÃO DA PLATAFORMA MULTI-LOJA (VITRINE ARTESANAL)

Este documento foi criado para orientar você no gerenciamento completo da plataforma, criação de novas lojas e vinculação de artesãos/clientes.

====================================================================
1. COMO A PLATAFORMA FUNCIONA (VISÃO GERAL)
====================================================================

A plataforma funciona em um modelo Multi-Loja (Multi-Tenant) centralizado.

• Vitrine Pública do Cliente:
  http://localhost:5173/slug-da-loja (Exemplo: http://localhost:5173/arte-em-couro)
  É o site público onde os clientes do artesão veem os produtos e compram.

• Painel Admin da Loja:
  http://localhost:5173/slug-da-loja/admin
  É a área onde o dono da loja gerencia seus produtos, categorias, fotos e cores do site.

• Central de Gerenciamento Mestre (Você):
  http://localhost:5173/master-admin
  É o seu painel central para criar novas lojas, bloquear ou ativar lojas e gerenciar donos.

• Página de Cadastro de Artesãos:
  http://localhost:5173/signup
  É a página onde os novos clientes/artesãos criam suas contas.

====================================================================
2. COMO CONFIGURAR SEU ACESSO COMO ADMINISTRADOR MESTRE
====================================================================

Para ter acesso total ao painel /master-admin:

Passo 1: Criar sua Conta de Administrador
1. Acesse: http://localhost:5173/signup
2. Digite seu e-mail pessoal ou profissional e crie uma senha.
3. Ao cadastrar, o sistema exibirá na tela o seu ID de Usuário (UUID).

Passo 2: Definir sua Conta como Mestre no Arquivo .env
1. Abra o arquivo .env localizado na raiz do projeto.
2. Adicione a seguinte linha substituindo pelo seu UUID:

   VITE_MASTER_USER_ID=cole_seu_uuid_aqui

Nota: Se não souber seu UUID, acesse http://localhost:5173/master-admin, faça login e o sistema mostrará seu ID exato na tela.

====================================================================
3. PASSO A PASSO: COMO CRIAR E ENTREGAR UMA LOJA PARA UM CLIENTE
====================================================================

Fluxo Simplificado:

[PASSO 1] O Cliente se cadastra em /signup e te envia o User ID dele.
[PASSO 2] Você entra em /master-admin e cria a loja usando o User ID dele.
[PASSO 3] Você entrega o link da vitrine e do painel admin para o cliente.

Detalhamento dos Passos:

Passo 1: O Cliente se Cadastra
1. Peça ao cliente/artesão para acessar: http://localhost:5173/signup
2. Ele preenche o e-mail e a senha dele.
3. O sistema gerará um ID de Usuário (exemplo: a8f3c7e9-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
4. O cliente copia esse ID e envia para você.

Passo 2: Você Cria a Loja no Super Admin
1. Acesse http://localhost:5173/master-admin e faça login com sua conta mestre.
2. Preencha o formulário "CRIAR NOVA LOJA":
   - NOME DA LOJA: Exemplo "Ateliê da Maria"
   - SLUG (URL): Exemplo "atelie-da-maria" (em minúsculas, sem espaços nem acentos)
   - USER ID DO DONO: Cole o ID enviado pelo cliente.
3. Clique no botão "CRIAR E INICIALIZAR LOJA".

Passo 3: Entrega dos Links ao Cliente
Envie para o cliente as informações de acesso:
- Link da Vitrine Pública: http://localhost:5173/atelie-da-maria
- Link do Painel de Controle: http://localhost:5173/atelie-da-maria/admin
- Acesso: O cliente usa o mesmo e-mail e senha que criou no cadastro.

====================================================================
4. GERENCIANDO LOJAS EXISTENTES
====================================================================

No painel /master-admin você pode:

• Reatribuir Dono:
  Caso queira trocar o dono de uma loja, cole o novo UUID do cliente no campo "ID do Dono" e clique fora do campo para salvar.

• Bloquear ou Ativar Acesso:
  Clique no botão "BLOQUEAR ACESSO" para suspender temporariamente uma loja (o site mostrará "LOJA TEMPORARIAMENTE INDISPONÍVEL").
  Clique em "ATIVAR ACESSO" para liberar novamente.

• Excluir Loja:
  O botão "EXCLUIR LOJA" remove permanentemente a loja e seus produtos do banco de dados.

====================================================================
RESUMO RÁPIDO DAS URLs
====================================================================

- Vitrine Pública: http://localhost:5173/:slug
- Admin da Loja: http://localhost:5173/:slug/admin
- Cadastro de Clientes: http://localhost:5173/signup
- Super Admin (Você): http://localhost:5173/master-admin
