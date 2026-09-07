const CriarPerguntaUseCase = require('../application/use-cases/CriarPerguntaUseCase');
const PublicarSolucaoUseCase = require('../application/use-cases/PublicarSolucaoUseCase');
const AceitarSolucaoUseCase = require('../application/use-cases/AceitarSolucaoUseCase');
const EditarSolucaoUseCase = require('../application/use-cases/EditarSolucaoUseCase');
const EncerrarPerguntaAdministrativamenteUseCase = require('../application/use-cases/EncerrarPerguntaAdministrativamenteUseCase');
const perguntaRepository = require('../infrastructure/database/PerguntaRepository');
const solucaoRepository = require('../infrastructure/database/SolucaoRepository');
const { DomainError, UnauthorizedError } = require('../domain/errors/DomainErrors');

// Tratamento de erros delegado ao errorHandler.js via next(error)

// 1. Listar Perguntas (Leitura desacoplada / CQRS)
exports.listProblems = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const category = req.query.category;
        const author_id = req.query.author_id;

        const problems = await perguntaRepository.listWithAuthors({ page, limit, category, author_id });
        return res.status(200).json(problems);
    } catch (error) {
        next(error);
    }
};

// 2. Detalhes de Pergunta com Soluções (Leitura desacoplada / CQRS)
exports.getProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const problem = await perguntaRepository.getWithSolutions(id);

        if (!problem) {
            return res.status(404).json({ error: 'Pergunta não encontrada.' });
        }

        return res.status(200).json(problem);
    } catch (error) {
        next(error);
    }
};

// 3. Criar Pergunta (Caso de Uso DDD)
exports.createProblem = async (req, res, next) => {
    try {
        const securityContext = req.securityContext;
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
        next(error);
    }
};

// 4. Publicar Solução (Caso de Uso DDD)
exports.addSolution = async (req, res, next) => {
    try {
        const securityContext = req.securityContext;
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
        next(error);
    }
};

// 5. Aceitar Solução Oficial (Caso de Uso ABAC)
exports.acceptSolution = async (req, res, next) => {
    try {
        const securityContext = req.securityContext;
        const { id: problem_id, solutionId } = req.params;
        const { desmarcar } = req.body || {};

        const useCase = new AceitarSolucaoUseCase({ 
            perguntaRepository, 
            solucaoRepository 
        });

        const result = await useCase.execute({
            securityContext,
            perguntaId: problem_id,
            solucaoId: solutionId === 'unaccept' ? null : solutionId,
            desmarcar: Boolean(desmarcar || solutionId === 'unaccept')
        });

        return res.status(200).json({ 
            message: (desmarcar || solutionId === 'unaccept') ? 'Solução desmarcada com sucesso.' : 'Solução aceita com sucesso.', 
            acceptedSolutionId: result.solucaoAceitaId,
            status: result.status,
            marcadoPorAdmin: result.marcadoPorAdmin
        });
    } catch (error) {
        next(error);
    }
};

// 6. Editar Solução (Caso de Uso ABAC)
exports.editSolution = async (req, res, next) => {
    try {
        const securityContext = req.securityContext;
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
        next(error);
    }
};

// 7. Encerrar Pergunta Administrativamente (Caso de Uso RBAC)
exports.closeProblemAdmin = async (req, res, next) => {
    try {
        const securityContext = req.securityContext;
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
        next(error);
    }
};
