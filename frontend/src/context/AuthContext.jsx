import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/v1/auth/me', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUser(data.user);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (err) {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [API_URL]);

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await fetch('/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error('Logout error', e);
        }
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
