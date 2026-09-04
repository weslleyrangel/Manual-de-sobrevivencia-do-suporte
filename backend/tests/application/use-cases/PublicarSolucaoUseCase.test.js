const PublicarSolucaoUseCase = require('../../../src/application/use-cases/PublicarSolucaoUseCase');

describe('PublicarSolucaoUseCase', () => {
  let mockPerguntaRepository;
  let mockSolucaoRepository;
  let mockEventPublisher;
  let useCase;

  beforeEach(() => {
    mockPerguntaRepository = {
      findById: jest.fn()
    };
    mockSolucaoRepository = {
      save: jest.fn().mockResolvedValue(true)
    };
    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(true)
    };
    
    useCase = new PublicarSolucaoUseCase({
      perguntaRepository: mockPerguntaRepository,
      solucaoRepository: mockSolucaoRepository,
      eventPublisher: mockEventPublisher
    });
  });

  it('should publish a solution', async () => {
    mockPerguntaRepository.findById.mockResolvedValue({
      id: 'p-1',
      status: 'ABERTA',
      isFechada: () => false
    });

    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-1',
      descricaoPassoAPasso: 'Você pode tentar reiniciar o roteador para ver se volta a funcionar.',
    };

    const result = await useCase.execute(input);

    expect(result.id).toBeDefined();
    expect(result.perguntaId).toBe('p-1');
    expect(result.authorId).toBe('123');
    
    expect(mockSolucaoRepository.save).toHaveBeenCalledTimes(1);
    expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw error if user not verified', async () => {
    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: false },
      perguntaId: 'p-1',
      descricaoPassoAPasso: 'Você pode tentar reiniciar o roteador para ver se volta a funcionar.',
    };

    await expect(useCase.execute(input)).rejects.toThrow('Conta não verificada.');
  });

  it('should throw error if pergunta not found', async () => {
    mockPerguntaRepository.findById.mockResolvedValue(null);

    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-nonexistent',
      descricaoPassoAPasso: 'Você pode tentar reiniciar o roteador para ver se volta a funcionar.',
    };

    await expect(useCase.execute(input)).rejects.toThrow('Pergunta não encontrada.');
  });

  it('should throw error if pergunta is closed', async () => {
    mockPerguntaRepository.findById.mockResolvedValue({
      id: 'p-1',
      status: 'RESOLVIDA',
      isFechada: () => true
    });

    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-1',
      descricaoPassoAPasso: 'Você pode tentar reiniciar o roteador para ver se volta a funcionar.',
    };

    await expect(useCase.execute(input)).rejects.toThrow('Não é possível adicionar soluções a perguntas encerradas.');
  });
});
