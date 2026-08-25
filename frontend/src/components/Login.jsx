import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro de autenticação');
            }

            login();
            navigate('/'); // Redirect to catalog
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
                <p className="subtitle">Identifique-se para acessar a base de conhecimento</p>
                
                {error && <div className="login-error">{error}</div>}
                
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
                        {isLoading ? 'Autenticando...' : 'Entrar'}
                    </button>
                </form>
                <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
                    <Link to="/register" style={{color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem'}}>
                        Não tem conta? Registre-se
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
