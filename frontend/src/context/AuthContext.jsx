import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    isVerified: true,
    isTechnician: false,
    isAdmin: false,
    isGuest: false,
    loading: false,
    login: () => {},
    guestLogin: () => {},
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
        if (!userData || typeof userData !== 'object' || userData.nativeEvent) {
            console.warn('login() chamado sem dados de usuário válidos.');
            return;
        }
        setIsAuthenticated(true);
        setUser(userData);
    };

    const guestLogin = async () => {
        try {
            const res = await fetch('/api/v1/auth/guest', {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setIsAuthenticated(true);
                setUser(data.user);
                return data.user;
            }
        } catch (e) {
            console.error('Erro no guestLogin', e);
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
    const isAdmin = Boolean(
        user?.role === 'ROLE_ADMIN' || 
        user?.role === 'ADMIN' || 
        user?.role?.toUpperCase()?.includes('ADMIN')
    );
    const isGuest = Boolean(user?.role === 'GUEST' || user?.role === 'ROLE_GUEST');
    const isAuthor = (authorId) => {
        if (!user || authorId === undefined || authorId === null) return false;
        return String(user.id) === String(authorId);
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            login, 
            guestLogin,
            logout, 
            loading,
            isVerified,
            isTechnician,
            isAdmin,
            isGuest,
            isAuthor
        }}>
            {children}
        </AuthContext.Provider>
    );
};
