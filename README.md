# warehouseSystem
 
Um aplicação construída com base electron, tem o objetivo de emitir e gerenciar requisições de saídas de item de um almoxarife.

- Algumas das tecnologias aplicadas no projeto são: 
  - electron
  - sequelize
  - sqlite
  - sass

O projeto foi pensado pra ter uma estrutura que respeite os conceitos de desacoplamento de código e também injeção de dependencias.

# Funcionalidades

- Requisições de Item:

    - Criar requisições:
        - Inserir na Base de Dados;

    - Pesquisar Itens;

    - Gerenciar requisiçôes(admin):
        - Criar;
        - Excluir;
        - Validar:
            * Gerar PDF;
            * Inserir Assinatura;

    - Emitir FABs(admin):
        - Inserir na Base de Dados;
        - Gerar Arquivo .xlsx;
        - Editar;

    - Estoque(admin):
        - Pesquisar
        - Modificar
    
