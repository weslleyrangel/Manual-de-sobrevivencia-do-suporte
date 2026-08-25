const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

(async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123', salt);
        await db.query(
            "UPDATE users SET password_hash = $1, is_verified = true WHERE email = $2",
            [hash, 'admin@suporte.com']
        );
        console.log('Admin account updated with valid hash and verified=true');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
