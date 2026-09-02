import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import './NewPublication.css';

export const NewPublication = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
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

  const handleSave = (isDraft = false) => {
    if (!title.trim() && !isDraft) {
      alert('Por favor, digite um título para a publicação.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(isDraft ? 'Rascunho salvo com sucesso!' : 'Publicação realizada com sucesso!');
      navigate('/my-publications');
    }, 400);
  };

  return (
    <AppLayout hideBottomNav>
      <div className="newpub-screen-wrapper">
        {/* Header */}
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
          {/* Community Note */}
          <div className="newpub-community-note">
            <Icon name="sprout" size={18} color="var(--green-deep)" />
            <span className="community-note-text">
              Compartilhe algo que ajude outro agente hoje.
            </span>
          </div>

          {/* Title Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="pub-title">Título</label>
            <div className="form-input-box">
              <input
                id="pub-title"
                type="text"
                placeholder="Dê um nome claro à sua dica"
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
                <option value="">Selecione uma categoria</option>
                <option value="Atendimento">Atendimento ao Cliente</option>
                <option value="Boas práticas">Boas práticas & Empatia</option>
                <option value="Processos">Processos e Fluxos</option>
                <option value="Ferramentas">Ferramentas & Acessos</option>
                <option value="Erros Comuns">Resolução de Erros Comuns</option>
              </select>
              <Icon name="chevron-down" size={18} color="var(--green-deep)" />
            </div>
          </div>

          {/* Content Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="pub-content">Conteúdo</label>
            <div className="newpub-textarea-box">
              <textarea
                id="pub-content"
                maxLength={1200}
                placeholder="Escreva sua dica, contexto e o que funcionou…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <span className="newpub-char-counter">{content.length} / 1.200</span>
            </div>
          </div>

          {/* Step-by-Step & Images Section */}
          <section className="newpub-steps-section">
            <div className="steps-section-header">
              <label className="form-label">Imagens e Passo a Passo</label>
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
                        <Icon name="image-up" size={14} color="#FFFFFF" /> Trocar
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
                      <Icon name="image-up" size={24} color="var(--green-leaf)" />
                      <span className="upload-label-title">Anexar print ou imagem</span>
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
                    placeholder="O que fazer nesta etapa..."
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
                <Icon name="plus" size={16} color="var(--green-deep)" /> Adicionar outro passo
              </button>
            </div>
          </section>

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
      </div>
    </AppLayout>
  );
};
