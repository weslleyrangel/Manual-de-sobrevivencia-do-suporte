// Garante que os testes rodem com autenticação real, mesmo quando o
// contêiner estiver com LOCAL_MODE=true (uso local sem login).
// Testes do modo local habilitam a variável explicitamente.
delete process.env.LOCAL_MODE;
delete process.env.LOCAL_USER_EMAIL;

