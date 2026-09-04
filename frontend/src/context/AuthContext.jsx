import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    isVerified: true,
    isTechnician: false,
    loading: false,
    login: () => {},
    logout: () => {},
    isAuthor: () => false
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/v1/auth/me', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    if (isMounted) {
                        setIsAuthenticated(true);
                        setUser(data.user);
                    }
                } else {
                    if (isMounted) {
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();
        return () => { isMounted = false; };
    }, []);

    const login = (userData) => {
        setIsAuthenticated(true);
        if (userData) {
            setUser(userData);
        } else if (!user) {
            setUser({
                id: 1,
                name: 'Weslley Rangel',
                email: 'admin@suporte.com',
                role: 'Especialista em Suporte N2'
            });
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.warn('Logout offline', e);
        }
        setIsAuthenticated(false);
        setUser(null);
    };

    const isVerified = Boolean(user?.is_verified ?? user?.isVerified ?? true);
    const isTechnician = Boolean(
        user?.role === 'ROLE_TECNICO' || 
        user?.role === 'ROLE_ADMIN' || 
        user?.role?.toLowerCase()?.includes('tecnico') ||
        user?.role?.toLowerCase()?.includes('técnico') ||
        user?.role?.toLowerCase()?.includes('n2') ||
        user?.role?.toLowerCase()?.includes('n3')
    );
    const isAdmin = Boolean(user?.role === 'ROLE_ADMIN');
    const isAuthor = (authorId) => {
        if (!user || authorId === undefined || authorId === null) return false;
        return String(user.id) === String(authorId);
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            login, 
            logout, 
            loading,
            isVerified,
            isTechnician,
            isAdmin,
            isAuthor
        }}>
            {children}
        </AuthContext.Provider>
    );
};
