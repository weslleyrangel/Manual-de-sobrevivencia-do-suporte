const nodemailer = require('nodemailer');

let transporter;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Inicializa o Ethereal Mail (ideal para dev, não envia e-mails reais mas gera links de preview)
async function init() {
    try {
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('Ethereal Mail inicializado para testes.');
    } catch (err) {
        console.error('Erro ao inicializar o Ethereal Mail:', err);
    }
}

if (process.env.NODE_ENV !== 'test') {
    init();
}

exports.sendVerificationEmail = async (to, token) => {
    if (!transporter) {
        console.error('Transporter não inicializado');
        return;
    }

    const verifyUrl = `${FRONTEND_URL}/verify?token=${token}`;
    
    try {
        let info = await transporter.sendMail({
            from: '"Manual de Sobrevivência do Suporte" <no-reply@suporte.com>',
            to: to,
            subject: "Confirme sua conta no Manual de Sobrevivência do Suporte",
            text: `Bem-vindo ao Manual de Sobrevivência do Suporte!\n\nClique no link abaixo para confirmar sua conta:\n${verifyUrl}\n\nEste link expira em 24 horas.\n\nSe você não criou esta conta, ignore este e-mail.`,
            html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#F5F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:32px 32px 24px;text-align:center;">
              <div style="width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;margin:0 auto 16px;line-height:48px;font-size:24px;">🌱</div>
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.01em;">Manual de Sobrevivência</h1>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">Base de Conhecimento & Suporte</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A1A1A;">Confirme seu e-mail</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#666666;line-height:1.6;">
                Obrigado por se cadastrar! Clique no botão abaixo para ativar sua conta e começar a usar o manual.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display:inline-block;background-color:#2D6A4F;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:50px;letter-spacing:0.02em;">
                      Verificar minha conta
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#999999;line-height:1.5;">
                Este link expira em <strong>24 horas</strong>. Se você não criou esta conta, pode ignorar este e-mail com segurança.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#FAFAF8;border-top:1px solid #F0EDE8;text-align:center;">
              <p style="margin:0;font-size:12px;color:#AAAAAA;">
                © ${new Date().getFullYear()} Manual de Sobrevivência do Suporte
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });

        console.log("Mensagem enviada: %s", info.messageId);
        // O Ethereal gera uma URL onde você pode visualizar o e-mail no navegador
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("URL de Pré-visualização do E-mail: %s", previewUrl);
        return previewUrl;
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
    }
};
