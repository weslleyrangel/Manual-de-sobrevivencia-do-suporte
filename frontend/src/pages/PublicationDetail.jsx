import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import './PublicationDetail.css';

export const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(24);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Rafael Costa',
      initials: 'RC',
      time: 'há 18 min',
      text: 'Ótima saída! Vou incluir esse passo no meu checklist.',
      bg: 'var(--yellow-pale)',
      textColor: 'var(--green-deep)'
    },
    {
      id: 2,
      author: 'Mariana Silva',
      initials: 'MS',
      time: 'há 5 min',
      text: 'Aqui na fila de pagamentos esse procedimento resolveu com agilidade.',
      bg: 'var(--green-mint)',
      textColor: 'var(--green-deep)'
    }
  ]);

  const publication = {
    title: id === '2' 
      ? '5 frases para desarmar uma conversa difícil' 
      : 'Cliente não recebeu o e-mail de redefinição de senha',
    author: 'Ana Martins',
    initials: 'AM',
    date: 'Criado hoje, às 09:42',
    status: 'RESOLVIDO',
    category: 'ATENDIMENTO',
    solution: 'Confirmamos o e-mail cadastrado no painel administrativo, reenviamos o token de redefinição e orientamos o cliente a checar as pastas de Spam e Lixeira eletrônica. Após 2 minutos o cliente confirmou o recebimento e concluiu o login.',
    steps: [
      '1. Valide o e-mail no painel do usuário (evitar digitação errada).',
      '2. Dispare o reenvio manual do link de redefinição.',
      '3. Solicite que o cliente busque por "noreply@empresa.com" na caixa de pesquisa.'
    ]
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments([
      ...comments,
      {
        id: Date.now(),
        author: 'Você (Suporte)',
        initials: 'VC',
        time: 'agora mesmo',
        text: commentText.trim(),
        bg: 'var(--green-mint)',
        textColor: 'var(--green-deep)'
      }
    ]);
    setCommentText('');
  };

  return (
    <AppLayout>
      <div className="pubdetail-screen-wrapper">
        {/* Header */}
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
            onClick={() => alert('Opções: Copiar link, reportar erro ou imprimir.')}
            aria-label="Mais ações"
          >
            <Icon name="ellipsis" size={19} color="var(--ink)" />
          </button>
        </header>

        {/* Content Body */}
        <div className="pubdetail-content">
          {/* Author info & status */}
          <section className="pubdetail-author-row">
            <div className="pubdetail-author-avatar">
              <span className="author-avatar-text">{publication.initials}</span>
            </div>
            <div className="pubdetail-author-copy">
              <span className="author-name">{publication.author}</span>
              <span className="author-date">{publication.date}</span>
            </div>
            <div className="pubdetail-status-badge">
              <span>{publication.status}</span>
            </div>
          </section>

          {/* Case Title */}
          <h2 className="pubdetail-case-title">{publication.title}</h2>

          {/* Attachment Banner */}
          <div className="pubdetail-attachment-banner">
            <div className="attachment-badge">
              <Icon name="image-up" size={14} color="var(--green-deep)" />
              <span>IMAGEM ANEXADA</span>
            </div>
          </div>

          {/* Solution Card */}
          <section className="pubdetail-solution-card">
            <div className="solution-heading">
              <Icon name="circle-check-big" size={18} color="var(--green-leaf)" />
              <span className="solution-label">COMO FOI SOLUCIONADO</span>
            </div>
            <p className="solution-text">{publication.solution}</p>

            <div className="solution-steps-box">
              {publication.steps.map((st, i) => (
                <div key={i} className="solution-step-item">{st}</div>
              ))}
            </div>
          </section>

          {/* Action Bar (Like, Save, Share) */}
          <section className="pubdetail-actions-bar">
            <button
              type="button"
              className={`action-pill-btn pressable ${liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <Icon name="thumbs-up" size={16} color={liked ? '#FFFFFF' : 'var(--green-deep)'} />
              <span>{likesCount} Útil</span>
            </button>
            <button
              type="button"
              className={`action-pill-btn pressable ${saved ? 'saved' : ''}`}
              onClick={() => setSaved(!saved)}
            >
              <Icon name="bookmark" size={16} color={saved ? '#FFFFFF' : 'var(--foreground-secondary)'} />
              <span>{saved ? 'Salvo' : 'Salvar'}</span>
            </button>
            <button
              type="button"
              className="action-pill-btn pressable"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Link da publicação copiado para a área de transferência!');
              }}
            >
              <Icon name="share-2" size={16} color="var(--foreground-secondary)" />
              <span>Compartilhar</span>
            </button>
          </section>

          {/* Comments Section */}
          <section className="pubdetail-comments-section">
            <div className="comments-header">
              <h3 className="comments-title">Comentários</h3>
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
      </div>
    </AppLayout>
  );
};
