import React, { useContext, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

const SearchHome = React.lazy(() => import('./components/SearchHome'));
const Login = React.lazy(() => import('./components/Login'));
const Register = React.lazy(() => import('./components/Register'));
const VerifyEmail = React.lazy(() => import('./components/VerifyEmail'));

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    
    if (loading) return null; // Or a loading spinner
    
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <div className="app-container">

      <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando tela...</div>}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/" element={
              <PrivateRoute>
                  <main>
                      <SearchHome />
                  </main>
              </PrivateRoute>
          } />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
