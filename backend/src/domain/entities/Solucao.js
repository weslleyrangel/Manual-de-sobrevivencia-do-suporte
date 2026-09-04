const crypto = require('crypto');
const { ValidationError } = require('../errors/DomainErrors');

class Solucao {
  constructor({ id, perguntaId, authorId, descricaoPassoAPasso, anexosUrls, dataCriacao, editadoEm }) {
    this.id = id || crypto.randomUUID();
    this.perguntaId = perguntaId;
    this.authorId = authorId;
    this.descricaoPassoAPasso = descricaoPassoAPasso;
    this.anexosUrls = anexosUrls || [];
    this.dataCriacao = dataCriacao || new Date();
    this.editadoEm = editadoEm || null;
  }

  static criar(payload) {
    const { descricaoPassoAPasso } = payload;
    
    if (!descricaoPassoAPasso || descricaoPassoAPasso.trim().length < 20) {
      throw new ValidationError('O passo a passo da solução deve ter no mínimo 20 caracteres.');
    }

    return new Solucao(payload);
  }

  atualizarConteudo({ novaDescricaoPassoAPasso, novosAnexosUrls }) {
    if (!novaDescricaoPassoAPasso || novaDescricaoPassoAPasso.trim().length < 20) {
      throw new ValidationError('O passo a passo da solução deve ter no mínimo 20 caracteres.');
    }

    this.descricaoPassoAPasso = novaDescricaoPassoAPasso;
    if (novosAnexosUrls) {
      this.anexosUrls = novosAnexosUrls;
    }
    this.editadoEm = new Date();
  }
}

module.exports = Solucao;
