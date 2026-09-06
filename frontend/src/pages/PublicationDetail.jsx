import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { CloseQuestionModal } from '../components/common/CloseQuestionModal';
import { api } from '../services/api';
import './PublicationDetail.css';

export const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isVerified, isTechnician, isAdmin, isAuthor } = useContext(AuthContext);

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Modals & Editing states
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingAdminLoading, setClosingAdminLoading] = useState(false);
  const [editingSolutionId, setEditingSolutionId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [comments, setComments] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      api.getProblemById(id)
        .then((data) => {
          if (isMounted && data) {
            setPublication(data);
            setLikesCount(data.likes_count || 0);

            if (data.solutions && Array.isArray(data.solutions) && data.solutions.length > 0) {
              const mapped = data.solutions.map((sol, index) => {
                const authorName = sol.author_name || 'Especialista em Suporte';
                const initials = authorName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ES';
                const isAccepted = Boolean(sol.is_primary || String(sol.id) === String(data.accepted_solution_id));

                return {
                  id: sol.id || index + 1,
                  authorId: sol.author_id,
                  author: authorName,
                  role: sol.author_role || 'Analista de Suporte',
                  initials,
                  time: sol.created_at ? new Date(sol.created_at).toLocaleDateString('pt-BR') : 'publicado no catálogo',
                  text: sol.content,
                  steps: Array.isArray(sol.steps) ? sol.steps : [],
                  isAccepted,
                  bg: isAccepted ? 'var(--badge-mint-bg)' : 'var(--badge-yellow-bg)',
                  textColor: isAccepted ? 'var(--badge-mint-text)' : 'var(--badge-yellow-text)'
                };
              });
              setComments(mapped);
            } else {
              setComments([]);
            }
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar publicação:', err);
          if (isMounted) setPublication(null);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => { isMounted = false; };
  }, [id]);

  const isClosedAdmin = publication?.status === 'FECHADA_ADMIN' || publication?.status === 'FECHADA_ADMINISTRATIVAMENTE';
  const isQuestionAuthor = isAuthor(publication?.author_id);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link da publicação copiado para a área de transferência!', 'success');
      } else {
        showToast('Link: ' + window.location.href, 'info');
      }
    } catch (e) {
      showToast('Não foi possível copiar o link automaticamente.', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isVerified) {
      showToast('Você precisa ter a conta verificada para publicar respostas ou soluções.', 'error');
      return;
    }

    if (isClosedAdmin) {
      showToast('Esta publicação está encerrada administrativamente.', 'error');
      return;
    }

    const newText = commentText.trim();
    if (newText.length < 10) {
      showToast('A solução deve ter no mínimo 10 caracteres para garantir clareza.', 'error');
      return;
    }

    const tempId = Date.now();

    setComments((prev) => [
      ...prev,
      {
        id: tempId,
        authorId: user?.id,
        author: user?.name || 'Você',
        role: user?.role || user?.job_title || 'Analista de Suporte',
        initials: (user?.name || 'VC').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        time: 'agora mesmo',
        text: newText,
        steps: [],
        isAccepted: false,
        bg: 'var(--badge-yellow-bg)',
        textColor: 'var(--badge-yellow-text)'
      }
    ]);
    setCommentText('');

    try {
      const created = await api.addSolution(id || publication?.id, {
        content: newText,
        steps: [`1. ${newText}`]
      });
      if (created && (created.id || created.solution_id)) {
        const actualId = created.id || created.solution_id;
        setComments((prev) => prev.map(c => c.id === tempId ? { ...c, id: actualId } : c));
      }
      showToast('Solução colaborativa enviada com sucesso!', 'success');
    } catch (err) {
      setComments((prev) => prev.filter(c => c.id !== tempId));
      setCommentText(newText);
      showToast(err.message || 'Erro ao enviar solução. Tente novamente.', 'error');
    }
  };

  // ABAC / RBAC: Aceitar solução como resposta oficial (autor da pergunta ou Admin)
  const handleAcceptSolution = async (solutionId) => {
    if (!isQuestionAuthor && !isAdmin) {
      showToast('Apenas o autor da pergunta ou um administrador podem aceitar uma solução.', 'error');
      return;
    }

    if (isClosedAdmin) {
      showToast('Não é possível alterar soluções em uma pergunta encerrada.', 'error');
      return;
    }

    try {
      await api.acceptSolution(publication?.id || id, solutionId);
      
      // Atualiza o estado local
      setComments((prev) =>
        prev.map((c) => ({
          ...c,
          isAccepted: String(c.id) === String(solutionId),
          bg: String(c.id) === String(solutionId) ? 'var(--badge-mint-bg)' : 'var(--badge-yellow-bg)',
          textColor: String(c.id) === String(solutionId) ? 'var(--badge-mint-text)' : 'var(--badge-yellow-text)'
        }))
      );
      setPublication((prev) => ({ ...prev, status: 'RESOLVIDO' }));
      showToast(isAdmin && !isQuestionAuthor ? 'Solução validada e homologada como Oficial pelo Administrador!' : 'Solução marcada como aceita pelo autor!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao aceitar solução.', 'error');
    }
  };

  // Desmarcar Solução Oficial
  const handleUnacceptSolution = async () => {
    if (!isQuestionAuthor && !isAdmin) {
      showToast('Apenas o autor da pergunta ou um administrador podem desmarcar a solução.', 'error');
      return;
    }

    try {
      await api.unacceptSolution(publication?.id || id);
      setComments((prev) =>
        prev.map((c) => ({
          ...c,
          isAccepted: false,
          bg: 'var(--badge-yellow-bg)',
          textColor: 'var(--badge-yellow-text)'
        }))
      );
      setPublication((prev) => ({ ...prev, status: 'ABERTA' }));
      showToast('Solução oficial desmarcada com sucesso.', 'info');
    } catch (err) {
      showToast(err.message || 'Erro ao desmarcar solução.', 'error');
    }
  };

  // ABAC: Iniciar edição da própria solução
  const handleStartEdit = (comm) => {
    setEditingSolutionId(comm.id);
    setEditingText(comm.text);
  };

  // ABAC: Salvar edição da solução
  const handleSaveEdit = async (solutionId) => {
    if (!editingText.trim()) return;
    setEditLoading(true);

    try {
      await api.editSolution(publication?.id || id, solutionId, editingText.trim());
      setComments((prev) =>
        prev.map((c) => (String(c.id) === String(solutionId) ? { ...c, text: editingText.trim() } : c))
      );
      setEditingSolutionId(null);
      setEditingText('');
      showToast('Solução atualizada com sucesso!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao editar solução.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // RBAC: Encerrar administrativamente (Técnicos e Admins)
  const handleAdminClose = async (reason) => {
    if (!reason || reason.trim().length < 15) {
      showToast('Justificativa técnica com no mínimo 15 caracteres é obrigatória.', 'error');
      return;
    }

    setClosingAdminLoading(true);
    try {
      await api.closeProblemAdmin(publication?.id || id, reason);
      setPublication((prev) => ({
        ...prev,
        status: 'FECHADA_ADMINISTRATIVAMENTE',
        closing_reason: reason
      }));
      setShowCloseModal(false);
      showToast('Pergunta encerrada administrativamente com sucesso.', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao encerrar pergunta.', 'error');
    } finally {
      setClosingAdminLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink)', fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>
          Carregando publicação...
        </div>
      </AppLayout>
    );
  }

  if (!publication) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>Publicação não encontrada</h2>
          <p style={{ color: 'var(--foreground-secondary)', marginBottom: '20px' }}>A publicação solicitada não existe ou foi removida.</p>
          <button onClick={() => navigate('/')} className="desktop-create-btn" style={{ margin: '0 auto' }}>
            Voltar ao Início
          </button>
        </div>
      </AppLayout>
    );
  }

  const primarySolution = publication?.solutions?.find(s => s.is_primary) || publication?.solutions?.[0] || null;
  const primarySteps = Array.isArray(primarySolution?.steps) ? primarySolution.steps : [];

  return (
    <AppLayout>
      <div className="pubdetail-screen-wrapper">
        {/* Mobile Header */}
        <header className="pubdetail-header">
          <button
            type="button"
            className="pubdetail-back-btn pressable"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <Icon name="arrow-left" size={19} color="var(--ink)" />
          </button>
          <h1 className="pubdetail-header-title">Publicação</h1>
          <button
            type="button"
            className="pubdetail-more-btn pressable"
            onClick={() => showToast('Opções: Copiar link ou compartilhar.', 'info')}
            aria-label="Mais ações"
          >
            <Icon name="ellipsis" size={19} color="var(--ink)" />
          </button>
        </header>

        {/* Content Body */}
        <div className="pubdetail-content">
          {/* Breadcrumb for Desktop */}
          <div className="pubdetail-desktop-nav">
            <button
              type="button"
              className="pubdetail-desktop-back pressable"
              onClick={() => navigate(-1)}
            >
              <Icon name="arrow-left" size={16} color="var(--green-leaf)" />
              <span>Voltar para publicações</span>
            </button>
            <span className="pubdetail-breadcrumb-sep">/</span>
            <span className="pubdetail-breadcrumb-cat">{publication.category || 'ATENDIMENTO'}</span>
          </div>

          {/* 2-Column Split for Desktop */}
          <div className="pubdetail-layout-grid">
            {/* Left Column (Article Core Content) */}
            <div className="pubdetail-main-col">
              
              {/* RBAC: Banner de Encerramento Administrativo */}
              {isClosedAdmin && (
                <div className="admin-closure-banner">
                  <div className="admin-closure-header">
                    <Icon name="shield-check" size={18} color="var(--yellow-signal)" />
                    <span>TÓPICO ENCERRADO ADMINISTRATIVAMENTE</span>
                  </div>
                  <p className="admin-closure-reason">
                    <strong>Motivo:</strong> {publication.closing_reason || 'Encerrado formalmente pela equipe de suporte técnico.'}
                  </p>
                  <span className="admin-closure-meta">
                    Este tópico está congelado para novas interações e respostas.
                  </span>
                </div>
              )}

              {/* Case Title */}
              <div className="pubdetail-title-block">
                <div className="pubdetail-badge-row">
                  <span className="pubdetail-cat-badge">{publication.category || 'GERAL'}</span>
                  <span className={`pubdetail-status-badge ${isClosedAdmin ? 'closed' : ''}`}>
                    {publication.status || 'ABERTO'}
                  </span>
                </div>
                <h1 className="pubdetail-case-title">{publication.title}</h1>
              </div>

              {/* Problem Description Card */}
              <section className="pubdetail-solution-card">
                <div className="solution-heading">
                  <Icon name="circle-check-big" size={20} color="var(--green-leaf)" />
                  <span className="solution-label">DESCRIÇÃO DO PROCEDIMENTO / PROBLEMA</span>
                </div>
                <p className="solution-text">{publication.description}</p>

                {primarySolution && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="steps-subheading" style={{ color: 'var(--green-leaf)', fontWeight: 600 }}>Solução Principal Registrada:</span>
                      {(primarySolution.author_name || primarySolution.author) && (
                        <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
                          Por: <strong>{primarySolution.author_name || primarySolution.author}</strong>
                        </span>
                      )}
                    </div>
                    <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--ink)' }}>{primarySolution.content || primarySolution.text}</p>
                    
                    {primarySteps.length > 0 && (
                      <div className="solution-steps-box" style={{ marginTop: '10px' }}>
                        <span className="steps-subheading">Passos:</span>
                        {primarySteps.map((st, i) => (
                          <div key={i} className="solution-step-item">{typeof st === 'string' ? st : JSON.stringify(st)}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Solutions / Alternative Methods Section */}
              <section className="pubdetail-comments-section">
                <div className="comments-header">
                  <h2 className="comments-title">Respostas e Soluções Colaborativas</h2>
                  <span className="comments-count">{comments.length}</span>
                </div>

                {comments.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: 'var(--surface-primary)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '16px',
                    color: 'var(--foreground-secondary)',
                    fontSize: '14px'
                  }}>
                    Nenhuma resposta colaborativa foi enviada para esta publicação ainda. Seja o primeiro a responder!
                  </div>
                ) : (
                  <div className="comments-list">
                    {comments.map((comm) => (
                      <div key={comm.id} className="comment-card">
                        <div className="comment-header">
                          <div
                            className="comment-avatar"
                            style={{ backgroundColor: comm.bg, color: comm.textColor }}
                          >
                            <span>{comm.initials}</span>
                          </div>
                          <span className="comment-author-name">{comm.author}</span>
                          <span className="comment-time">{comm.time}</span>

                          {/* ABAC: Editar Solução (Apenas o autor da solução) */}
                          {isAuthor(comm.authorId) && !isClosedAdmin && editingSolutionId !== comm.id && (
                            <button
                              type="button"
                              className="btn-edit-solution"
                              onClick={() => handleStartEdit(comm)}
                              aria-label="Editar resposta"
                            >
                              <Icon name="edit" size={13} />
                              <span>Editar</span>
                            </button>
                          )}
                        </div>

                        {/* Conteúdo ou formulário de edição in-place */}
                        {editingSolutionId === comm.id ? (
                          <div className="solution-edit-box">
                            <textarea
                              className="solution-edit-textarea"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              disabled={editLoading}
                            />
                            <div className="solution-edit-actions">
                              <button
                                type="button"
                                className="btn-edit-cancel"
                                onClick={() => setEditingSolutionId(null)}
                                disabled={editLoading}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="btn-edit-save"
                                onClick={() => handleSaveEdit(comm.id)}
                                disabled={editLoading || !editingText.trim()}
                              >
                                {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="comment-text">{comm.text}</p>
                        )}

                        {/* ABAC & RBAC: Aceitar / Desmarcar Solução & Badge de Solução Aceita */}
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {comm.isAccepted ? (
                            <>
                              <span className="badge-accepted-solution">
                                <Icon name="check-circle" size={14} color="var(--green-leaf)" />
                                Solução Oficial Aceita
                              </span>
                              {(isQuestionAuthor || isAdmin) && !isClosedAdmin && (
                                <button
                                  type="button"
                                  className="btn-edit-solution"
                                  style={{ color: '#EF4444' }}
                                  onClick={handleUnacceptSolution}
                                  title="Desmarcar esta resposta como solução oficial"
                                >
                                  <Icon name="x" size={13} />
                                  <span>Desmarcar</span>
                                </button>
                              )}
                            </>
                          ) : (
                            (isQuestionAuthor || isAdmin) && !isClosedAdmin && (
                              <button
                                type="button"
                                className="btn-accept-solution pressable"
                                onClick={() => handleAcceptSolution(comm.id)}
                              >
                                <Icon name="check" size={14} />
                                <span>{isAdmin && !isQuestionAuthor ? '⭐ Validar como Solução Oficial (Admin)' : 'Marcar como Solução Aceita'}</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Solution / Comment Form */}
                {isClosedAdmin ? (
                  <div className="closed-question-notice">
                    <Icon name="shield-check" size={16} color="var(--foreground-muted)" style={{ display: 'inline', marginRight: '6px' }} />
                    Esta publicação foi encerrada administrativamente e não aceita novas soluções.
                  </div>
                ) : !isVerified ? (
                  <div className="unverified-alert-banner">
                    <Icon name="lightbulb" size={16} color="var(--color-info-foreground)" />
                    <span>Sua conta precisa ser verificada para que você possa enviar soluções colaborativas.</span>
                  </div>
                ) : (
                  <form onSubmit={handleAddComment} className="add-comment-form">
                    <input
                      type="text"
                      placeholder="Escreva uma resposta ou solução para este chamado..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="comment-input"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="comment-submit-btn pressable"
                    >
                      Enviar
                    </button>
                  </form>
                )}
              </section>
            </div>

            {/* Right Column (Sidebar with Author & Actions) */}
            <aside className="pubdetail-sidebar-col">
              {/* Author Card */}
              <div className="pubdetail-author-card">
                <div className="author-card-top">
                  <div className="pubdetail-author-avatar">
                    <span className="author-avatar-text">
                      {(publication.author_name || 'Usuário').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="author-card-meta">
                    <span className="author-label">PUBLICADO POR</span>
                    <h3 className="author-name">{publication.author_name || 'Usuário'}</h3>
                    <span className="author-role">{publication.author_role || publication.author_job_title || 'Analista de Suporte'}</span>
                  </div>
                </div>
                <div className="author-card-date">
                  <Icon name="history" size={14} color="var(--foreground-muted)" />
                  <span>{publication.created_at ? new Date(publication.created_at).toLocaleDateString('pt-BR') : 'Cadastrado no catálogo'}</span>
                </div>
              </div>

              {/* Actions Bar */}
              <section className="pubdetail-actions-card">
                <h4 className="actions-card-title">Interações</h4>
                <div className="actions-card-buttons">
                  <button
                    type="button"
                    className={`action-pill-btn pressable ${liked ? 'liked' : ''}`}
                    onClick={handleLike}
                  >
                    <Icon name="thumbs-up" size={17} color={liked ? '#FFFFFF' : 'var(--green-leaf)'} />
                    <span>{likesCount} Útil</span>
                  </button>

                  <button
                    type="button"
                    className={`action-pill-btn pressable ${saved ? 'saved' : ''}`}
                    onClick={() => {
                      const nextSaved = !saved;
                      setSaved(nextSaved);
                      showToast(nextSaved ? 'Publicação salva nos favoritos!' : 'Publicação removida dos favoritos.', 'info');
                    }}
                  >
                    <Icon name="bookmark" size={17} color={saved ? '#181D17' : 'var(--foreground-secondary)'} />
                    <span>{saved ? 'Salvo' : 'Salvar'}</span>
                  </button>

                  <button
                    type="button"
                    className="action-pill-btn pressable"
                    onClick={handleShare}
                  >
                    <Icon name="share-2" size={17} color="var(--foreground-secondary)" />
                    <span>Compartilhar link</span>
                  </button>

                  {/* RBAC: Ação Administrativa para Técnicos e Admins */}
                  {(isTechnician || isAdmin) && !isClosedAdmin && (
                    <button
                      type="button"
                      className="action-pill-btn btn-close-admin pressable"
                      onClick={() => setShowCloseModal(true)}
                    >
                      <Icon name="shield-check" size={17} color="#DC2626" />
                      <span>Encerrar Pergunta (Admin/Técnico)</span>
                    </button>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {/* Modal de Encerramento Administrativo */}
      <CloseQuestionModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleAdminClose}
        loading={closingAdminLoading}
      />
    </AppLayout>
  );
};

export default PublicationDetail;
