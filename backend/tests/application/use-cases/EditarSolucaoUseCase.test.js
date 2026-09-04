const EditarSolucaoUseCase = require('../../../src/application/use-cases/EditarSolucaoUseCase');

describe('EditarSolucaoUseCase', () => {
  let mockSolucaoRepository;
  let mockEventPublisher;
  let useCase;

  beforeEach(() => {
    mockSolucaoRepository = {
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue(true)
    };
    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(true)
    };
    
    useCase = new EditarSolucaoUseCase({
      solucaoRepository: mockSolucaoRepository,
      eventPublisher: mockEventPublisher
    });
  });

  it('should edit a solution if user is author', async () => {
    const mockSolucao = {
      id: 'sol-1',
      authorId: 'user-123',
      descricaoPassoAPasso: 'Old desc...',
      atualizarConteudo: jest.fn()
    };
    mockSolucaoRepository.findById.mockResolvedValue(mockSolucao);

    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      solucaoId: 'sol-1',
      novaDescricaoPassoAPasso: 'New desc...'
    };

    const result = await useCase.execute(input);

    expect(result.id).toBe('sol-1');
    expect(mockSolucao.atualizarConteudo).toHaveBeenCalledWith({
      novaDescricaoPassoAPasso: 'New desc...',
      novosAnexosUrls: undefined
    });
    expect(mockSolucaoRepository.update).toHaveBeenCalledWith(mockSolucao);
    expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw error if solution not found', async () => {
    mockSolucaoRepository.findById.mockResolvedValue(null);

    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      solucaoId: 'sol-none',
      novaDescricaoPassoAPasso: 'New desc...'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Solução não encontrada.');
  });

  it('should throw error if user is not author', async () => {
    const mockSolucao = {
      id: 'sol-1',
      authorId: 'user-other',
      descricaoPassoAPasso: 'Old desc...',
      atualizarConteudo: jest.fn()
    };
    mockSolucaoRepository.findById.mockResolvedValue(mockSolucao);

    const input = {
      securityContext: { userId: 'user-123', roles: ['ROLE_MEMBER'], isVerified: true },
      solucaoId: 'sol-1',
      novaDescricaoPassoAPasso: 'New desc...'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Acesso negado. Você só pode editar suas próprias soluções.');
  });
});
