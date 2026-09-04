const Solucao = require('../../domain/entities/Solucao');
const { UnauthorizedError, NotFoundError, ForbiddenError } = require('../../domain/errors/DomainErrors');

class PublicarSolucaoUseCase {
  constructor({ perguntaRepository, solucaoRepository, eventPublisher }) {
    this.perguntaRepository = perguntaRepository;
    this.solucaoRepository = solucaoRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute({ securityContext, perguntaId, descricaoPassoAPasso, anexosUrls }) {
    if (!securityContext.isVerified) {
      throw new UnauthorizedError('Conta não verificada.');
    }

    const pergunta = await this.perguntaRepository.findById(perguntaId);
    if (!pergunta) {
      throw new NotFoundError('Pergunta não encontrada.');
    }

    if (pergunta.isFechada()) {
      throw new ForbiddenError('Não é possível adicionar soluções a perguntas encerradas.');
    }

    const solucao = Solucao.criar({
      perguntaId,
      authorId: securityContext.userId,
      descricaoPassoAPasso,
      anexosUrls
    });

    await this.solucaoRepository.save(solucao);
    
    if (this.eventPublisher) {
      await this.eventPublisher.publish({
        type: 'SolucaoPublicadaEvent',
        payload: { solucao, pergunta }
      });
    }

    return {
      id: solucao.id,
      perguntaId: solucao.perguntaId,
      authorId: solucao.authorId,
      dataCriacao: solucao.dataCriacao
    };
  }
}

module.exports = PublicarSolucaoUseCase;
