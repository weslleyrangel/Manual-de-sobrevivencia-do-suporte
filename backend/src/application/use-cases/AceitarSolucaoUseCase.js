const { NotFoundError, ForbiddenError, ValidationError } = require('../../domain/errors/DomainErrors');

class AceitarSolucaoUseCase {
  constructor({ perguntaRepository, solucaoRepository, eventPublisher }) {
    this.perguntaRepository = perguntaRepository;
    this.solucaoRepository = solucaoRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute({ securityContext, perguntaId, solucaoId }) {
    const pergunta = await this.perguntaRepository.findById(perguntaId);
    if (!pergunta) {
      throw new NotFoundError('Pergunta não encontrada.');
    }

    if (String(pergunta.authorId) !== String(securityContext.userId)) {
      throw new ForbiddenError('Apenas o autor da pergunta pode marcar uma solução como aceita.');
    }

    const solucao = await this.solucaoRepository.findById(solucaoId);
    if (!solucao || String(solucao.perguntaId) !== String(perguntaId)) {
      throw new ValidationError('Solução inválida ou não pertence a este problema.');
    }

    pergunta.marcarSolucaoAceita(solucao.id);

    await this.perguntaRepository.update(pergunta);
    
    if (this.eventPublisher) {
      await this.eventPublisher.publish({
        type: 'SolucaoAceitaEvent',
        payload: { pergunta, solucao }
      });
    }

    return {
      perguntaId: pergunta.id,
      solucaoAceitaId: pergunta.solucaoAceitaId,
      status: pergunta.status
    };
  }
}

module.exports = AceitarSolucaoUseCase;
