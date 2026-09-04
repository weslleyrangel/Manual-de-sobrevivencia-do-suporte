const db = require('../../config/db');
const Solucao = require('../../domain/entities/Solucao');

class SolucaoRepository {
  async save(solucao) {
    const result = await db.query(
      'INSERT INTO solutions (problem_id, author_id, content, media_urls) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      [solucao.perguntaId, solucao.authorId, solucao.descricaoPassoAPasso, solucao.anexosUrls]
    );
    solucao.id = result.rows[0].id.toString();
    solucao.dataCriacao = result.rows[0].created_at;
  }

  async findById(id) {
    const result = await db.query('SELECT * FROM solutions WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new Solucao({
      id: row.id.toString(),
      perguntaId: row.problem_id.toString(),
      authorId: row.author_id ? row.author_id.toString() : null,
      descricaoPassoAPasso: row.content,
      anexosUrls: row.media_urls || [],
      dataCriacao: row.created_at
    });
  }

  async update(solucao) {
    await db.query(
      'UPDATE solutions SET content = $1, media_urls = $2 WHERE id = $3',
      [solucao.descricaoPassoAPasso, solucao.anexosUrls, solucao.id]
    );
  }
}

module.exports = new SolucaoRepository();
