const nodemailer = require('nodemailer');
const { MailtrapClient } = require('mailtrap');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MAILTRAP_HOST = process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io';
const MAILTRAP_PORT = parseInt(process.env.MAILTRAP_PORT || '2525', 10);
const MAILTRAP_USER = process.env.MAILTRAP_USER;
const MAILTRAP_PASS = process.env.MAILTRAP_PASS;
const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN;
const SENDER_EMAIL = process.env.MAILTRAP_SENDER_EMAIL || 'no-reply@suporte.com';
const SENDER_NAME = process.env.MAILTRAP_SENDER_NAME || 'Manual de Sobrevivência do Suporte';

let smtpTransporter = null;
let mailtrapClient = null;
let fallbackTransporter = null;

if (MAILTRAP_USER && MAILTRAP_PASS) {
    smtpTransporter = nodemailer.createTransport({
        host: MAILTRAP_HOST,
        port: MAILTRAP_PORT,
        auth: {
            user: MAILTRAP_USER,
            pass: MAILTRAP_PASS,
        },
    });
    console.log(`Mailtrap Sandbox SMTP inicializado com sucesso (${MAILTRAP_HOST}:${MAILTRAP_PORT}).`);
} else if (MAILTRAP_TOKEN) {
    mailtrapClient = new MailtrapClient({ token: MAILTRAP_TOKEN });
    console.log('Mailtrap SDK API inicializado com sucesso.');
} else if (process.env.NODE_ENV !== 'test') {
    initFallback();
}

// Inicializa o Ethereal Mail como fallback caso nenhuma configuração de e-mail exista
async function initFallback() {
    try {
        let testAccount = await nodemailer.createTestAccount();
        fallbackTransporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('Ethereal Mail inicializado como fallback para testes.');
    } catch (err) {
        console.error('Erro ao inicializar o fallback de e-mail:', err);
    }
}

exports.sendVerificationEmail = async (to, token, userName = '') => {
    const verifyUrl = `${FRONTEND_URL}/verify?token=${token}`;
    const firstName = userName ? userName.trim().split(' ')[0] : 'colega';
    const subject = `Bem-vindo(a), ${firstName}! Confirme seu e-mail no Manual de Suporte`;
    
    const textContent = `Olá, ${firstName}!\n\n` +
        `Ficamos muito felizes em ter você na comunidade do Manual de Sobrevivência do Suporte! 🎉\n\n` +
        `Para ativar a sua conta e acessar todas as soluções, roteiros e ferramentas da nossa base de conhecimento, basta confirmar o seu e-mail clicando no link abaixo:\n\n` +
        `${verifyUrl}\n\n` +
        `Este link é válido por 24 horas.\n\n` +
        `Se você não realizou este cadastro, pode desconsiderar esta mensagem com total segurança.\n\n` +
        `Um abraço,\nEquipe do Manual de Sobrevivência do Suporte`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Cadastro</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background-color:#F5F3EE;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid #ECE7DE;">
          
          <!-- Banner Superior -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%);padding:36px 32px 28px;text-align:center;">
              <div style="width:52px;height:52px;background:rgba(255,255,255,0.18);border-radius:14px;margin:0 auto 16px;line-height:52px;font-size:26px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">🌱</div>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.01em;">Manual de Sobrevivência</h1>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85);letter-spacing:0.02em;text-transform:uppercase;font-weight:600;">Base de Conhecimento do Suporte</p>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1A1A1A;letter-spacing:-0.02em;">
                Olá, ${firstName}! 👋
              </h2>
              <p style="margin:0 0 18px;font-size:15px;color:#4A4A4A;line-height:1.6;">
                Seja muito bem-vindo(a)! Ficamos muito felizes em ter você no <strong>Manual de Sobrevivência do Suporte</strong>.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#4A4A4A;line-height:1.6;">
                Para começar a explorar roteiros rápidos, compartilhar soluções e salvar seus procedimentos favoritos, confirme seu e-mail clicando no botão abaixo:
              </p>

              <!-- Botão de Ação -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display:inline-block;background-color:#2D6A4F;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:16px 36px;border-radius:12px;box-shadow:0 4px 14px rgba(45,106,79,0.35);letter-spacing:0.01em;transition:all 0.2s ease;">
                      ✅ Confirmar meu e-mail
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Dica amigável / Fallback link -->
              <div style="background-color:#F9F8F5;border:1px solid #ECE7DE;border-radius:12px;padding:16px;margin:0 0 20px;">
                <p style="margin:0 0 8px;font-size:13px;color:#666666;line-height:1.5;">
                  🔒 <strong>Segurança:</strong> este link expira em <strong>24 horas</strong>.
                </p>
                <p style="margin:0;font-size:12px;color:#888888;line-height:1.5;word-break:break-all;">
                  Se o botão acima não funcionar, copie e cole o link a seguir no seu navegador:<br>
                  <a href="${verifyUrl}" target="_blank" style="color:#2D6A4F;text-decoration:underline;">${verifyUrl}</a>
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#888888;line-height:1.5;">
                Se você não criou esta conta, pode ignorar este e-mail tranquilamente. Nenhuma ação será realizada.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding:24px 32px;background:#FAFAF8;border-top:1px solid #F0EDE8;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#555555;">
                Manual de Sobrevivência do Suporte
              </p>
              <p style="margin:0;font-size:12px;color:#999999;">
                Feito para tornar a rotina dos analistas e especialistas mais ágil e eficiente.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 1. Envio via Mailtrap Sandbox SMTP (Recomendado para Dev - captura 100% dos e-mails)
    if (smtpTransporter) {
        try {
            const info = await smtpTransporter.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: to,
                subject: subject,
                text: textContent,
                html: htmlContent,
            });
            console.log("E-mail enviado via Mailtrap Sandbox SMTP com sucesso: %s", info.messageId);
            return info;
        } catch (error) {
            console.error('Erro ao enviar e-mail via Mailtrap Sandbox:', error);
            throw error;
        }
    }

    // 2. Envio via Mailtrap API (se token fornecido)
    if (mailtrapClient) {
        try {
            const response = await mailtrapClient.send({
                from: {
                    email: SENDER_EMAIL,
                    name: SENDER_NAME,
                },
                to: [
                    {
                        email: to,
                    }
                ],
                subject: subject,
                text: textContent,
                html: htmlContent,
                category: "Account Verification",
            });
            console.log("E-mail enviado via Mailtrap API com sucesso:", response);
            return response;
        } catch (error) {
            console.error('Erro ao enviar e-mail via Mailtrap API:', error);
            throw error;
        }
    }

    // 3. Envio via Nodemailer / Fallback Ethereal
    if (fallbackTransporter) {
        try {
            let info = await fallbackTransporter.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: to,
                subject: subject,
                text: textContent,
                html: htmlContent,
            });

            console.log("Mensagem enviada via Ethereal: %s", info.messageId);
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log("URL de Pré-visualização do E-mail: %s", previewUrl);
            return previewUrl;
        } catch (error) {
            console.error('Erro ao enviar e-mail via fallback:', error);
        }
    } else {
        console.warn('Nenhum serviço de e-mail configurado ou disponível.');
    }
};

