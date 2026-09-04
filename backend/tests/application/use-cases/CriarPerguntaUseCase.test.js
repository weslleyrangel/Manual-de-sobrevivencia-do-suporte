const CriarPerguntaUseCase = require('../../../src/application/use-cases/CriarPerguntaUseCase');

describe('CriarPerguntaUseCase', () => {
  let mockPerguntaRepository;
  let mockEventPublisher;
  let useCase;

  beforeEach(() => {
    mockPerguntaRepository = {
      save: jest.fn().mockResolvedValue(true)
    };
    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(true)
    };
    
    useCase = new CriarPerguntaUseCase({
      perguntaRepository: mockPerguntaRepository,
      eventPublisher: mockEventPublisher
    });
  });

  it('should create a question when user is verified', async () => {
    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: true },
      titulo: 'Como configuro o VPN?',
      descricao: 'Não consigo acessar a VPN pelo Mac.',
      tags: ['vpn', 'mac']
    };

    const result = await useCase.execute(input);

    expect(result.id).toBeDefined();
    expect(result.titulo).toBe('Como configuro o VPN?');
    expect(result.status).toBe('ABERTA');
    
    expect(mockPerguntaRepository.save).toHaveBeenCalledTimes(1);
    expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw Error when user is not verified', async () => {
    const input = {
      securityContext: { userId: '123', roles: ['ROLE_MEMBER'], isVerified: false },
      titulo: 'Como configuro o VPN?',
      descricao: 'Não consigo acessar a VPN pelo Mac.',
      tags: ['vpn', 'mac']
    };

    await expect(useCase.execute(input)).rejects.toThrow('E-mail não verificado. Confirme seu e-mail para publicar.');
    expect(mockPerguntaRepository.save).not.toHaveBeenCalled();
  });
});
