const crypto = require('crypto');

class Comentario {
  constructor({ id, tipoRecurso, recursoAlvoId, authorId, texto, criadoEm }) {
    this.id = id || crypto.randomUUID();
    this.tipoRecurso = tipoRecurso;
    this.recursoAlvoId = recursoAlvoId;
    this.authorId = authorId;
    this.texto = texto;
    this.criadoEm = criadoEm || new Date();
  }

  static criar(payload) {
    const { texto } = payload;
    
    if (!texto || texto.length < 5 || texto.length > 500) {
      throw new Error('O comentário deve ter entre 5 e 500 caracteres.');
    }

    return new Comentario(payload);
  }
}

module.exports = Comentario;
