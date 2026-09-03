import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './PublicationDetail.css';

const DEFAULT_PUB = {
  id: '1',
  title: 'Cliente não recebeu o e-mail de redefinição de senha',
  author_name: 'Ana Martins',
  author_role: 'Especialista em Suporte N2',
  category: 'ATENDIMENTO',
  status: 'RESOLVIDO',
  description: 'Confirmamos o e-mail cadastrado no painel administrativo, reenviamos o token de redefinição e orientamos o cliente a checar as pastas de Spam e Lixeira eletrônica. Após 2 minutos o cliente confirmou o recebimento e concluiu o login.',
  created_at: 'Hoje, às 09:42',
  solutions: [
    {
      id: 1,
      author_name: 'Rafael Costa',
      author_role: 'Analista de suporte',
      content: 'Ótima saída! Vou incluir esse passo no meu checklist.',
      steps: [
        '1. Valide o e-mail no painel do usuário (evitar digitação errada).',
        '2. Dispare o reenvio manual do link de redefinição.',
        '3. Solicite que o cliente busque por "noreply@empresa.com" na caixa de pesquisa.'
      ],
      is_primary: true
    },
    {
      id: 2,
      author_name: 'Mariana Silva',
      author_role: 'Analista de redes',
      content: 'Aqui na fila de pagamentos esse procedimento resolveu com agilidade.',
      steps: [],
      is_primary: false
    }
  ]
};

export const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [publication, setPublication] = useState(DEFAULT_PUB);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(24);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Rafael Costa',
      role: 'Analista de suporte',
      initials: 'RC',
      time: 'há 18 min',
      text: 'Ótima saída! Vou incluir esse passo no meu checklist.',
      bg: 'var(--badge-yellow-bg)',
      textColor: 'var(--badge-yellow-text)'
    },
    {
      id: 2,
      author: 'Mariana Silva',
      role: 'Analista de redes',
      initials: 'MS',
      time: 'há 5 min',
      text: 'Aqui na fila de pagamentos esse procedimento resolveu com agilidade.',
      bg: 'var(--badge-mint-bg)',
      textColor: 'var(--badge-mint-text)'
    }
  ]);

  useEffect(() => {
    let isMounted = true;
    if (id && id !== '1') {
      api.getProblemById(id)
        .then((data) => {
          if (isMounted && data) {
            setPublication(data);
            setLikesCount(data.likes_count || 24);

            if (data.solutions && data.solutions.length > 0) {
              const mapped = data.solutions.map((sol, index) => ({
                id: sol.id || index + 1,
                author: sol.author_name || 'Especialista em Suporte',
                role: sol.author_role || 'Analista N2',
                initials: (sol.author_name || 'ES').split(' ').map(n => n[0]).join('').slice(0, 2),
                time: 'publicado no catálogo',
                text: sol.content,
                steps: sol.steps || [],
                isPrimary: sol.is_primary,
                bg: sol.is_primary ? 'var(--badge-mint-bg)' : 'var(--badge-yellow-bg)',
                textColor: sol.is_primary ? 'var(--badge-mint-text)' : 'var(--badge-yellow-text)'
              }));
              setComments(mapped);
            }
          }
        })
        .catch(() => {});
    }

    return () => { isMounted = false; };
  }, [id]);

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

    const newText = commentText.trim();
    setComments([
      ...comments,
      {
        id: Date.now(),
        author: 'Você (Weslley Rangel)',
        role: 'Especialista em Suporte',
        initials: 'WR',
        time: 'agora mesmo',
        text: newText,
        bg: 'var(--badge-mint-bg)',
        textColor: 'var(--badge-mint-text)'
      }
    ]);
    setCommentText('');

    try {
      await api.addSolution(id || '1', {
        content: newText,
        steps: [`1. ${newText}`]
      });
      showToast('Solução colaborativa enviada com sucesso!', 'success');
    } catch (err) {
      showToast('Comentário registrado localmente.', 'info');
    }
  };

  const primarySolution = publication?.solutions?.find(s => s.is_primary) || publication?.solutions?.[0] || {
    content: publication?.description || 'Confirmamos o e-mail cadastrado no painel administrativo.',
    steps: [
      '1. Valide o e-mail no painel do usuário (evitar digitação errada).',
      '2. Dispare o reenvio manual do link de redefinição.',
      '3. Solicite que o cliente busque por "noreply@empresa.com" na caixa de pesquisa.'
    ]
  };

  const primarySteps = Array.isArray(primarySolution.steps) && primarySolution.steps.length > 0 
    ? primarySolution.steps 
    : [
      '1. Valide o e-mail no painel do usuário (evitar digitação errada).',
      '2. Dispare o reenvio manual do link de redefinição.',
      '3. Solicite que o cliente busque por "noreply@empresa.com" na caixa de pesquisa.'
    ];

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
            onClick={() => showToast('Opções: Copiar link, reportar erro ou imprimir.', 'info')}
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
            <span className="pubdetail-breadcrumb-cat">{publication?.category || 'ATENDIMENTO'}</span>
          </div>

          {/* 2-Column Split for Desktop */}
          <div className="pubdetail-layout-grid">
            {/* Left Column (Article Core Content) */}
            <div className="pubdetail-main-col">
              {/* Case Title */}
              <div className="pubdetail-title-block">
                <div className="pubdetail-badge-row">
                  <span className="pubdetail-cat-badge">{publication?.category || 'GERAL'}</span>
                  <span className="pubdetail-status-badge">{publication?.status || 'RESOLVIDO'}</span>
                </div>
                <h1 className="pubdetail-case-title">{publication?.title || 'Carregando detalhes...'}</h1>
              </div>

              {/* Attachment Banner */}
              <div className="pubdetail-attachment-banner">
                <div className="attachment-badge">
                  <Icon name="image-up" size={15} color="var(--accent-primary)" />
                  <span>PRINT / EVIDÊNCIA ANEXADA</span>
                </div>
              </div>

              {/* Solution Card */}
              <section className="pubdetail-solution-card">
                <div className="solution-heading">
                  <Icon name="circle-check-big" size={20} color="var(--green-leaf)" />
                  <span className="solution-label">COMO FOI SOLUCIONADO</span>
                </div>
                <p className="solution-text">{publication?.description || primarySolution.content}</p>

                <div className="solution-steps-box">
                  <span className="steps-subheading">Passo a passo recomendado:</span>
                  {primarySteps.map((st, i) => (
                    <div key={i} className="solution-step-item">{typeof st === 'string' ? st : JSON.stringify(st)}</div>
                  ))}
                </div>
              </section>

              {/* Comments / Alternative Methods Section */}
              <section className="pubdetail-comments-section">
                <div className="comments-header">
                  <h2 className="comments-title">Métodos alternativos e comentários</h2>
                  <span className="comments-count">{comments.length}</span>
                </div>

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
                      </div>
                      <p className="comment-text">{comm.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="add-comment-form">
                  <input
                    type="text"
                    placeholder="Escreva um comentário ou sugestão..."
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
              </section>
            </div>

            {/* Right Column (Sidebar with Author & Actions) */}
            <aside className="pubdetail-sidebar-col">
              {/* Author Card */}
              <div className="pubdetail-author-card">
                <div className="author-card-top">
                  <div className="pubdetail-author-avatar">
                    <span className="author-avatar-text">
                      {(publication?.author_name || 'Ana Martins').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="author-card-meta">
                    <span className="author-label">PUBLICADO POR</span>
                    <h3 className="author-name">{publication?.author_name || 'Ana Martins'}</h3>
                    <span className="author-role">{publication?.author_role || 'Especialista em Suporte N2'}</span>
                  </div>
                </div>
                <div className="author-card-date">
                  <Icon name="clock" size={14} color="var(--foreground-muted)" />
                  <span>Cadastrado no catálogo oficial</span>
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
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
