# Arquitetura de Casos de Uso (DDD & Clean Architecture em Node.js)

Este documento especifica a **camada de aplicação (`application/use-cases`)** do sistema de **Base de Conhecimento e Suporte Técnico Colaborativo**, desenvolvida em **Node.js (JavaScript/TypeScript)** seguindo os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **Segurança Híbrida (RBAC + ABAC)**.

---

## 1. Princípios Arquiteturais e Mapeamento de Camadas (Node.js)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRAMEWORKS & DRIVERS (Infra)                       │
│      Controllers Express, jsonwebtoken, pg (PostgreSQL Client)          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     INTERFACE ADAPTERS (HTTP)                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                APPLICATION (Use Cases / DTOs)               │  │  │
│  │  │  ┌───────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                DOMAIN (Entities & Services)            │  │  │  │
│  │  │  │   Pergunta, Solucao, Comentario, Eventos de Domínio    │  │  │  │
│  │  │  └───────────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Estrutura de Pastas Sugerida no Backend (`backend/src/`):
```text
src/
├── domain/                  # Camada de Domínio (Sem dependências externas)
│   ├── entities/            # Pergunta.js, Solucao.js, Comentario.js, Usuario.js
│   ├── events/              # PerguntaCriadaEvent.js, SolucaoAceitaEvent.js
│   └── value-objects/       # MotivoEncerramento.js, StatusPergunta.js
├── application/             # Camada de Aplicação (Use Cases & Ports)
│   ├── use-cases/           # CriarPerguntaUseCase.js, AceitarSolucaoUseCase.js...
│   ├── dtos/                # Commands e Responses DTOs
│   └── ports/               # PerguntaRepositoryPort.js, EventPublisherPort.js
├── infrastructure/          # Camada de Infraestrutura
│   ├── database/            # PostgresPerguntaRepository.js (usando pg)
│   └── messaging/           # EventEmitterPublisher.js
└── presentation/            # Camada de Apresentação (Express)
    ├── controllers/         # PerguntaController.js
    └── middlewares/         # authMiddleware.js (popula req.securityContext)
```

---

## 2. Detalhamento dos Casos de Uso (Node.js / JS / TS)

---

### UC-01: `CriarPerguntaUseCase`

* **Ator Principal:** Usuário Autenticado (`ROLE_USUARIO`, `ROLE_TECNICO`, `ROLE_ADMIN`).
* **Modelo de Autorização:**
  * **RBAC:** Requer papel de membro ativo (`ROLE_USUARIO`, `ROLE_TECNICO`, `ROLE_ADMIN`).
  * **ABAC:** `securityContext.isVerified === true` (exige conta com e-mail verificado).
* **Input (Command DTO / Payload JS):**
  ```typescript
  interface CriarPerguntaCommand {
    securityContext: {
      userId: string;
      roles: string[];
      isVerified: boolean;
    };
    titulo: string;
    descricao: string;
    tags: string[];
    categoriaId?: string;
  }
  ```
* **Regras de Negócio e Invariantes Validadas:**
  1. **Validação de Verificação:** Se `!securityContext.isVerified`, lança `AccountUnverifiedError`.
  2. **Invariantes da Entidade Pergunta:** Título entre 10 e 150 caracteres, descrição obrigatória, número de tags entre 1 e 5.
  3. **Estado Inicial:** Instância da entidade `Pergunta` nasce com status `ABERTA`.
* **Output / Eventos de Domínio:**
  * **Output:** Object `{ id, titulo, status, authorId, dataCriacao }`.
  * **Evento Disparado:** `PerguntaCriadaEvent({ perguntaId, authorId, titulo, dataCriacao })`.
* **Esboço do Código em Node.js (Clean Architecture):**
  ```javascript
  // application/use-cases/CriarPerguntaUseCase.js
  export class CriarPerguntaUseCase {
    constructor({ perguntaRepository, eventPublisher }) {
      this.perguntaRepository = perguntaRepository;
      this.eventPublisher = eventPublisher;
    }

    async execute({ securityContext, titulo, descricao, tags, categoriaId }) {
      if (!securityContext.isVerified) {
        throw new Error('E-mail não verificado. Confirme seu e-mail para publicar.');
      }

      // Entidade rica de domínio valida invariantes de tamanho e formato
      const novaPergunta = Pergunta.criar({
        titulo,
        descricao,
        tags,
        categoriaId,
        authorId: securityContext.userId
      });

      await this.perguntaRepository.save(novaPergunta);
      await this.eventPublisher.publish(new PerguntaCriadaEvent(novaPergunta));

      return {
        id: novaPergunta.id,
        titulo: novaPergunta.titulo,
        status: novaPergunta.status,
        authorId: novaPergunta.authorId,
        dataCriacao: novaPergunta.dataCriacao
      };
    }
  }
  ```

---

### UC-02: `PublicarSolucaoUseCase`

* **Ator Principal:** Usuário Autenticado (`ROLE_USUARIO`, `ROLE_TECNICO`, `ROLE_ADMIN`).
* **Modelo de Autorização:**
  * **RBAC:** Qualquer membro autenticado.
  * **ABAC:** 
    * `securityContext.isVerified === true`.
    * `pergunta.status === 'ABERTA'` (A pergunta não pode estar encerrada).
* **Input (Command DTO):**
  ```typescript
  interface PublicarSolucaoCommand {
    securityContext: { userId: string; roles: string[]; isVerified: boolean };
    perguntaId: string;
    descricaoPassoAPasso: string;
    anexosUrls?: string[];
  }
  ```
* **Regras de Negócio e Invariantes Validadas:**
  1. **Disponibilidade da Pergunta:** A pergunta deve existir e estar com status `ABERTA`. Se estiver `FECHADA` ou `RESOLVIDA`, lança `PerguntaFechadaError`.
  2. **Validação de Conteúdo:** O passo a passo deve ter no mínimo 20 caracteres detalhados.
  3. **Multiplicidade:** Qualquer usuário verificado pode adicionar uma solução alternativa (colaboração estilo Stack Overflow).
* **Esboço do Código em Node.js:**
  ```javascript
  // application/use-cases/PublicarSolucaoUseCase.js
  export class PublicarSolucaoUseCase {
    constructor({ perguntaRepository, solucaoRepository, eventPublisher }) {
      this.perguntaRepository = perguntaRepository;
      this.solucaoRepository = solucaoRepository;
      this.eventPublisher = eventPublisher;
    }

    async execute({ securityContext, perguntaId, descricaoPassoAPasso, anexosUrls }) {
      if (!securityContext.isVerified) {
        throw new Error('Conta não verificada.');
      }

      const pergunta = await this.perguntaRepository.findById(perguntaId);
      if (!pergunta) throw new Error('Pergunta não encontrada.');
      if (pergunta.isFechada()) throw new Error('Não é possível adicionar soluções a perguntas encerradas.');

      const solucao = Solucao.criar({
        perguntaId,
        authorId: securityContext.userId,
        descricaoPassoAPasso,
        anexosUrls
      });

      await this.solucaoRepository.save(solucao);
      await this.eventPublisher.publish(new SolucaoPublicadaEvent(solucao, pergunta));

      return {
        id: solucao.id,
        perguntaId: solucao.perguntaId,
        authorId: solucao.authorId,
        dataCriacao: solucao.dataCriacao
      };
    }
  }
  ```

---

### UC-03: `EditarSolucaoUseCase`

* **Ator Principal:** Autor da Solução (`securityContext.userId === solucao.authorId`).
* **Modelo de Autorização:**
  * **RBAC:** `ROLE_USUARIO`, `ROLE_TECNICO`, `ROLE_ADMIN`.
  * **ABAC (Ownership Strict):** 
    * `securityContext.userId === solucao.authorId` (Apenas o próprio criador da resposta pode alterá-la).
    * `securityContext.isVerified === true`.
* **Input (Command DTO):**
  ```typescript
  interface EditarSolucaoCommand {
    securityContext: { userId: string; roles: string[]; isVerified: boolean };
    solucaoId: string;
    novaDescricaoPassoAPasso: string;
    novosAnexosUrls?: string[];
  }
  ```
* **Regras de Negócio e Invariantes Validadas:**
  1. **Trava de Propriedade (Ownership Check):** Se `solucao.authorId !== securityContext.userId`, lança `ForbiddenError('Apenas o autor pode editar sua solução.')`.
  2. **Mutação do Agregado:** A entidade `Solucao` altera seu texto e atualiza `editadoEm = new Date()`.
* **Esboço do Código em Node.js:**
  ```javascript
  // application/use-cases/EditarSolucaoUseCase.js
  export class EditarSolucaoUseCase {
    constructor({ solucaoRepository, eventPublisher }) {
      this.solucaoRepository = solucaoRepository;
      this.eventPublisher = eventPublisher;
    }

    async execute({ securityContext, solucaoId, novaDescricaoPassoAPasso, novosAnexosUrls }) {
      const solucao = await this.solucaoRepository.findById(solucaoId);
      if (!solucao) throw new Error('Solução não encontrada.');

      // Validação ABAC de Propriedade
      if (solucao.authorId !== securityContext.userId) {
        throw new Error('Acesso negado. Você só pode editar suas próprias soluções.');
      }

      solucao.atualizarConteudo({ novaDescricaoPassoAPasso, novosAnexosUrls });

      await this.solucaoRepository.update(solucao);
      await this.eventPublisher.publish(new SolucaoEditadaEvent(solucao));

      return { id: solucao.id, editadoEm: solucao.editadoEm };
    }
  }
  ```

---

### UC-04: `AceitarSolucaoUseCase`

* **Ator Principal:** Autor da Pergunta Original (`securityContext.userId === pergunta.authorId`).
* **Modelo de Autorização:**
  * **RBAC:** Qualquer membro.
  * **ABAC (Ownership Pure):**
    * `securityContext.userId === pergunta.authorId` (Apenas o autor da dúvida tem o direito de indicar qual resposta aceitar).
* **Input (Command DTO):**
  ```typescript
  interface AceitarSolucaoCommand {
    securityContext: { userId: string; roles: string[]; isVerified: boolean };
    perguntaId: string;
    solucaoId: string;
  }
  ```
* **Regras de Negócio e Invariantes Validadas:**
  1. **Validação de Autor da Pergunta:** Se `pergunta.authorId !== securityContext.userId`, lança `ForbiddenError('Apenas o criador da pergunta pode aceitar uma solução.')`.
  2. **Pertencimento:** A solução fornecida deve pertencer à pergunta informada (`solucao.perguntaId === pergunta.id`).
  3. **Transição de Estado no Agregado:** Chamada de método rico `pergunta.marcarSolucaoAceita(solucaoId)`, alterando o status para `RESOLVIDA`.
* **Esboço do Código em Node.js:**
  ```javascript
  // application/use-cases/AceitarSolucaoUseCase.js
  export class AceitarSolucaoUseCase {
    constructor({ perguntaRepository, solucaoRepository, eventPublisher }) {
      this.perguntaRepository = perguntaRepository;
      this.solucaoRepository = solucaoRepository;
      this.eventPublisher = eventPublisher;
    }

    async execute({ securityContext, perguntaId, solucaoId }) {
      const pergunta = await this.perguntaRepository.findById(perguntaId);
      if (!pergunta) throw new Error('Pergunta não encontrada.');

      // ABAC: Apenas o autor da pergunta pode aceitar a solução
      if (pergunta.authorId !== securityContext.userId) {
        throw new Error('Apenas o autor da pergunta pode marcar uma solução como aceita.');
      }

      const solucao = await this.solucaoRepository.findById(solucaoId);
      if (!solucao || solucao.perguntaId !== perguntaId) {
        throw new Error('Solução inválida ou não pertence a este problema.');
      }

      // Método de domínio encapsula a mudança de estado
      pergunta.marcarSolucaoAceita(solucao.id);

      await this.perguntaRepository.update(pergunta);
      await this.eventPublisher.publish(new SolucaoAceitaEvent(pergunta, solucao));

      return {
        perguntaId: pergunta.id,
        solucaoAceitaId: pergunta.solucaoAceitaId,
        status: pergunta.status
      };
    }
  }
  ```

---

### UC-05: `EncerrarPerguntaAdministrativamenteUseCase`

* **Ator Principal:** Técnico de Suporte N2/N3 ou Administrador (`ROLE_TECNICO`, `ROLE_ADMIN`).
* **Modelo de Autorização:**
  * **RBAC:** Requer a role de suporte `ROLE_TECNICO` ou `ROLE_ADMIN`. Membros comuns (`ROLE_USUARIO`) são bloqueados.
  * **ABAC:**
    * Exige informativos contextuais: `motivo` (`'INATIVIDADE'`, `'DUPLICADA'`, `'FORA_DE_ESCOPO'`, `'RESOLVIDA_EXTERNAMENTE'`).
    * Exige uma `justificativaTecnica` textual obrigatória com no mínimo 15 caracteres para auditoria.
* **Input (Command DTO):**
  ```typescript
  interface EncerrarPerguntaAdministrativamenteCommand {
    securityContext: { userId: string; roles: string[]; isVerified: boolean };
    perguntaId: string;
    motivo: 'INATIVIDADE' | 'DUPLICADA' | 'FORA_DE_ESCOPO' | 'RESOLVIDA_EXTERNAMENTE';
    justificativaTecnica: string;
  }
  ```
* **Regras de Negócio e Invariantes Validadas:**
  1. **Trava de Papel de Suporte (RBAC):** Se `!securityContext.roles.includes('ROLE_TECNICO') && !securityContext.roles.includes('ROLE_ADMIN')`, lança `ForbiddenError('Apenas a equipe de Suporte/Admin pode encerrar perguntas administrativamente.')`.
  2. **Invariante de Justificativa:** A justificativa é obrigatória e deve ter pelo menos 15 caracteres.
  3. **Transição de Estado e Auditoria:** Chamada `pergunta.encerrarAdministrativamente(tecnicoId, motivo, justificativa)`. Status muda para `FECHADA_ADMINISTRATIVAMENTE`.
* **Esboço do Código em Node.js:**
  ```javascript
  // application/use-cases/EncerrarPerguntaAdministrativamenteUseCase.js
  export class EncerrarPerguntaAdministrativamenteUseCase {
    constructor({ perguntaRepository, auditLogGateway, eventPublisher }) {
      this.perguntaRepository = perguntaRepository;
      this.auditLogGateway = auditLogGateway;
      this.eventPublisher = eventPublisher;
    }

    async execute({ securityContext, perguntaId, motivo, justificativaTecnica }) {
      const isTecnicoOuAdmin = securityContext.roles.some(r => ['ROLE_TECNICO', 'ROLE_ADMIN'].includes(r));
      if (!isTecnicoOuAdmin) {
        throw new Error('Acesso negado. Requer permissão de Suporte Técnico ou Admin.');
      }

      if (!justificativaTecnica || justificativaTecnica.trim().length < 15) {
        throw new Error('Uma justificativa técnica de no mínimo 15 caracteres é obrigatória.');
      }

      const pergunta = await this.perguntaRepository.findById(perguntaId);
      if (!pergunta) throw new Error('Pergunta não encontrada.');

      // Encapsulamento da regra no agregado
      pergunta.encerrarAdministrativamente({
        tecnicoId: securityContext.userId,
        motivo,
        justificativaTecnica
      });

      await this.perguntaRepository.update(pergunta);
      await this.auditLogGateway.log({
        action: 'ENCERRAMENTO_ADMINISTRATIVO',
        perguntaId,
        executedBy: securityContext.userId,
        motivo,
        justificativaTecnica
      });

      await this.eventPublisher.publish(new PerguntaEncerradaAdministrativamenteEvent(pergunta));

      return {
        perguntaId: pergunta.id,
        status: pergunta.status,
        encerradoPor: securityContext.userId,
        motivo,
        encerradoEm: pergunta.encerradoEm
      };
    }
  }
  ```

---

### UC-06: `IncluirComentarioUseCase`

* **Ator Principal:** Qualquer Usuário Verificado (`ROLE_USUARIO`, `ROLE_TECNICO`, `ROLE_ADMIN`).
* **Modelo de Autorização:**
  * **RBAC:** `ROLE_USUARIO`, `ROLE_TECNICO`, `ROLE_ADMIN`.
  * **ABAC:**
    * `securityContext.isVerified === true`.
    * O recurso alvo (Pergunta ou Solução) não pode estar no status `FECHADA_ADMINISTRATIVAMENTE`.
* **Input (Command DTO):**
  ```typescript
  interface IncluirComentarioCommand {
    securityContext: { userId: string; roles: string[]; isVerified: boolean };
    tipoRecurso: 'PERGUNTA' | 'SOLUCAO';
    recursoAlvoId: string;
    textoComentario: string;
  }
  ```
* **Regras de Negócio e Invariantes Validadas:**
  1. **Estado do Recurso:** Não é permitido comentar em tópicos encerrados administrativamente.
  2. **Tamanho do Comentário:** Entre 5 e 500 caracteres (interação rápida de esclarecimento).
* **Esboço do Código em Node.js:**
  ```javascript
  // application/use-cases/IncluirComentarioUseCase.js
  export class IncluirComentarioUseCase {
    constructor({ perguntaRepository, solucaoRepository, comentarioRepository, eventPublisher }) {
      this.perguntaRepository = perguntaRepository;
      this.solucaoRepository = solucaoRepository;
      this.comentarioRepository = comentarioRepository;
      this.eventPublisher = eventPublisher;
    }

    async execute({ securityContext, tipoRecurso, recursoAlvoId, textoComentario }) {
      if (!securityContext.isVerified) throw new Error('Conta não verificada.');

      if (tipoRecurso === 'PERGUNTA') {
        const pergunta = await this.perguntaRepository.findById(recursoAlvoId);
        if (!pergunta) throw new Error('Pergunta não encontrada.');
        if (pergunta.status === 'FECHADA_ADMINISTRATIVAMENTE') {
          throw new Error('Não é possível comentar em uma pergunta encerrada administrativamente.');
        }
      }

      const comentario = Comentario.criar({
        tipoRecurso,
        recursoAlvoId,
        authorId: securityContext.userId,
        texto: textoComentario
      });

      await this.comentarioRepository.save(comentario);
      await this.eventPublisher.publish(new ComentarioIncluidoEvent(comentario));

      return {
        id: comentario.id,
        recursoAlvoId: comentario.recursoAlvoId,
        authorId: comentario.authorId,
        criadoEm: comentario.criadoEm
      };
    }
  }
  ```

---

## 3. Matriz Resumo de Autorização (Node.js Clean Arch)

| Use Case | Role Exigida (RBAC) | Atributo Contextual Exigido (ABAC) | Evento de Domínio Disparado |
| :--- | :--- | :--- | :--- |
| **`CriarPerguntaUseCase`** | `ROLE_USUARIO`+ | `isVerified === true` | `PerguntaCriadaEvent` |
| **`PublicarSolucaoUseCase`** | `ROLE_USUARIO`+ | `isVerified === true` AND `pergunta.status === 'ABERTA'` | `SolucaoPublicadaEvent` |
| **`EditarSolucaoUseCase`** | `ROLE_USUARIO`+ | `securityContext.userId === solucao.authorId` | `SolucaoEditadaEvent` |
| **`AceitarSolucaoUseCase`** | `ROLE_USUARIO`+ | `securityContext.userId === pergunta.authorId` | `SolucaoAceitaEvent` |
| **`EncerrarPerguntaAdministrativamenteUseCase`** | `ROLE_TECNICO` / `ROLE_ADMIN` | Exige `motivo` + `justificativa` (>15 chars) | `PerguntaEncerradaAdministrativamenteEvent` |
| **`IncluirComentarioUseCase`** | `ROLE_USUARIO`+ | `isVerified === true` AND `recurso.status !== 'FECHADA'` | `ComentarioIncluidoEvent` |
