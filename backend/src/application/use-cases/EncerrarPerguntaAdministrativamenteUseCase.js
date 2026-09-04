const { ForbiddenError, ValidationError, NotFoundError } = require('../../domain/errors/DomainErrors');

class EncerrarPerguntaAdministrativamenteUseCase {
  constructor({ perguntaRepository, auditLogGateway, eventPublisher }) {
    this.perguntaRepository = perguntaRepository;
    this.auditLogGateway = auditLogGateway;
    this.eventPublisher = eventPublisher;
  }

  async execute({ securityContext, perguntaId, motivo, justificativaTecnica }) {
    const isTecnicoOuAdmin = securityContext.roles.some(r => ['ROLE_TECNICO', 'ROLE_ADMIN'].includes(r));
    if (!isTecnicoOuAdmin) {
      throw new ForbiddenError('Acesso negado. Requer permissão de Suporte Técnico ou Admin.');
    }

    if (!justificativaTecnica || justificativaTecnica.trim().length < 15) {
      throw new ValidationError('Uma justificativa técnica de no mínimo 15 caracteres é obrigatória.');
    }

    const pergunta = await this.perguntaRepository.findById(perguntaId);
    if (!pergunta) {
      throw new NotFoundError('Pergunta não encontrada.');
    }

    pergunta.encerrarAdministrativamente({
      tecnicoId: securityContext.userId,
      motivo,
      justificativaTecnica
    });

    await this.perguntaRepository.update(pergunta);
    
    if (this.auditLogGateway) {
      await this.auditLogGateway.log({
        action: 'ENCERRAMENTO_ADMINISTRATIVO',
        perguntaId,
        executedBy: securityContext.userId,
        motivo,
        justificativaTecnica
      });
    }

    if (this.eventPublisher) {
      await this.eventPublisher.publish({
        type: 'PerguntaEncerradaAdministrativamenteEvent',
        payload: pergunta
      });
    }

    return {
      perguntaId: pergunta.id,
      status: pergunta.status,
      encerradoPor: securityContext.userId,
      motivo,
      encerradoEm: pergunta.encerradoEm
    };
  }
}

module.exports = EncerrarPerguntaAdministrativamenteUseCase;
