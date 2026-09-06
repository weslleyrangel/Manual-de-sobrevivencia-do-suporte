const { NotFoundError, ForbiddenError, ValidationError } = require('../../domain/errors/DomainErrors');

class AceitarSolucaoUseCase {
  constructor({ perguntaRepository, solucaoRepository, eventPublisher }) {
    this.perguntaRepository = perguntaRepository;
    this.solucaoRepository = solucaoRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute({ securityContext, perguntaId, solucaoId, desmarcar = false }) {
    const pergunta = await this.perguntaRepository.findById(perguntaId);
    if (!pergunta) {
      throw new NotFoundError('Pergunta não encontrada.');
    }

    const isAuthor = String(pergunta.authorId) === String(securityContext.userId);
    const isAdmin = securityContext.roles && securityContext.roles.some(r => ['ROLE_ADMIN', 'ADMIN'].includes(r));

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenError('Apenas o autor da pergunta ou um administrador podem marcar uma solução como aceita.');
    }

    if (desmarcar || solucaoId === null) {
      pergunta.desmarcarSolucaoAceita();
      await this.perguntaRepository.update(pergunta);
      return {
        perguntaId: pergunta.id,
        solucaoAceitaId: null,
        status: pergunta.status
      };
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
        payload: { pergunta, solucao, marcadoPorAdmin: isAdmin && !isAuthor }
      });
    }

    return {
      perguntaId: pergunta.id,
      solucaoAceitaId: pergunta.solucaoAceitaId,
      status: pergunta.status,
      marcadoPorAdmin: isAdmin && !isAuthor
    };
  }
}

module.exports = AceitarSolucaoUseCase;
