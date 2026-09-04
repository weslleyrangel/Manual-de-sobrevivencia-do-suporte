class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends DomainError {
  constructor(message = 'Dados inválidos.') {
    super(message);
    this.statusCode = 400;
  }
}

class UnauthorizedError extends DomainError {
  constructor(message = 'Não autorizado.') {
    super(message);
    this.statusCode = 401;
  }
}

class ForbiddenError extends DomainError {
  constructor(message = 'Acesso negado para este recurso.') {
    super(message);
    this.statusCode = 403;
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Recurso não encontrado.') {
    super(message);
    this.statusCode = 404;
  }
}

module.exports = {
  DomainError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
};
