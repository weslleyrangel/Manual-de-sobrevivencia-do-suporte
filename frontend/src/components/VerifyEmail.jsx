import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Login.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('Verificando sua conta...');

    useEffect(() => {
        if (!token) {
            setStatus('Token não fornecido na URL.');
            return;
        }

        const verify = async () => {
            try {
                const response = await fetch(`/api/v1/auth/verify/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('✅ ' + data.message);
                } else {
                    setStatus('❌ ' + (data.error || 'Erro ao verificar conta.'));
                }
            } catch (err) {
                setStatus('❌ Erro de conexão com o servidor.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="login-container">
            <div className="glass-panel login-panel" style={{textAlign: 'center'}}>
                <h2>Verificação</h2>
                <p style={{ marginTop: '2rem', marginBottom: '2rem', fontSize: '1.2rem' }}>{status}</p>
                <Link to="/login" style={{color: 'white', textDecoration: 'underline'}}>
                    Ir para o Login
                </Link>
            </div>
        </div>
    );
};

export default VerifyEmail;
