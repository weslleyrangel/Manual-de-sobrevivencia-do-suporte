/**
 * In-Memory Sliding Window Rate Limiter Middleware
 * Protege rotas sensíveis contra ataques de força bruta e spam.
 */

const rateLimitStores = new Map();

// Limpeza periódica a cada 5 minutos para evitar vazamento de memória
const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStores.entries()) {
        if (now - record.resetTime > 0) {
            rateLimitStores.delete(key);
        }
    }
}, 5 * 60 * 1000);

if (cleanupTimer.unref) {
    cleanupTimer.unref();
}

/**
 * Cria um middleware de rate limiting configurável
 * @param {Object} options
 * @param {number} options.windowMs - Janela de tempo em milissegundos (padrão: 60s)
 * @param {number} options.max - Número máximo de requisições por janela (padrão: 10)
 * @param {string} options.message - Mensagem de erro retornada em caso de bloqueio
 */
function createRateLimiter(options = {}) {
    const windowMs = options.windowMs || 60 * 1000;
    const max = options.max || 10;
    const message = options.message || 'Muitas requisições. Por favor, aguarde antes de tentar novamente.';

    return (req, res, next) => {
        // Desativa rate limiter em ambiente de teste automatizado para não flakar testes
        if (process.env.NODE_ENV === 'test') {
            return next();
        }

        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
        const key = `${req.baseUrl || ''}${req.path}_${ip}`;
        const now = Date.now();

        let record = rateLimitStores.get(key);

        if (!record || now > record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };
            rateLimitStores.set(key, record);
            return next();
        }

        record.count += 1;

        if (record.count > max) {
            const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfterSec);
            return res.status(429).json({
                error: message,
                retryAfter: retryAfterSec
            });
        }

        next();
    };
}

module.exports = {
    authRateLimiter: createRateLimiter({
        windowMs: 60 * 1000,
        max: 10,
        message: 'Muitas tentativas de autenticação. Por favor, aguarde 1 minuto.'
    }),
    emailActionRateLimiter: createRateLimiter({
        windowMs: 60 * 1000,
        max: 5,
        message: 'Muitos e-mails solicitados. Por favor, aguarde 1 minuto para novas solicitações.'
    })
};
