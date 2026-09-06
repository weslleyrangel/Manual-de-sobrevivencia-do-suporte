const { DomainError } = require('../domain/errors/DomainErrors');

module.exports = (err, req, res, next) => {
    // Se for um erro do nosso domínio, conhecemos a estrutura e o status
    if (err instanceof DomainError) {
        return res.status(err.statusCode || 400).json({
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Tratamento específico para erros conhecidos de infra/banco
    if (err.code === '23505') { // Erro de unicidade do PostgreSQL
        return res.status(400).json({ error: 'Este registro já existe no sistema.' });
    }

    // Log real no servidor
    console.error('Unhandled Error:', err);

    // Resposta mascarada para o cliente (evita vazar stacktrace de infraestrutura em prod)
    return res.status(500).json({
        error: 'Erro interno no servidor.',
        ...(process.env.NODE_ENV === 'development' && { details: err.message, stack: err.stack })
    });
};
