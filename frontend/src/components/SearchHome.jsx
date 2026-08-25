import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './SearchHome.css';

const SearchHome = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { logout } = useContext(AuthContext);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Erro ao realizar a busca inteligente.');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="search-home-wrapper">
            <div className="top-nav">
                <div className="nav-logo">Manual de Sobrevivência</div>
                <button onClick={logout} className="logout-btn">Sair</button>
            </div>
            <div className={`search-container ${hasSearched ? 'searched' : 'centered'}`}>
            <div className="search-header">
                <h1 className="search-title">O que você precisa resolver hoje?</h1>
                <form onSubmit={handleSearch} className="search-bar-wrapper">
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Ex: Impressora não liga, VPN caindo, Tela azul..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="search-button" disabled={isLoading}>
                        {isLoading ? '...' : '🔍'}
                    </button>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            {hasSearched && (
                <div className="search-results">
                    {results.length === 0 && !isLoading && (
                        <div className="no-results">
                            Nenhum problema encontrado. Tente termos diferentes.
                        </div>
                    )}
                    {results.map((result) => (
                        <div key={result.id} className="result-card glass-panel">
                            <h3>{result.title}</h3>
                            <p>{result.description}</p>
                            {/* Futuro: Exibir soluções aqui ou linkar para detalhes */}
                            <span className="relevance-badge">
                                Relevância: {Math.round(result.rank * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </div>
    );
};

export default SearchHome;
