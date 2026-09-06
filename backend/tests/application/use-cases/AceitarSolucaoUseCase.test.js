const AceitarSolucaoUseCase = require('../../../src/application/use-cases/AceitarSolucaoUseCase');

describe('AceitarSolucaoUseCase', () => {
  let mockPerguntaRepository;
  let mockSolucaoRepository;
  let mockEventPublisher;
  let useCase;

  beforeEach(() => {
    mockPerguntaRepository = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue(true)
    };
    mockSolucaoRepository = {
      findById: jest.fn()
    };
    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(true)
    };
    
    useCase = new AceitarSolucaoUseCase({
      perguntaRepository: mockPerguntaRepository,
      solucaoRepository: mockSolucaoRepository,
      eventPublisher: mockEventPublisher
    });
  });

  it('should accept a solution if user is author of the question', async () => {
    const mockPergunta = {
      id: 'p-1',
      authorId: 'user-123',
      status: 'ABERTA',
      marcarSolucaoAceita: jest.fn()
    };
    mockPerguntaRepository.findById.mockResolvedValue(mockPergunta);

    const mockSolucao = {
      id: 'sol-1',
      perguntaId: 'p-1'
    };
    mockSolucaoRepository.findById.mockResolvedValue(mockSolucao);

    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-1',
      solucaoId: 'sol-1'
    };

    const result = await useCase.execute(input);

    expect(result.perguntaId).toBe('p-1');
    expect(mockPergunta.marcarSolucaoAceita).toHaveBeenCalledWith('sol-1');
    expect(mockPerguntaRepository.update).toHaveBeenCalledWith(mockPergunta);
    expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw error if pergunta not found', async () => {
    mockPerguntaRepository.findById.mockResolvedValue(null);

    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-none',
      solucaoId: 'sol-1'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Pergunta não encontrada.');
  });

  it('should throw error if user is not the author of the question', async () => {
    mockPerguntaRepository.findById.mockResolvedValue({
      id: 'p-1',
      authorId: 'user-other'
    });

    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-1',
      solucaoId: 'sol-1'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Apenas o autor da pergunta ou um administrador podem marcar uma solução como aceita.');
  });

  it('should throw error if solution not found or belongs to another question', async () => {
    mockPerguntaRepository.findById.mockResolvedValue({
      id: 'p-1',
      authorId: 'user-123'
    });

    mockSolucaoRepository.findById.mockResolvedValue({
      id: 'sol-1',
      perguntaId: 'p-2' // different question
    });

    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-1',
      solucaoId: 'sol-1'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Solução inválida ou não pertence a este problema.');
  });

  it('should allow ROLE_ADMIN to accept a solution even if not the author', async () => {
    const mockPergunta = {
      id: 'p-1',
      authorId: 'user-other',
      status: 'ABERTA',
      marcarSolucaoAceita: jest.fn()
    };
    mockPerguntaRepository.findById.mockResolvedValue(mockPergunta);

    const mockSolucao = {
      id: 'sol-99',
      perguntaId: 'p-1'
    };
    mockSolucaoRepository.findById.mockResolvedValue(mockSolucao);

    const input = {
      securityContext: { userId: 'admin-user', roles: ['ROLE_ADMIN'], isVerified: true },
      perguntaId: 'p-1',
      solucaoId: 'sol-99'
    };

    const result = await useCase.execute(input);

    expect(result.perguntaId).toBe('p-1');
    expect(result.marcadoPorAdmin).toBe(true);
    expect(mockPergunta.marcarSolucaoAceita).toHaveBeenCalledWith('sol-99');
    expect(mockPerguntaRepository.update).toHaveBeenCalledWith(mockPergunta);
  });

  it('should unaccept a solution when desmarcar is true', async () => {
    const mockPergunta = {
      id: 'p-1',
      authorId: 'user-123',
      status: 'RESOLVIDA',
      solucaoAceitaId: 'sol-1',
      desmarcarSolucaoAceita: jest.fn()
    };
    mockPerguntaRepository.findById.mockResolvedValue(mockPergunta);

    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      perguntaId: 'p-1',
      solucaoId: null,
      desmarcar: true
    };

    const result = await useCase.execute(input);

    expect(result.solucaoAceitaId).toBeNull();
    expect(mockPergunta.desmarcarSolucaoAceita).toHaveBeenCalled();
    expect(mockPerguntaRepository.update).toHaveBeenCalledWith(mockPergunta);
  });
});
