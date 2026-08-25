import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Reusing Login styles for Glassmorphism

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao registrar');
            }

            setSuccessMessage(data.message); // Ex: "Usuário criado. Verifique seu e-mail para ativar a conta."
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="glass-panel login-panel">
                <h1 style={{fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Manual de Sobrevivência do Suporte</h1>
                <p className="subtitle">Cadastre-se para acessar a base de conhecimento</p>
                
                {error && <div className="login-error">{error}</div>}
                {successMessage && <div className="login-success" style={{color: '#a8ffb1', marginBottom: '1rem', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', textAlign: 'center'}}>{successMessage}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <input 
                        type="email" 
                        placeholder="Email corporativo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Criar Conta'}
                    </button>
                </form>
                
                <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
                    <Link to="/login" style={{color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem'}}>
                        Já possui conta? Fazer Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
