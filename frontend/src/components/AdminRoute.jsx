import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'var(--cream)',
                fontFamily: 'var(--font-heading)',
                color: 'var(--green-deep)',
                fontSize: '18px',
                fontWeight: 700
            }}>
                Verificando credenciais de administrador...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default AdminRoute;
