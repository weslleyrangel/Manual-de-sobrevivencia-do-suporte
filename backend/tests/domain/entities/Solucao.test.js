const Solucao = require('../../../src/domain/entities/Solucao');

describe('Solucao Entity', () => {
  it('creates a valid Solucao', () => {
    const solucao = Solucao.criar({
      perguntaId: 'p-123',
      authorId: 'u-456',
      descricaoPassoAPasso: 'Para resolver isso, você deve seguir estes passos detalhados e limpar o cache do navegador.',
      anexosUrls: ['http://example.com/print1.png']
    });

    expect(solucao.id).toBeDefined();
    expect(solucao.perguntaId).toBe('p-123');
    expect(solucao.authorId).toBe('u-456');
    expect(solucao.descricaoPassoAPasso).toMatch(/Para resolver isso/);
    expect(solucao.dataCriacao).toBeInstanceOf(Date);
  });

  it('throws Error if descricaoPassoAPasso is too short (< 20 chars)', () => {
    expect(() => {
      Solucao.criar({
        perguntaId: 'p-123',
        authorId: 'u-456',
        descricaoPassoAPasso: 'Curto demais', // 12 chars
        anexosUrls: []
      });
    }).toThrow('O passo a passo da solução deve ter no mínimo 20 caracteres.');
  });

  it('can update its content', () => {
    const solucao = Solucao.criar({
      perguntaId: 'p-123',
      authorId: 'u-456',
      descricaoPassoAPasso: 'Para resolver isso, você deve seguir estes passos detalhados e limpar o cache do navegador.',
      anexosUrls: []
    });

    solucao.atualizarConteudo({
      novaDescricaoPassoAPasso: 'Agora a descrição foi atualizada com mais detalhes importantes para a resolução.',
      novosAnexosUrls: ['http://example.com/new.png']
    });

    expect(solucao.descricaoPassoAPasso).toBe('Agora a descrição foi atualizada com mais detalhes importantes para a resolução.');
    expect(solucao.anexosUrls).toContain('http://example.com/new.png');
    expect(solucao.editadoEm).toBeInstanceOf(Date);
  });

  it('throws Error if updated content is too short', () => {
    const solucao = Solucao.criar({
      perguntaId: 'p-123',
      authorId: 'u-456',
      descricaoPassoAPasso: 'Para resolver isso, você deve seguir estes passos detalhados e limpar o cache do navegador.',
      anexosUrls: []
    });

    expect(() => {
      solucao.atualizarConteudo({
        novaDescricaoPassoAPasso: 'Curto'
      });
    }).toThrow('O passo a passo da solução deve ter no mínimo 20 caracteres.');
  });
});
