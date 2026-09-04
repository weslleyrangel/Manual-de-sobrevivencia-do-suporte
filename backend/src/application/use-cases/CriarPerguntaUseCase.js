const Pergunta = require('../../domain/entities/Pergunta');
const { UnauthorizedError } = require('../../domain/errors/DomainErrors');

class CriarPerguntaUseCase {
  constructor({ perguntaRepository, eventPublisher }) {
    this.perguntaRepository = perguntaRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute({ securityContext, titulo, descricao, tags, categoriaId }) {
    if (!securityContext.isVerified) {
      throw new UnauthorizedError('E-mail não verificado. Confirme seu e-mail para publicar.');
    }

    const novaPergunta = Pergunta.criar({
      titulo,
      descricao,
      tags,
      categoriaId,
      authorId: securityContext.userId
    });

    await this.perguntaRepository.save(novaPergunta);
    
    if (this.eventPublisher) {
      await this.eventPublisher.publish({
        type: 'PerguntaCriadaEvent',
        payload: novaPergunta
      });
    }

    return {
      id: novaPergunta.id,
      titulo: novaPergunta.titulo,
      status: novaPergunta.status,
      authorId: novaPergunta.authorId,
      dataCriacao: novaPergunta.dataCriacao
    };
  }
}

module.exports = CriarPerguntaUseCase;
