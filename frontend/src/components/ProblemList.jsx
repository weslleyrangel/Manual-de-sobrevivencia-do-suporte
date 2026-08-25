import React, { useState, useEffect } from 'react';
import './ProblemList.css';
import { saveProblemsOffline, getOfflineProblems } from '../utils/offlineStore';

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
                
                const response = await fetch(`${API_URL}/api/v1/problems?page=1&limit=20`, {
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('API Error');
                
                const data = await response.json();
                setProblems(data);
                
                // Grava catálogo atualizado no banco offline
                await saveProblemsOffline(data);
                
                setLoading(false);
                setIsOffline(false);
            } catch (err) {
                // Se a API cair ou sem rede, tenta resgatar do IndexedDB
                const cachedData = await getOfflineProblems();
                if (cachedData && cachedData.length > 0) {
                    setProblems(cachedData);
                    setIsOffline(true);
                    setLoading(false);
                } else {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchProblems();
    }, []);

    if (loading) return <div className="loading-state">Carregando catálogo...</div>;
    if (error) return <div className="error-state">Erro ao carregar o catálogo. Sem conexão e sem cache.</div>;

    return (
        <div className="problem-list">
            {isOffline && (
                <div className="offline-banner">
                    ⚠️ Você está visualizando o modo Offline.
                </div>
            )}
            {problems.map((problem) => (
                <div key={problem.id} className="problem-card">
                    <h3>{problem.title}</h3>
                    <p>{problem.description}</p>
                </div>
            ))}
        </div>
    );
};

export default ProblemList;
