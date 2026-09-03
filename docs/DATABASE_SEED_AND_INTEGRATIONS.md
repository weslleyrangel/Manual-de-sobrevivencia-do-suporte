# Registro do Banco de Dados & Catálogo de Publicações Reais

Este documento registra a estrutura oficial da base de conhecimento, os usuários cadastrados e o catálogo de tutoriais e procedimentos inseridos no banco PostgreSQL do **Manual de Sobrevivência do Suporte (IT Support Knowledge Catalog)**.

---

## 👥 1. Usuários e Credenciais de Acesso

Todos os usuários foram criados com status `is_verified: true` e possuem a senha padrão: **`123`**.

| ID | Nome do Analista | E-mail de Login | Função / Nível | Quantidade de Publicações |
| :-: | :--- | :--- | :--- | :-: |
| **1** | **Weslley Rangel** *(Principal)* | `admin@suporte.com` | Especialista em Suporte N2 | **20 publicações** |
| **2** | **Ana Martins** | `ana.martins@suporte.com` | Analista de Suporte N2 | **5 publicações** |
| **3** | **Rafael Costa** | `rafael.costa@suporte.com` | Analista de Suporte N1 | **4 publicações** (+ 1 método alternativo) |
| **4** | **Mariana Silva** | `mariana.silva@suporte.com` | Especialista em Redes e Infra N2 | **4 publicações** (+ 1 método alternativo) |

---

## 📚 2. Catálogo das 20 Publicações de Weslley Rangel (`admin@suporte.com`)

| # | Categoria | Título do Procedimento | Status | Visualizações | Curtidas |
| :-: | :--- | :--- | :---: | :-: | :-: |
| **1** | Atendimento | Como desescalonar chamados críticos e lidar com clientes irritados | `RESOLVIDO` | 1.240 | 38 |
| **2** | Ferramentas | Guia de troubleshooting para falha no login / SSO corporativo | `RESOLVIDO` | 890 | 29 |
| **3** | Processos | Checklist: início de turno e conferência de filas de chamados | `RESOLVIDO` | 670 | 24 |
| **4** | Redes | Configuração de VPN corporativa (OpenVPN e WireGuard) com MFA | `RESOLVIDO` | 1.120 | 42 |
| **5** | Sistemas | Como redefinir perfil de usuário corrompido no Windows 11 sem perda de dados | `RESOLVIDO` | 950 | 35 |
| **6** | Ferramentas | Mapeamento automático de impressoras de rede via PowerShell e GPO | `RESOLVIDO` | 540 | 19 |
| **7** | Segurança | Recuperação de e-mails em quarentena no Microsoft 365 Defender | `RESOLVIDO` | 780 | 26 |
| **8** | Ferramentas | Resolução de erro de sincronização do OneDrive corporativo (Código 0x8004de40) | `RESOLVIDO` | 610 | 21 |
| **9** | Processos | Desbloqueio e reset de senha no Active Directory com política de complexidade | `RESOLVIDO` | 1.450 | 52 |
| **10** | Atendimento | Procedimento de contingência para falha no gateway de pagamento TEF | `RESOLVIDO` | 430 | 15 |
| **11** | Sistemas | Como diagnosticar lentidão na inicialização do Windows 10/11 usando o Monitor de Recursos | `RESOLVIDO` | 870 | 31 |
| **12** | Ferramentas | Configuração de certificado digital A1 e A3 para emissão de notas fiscais | `RESOLVIDO` | 560 | 18 |
| **13** | Segurança | Procedimento padrão para isolamento de endpoint suspeito de malware | `RESOLVIDO` | 1.030 | 47 |
| **14** | Redes | Como solucionar erro de permissão negada em pastas de rede (NTFS e Compartilhamento) | `RESOLVIDO` | 790 | 28 |
| **15** | Hardware | Configuração e testes de headset USB/P3 no Microsoft Teams e Google Meet | `RESOLVIDO` | 620 | 22 |
| **16** | Atendimento | Scripts prontos para respostas rápidas em tickets de alta recorrência | `RESOLVIDO` | 1.340 | 61 |
| **17** | Banco de Dados | Como restaurar backup do banco de dados PostgreSQL local via pg_restore | `RESOLVIDO` | 490 | 17 |
| **18** | Processos | Instalação silenciosa de pacotes corporativos via winget e PowerShell | `RESOLVIDO` | 720 | 25 |
| **19** | Hardware | Correção de tela azul (BSOD) causada por conflito de drivers gráficos | `RESOLVIDO` | 880 | 33 |
| **20** | Atendimento | Boas práticas para encerramento de chamado com alto índice de CSAT | `RESOLVIDO` | 1.150 | 49 |

---

## 🤝 3. Publicações dos Outros Analistas & Métodos Colaborativos

### Ana Martins (`ana.martins@suporte.com`):
- **#21**: *5 frases para desarmar conversas difíceis com clientes em momentos de crise* (Atendimento)
- **#22**: *Como criar regras de encaminhamento seguro e caixas compartilhadas no Exchange Online* (Ferramentas)
- **#23**: *Procedimento de onboarding de novos colaboradores: acessos no primeiro dia* (Processos)
- **#24**: *Como recuperar arquivos excluídos acidentalmente no SharePoint e OneDrive* (Ferramentas)
- **#25**: *Diagnóstico de travamentos intermitentes no Google Chrome com aceleração por hardware* (Sistemas)

### Rafael Costa (`rafael.costa@suporte.com`):
- **#26**: *Limpeza de cache DNS e renovação de IP via prompt de comando (CMD)* (Redes)
- **#27**: *Substituição rápida de toner e limpeza de rolos de alimentação em impressoras térmicas* (Hardware)
- **#28**: *Como orientar o usuário a tirar prints com a Ferramenta de Captura (Win + Shift + S)* (Atendimento)
- **#29**: *Procedimento para reset de PIN do Windows Hello em computadores de domínio* (Segurança)
- **Método Colaborativo no Artigo #2**: *Resolução alternativa via limpeza de credenciais no Windows Credential Manager.*

### Mariana Silva (`mariana.silva@suporte.com`):
- **#30**: *Análise de pacotes e perda de conexão usando Ping, Tracert e Pathping* (Redes)
- **#31**: *Configuração de VLAN de voz e dados para aparelhos de telefone IP Grandstream* (Redes)
- **#32**: *Verificação de portas abertas e conectividade remota com Test-NetConnection no PowerShell* (Ferramentas)
- **#33**: *Procedimento de failover para link secundário de internet em roteadores Mikrotik* (Redes)
- **Método Colaborativo no Artigo #4**: *Solução alternativa para conflito de rota na VPN desmarcando IPv6 na placa TAP.*

---

## 🛠️ 4. Como Executar ou Repetir o Seed

Para restaurar ou recriar a base completa a qualquer momento, execute:

```bash
docker exec itsupport_backend node src/config/seed_db.js
```
