# Projeto E-commerce

Este é um projeto de e-commerce com **backend em NestJs**.


## Como executar

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DO_REPOSITORIO>
    ```

2.  **Crie o arquivo `.env` para o backend** (se necessário) com as variáveis de ambiente adequadas:
    ```ini

    JWT_SECRET=
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=6415
    DB_NAME=ecommerce_db

    #tempo para redefinicao de senha
    MIN_INTERVAL_MS=20

    #tempo de intervalo da função de liberar pedidos reservados
    PEDIDO_TIMEOUT_MINUTOS=1

    #configuração envio emails
    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=465
    MAIL_SECURE=true
    MAIL_USER=<email>
    MAIL_PASSWORD=qtvi jbxf uhoh abcd #criar uma senha de app
    MAIL_FROM="Guarashop <email>"
    #horario
    TZ=America/Recife

    #frete
    MELHOR_ENVIO_TOKEN=    #token da plataforma melhor envio
    CEP_ORIGEM=          #cep da origem do frete para o cep do cadastro do cliente

    ```
3.  **Suba o container com Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    Isso irá:
    * Criar o container do PostgreSQL na porta `5433` (externa) `5432` (interna)
    * Criar o container do backend disponivel na porta `5000`

4. **execute o projeto**
    ```ini
    npm run start
    ```

* **Backend:** `http://localhost:5000`
* **Documentação Swagger:** `http://localhost:5000/api`