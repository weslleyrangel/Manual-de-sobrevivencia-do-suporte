const crypto = require('crypto');
const { ValidationError } = require('../errors/DomainErrors');

class Pergunta {
  constructor({ id, titulo, descricao, tags, categoriaId, authorId, status, dataCriacao, solucaoAceitaId, encerradoEm, closedAt, closingReason }) {
    this.id = id || crypto.randomUUID();
    this.titulo = titulo;
    this.descricao = descricao;
    this.tags = tags || [];
    this.categoriaId = categoriaId;
    this.authorId = authorId;
    this.status = status || 'ABERTA';
    this.dataCriacao = dataCriacao || new Date();
    this.solucaoAceitaId = solucaoAceitaId || null;
    this.encerradoEm = encerradoEm || closedAt || null;
    this.closedAt = this.encerradoEm;
    this.closingReason = closingReason || null;
  }

  static criar(payload) {
    const { titulo, descricao, tags } = payload;
    
    if (!titulo || titulo.length < 10 || titulo.length > 150) {
      throw new ValidationError('O título deve ter entre 10 e 150 caracteres.');
    }

    if (!descricao || descricao.trim() === '') {
      throw new ValidationError('A descrição é obrigatória.');
    }

    if (!tags || tags.length < 1 || tags.length > 5) {
      throw new ValidationError('A pergunta deve ter entre 1 e 5 tags.');
    }

    return new Pergunta(payload);
  }

  marcarSolucaoAceita(solucaoId) {
    this.status = 'RESOLVIDA';
    this.solucaoAceitaId = solucaoId;
  }

  desmarcarSolucaoAceita() {
    this.status = 'ABERTA';
    this.solucaoAceitaId = null;
  }

  reabrir() {
    this.status = 'ABERTA';
    this.closingReason = null;
    this.closedAt = null;
    this.encerradoEm = null;
  }

  encerrarAdministrativamente({ tecnicoId, motivo, justificativaTecnica }) {
    this.status = 'FECHADA_ADMINISTRATIVAMENTE';
    this.closingReason = justificativaTecnica || motivo;
    this.closedAt = new Date();
    this.encerradoEm = this.closedAt;
  }

  isFechada() {
    return this.status === 'FECHADA_ADMINISTRATIVAMENTE' || this.status === 'RESOLVIDA';
  }
}

module.exports = Pergunta;
