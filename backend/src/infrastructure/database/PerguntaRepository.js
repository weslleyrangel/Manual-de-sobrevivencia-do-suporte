const db = require('../../config/db');
const Pergunta = require('../../domain/entities/Pergunta');

class PerguntaRepository {
  async save(pergunta) {
    const result = await db.query(
      'INSERT INTO problems (title, description, author_id, status, category) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at',
      [pergunta.titulo, pergunta.descricao, pergunta.authorId, pergunta.status, pergunta.categoriaId || 'Atendimento']
    );
    pergunta.id = result.rows[0].id.toString();
    pergunta.dataCriacao = result.rows[0].created_at;
  }

  async findById(id) {
    const result = await db.query('SELECT * FROM problems WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new Pergunta({
      id: row.id.toString(),
      titulo: row.title,
      descricao: row.description,
      categoriaId: row.category,
      authorId: row.author_id ? row.author_id.toString() : null,
      status: row.status,
      dataCriacao: row.created_at,
      solucaoAceitaId: row.accepted_solution_id ? row.accepted_solution_id.toString() : null,
      closingReason: row.closing_reason,
      closedAt: row.closed_at
    });
  }

  async update(pergunta) {
    await db.query(
      'UPDATE problems SET status = $1, accepted_solution_id = $2, closing_reason = $3, closed_at = $4 WHERE id = $5',
      [
        pergunta.status,
        pergunta.solucaoAceitaId,
        pergunta.closingReason || null,
        pergunta.closedAt || null,
        pergunta.id
      ]
    );
  }

  // --- Métodos de Leitura Otimizados (CQRS / Read Models) ---
  async listWithAuthors({ page = 1, limit = 50, category, author_id } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    let sql = `
      SELECT p.id, p.title, p.category, p.description, p.status, p.views_count, p.likes_count,
             p.accepted_solution_id, p.closing_reason, p.closed_at, p.created_at,
             u.id as author_id, u.name as author_name, u.role as author_role, u.job_title as author_job_title,
             (SELECT COUNT(*) FROM solutions s WHERE s.problem_id = p.id)::int as solutions_count
      FROM problems p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE 1=1
    `;

    if (category) {
      params.push(category);
      sql += ` AND p.category = $${params.length}`;
    }

    if (author_id) {
      params.push(author_id);
      sql += ` AND p.author_id = $${params.length}`;
    }

    params.push(limit);
    sql += ` ORDER BY p.created_at DESC LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const result = await db.query(sql, params);
    return result ? result.rows : [];
  }

  async getWithSolutions(id) {
    const problemResult = await db.query(`
      SELECT p.id, p.title, p.category, p.description, p.status, p.views_count, p.likes_count,
             p.accepted_solution_id, p.closing_reason, p.closed_at, p.created_at,
             u.id as author_id, u.name as author_name, u.role as author_role, u.job_title as author_job_title
      FROM problems p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (!problemResult || problemResult.rows.length === 0) {
      return null;
    }

    const problem = problemResult.rows[0];

    const solutionsResult = await db.query(`
      SELECT s.id, s.problem_id, s.content, s.steps, s.media_urls, s.is_primary, s.created_at,
             u.id as author_id, u.name as author_name, u.role as author_role
      FROM solutions s
      LEFT JOIN users u ON s.author_id = u.id
      WHERE s.problem_id = $1
      ORDER BY s.is_primary DESC, s.created_at ASC
    `, [id]);

    problem.solutions = solutionsResult ? solutionsResult.rows : [];
    return problem;
  }
}

module.exports = new PerguntaRepository();
