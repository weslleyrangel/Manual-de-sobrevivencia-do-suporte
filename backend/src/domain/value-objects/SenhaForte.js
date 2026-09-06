const { ValidationError } = require('../errors/DomainErrors');

class SenhaForte {
  constructor(valor) {
    if (!valor) {
      throw new ValidationError('A senha é obrigatória.');
    }

    if (valor.length < 8) {
      throw new ValidationError('A senha deve ter no mínimo 8 caracteres.');
    }

    const temLetra = /[a-zA-Z]/.test(valor);
    const temNumero = /\d/.test(valor);

    if (!temLetra || !temNumero) {
      throw new ValidationError('A senha deve conter no mínimo letras e números.');
    }

    this._valor = valor;
  }

  get valor() {
    return this._valor;
  }
}

module.exports = SenhaForte;
