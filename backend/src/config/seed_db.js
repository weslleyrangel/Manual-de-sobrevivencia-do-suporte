const bcrypt = require('bcryptjs');
const db = require('./db');

async function runSeed() {
    try {
        console.log('Iniciando seed do banco de dados PostgreSQL...');

        // 1. Criar hash da senha '123'
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('123', salt);

        // 2. Dropar e recriar tabelas
        await db.query('DROP TABLE IF EXISTS solutions, problems, users CASCADE');

        await db.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) DEFAULT 'Analista de Suporte',
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(100) DEFAULT 'Analista de Suporte · Nível 1',
                is_verified BOOLEAN DEFAULT TRUE,
                verification_token VARCHAR(255),
                token_expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query('CREATE INDEX idx_users_email ON users(email)');

        await db.query(`
            CREATE TABLE problems (
                id SERIAL PRIMARY KEY,
                author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) DEFAULT 'Atendimento',
                description TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'RESOLVIDO',
                views_count INTEGER DEFAULT 0,
                likes_count INTEGER DEFAULT 0,
                is_draft BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query('CREATE INDEX idx_problems_author ON problems(author_id)');
        await db.query('CREATE INDEX idx_problems_category ON problems(category)');

        await db.query(`
            CREATE TABLE solutions (
                id SERIAL PRIMARY KEY,
                problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
                author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                content TEXT NOT NULL,
                steps JSONB DEFAULT '[]'::jsonb,
                media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
                is_primary BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query('CREATE INDEX idx_solutions_problem ON solutions(problem_id)');
        console.log('✓ Schema recriado com sucesso.');

        // Inserir Usuários
        await db.query(`
            INSERT INTO users (id, name, email, password_hash, role, is_verified) VALUES
            (1, 'Weslley Rangel', 'admin@suporte.com', $1, 'Especialista em Suporte N2', true),
            (2, 'Ana Martins', 'ana.martins@suporte.com', $1, 'Analista de Suporte N2', true),
            (3, 'Rafael Costa', 'rafael.costa@suporte.com', $1, 'Analista de Suporte N1', true),
            (4, 'Mariana Silva', 'mariana.silva@suporte.com', $1, 'Especialista em Redes e Infra N2', true)
        `, [passwordHash]);

        await db.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
        console.log('✓ 4 Usuários criados (admin@suporte.com, ana.martins, rafael.costa, mariana.silva).');

        // Inserir Publicações
        await db.query(`
            INSERT INTO problems (id, author_id, title, category, description, status, views_count, likes_count, is_draft) VALUES
            (1, 1, 'Como desescalonar chamados críticos e lidar com clientes irritados', 'Atendimento', 'Estratégia empática e prática para contornar ligações e chats de alta tensão sem gerar atrito.', 'RESOLVIDO', 1240, 38, false),
            (2, 1, 'Guia de troubleshooting para falha no login / SSO corporativo', 'Ferramentas', 'Diagnóstico rápido para problemas de autenticação SAML/OAuth e cookies corrompidos no navegador.', 'RESOLVIDO', 890, 29, false),
            (3, 1, 'Checklist: início de turno e conferência de filas de chamados', 'Processos', 'Rotina matinal para priorização de chamados reabertos, alertas de SLA e filas prioritárias.', 'RESOLVIDO', 670, 24, false),
            (4, 1, 'Configuração de VPN corporativa (OpenVPN e WireGuard) com MFA', 'Redes', 'Passo a passo para conectar usuários remotos com dupla autenticação e resolver conflitos de rota.', 'RESOLVIDO', 1120, 42, false),
            (5, 1, 'Como redefinir perfil de usuário corrompido no Windows 11 sem perda de dados', 'Sistemas', 'Procedimento para recriar a chave de registro do perfil mantendo arquivos em C:\\Users.', 'RESOLVIDO', 950, 35, false),
            (6, 1, 'Mapeamento automático de impressoras de rede via PowerShell e GPO', 'Ferramentas', 'Script para mapear filas de impressão corretas por setor sem necessidade de visita presencial.', 'RESOLVIDO', 540, 19, false),
            (7, 1, 'Recuperação de e-mails em quarentena no Microsoft 365 Defender', 'Segurança', 'Como analisar headers de e-mail retidos por falso positivo e liberar com segurança para o destinatário.', 'RESOLVIDO', 780, 26, false),
            (8, 1, 'Resolução de erro de sincronização do OneDrive corporativo (Código 0x8004de40)', 'Ferramentas', 'Como limpar credenciais no Gerenciador do Windows e reiniciar o serviço de sincronização.', 'RESOLVIDO', 610, 21, false),
            (9, 1, 'Desbloqueio e reset de senha no Active Directory com política de complexidade', 'Processos', 'Boas práticas para atendimento seguro na central de atendimento e validação de identidade do colaborador.', 'RESOLVIDO', 1450, 52, false),
            (10, 1, 'Procedimento de contingência para falha no gateway de pagamento TEF', 'Atendimento', 'Como acionar o modo offline do POS e comunicar a loja sem interromper as operações do caixa.', 'RESOLVIDO', 430, 15, false),
            (11, 1, 'Como diagnosticar lentidão na inicialização do Windows 10/11 usando o Monitor de Recursos', 'Sistemas', 'Identificação de processos que consom 100% de disco ou CPU logo após a inicialização da máquina.', 'RESOLVIDO', 870, 31, false),
            (12, 1, 'Configuração de certificado digital A1 e A3 para emissão de notas fiscais', 'Ferramentas', 'Instalação de cadeia de certificados ICP-Brasil e drivers de leitora smartcard para o setor fiscal.', 'RESOLVIDO', 560, 18, false),
            (13, 1, 'Procedimento padrão para isolamento de endpoint suspeito de malware', 'Segurança', 'Checklist de contenção: desconexão de rede, coleta de logs do EDR e análise forense inicial.', 'RESOLVIDO', 1030, 47, false),
            (14, 1, 'Como solucionar erro de permissão negada em pastas de rede (NTFS e Compartilhamento)', 'Redes', 'Validação de grupos de segurança no AD vs permissões efetivas na pasta compartilhada.', 'RESOLVIDO', 790, 28, false),
            (15, 1, 'Configuração e testes de headset USB/P3 no Microsoft Teams e Google Meet', 'Hardware', 'Ajuste de taxa de amostragem de áudio, cancelamento de ruído e seleção do dispositivo padrão.', 'RESOLVIDO', 620, 22, false),
            (16, 1, 'Scripts prontos para respostas rápidas em tickets de alta recorrência', 'Atendimento', 'Modelos prontos de comunicação clara para avisos de indisponibilidade, solicitações e encerramentos.', 'RESOLVIDO', 1340, 61, false),
            (17, 1, 'Como restaurar backup do banco de dados PostgreSQL local via pg_restore', 'Banco de Dados', 'Comandos essenciais para restauração rápida de dumps de desenvolvimento e testes de schema.', 'RESOLVIDO', 490, 17, false),
            (18, 1, 'Instalação silenciosa de pacotes corporativos via winget e PowerShell', 'Processos', 'Automatização do provisionamento de novos computadores sem intervenção manual em cada instalador.', 'RESOLVIDO', 720, 25, false),
            (19, 1, 'Correção de tela azul (BSOD) causada por conflito de drivers gráficos', 'Hardware', 'Uso do DDU (Display Driver Uninstaller) em modo de segurança e instalação de driver homologado.', 'RESOLVIDO', 880, 33, false),
            (20, 1, 'Boas práticas para encerramento de chamado com alto índice de CSAT', 'Atendimento', 'Como sintetizar a solução no ticket e garantir que o cliente sinta que foi plenamente atendido.', 'RESOLVIDO', 1150, 49, false),
            (21, 2, '5 frases para desarmar conversas difíceis com clientes em momentos de crise', 'Atendimento', 'Substitua expressões reativas por acordos objetivos e mantenha o controle e cordialidade.', 'RESOLVIDO', 850, 34, false),
            (22, 2, 'Como criar regras de encaminhamento seguro e caixas compartilhadas no Exchange Online', 'Ferramentas', 'Configuração de permissões SendAs e FullAccess para equipes de atendimento.', 'RESOLVIDO', 620, 20, false),
            (23, 2, 'Procedimento de onboarding de novos colaboradores: acessos no primeiro dia', 'Processos', 'Checklist unificado de criação de e-mail, grupos do Teams, VPN e entrega do notebook.', 'RESOLVIDO', 710, 27, false),
            (24, 2, 'Como recuperar arquivos excluídos acidentalmente no SharePoint e OneDrive', 'Ferramentas', 'Passo a passo pela Lixeira de primeiro e segundo estágio no painel do administrador.', 'RESOLVIDO', 530, 16, false),
            (25, 2, 'Diagnóstico de travamentos intermitentes no Google Chrome com aceleração por hardware', 'Sistemas', 'Desativação de flags de GPU instáveis que causam congelamento em reuniões virtuais.', 'RESOLVIDO', 410, 12, false),
            (26, 3, 'Limpeza de cache DNS e renovação de IP via prompt de comando (CMD)', 'Redes', 'Comandos ipconfig /flushdns, /release e /renew para computadores com perda de rota local.', 'RESOLVIDO', 940, 39, false),
            (27, 3, 'Substituição rápida de toner e limpeza de rolos de alimentação em impressoras térmicas', 'Hardware', 'Manutenção preventiva básica para evitar atolamento de papel em terminais de etiquetas.', 'RESOLVIDO', 380, 14, false),
            (28, 3, 'Como orientar o usuário a tirar prints com a Ferramenta de Captura (Win + Shift + S)', 'Atendimento', 'Instruções simples para envio de evidências legíveis na abertura de chamados.', 'RESOLVIDO', 590, 23, false),
            (29, 3, 'Procedimento para reset de PIN do Windows Hello em computadores de domínio', 'Segurança', 'Exclusão da pasta NGC segura e recadastro biométrico do colaborador.', 'RESOLVIDO', 470, 18, false),
            (30, 4, 'Análise de pacotes e perda de conexão usando Ping, Tracert e Pathping', 'Redes', 'Como isolar se a lentidão está no switch local, no roteador da filial ou no link da operadora.', 'RESOLVIDO', 820, 36, false),
            (31, 4, 'Configuração de VLAN de voz e dados para aparelhos de telefone IP Grandstream', 'Redes', 'Parametrização de porta trunk e tagged VLAN para qualidade de voz (QoS).', 'RESOLVIDO', 640, 25, false),
            (32, 4, 'Verificação de portas abertas e conectividade remota com Test-NetConnection no PowerShell', 'Ferramentas', 'Substituto moderno e confiável do antigo cliente Telnet para validação de firewalls.', 'RESOLVIDO', 760, 30, false),
            (33, 4, 'Procedimento de failover para link secundário de internet em roteadores Mikrotik', 'Redes', 'Checklist de validação do roteamento BGP/estático quando o link principal cai.', 'RESOLVIDO', 910, 41, false)
        `);

        await db.query("SELECT setval('problems_id_seq', (SELECT MAX(id) FROM problems))");
        console.log('✓ 33 Publicações cadastradas (20 do usuário principal + 13 dos outros analistas).');

        // Inserir Soluções
        await db.query(`
            INSERT INTO solutions (problem_id, author_id, content, steps, is_primary) VALUES
            (1, 1, 'Validamos o histórico do chamado, reconhecemos a frustração do cliente sem debater e propusemos um plano de ação claro com prazo definido de retorno.', '[
              "1. Ouça atentamente sem interromper nos primeiros 60 segundos.",
              "2. Valide o impacto no trabalho do usuário com empatia.",
              "3. Assuma a propriedade da resolução e estipule um horário de retorno.",
              "4. Registre detalhadamente o caso para evitar reincidência."
            ]'::jsonb, true),

            (2, 1, 'Limpamos o cache de tokens do navegador e checamos o status da sincronização com o Azure AD / Okta.', '[
              "1. Abra o navegador em janela anônima para testar se é cache local.",
              "2. Limpe os cookies relacionados ao domínio corporativo.",
              "3. No painel do SSO, valide se a conta está ativa e com a licença correta.",
              "4. Force a sincronização do token via endpoint de login."
            ]'::jsonb, true),

            (3, 1, 'Rotina diária com 4 etapas sequenciais para garantir que nenhum chamado urgente estoure o SLA.', '[
              "1. Filtre a fila pelos chamados abertos há mais de 2 horas.",
              "2. Identifique tickets marcados com urgência pelo gestor da área.",
              "3. Atualize o status dos chamados que aguardam retorno de terceiros.",
              "4. Distribua as pendências do dia com a equipe no alinhamento inicial."
            ]'::jsonb, true),

            (4, 1, 'Instalação do cliente de VPN atualizado e importação do perfil com chave pré-compartilhada.', '[
              "1. Desinstale versões antigas do cliente TAP-Windows.",
              "2. Instale o pacote oficial homologado pela segurança.",
              "3. Importe o arquivo de perfil .ovpn ou .conf.",
              "4. Efetue o login informando o token do aplicativo autenticador."
            ]'::jsonb, true),

            (5, 1, 'Renomeamos a pasta do perfil corrompido e removemos o GUID correspondente na chave ProfileList do Registro.', '[
              "1. Reinicie em modo seguro com uma conta de Administrador local.",
              "2. Acesse HKEY_LOCAL_MACHINE\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion\\\\ProfileList.",
              "3. Localize a chave com final .bak e remova o sufixo ou exclua o registro órfão.",
              "4. Faça login novamente para recriar o perfil limpo e copie os dados de volta."
            ]'::jsonb, true),

            (9, 1, 'Validação rigorosa por chamada de voz ou confirmação do gestor antes de alterar credenciais de rede.', '[
              "1. Confirme os dados cadastrais (matrícula e setor) do solicitante.",
              "2. No Active Directory Users and Computers, desmarque a opção ''Conta bloqueada''.",
              "3. Defina uma senha temporária complexa e marque ''O usuário deve alterar a senha no próximo logon''.",
              "4. Acompanhe o primeiro acesso para garantir o sucesso."
            ]'::jsonb, true),

            (21, 2, 'Frases estruturadas para substituir termos reativos e transmitir segurança imediata ao usuário.', '[
              "1. Em vez de ''Isso não é com o meu setor'', use: ''Vou te conectar com o especialista responsável agora mesmo''.",
              "2. Em vez de ''Você fez errado'', use: ''Vamos ajustar a configuração juntos para que funcione perfeitamente''.",
              "3. Em vez de ''Não há previsão'', use: ''Estamos atuando na análise e trarei uma atualização às 11h''.",
              "4. Em vez de ''Você precisa ter calma'', use: ''Compreendo a urgência e estou focado em resolver isso agora''."
            ]'::jsonb, true),

            (26, 3, 'Execução sequencial de comandos de rede no terminal com permissão elevada.', '[
              "1. Abra o CMD ou PowerShell como Administrador.",
              "2. Digite ''ipconfig /flushdns'' e pressione Enter.",
              "3. Digite ''ipconfig /release'' e em seguida ''ipconfig /renew''.",
              "4. Teste a navegação com ''ping 8.8.8.8'' e ''ping google.com''."
            ]'::jsonb, true),

            (30, 4, 'Metodologia de três testes para diagnosticar gargalos em redes corporativas.', '[
              "1. Execute ''ping 127.0.0.1'' para testar a pilha TCP/IP do computador.",
              "2. Execute ''ping [IP_DO_GATEWAY]'' para testar a comunicação até o switch/roteador.",
              "3. Execute ''tracert 8.8.8.8'' para ver em qual salto (hop) ocorre a perda de pacotes ou aumento de latência."
            ]'::jsonb, true),

            (2, 3, 'Método alternativo rápido via limpeza de credenciais do Windows (Credential Manager).', '[
              "1. Pressione Win + R e digite ''control keymgr.dll''.",
              "2. Na aba ''Credenciais do Windows'', exclua entradas associadas ao Office/Teams.",
              "3. Reinicie a aplicação e informe login e senha novamente."
            ]'::jsonb, false),

            (4, 4, 'Solução alternativa para erro de rota na VPN: desativar IPv6 na placa de rede virtual.', '[
              "1. Abra as Conexões de Rede (ncpa.cpl).",
              "2. Clique com botão direito no adaptador TAP/VPN e vá em Propriedades.",
              "3. Desmarque a caixa ''Protocolo IP Versão 6 (TCP/IPv6)''.",
              "4. Salve e reconecte a VPN."
            ]'::jsonb, false)
        `);
        console.log('✓ Soluções principais e métodos alternativos inseridos.');

        // 4. Validar contagens
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const probCount = await db.query('SELECT COUNT(*) FROM problems');
        const user1ProbCount = await db.query('SELECT COUNT(*) FROM problems WHERE author_id = 1');
        const solCount = await db.query('SELECT COUNT(*) FROM solutions');

        console.log(`\n==============================================`);
        console.log(`✓ SEED DO BANCO EXECUTADO COM 100% DE SUCESSO!`);
        console.log(`==============================================`);
        console.log(`• Usuários cadastrados: ${userCount.rows[0].count}`);
        console.log(`• Total de problemas/artigos: ${probCount.rows[0].count}`);
        console.log(`• Publicações de Weslley Rangel (admin@suporte.com): ${user1ProbCount.rows[0].count}`);
        console.log(`• Total de soluções e métodos colaborativos: ${solCount.rows[0].count}`);
        console.log(`==============================================\n`);

        process.exit(0);
    } catch (error) {
        console.error('Erro ao executar seed:', error);
        process.exit(1);
    }
}

runSeed();
