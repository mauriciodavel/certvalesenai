# Certifica Vale

Dashboard seguro para análise dos desempenhos teórico, prático e GAP por objeto de conhecimento.

## Configuração

1. Crie localmente um arquivo `.env` com as variáveis de banco, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PORT`, `APP_ORIGIN` e `NODE_ENV`. Use um `JWT_SECRET` aleatório com pelo menos 32 caracteres e uma senha inicial forte. O arquivo não deve ser versionado.
2. Execute `npm install`.
3. Execute `npm run db:init` para criar as tabelas e o primeiro administrador.
4. Execute `npm run dev` para desenvolvimento, ou `npm run build && npm start` para produção.
5. Entre como administrador e importe primeiro a base teórica e depois a prática em **Atualizações**.

## Requisitos de produção

- HTTPS obrigatório e `NODE_ENV=production` para cookies `Secure`.
- Segredos fornecidos apenas pelo gerenciador de segredos da infraestrutura; nunca no repositório.
- Banco TiDB acessível somente pela aplicação e com usuário de privilégio mínimo.
- Backup, rotação de credenciais, logs centralizados e monitoramento de tentativas de login.

## Proteções implementadas

Sessão assinada em cookie `HttpOnly`/`SameSite`, CSRF, RBAC, rate limiting, bloqueio temporário de login, bcrypt, cabeçalhos Helmet/CSP, TLS no banco, validação de planilha e tamanho, consultas parametrizadas, atualização transacional e histórico de auditoria.
