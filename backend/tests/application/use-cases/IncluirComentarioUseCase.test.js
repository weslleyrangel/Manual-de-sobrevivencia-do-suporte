const IncluirComentarioUseCase = require('../../../src/application/use-cases/IncluirComentarioUseCase');

describe('IncluirComentarioUseCase', () => {
  let mockPerguntaRepository;
  let mockSolucaoRepository;
  let mockComentarioRepository;
  let mockEventPublisher;
  let useCase;

  beforeEach(() => {
    mockPerguntaRepository = {
      findById: jest.fn()
    };
    mockSolucaoRepository = {
      findById: jest.fn()
    };
    mockComentarioRepository = {
      save: jest.fn().mockResolvedValue(true)
    };
    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(true)
    };
    
    useCase = new IncluirComentarioUseCase({
      perguntaRepository: mockPerguntaRepository,
      solucaoRepository: mockSolucaoRepository,
      comentarioRepository: mockComentarioRepository,
      eventPublisher: mockEventPublisher
    });
  });

  it('should include comment in a question', async () => {
    mockPerguntaRepository.findById.mockResolvedValue({
      id: 'p-1',
      status: 'ABERTA'
    });

    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: true },
      tipoRecurso: 'PERGUNTA',
      recursoAlvoId: 'p-1',
      textoComentario: 'Isso também acontece no Windows 11?'
    };

    const result = await useCase.execute(input);

    expect(result.id).toBeDefined();
    expect(result.recursoAlvoId).toBe('p-1');
    expect(mockComentarioRepository.save).toHaveBeenCalledTimes(1);
    expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw error if user is not verified', async () => {
    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: false },
      tipoRecurso: 'PERGUNTA',
      recursoAlvoId: 'p-1',
      textoComentario: 'Isso também acontece no Windows 11?'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Conta não verificada.');
  });

  it('should throw error if question is closed administratively', async () => {
    mockPerguntaRepository.findById.mockResolvedValue({
      id: 'p-1',
      status: 'FECHADA_ADMINISTRATIVAMENTE'
    });

    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: true },
      tipoRecurso: 'PERGUNTA',
      recursoAlvoId: 'p-1',
      textoComentario: 'Isso também acontece no Windows 11?'
    };

    await expect(useCase.execute(input)).rejects.toThrow('Não é possível comentar em uma pergunta encerrada administrativamente.');
  });
});
