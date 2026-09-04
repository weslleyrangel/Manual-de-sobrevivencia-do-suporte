const EncerrarPerguntaAdministrativamenteUseCase = require('../../../src/application/use-cases/EncerrarPerguntaAdministrativamenteUseCase');

describe('EncerrarPerguntaAdministrativamenteUseCase', () => {
  let mockPerguntaRepository;
  let mockAuditLogGateway;
  let mockEventPublisher;
  let useCase;

  beforeEach(() => {
    mockPerguntaRepository = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue(true)
    };
    mockAuditLogGateway = {
      log: jest.fn().mockResolvedValue(true)
    };
    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(true)
    };
    
    useCase = new EncerrarPerguntaAdministrativamenteUseCase({
      perguntaRepository: mockPerguntaRepository,
      auditLogGateway: mockAuditLogGateway,
      eventPublisher: mockEventPublisher
    });
  });

  it('should close a question administratively', async () => {
    const mockPergunta = {
      id: 'p-1',
      status: 'ABERTA',
      encerrarAdministrativamente: jest.fn()
    };
    mockPerguntaRepository.findById.mockResolvedValue(mockPergunta);

    const input = {
      securityContext: { userId: 'admin-123', roles: ['ROLE_TECNICO'], isVerified: true },
      perguntaId: 'p-1',
      motivo: 'DUPLICADA',
      justificativaTecnica: 'Esta pergunta já foi respondida detalhadamente no chamado #45.'
    };

    const result = await useCase.execute(input);

    expect(result.perguntaId).toBe('p-1');
    expect(mockPergunta.encerrarAdministrativamente).toHaveBeenCalledWith({
      tecnicoId: 'admin-123',
      motivo: 'DUPLICADA',
      justificativaTecnica: 'Esta pergunta já foi respondida detalhadamente no chamado #45.'
    });
    expect(mockPerguntaRepository.update).toHaveBeenCalledWith(mockPergunta);
    expect(mockAuditLogGateway.log).toHaveBeenCalledWith({
      action: 'ENCERRAMENTO_ADMINISTRATIVO',
      perguntaId: 'p-1',
      executedBy: 'admin-123',
      motivo: 'DUPLICADA',
      justificativaTecnica: 'Esta pergunta já foi respondida detalhadamente no chamado #45.'
    });
    expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw error if user is not ADMIN or TECNICO', async () => {
    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-1',
      motivo: 'DUPLICADA',
      justificativaTecnica: 'Esta pergunta já foi respondida detalhadamente no chamado #45.'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Acesso negado. Requer permissão de Suporte Técnico ou Admin.');
  });

  it('should throw error if justification is too short', async () => {
    const input = {
      securityContext: { userId: 'admin-123', roles: ['ROLE_TECNICO'], isVerified: true },
      perguntaId: 'p-1',
      motivo: 'DUPLICADA',
      justificativaTecnica: 'Curta' // < 15 chars
    };

    await expect(useCase.execute(input)).rejects.toThrow('Uma justificativa técnica de no mínimo 15 caracteres é obrigatória.');
  });

  it('should throw error if question is not found', async () => {
    mockPerguntaRepository.findById.mockResolvedValue(null);

    const input = {
      securityContext: { userId: 'admin-123', roles: ['ROLE_TECNICO'], isVerified: true },
      perguntaId: 'p-none',
      motivo: 'DUPLICADA',
      justificativaTecnica: 'Esta pergunta já foi respondida detalhadamente no chamado #45.'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Pergunta não encontrada.');
  });
});
