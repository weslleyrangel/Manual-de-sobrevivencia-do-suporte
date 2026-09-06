import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import './VerifyEmail.css';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      showToast('Nenhum token de verificação informado.', 'error');
      navigate('/login', { replace: true });
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    api.verifyEmail(token)
      .then((data) => {
        showToast('E-mail verificado com sucesso! Acesse sua conta.', 'success');
        navigate('/login', { 
          replace: true, 
          state: { 
            verifiedSuccess: true,
            email: data?.email || ''
          } 
        });
      })
      .catch((err) => {
        showToast(err.message || 'Token de verificação inválido ou expirado.', 'error');
        navigate('/login', { 
          replace: true,
          state: {
            verifiedError: err.message || 'Token de verificação inválido ou expirado.'
          }
        });
      });
  }, [token, navigate, showToast]);

  return (
    <div className="verify-email-screen-wrapper">
      <header className="verify-email-header">
        <div className="verify-email-brand">
          <div className="verify-email-brand-icon" />
          <span className="verify-email-brand-name">Manual de Sobrevivência</span>
        </div>
      </header>

      <section className="verify-email-body">
        <div className="verify-email-card animate-fade">
          <div className="verify-spinner" />
          <h1 className="verify-email-title">Confirmando seu e-mail...</h1>
          <p className="verify-email-desc">Você está sendo redirecionado para a tela de login.</p>
        </div>
      </section>
    </div>
  );
};
