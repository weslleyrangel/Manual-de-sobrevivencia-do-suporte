const Pergunta = require('../../../src/domain/entities/Pergunta');

describe('Pergunta Entity', () => {
  it('creates a valid Pergunta with initial status ABERTA', () => {
    const pergunta = Pergunta.criar({
      titulo: 'Como resetar a senha do portal?',
      descricao: 'Não consigo acessar o portal mesmo após resetar a senha no AD.',
      tags: ['acesso', 'senha', 'portal'],
      categoriaId: '1',
      authorId: '123'
    });

    expect(pergunta.id).toBeDefined();
    expect(pergunta.titulo).toBe('Como resetar a senha do portal?');
    expect(pergunta.status).toBe('ABERTA');
    expect(pergunta.dataCriacao).toBeInstanceOf(Date);
  });

  it('throws Error if titulo is too short (< 10 chars)', () => {
    expect(() => {
      Pergunta.criar({
        titulo: 'Curto',
        descricao: 'Descrição longa o suficiente.',
        tags: ['tag1'],
        authorId: '123'
      });
    }).toThrow('O título deve ter entre 10 e 150 caracteres.');
  });

  it('throws Error if titulo is too long (> 150 chars)', () => {
    expect(() => {
      Pergunta.criar({
        titulo: 'A'.repeat(151),
        descricao: 'Descrição longa o suficiente.',
        tags: ['tag1'],
        authorId: '123'
      });
    }).toThrow('O título deve ter entre 10 e 150 caracteres.');
  });

  it('throws Error if descricao is missing', () => {
    expect(() => {
      Pergunta.criar({
        titulo: 'Título válido o suficiente',
        descricao: '',
        tags: ['tag1'],
        authorId: '123'
      });
    }).toThrow('A descrição é obrigatória.');
  });

  it('throws Error if tags count is outside 1 to 5', () => {
    expect(() => {
      Pergunta.criar({
        titulo: 'Título válido o suficiente',
        descricao: 'Descrição válida',
        tags: [], // zero tags
        authorId: '123'
      });
    }).toThrow('A pergunta deve ter entre 1 e 5 tags.');

    expect(() => {
      Pergunta.criar({
        titulo: 'Título válido o suficiente',
        descricao: 'Descrição válida',
        tags: ['1', '2', '3', '4', '5', '6'], // 6 tags
        authorId: '123'
      });
    }).toThrow('A pergunta deve ter entre 1 e 5 tags.');
  });

  it('accepts a solution and changes status to RESOLVIDA', () => {
    const pergunta = Pergunta.criar({
      titulo: 'Título válido o suficiente',
      descricao: 'Descrição válida',
      tags: ['tag1'],
      authorId: '123'
    });

    pergunta.marcarSolucaoAceita('sol-999');

    expect(pergunta.status).toBe('RESOLVIDA');
    expect(pergunta.solucaoAceitaId).toBe('sol-999');
  });

  it('can be closed administratively', () => {
    const pergunta = Pergunta.criar({
      titulo: 'Título válido o suficiente',
      descricao: 'Descrição válida',
      tags: ['tag1'],
      authorId: '123'
    });

    pergunta.encerrarAdministrativamente({
      tecnicoId: 'tec-456',
      motivo: 'DUPLICADA',
      justificativaTecnica: 'Esta pergunta já foi respondida em outro tópico.'
    });

    expect(pergunta.status).toBe('FECHADA_ADMINISTRATIVAMENTE');
    expect(pergunta.encerradoEm).toBeInstanceOf(Date);
  });

  it('checks if question is closed', () => {
    const pergunta = Pergunta.criar({
      titulo: 'Título válido o suficiente',
      descricao: 'Descrição válida',
      tags: ['tag1'],
      authorId: '123'
    });

    expect(pergunta.isFechada()).toBe(false);

    pergunta.encerrarAdministrativamente({
      tecnicoId: 'tec-456',
      motivo: 'DUPLICADA',
      justificativaTecnica: 'Esta pergunta já foi respondida em outro tópico.'
    });

    expect(pergunta.isFechada()).toBe(true);
  });
});
