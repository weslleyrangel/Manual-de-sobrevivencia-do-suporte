const { NotFoundError, ForbiddenError } = require('../../domain/errors/DomainErrors');

class EditarSolucaoUseCase {
  constructor({ solucaoRepository, eventPublisher }) {
    this.solucaoRepository = solucaoRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute({ securityContext, solucaoId, novaDescricaoPassoAPasso, novosAnexosUrls }) {
    const solucao = await this.solucaoRepository.findById(solucaoId);
    if (!solucao) {
      throw new NotFoundError('Solução não encontrada.');
    }

    if (String(solucao.authorId) !== String(securityContext.userId)) {
      throw new ForbiddenError('Acesso negado. Você só pode editar suas próprias soluções.');
    }

    solucao.atualizarConteudo({ novaDescricaoPassoAPasso, novosAnexosUrls });

    await this.solucaoRepository.update(solucao);
    
    if (this.eventPublisher) {
      await this.eventPublisher.publish({
        type: 'SolucaoEditadaEvent',
        payload: solucao
      });
    }

    return {
      id: solucao.id,
      editadoEm: solucao.editadoEm
    };
  }
}

module.exports = EditarSolucaoUseCase;
