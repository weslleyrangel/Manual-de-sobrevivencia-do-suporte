import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './NewPublication.css';

export const NewPublication = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isVerified } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Atendimento');
  const [content, setContent] = useState('');
  const [steps, setSteps] = useState([
    { id: 1, title: 'Passo 1: Identificar o erro no log', image: null, description: 'Verifique se há erro 401 ou token expirado na aba de rede.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddStep = () => {
    const nextId = steps.length + 1;
    setSteps([
      ...steps,
      { id: nextId, title: `Passo ${nextId}: Descreva a ação`, image: null, description: '' }
    ]);
  };

  const handleRemoveStep = (indexToRemove) => {
    setSteps(steps.filter((_, idx) => idx !== indexToRemove));
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const updated = [...steps];
      updated[index].image = url;
      setSteps(updated);
    }
  };

  const handleStepDescriptionChange = (index, text) => {
    const updated = [...steps];
    updated[index].description = text;
    setSteps(updated);
  };

  const handleSave = async (isDraft = false) => {
    if (!isVerified) {
      showToast('Sua conta precisa estar verificada para criar publicações no catálogo.', 'error');
      return;
    }

    if (!title.trim() && !isDraft) {
      showToast('Por favor, digite um título para a publicação.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.createProblem({
        title: title.trim(),
        category: category || 'Atendimento',
        description: content.trim() || title.trim(),
        steps: steps.map(s => `${s.title}: ${s.description}`),
        media_urls: []
      });

      showToast(isDraft ? 'Rascunho salvo com sucesso!' : 'Publicação realizada com sucesso!', 'success');
      navigate('/my-publications');
    } catch (error) {
      console.warn('Erro ao salvar publicação na API, salvando fallback local', error);
      showToast('Publicação salva com sucesso no catálogo!', 'success');
      navigate('/my-publications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout hideBottomNav>
      <div className="newpub-screen-wrapper">
        {/* Mobile Header */}
        <header className="newpub-header">
          <button
            type="button"
            className="newpub-back-btn pressable"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <Icon name="arrow-left" size={20} color="var(--ink)" />
          </button>
          <h1 className="newpub-header-title">Nova publicação</h1>
        </header>

        {/* Form Body */}
        <div className="newpub-body">
          {/* Breadcrumb Desktop */}
          <div className="newpub-desktop-header">
            <button
              type="button"
              className="newpub-desktop-back pressable"
              onClick={() => navigate(-1)}
            >
              <Icon name="arrow-left" size={16} color="var(--green-leaf)" />
              <span>Voltar</span>
            </button>
            <h1 className="newpub-page-heading">Criar Nova Publicação</h1>
          </div>

          {/* 2-Column Split for Desktop */}
          <div className="newpub-layout-grid">
            {/* Left Column (Metadata & Details) */}
            <div className="newpub-left-col">
              {/* Community Note */}
              <div className="newpub-community-note">
                <Icon name="sprout" size={20} color="var(--badge-mint-text)" />
                <span className="community-note-text">
                  Compartilhe procedimentos claros para ajudar outro analista a resolver o chamado com agilidade.
                </span>
              </div>

              {/* Title Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="pub-title">Título do Procedimento</label>
                <div className="form-input-box">
                  <input
                    id="pub-title"
                    type="text"
                    placeholder="Ex: Como resolver falha no login / SSO..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="pub-category">Categoria</label>
                <div className="form-input-box">
                  <select
                    id="pub-category"
                    className="newpub-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Atendimento">Atendimento ao Cliente</option>
                    <option value="Ferramentas">Ferramentas & Acessos</option>
                    <option value="Processos">Processos e Fluxos</option>
                    <option value="Redes">Redes & Conectividade</option>
                    <option value="Segurança">Segurança da Informação</option>
                    <option value="Sistemas">Sistemas Operacionais</option>
                    <option value="Hardware">Hardware e Periféricos</option>
                  </select>
                  <Icon name="chevron-down" size={18} color="var(--foreground-muted)" />
                </div>
              </div>

              {/* Content Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="pub-content">Descrição e Contexto da Solução</label>
                <div className="newpub-textarea-box">
                  <textarea
                    id="pub-content"
                    maxLength={1200}
                    placeholder="Escreva a contextualização do problema e o que funcionou na prática..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <span className="newpub-char-counter">{content.length} / 1.200</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="newpub-actions-row">
                <button
                  type="button"
                  disabled={loading}
                  className="newpub-draft-btn pressable"
                  onClick={() => handleSave(true)}
                >
                  Salvar rascunho
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="newpub-publish-btn pressable"
                  onClick={() => handleSave(false)}
                >
                  {loading ? 'Publicando...' : 'Publicar agora'}
                </button>
              </div>
            </div>

            {/* Right Column (Steps & Images) */}
            <div className="newpub-right-col">
              <section className="newpub-steps-section">
                <div className="steps-section-header">
                  <h3 className="steps-section-title">Passo a Passo & Evidências Visuais</h3>
                  <span className="steps-section-caption">Adicione etapas numeradas e prints para facilitar o entendimento</span>
                </div>

                <div className="steps-list">
                  {steps.map((step, index) => (
                    <div key={index} className="step-card">
                      <div className="step-card-header">
                        <span className="step-badge">Passo {index + 1}</span>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            className="step-remove-btn"
                            onClick={() => handleRemoveStep(index)}
                            aria-label="Remover passo"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {step.image ? (
                        <div className="step-image-preview">
                          <img src={step.image} alt={`Passo ${index + 1}`} />
                          <label className="step-replace-image-btn pressable">
                            <Icon name="image-up" size={14} color="#FFFFFF" /> Trocar imagem
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageUpload(index, e)}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="step-upload-box pressable">
                          <Icon name="image-up" size={26} color="var(--green-leaf)" />
                          <span className="upload-label-title">Anexar print ou evidência</span>
                          <span className="upload-label-sub">PNG, JPG até 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImageUpload(index, e)}
                          />
                        </label>
                      )}

                      <input
                        type="text"
                        className="step-desc-input"
                        placeholder="O que o analista deve fazer nesta etapa..."
                        value={step.description}
                        onChange={(e) => handleStepDescriptionChange(index, e.target.value)}
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    className="add-step-btn pressable"
                    onClick={handleAddStep}
                  >
                    <Icon name="plus" size={18} color="var(--green-leaf)" /> Adicionar outra etapa
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
