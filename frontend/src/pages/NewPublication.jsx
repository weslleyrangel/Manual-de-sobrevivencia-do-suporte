import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './NewPublication.css';

export const NewPublication = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [suppliesInfo, setSuppliesInfo] = useState('');
  const [content, setContent] = useState('');

  // Lista de etapas estruturadas
  const [steps, setSteps] = useState([
    { id: 1, title: 'Passo 1: Ação inicial', file: null, previewUrl: null, description: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddStep = () => {
    const nextId = steps.length + 1;
    setSteps([
      ...steps,
      { id: nextId, title: `Passo ${nextId}: Descreva a ação`, file: null, previewUrl: null, description: '' }
    ]);
  };

  const handleRemoveStep = (indexToRemove) => {
    setSteps(steps.filter((_, idx) => idx !== indexToRemove));
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      const updated = [...steps];
      updated[index].file = file;
      updated[index].previewUrl = preview;
      setSteps(updated);
    }
  };

  const handleStepTitleChange = (index, text) => {
    const updated = [...steps];
    updated[index].title = text;
    setSteps(updated);
  };

  const handleStepDescriptionChange = (index, text) => {
    const updated = [...steps];
    updated[index].description = text;
    setSteps(updated);
  };

  const handleSave = async (isDraft = false) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('Por favor, digite um título para a publicação.', 'error');
      return;
    }

    if (trimmedTitle.length < 5) {
      showToast('O título deve ter no mínimo 5 caracteres.', 'error');
      return;
    }

    setLoading(true);
    try {
      showToast('Enviando imagens e cadastrando...', 'info');

      // 1. Fazer upload dos prints para o Supabase Storage
      const formattedSteps = await Promise.all(
        steps.map(async (st, idx) => {
          let imageUrl = null;
          if (st.file) {
            try {
              imageUrl = await api.uploadImage(st.file);
            } catch (err) {
              console.warn('Falha no upload da imagem do passo:', err);
            }
          }
          return {
            step_number: idx + 1,
            title: st.title || `Passo ${idx + 1}`,
            description: st.description || '',
            image_url: imageUrl
          };
        })
      );

      // 2. Salvar o problema e as soluções no Supabase
      const newProblem = await api.createProblem({
        title: trimmedTitle,
        category: category || 'Hardware',
        description: content.trim() || trimmedTitle,
        equipment_model: equipmentModel.trim() || null,
        supplies_info: suppliesInfo.trim() || null,
        steps: formattedSteps
      });

      showToast(isDraft ? 'Rascunho salvo com sucesso!' : 'Procedimento publicado com sucesso!', 'success');
      navigate(`/publication/${newProblem.id}`);
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Erro ao salvar publicação no catálogo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="newpub-screen-wrapper">
        <header className="newpub-header">
          <button
            type="button"
            className="newpub-back-btn pressable"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <Icon name="arrow-left" size={20} color="var(--ink)" />
          </button>
          <h1 className="newpub-header-title">Novo Procedimento</h1>
        </header>

        <div className="newpub-body">
          <div className="newpub-desktop-header">
            <button
              type="button"
              className="newpub-desktop-back pressable"
              onClick={() => navigate(-1)}
            >
              <Icon name="arrow-left" size={16} color="var(--green-leaf)" />
              <span>Voltar</span>
            </button>
            <h1 className="newpub-page-heading">Cadastrar Procedimento / Equipamento</h1>
          </div>

          <div className="newpub-layout-grid">
            {/* Coluna Esquerda: Dados do Problema & Insumos */}
            <div className="newpub-left-col">
              <div className="newpub-community-note">
                <Icon name="sprout" size={20} color="var(--badge-mint-text)" />
                <span className="community-note-text">
                  Ajude a equipe: descreva o problema, o modelo da máquina e o insumo certo para agilizar o suporte.
                </span>
              </div>

              {/* Título */}
              <div className="form-group">
                <label className="form-label" htmlFor="pub-title">Título do Procedimento</label>
                <div className="form-input-box">
                  <input
                    id="pub-title"
                    type="text"
                    maxLength={150}
                    placeholder="Ex: Impressão falhando ou saindo em branco..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="form-group">
                <label className="form-label" htmlFor="pub-category">Categoria</label>
                <div className="form-input-box">
                  <select
                    id="pub-category"
                    className="newpub-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Impressoras">Impressoras e Térmicas</option>
                    <option value="Hardware">Hardware e Periféricos</option>
                    <option value="Redes">Redes & Conectividade</option>
                    <option value="Sistemas">Sistemas Operacionais</option>
                    <option value="Atendimento">Atendimento e Rotinas</option>
                  </select>
                  <Icon name="chevron-down" size={18} color="var(--foreground-muted)" />
                </div>
              </div>

              {/* Bloco de Hardware & Insumo (Opcional mas recomendado) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pub-equipment">Modelo do Equipamento</label>
                  <div className="form-input-box">
                    <input
                      id="pub-equipment"
                      type="text"
                      placeholder="Ex: Elgin i9, Zebra ZD220"
                      value={equipmentModel}
                      onChange={(e) => setEquipmentModel(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pub-supplies">Insumo / Suprimento</label>
                  <div className="form-input-box">
                    <input
                      id="pub-supplies"
                      type="text"
                      placeholder="Ex: Bobina Térmica 80x40mm"
                      value={suppliesInfo}
                      onChange={(e) => setSuppliesInfo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Descrição Geral */}
              <div className="form-group">
                <label className="form-label" htmlFor="pub-content">Descrição do Problema / Causa Raiz</label>
                <div className="newpub-textarea-box">
                  <textarea
                    id="pub-content"
                    maxLength={1200}
                    placeholder="Explique o que causa esse comportamento e o resumo do que deve ser feito..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <span className="newpub-char-counter">{content.length} / 1.200</span>
                </div>
              </div>

              {/* Ações */}
              <div className="newpub-actions-row">
                <button
                  type="button"
                  disabled={loading}
                  className="newpub-publish-btn pressable"
                  onClick={() => handleSave(false)}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Enviando Imagens e Salvando...' : 'Publicar no Catálogo'}
                </button>
              </div>
            </div>

            {/* Coluna Direita: Passos com Upload de Imagem */}
            <div className="newpub-right-col">
              <section className="newpub-steps-section">
                <div className="steps-section-header">
                  <h3 className="steps-section-title">Passo a Passo com Prints</h3>
                  <span className="steps-section-caption">Adicione fotos de telas ou cabos para ajudar o analista novato</span>
                </div>

                <div className="steps-list">
                  {steps.map((step, index) => (
                    <div key={index} className="step-card" style={{ marginBottom: '16px' }}>
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

                      {/* Título do Passo */}
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          marginBottom: '8px',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}
                        placeholder={`Título da etapa (Ex: Abrir painel de controle)`}
                        value={step.title}
                        onChange={(e) => handleStepTitleChange(index, e.target.value)}
                      />

                      {/* Prévia ou Upload de Imagem */}
                      {step.previewUrl ? (
                        <div className="step-image-preview">
                          <img src={step.previewUrl} alt={`Prévia do Passo ${index + 1}`} />
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
                          <span className="upload-label-title">Anexar print da tela</span>
                          <span className="upload-label-sub">PNG, JPG ou WebP</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImageUpload(index, e)}
                          />
                        </label>
                      )}

                      {/* Descrição da Ação */}
                      <input
                        type="text"
                        className="step-desc-input"
                        placeholder="O que o analista deve clicar ou configurar aqui..."
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
                    <Icon name="plus" size={18} color="var(--green-leaf)" /> Adicionar outro passo
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

export default NewPublication;