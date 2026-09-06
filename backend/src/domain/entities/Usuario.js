const Email = require('../value-objects/Email');
const SenhaForte = require('../value-objects/SenhaForte');

class Usuario {
  constructor({ id, nome, email, senha, role, isVerified, token, tokenExpiresAt, jobTitle }) {
    this.id = id;
    this.nome = nome;
    // Vincula a validação rica dos VOs
    this.email = email instanceof Email ? email : new Email(email);
    
    // A senha pode já ser um hash, então a validação rica ocorre primordialmente na factory "criar"
    // ou se o tipo passado for explicitly SenhaForte.
    this.senha = senha instanceof SenhaForte ? senha.valor : senha;
    
    this.role = role || 'MEMBER';
    this.isVerified = isVerified || false;
    this.token = token || null;
    this.tokenExpiresAt = tokenExpiresAt || null;
    this.jobTitle = jobTitle || 'Analista de Suporte';
  }

  static criar({ nome, email, senhaLimpa, role, jobTitle }) {
    // Aplica as validações ricas de Value Object na criação
    const emailVo = new Email(email);
    const senhaVo = new SenhaForte(senhaLimpa);

    const computedName = (nome && nome.trim()) || 'Analista de Suporte';
    
    // Deixaremos o hash da senha para o caso de uso / serviço (que fará o BCrypt)
    // A entidade garante apenas as invariantes de domínio.
    return new Usuario({
      nome: computedName,
      email: emailVo,
      senha: senhaVo,
      role,
      jobTitle,
      isVerified: false
    });
  }
}

module.exports = Usuario;
