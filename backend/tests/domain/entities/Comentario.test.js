const Comentario = require('../../../src/domain/entities/Comentario');

describe('Comentario Entity', () => {
  it('creates a valid Comentario', () => {
    const comentario = Comentario.criar({
      tipoRecurso: 'PERGUNTA',
      recursoAlvoId: 'p-1',
      authorId: 'u-123',
      texto: 'Isso também acontece no Windows 11?'
    });

    expect(comentario.id).toBeDefined();
    expect(comentario.tipoRecurso).toBe('PERGUNTA');
    expect(comentario.texto).toBe('Isso também acontece no Windows 11?');
    expect(comentario.criadoEm).toBeInstanceOf(Date);
  });

  it('throws error if text is too short', () => {
    expect(() => {
      Comentario.criar({
        tipoRecurso: 'PERGUNTA',
        recursoAlvoId: 'p-1',
        authorId: 'u-123',
        texto: 'abc' // 3 chars
      });
    }).toThrow('O comentário deve ter entre 5 e 500 caracteres.');
  });

  it('throws error if text is too long', () => {
    expect(() => {
      Comentario.criar({
        tipoRecurso: 'PERGUNTA',
        recursoAlvoId: 'p-1',
        authorId: 'u-123',
        texto: 'A'.repeat(501)
      });
    }).toThrow('O comentário deve ter entre 5 e 500 caracteres.');
  });
});
