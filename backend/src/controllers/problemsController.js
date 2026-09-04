const CriarPerguntaUseCase = require('../application/use-cases/CriarPerguntaUseCase');
const PublicarSolucaoUseCase = require('../application/use-cases/PublicarSolucaoUseCase');
const AceitarSolucaoUseCase = require('../application/use-cases/AceitarSolucaoUseCase');
const EditarSolucaoUseCase = require('../application/use-cases/EditarSolucaoUseCase');
const EncerrarPerguntaAdministrativamenteUseCase = require('../application/use-cases/EncerrarPerguntaAdministrativamenteUseCase');
const perguntaRepository = require('../infrastructure/database/PerguntaRepository');
const solucaoRepository = require('../infrastructure/database/SolucaoRepository');
const { DomainError, UnauthorizedError } = require('../domain/errors/DomainErrors');

// Helper para extrair o securityContext de forma estrita
const getSecurityContext = (req) => {
    if (req.securityContext) return req.securityContext;
    if (req.user) {
        return {
            userId: req.user.id || req.user.userId,
            isVerified: req.user.is_verified ?? req.user.isVerified ?? true,
            roles: req.user.role ? [req.user.role] : ['ROLE_USUARIO']
        };
    }
    throw new UnauthorizedError('Sessão inválida ou não autenticada.');
};

// Helper centralizado para tratar respostas de erro
const handleError = (res, error, defaultMsg = 'Server error') => {
    if (error instanceof DomainError) {
        return res.status(error.statusCode || 400).json({ error: error.message });
    }
    console.error(`${defaultMsg}:`, error);
    return res.status(500).json({ error: defaultMsg });
};

// 1. Listar Perguntas (Leitura desacoplada / CQRS)
exports.listProblems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const category = req.query.category;
        const author_id = req.query.author_id;

        const problems = await perguntaRepository.listWithAuthors({ page, limit, category, author_id });
        return res.status(200).json(problems);
    } catch (error) {
        return handleError(res, error, 'Erro ao listar perguntas');
    }
};

// 2. Detalhes de Pergunta com Soluções (Leitura desacoplada / CQRS)
exports.getProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await perguntaRepository.getWithSolutions(id);

        if (!problem) {
            return res.status(404).json({ error: 'Pergunta não encontrada.' });
        }

        return res.status(200).json(problem);
    } catch (error) {
        return handleError(res, error, 'Erro ao buscar pergunta');
    }
};

// 3. Criar Pergunta (Caso de Uso DDD)
exports.createProblem = async (req, res) => {
    try {
        const securityContext = getSecurityContext(req);
        const { title, description, tags, categoriaId, category } = req.body;
        const defaultTags = tags && tags.length > 0 ? tags : ['geral'];

        const useCase = new CriarPerguntaUseCase({ perguntaRepository });
        const result = await useCase.execute({
            securityContext,
            titulo: title,
            descricao: description,
            tags: defaultTags,
            categoriaId: categoriaId || category || 'Atendimento'
        });

        return res.status(201).json({ id: parseInt(result.id) });
    } catch (error) {
        return handleError(res, error, 'Erro ao criar pergunta');
    }
};

// 4. Publicar Solução (Caso de Uso DDD)
exports.addSolution = async (req, res) => {
    try {
        const securityContext = getSecurityContext(req);
        const { id: problem_id } = req.params;
        const { content, media_urls } = req.body;

        const useCase = new PublicarSolucaoUseCase({ 
            perguntaRepository, 
            solucaoRepository 
        });

        const result = await useCase.execute({
            securityContext,
            perguntaId: problem_id,
            descricaoPassoAPasso: content,
            anexosUrls: media_urls
        });

        return res.status(201).json({ solution_id: parseInt(result.id) });
    } catch (error) {
        return handleError(res, error, 'Erro ao adicionar solução');
    }
};

// 5. Aceitar Solução Oficial (Caso de Uso ABAC)
exports.acceptSolution = async (req, res) => {
    try {
        const securityContext = getSecurityContext(req);
        const { id: problem_id, solutionId } = req.params;

        const useCase = new AceitarSolucaoUseCase({ 
            perguntaRepository, 
            solucaoRepository 
        });

        const result = await useCase.execute({
            securityContext,
            perguntaId: problem_id,
            solucaoId: solutionId
        });

        return res.status(200).json({ 
            message: 'Solução aceita com sucesso.', 
            acceptedSolutionId: result.solucaoAceitaId,
            status: result.status 
        });
    } catch (error) {
        return handleError(res, error, 'Erro ao aceitar solução');
    }
};

// 6. Editar Solução (Caso de Uso ABAC)
exports.editSolution = async (req, res) => {
    try {
        const securityContext = getSecurityContext(req);
        const { solutionId } = req.params;
        const { content, media_urls } = req.body;

        const useCase = new EditarSolucaoUseCase({ 
            solucaoRepository 
        });

        const result = await useCase.execute({
            securityContext,
            solucaoId: solutionId,
            novaDescricaoPassoAPasso: content,
            novosAnexosUrls: media_urls
        });

        return res.status(200).json({ 
            message: 'Solução atualizada com sucesso.', 
            solutionId: result.id 
        });
    } catch (error) {
        return handleError(res, error, 'Erro ao editar solução');
    }
};

// 7. Encerrar Pergunta Administrativamente (Caso de Uso RBAC)
exports.closeProblemAdmin = async (req, res) => {
    try {
        const securityContext = getSecurityContext(req);
        const { id: problem_id } = req.params;
        const { reason, motivo, justificativaTecnica } = req.body;

        const justification = reason || justificativaTecnica || motivo;

        const useCase = new EncerrarPerguntaAdministrativamenteUseCase({ 
            perguntaRepository 
        });

        const result = await useCase.execute({
            securityContext,
            perguntaId: problem_id,
            motivo: 'Encerramento Administrativo',
            justificativaTecnica: justification
        });

        return res.status(200).json({ 
            message: 'Pergunta encerrada administrativamente com sucesso.', 
            status: result.status,
            closedAt: result.encerradoEm 
        });
    } catch (error) {
        return handleError(res, error, 'Erro ao encerrar pergunta administrativamente');
    }
};
