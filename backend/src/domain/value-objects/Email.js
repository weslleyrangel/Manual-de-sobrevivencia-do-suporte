const { ValidationError } = require('../errors/DomainErrors');

class Email {
  constructor(valor) {
    if (!valor) {
      throw new ValidationError('O e-mail é obrigatório.');
    }

    const emailLimpo = valor.trim().toLowerCase();
    
    // Validação de formato (regex simples para e-mail)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(emailLimpo)) {
      throw new ValidationError('Formato de e-mail inválido.');
    }

    this._valor = emailLimpo;
  }

  get valor() {
    return this._valor;
  }
}

module.exports = Email;
