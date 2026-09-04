import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './VerifyEmail.css';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Nenhum token de verificação encontrado na URL.');
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        await api.verifyEmail(token);
        if (!cancelled) setStatus('success');
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(err.message || 'Token inválido ou expirado.');
        }
      }
    };

    verify();

    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="verify-email-screen-wrapper">
      {/* Header */}
      <header className="verify-email-header">
        <div className="verify-email-brand">
          <div className="verify-email-brand-icon" />
          <span className="verify-email-brand-name">Manual de Sobrevivência</span>
        </div>
      </header>

      {/* Body */}
      <section className="verify-email-body">
        {status === 'loading' && (
          <div className="verify-email-card animate-fade">
            <div className="verify-spinner" />
            <h1 className="verify-email-title">Verificando sua conta...</h1>
            <p className="verify-email-desc">Aguarde enquanto confirmamos o seu e-mail.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-email-card animate-fade">
            <div className="verify-email-icon-badge verify-success">
              <Icon name="circle-check-big" size={32} color="var(--green-leaf)" />
            </div>
            <h1 className="verify-email-title">E-mail verificado!</h1>
            <p className="verify-email-desc">
              Sua conta foi ativada com sucesso. Agora você pode fazer login e acessar o manual.
            </p>
            <Link to="/login" className="verify-email-action-btn pressable">
              Ir para o Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-email-card animate-fade">
            <div className="verify-email-icon-badge verify-error">
              <Icon name="alert-triangle" size={32} color="var(--color-error-foreground, #E53E3E)" />
            </div>
            <h1 className="verify-email-title">Verificação falhou</h1>
            <p className="verify-email-desc">{errorMessage}</p>
            <Link to="/login" className="verify-email-action-btn pressable">
              Ir para o Login
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
