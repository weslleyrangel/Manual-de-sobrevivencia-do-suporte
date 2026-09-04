import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading all pages for optimal performance and code-splitting
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const ProfessionalSetup = React.lazy(() => import('./pages/ProfessionalSetup').then(m => ({ default: m.ProfessionalSetup })));
const CheckEmail = React.lazy(() => import('./pages/CheckEmail').then(m => ({ default: m.CheckEmail })));
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Search = React.lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const MyPublications = React.lazy(() => import('./pages/MyPublications').then(m => ({ default: m.MyPublications })));
const NewPublication = React.lazy(() => import('./pages/NewPublication').then(m => ({ default: m.NewPublication })));
const PublicationDetail = React.lazy(() => import('./pages/PublicationDetail').then(m => ({ default: m.PublicationDetail })));
const Menu = React.lazy(() => import('./pages/Menu').then(m => ({ default: m.Menu })));

function App() {
  return (
    <Suspense
      fallback={
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
          Carregando manual...
        </div>
      }
    >
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/professional" element={<ProfessionalSetup />} />
        <Route path="/professional-setup" element={<ProfessionalSetup />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify" element={<VerifyEmail />} />

        {/* Application Core Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-publications" element={<MyPublications />} />
        <Route path="/new-publication" element={<NewPublication />} />
        <Route path="/publication/:id" element={<PublicationDetail />} />
        <Route path="/menu" element={<Menu />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
