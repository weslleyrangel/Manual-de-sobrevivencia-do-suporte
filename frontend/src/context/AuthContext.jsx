import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const AuthContext = createContext({
    user: null,
    isAuthenticated: true,
    isVerified: true,
    isTechnician: true,
    isAdmin: true,
    isGuest: false,
    loading: false,
    login: () => { },
    logout: () => { },
    isAuthor: () => true
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        id: 'analista-suporte',
        name: 'Analista de Suporte',
        role: 'ADMIN'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Verifica se há sessão ativa no Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    name: session.user.email?.split('@')[0] || 'Analista de Suporte',
                    role: 'ADMIN'
                });
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    name: session.user.email?.split('@')[0] || 'Analista de Suporte',
                    role: 'ADMIN'
                });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: true,
                isVerified: true,
                isTechnician: true,
                isAdmin: true,
                isGuest: false,
                loading,
                login: () => { },
                logout,
                isAuthor: () => true
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};