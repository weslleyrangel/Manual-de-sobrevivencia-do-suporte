const nodemailer = require('nodemailer');

let transporter;

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

    const verifyUrl = `http://localhost:5173/verify?token=${token}`;
    
    try {
        let info = await transporter.sendMail({
            from: '"Manual de Sobrevivência do Suporte" <no-reply@suporte.com>',
            to: to,
            subject: "Confirme sua conta no Manual de Sobrevivência do Suporte",
            text: `Bem-vindo! Clique no link para confirmar sua conta: ${verifyUrl}`,
            html: `<b>Bem-vindo!</b><br>Clique no link para confirmar sua conta: <a href="${verifyUrl}">${verifyUrl}</a>`,
        });

        console.log("Mensagem enviada: %s", info.messageId);
        // O Ethereal gera uma URL onde você pode visualizar o e-mail no navegador
        console.log("URL de Pré-visualização do E-mail: %s", nodemailer.getTestMessageUrl(info));
        return nodemailer.getTestMessageUrl(info);
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
    }
};
