import React, { useState } from 'react';
import { Icon } from './Icons';
import './CloseQuestionModal.css';

export const CloseQuestionModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const minLength = 15;
  const isLengthValid = reason.trim().length >= minLength;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLengthValid) {
      setError(`A justificativa técnica deve conter no mínimo ${minLength} caracteres.`);
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div className="modal-header-text">
            <h3 className="modal-title">
              <Icon name="shield-check" size={20} color="var(--yellow-signal)" />
              Encerrar Pergunta
            </h3>
            <p className="modal-subtitle">
              Como suporte técnico ou administrador, forneça uma justificativa formal para finalizar este tópico.
            </p>
          </div>
          <button 
            type="button" 
            className="modal-close-icon-btn" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <Icon name="x" size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="modal-error-banner">{error}</div>}

            <div className="modal-field">
              <label htmlFor="admin-close-reason" className="modal-label">
                Justificativa do Encerramento *
              </label>
              <textarea
                id="admin-close-reason"
                className="modal-textarea"
                rows={4}
                placeholder="Descreva o motivo (ex: Solução validada pelo suporte no ticket #102, ou tópico inativo duplicado de...)"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
                autoFocus
              />
              <div className={`modal-char-counter ${isLengthValid ? 'valid' : 'invalid'}`}>
                <span>{reason.trim().length} caracteres</span>
                <span>Mínimo: {minLength} caracteres</span>
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-modal-confirm-danger"
              disabled={!isLengthValid || loading}
            >
              {loading ? 'Encerrando...' : 'Confirmar Encerramento'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
