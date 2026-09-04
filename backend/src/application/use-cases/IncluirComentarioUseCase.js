const Comentario = require('../../domain/entities/Comentario');

class IncluirComentarioUseCase {
  constructor({ perguntaRepository, solucaoRepository, comentarioRepository, eventPublisher }) {
    this.perguntaRepository = perguntaRepository;
    this.solucaoRepository = solucaoRepository;
    this.comentarioRepository = comentarioRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute({ securityContext, tipoRecurso, recursoAlvoId, textoComentario }) {
    if (!securityContext.isVerified) {
      throw new Error('Conta não verificada.');
    }

    if (tipoRecurso === 'PERGUNTA') {
      const pergunta = await this.perguntaRepository.findById(recursoAlvoId);
      if (!pergunta) {
        throw new Error('Pergunta não encontrada.');
      }
      if (pergunta.status === 'FECHADA_ADMINISTRATIVAMENTE') {
        throw new Error('Não é possível comentar em uma pergunta encerrada administrativamente.');
      }
    } else if (tipoRecurso === 'SOLUCAO') {
      // Assuming similar validation for solutions if they can be closed, 
      // but according to the doc, the check is mainly on the question.
      const solucao = await this.solucaoRepository.findById(recursoAlvoId);
      if (!solucao) {
        throw new Error('Solução não encontrada.');
      }
    }

    const comentario = Comentario.criar({
      tipoRecurso,
      recursoAlvoId,
      authorId: securityContext.userId,
      texto: textoComentario
    });

    await this.comentarioRepository.save(comentario);
    
    if (this.eventPublisher) {
      await this.eventPublisher.publish({
        type: 'ComentarioIncluidoEvent',
        payload: comentario
      });
    }

    return {
      id: comentario.id,
      recursoAlvoId: comentario.recursoAlvoId,
      authorId: comentario.authorId,
      criadoEm: comentario.criadoEm
    };
  }
}

module.exports = IncluirComentarioUseCase;
