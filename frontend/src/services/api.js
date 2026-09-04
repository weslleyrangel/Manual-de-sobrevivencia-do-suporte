// Cliente HTTP da API com suporte a fallback offline transparente
import { saveProblemsOffline, getOfflineProblems } from '../utils/offlineStore';

const API_BASE = '/api/v1';

async function parseApiResponse(res, defaultErrorMsg) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || defaultErrorMsg);
    }
    return res.json();
}

export const api = {
    // 1. Auth
    async login(email, password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        return parseApiResponse(res, 'E-mail ou senha incorretos');
    },

    async register(data) {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return parseApiResponse(res, 'Falha ao registrar conta');
    },

    async verifyEmail(token) {
        const res = await fetch(`${API_BASE}/auth/verify/${encodeURIComponent(token)}`, {
            credentials: 'include'
        });
        return parseApiResponse(res, 'Token inválido ou expirado');
    },

    async me() {
        const res = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
    },

    async logout() {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    },

    // 2. Publicações & Problemas
    async getProblems(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.author_id) queryParams.append('author_id', params.author_id);
        if (params.limit) queryParams.append('limit', params.limit);

        try {
            const res = await fetch(`${API_BASE}/problems?${queryParams.toString()}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    saveProblemsOffline(data).catch(() => {});
                }
                return data;
            }
        } catch (e) {
            console.warn('Rede indisponível, buscando dados no IndexedDB...', e);
        }

        const cached = await getOfflineProblems();
        return cached || [];
    },

    async getProblemById(id) {
        try {
            const res = await fetch(`${API_BASE}/problems/${id}`, {
                credentials: 'include'
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.warn('Rede indisponível para getProblemById', e);
        }

        const cached = await getOfflineProblems();
        const found = cached?.find(p => String(p.id) === String(id));
        if (found) return found;

        throw new Error('Publicação não encontrada.');
    },

    async createProblem(data) {
        const res = await fetch(`${API_BASE}/problems`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return parseApiResponse(res, 'Erro ao criar publicação');
    },

    async addSolution(problemId, data) {
        const res = await fetch(`${API_BASE}/problems/${problemId}/solutions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return parseApiResponse(res, 'Erro ao adicionar solução');
    },

    async acceptSolution(problemId, solutionId) {
        const res = await fetch(`${API_BASE}/problems/${problemId}/solutions/${solutionId}/accept`, {
            method: 'PUT',
            credentials: 'include'
        });
        return parseApiResponse(res, 'Erro ao aceitar solução');
    },

    async editSolution(problemId, solutionId, content) {
        const res = await fetch(`${API_BASE}/problems/${problemId}/solutions/${solutionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content })
        });
        return parseApiResponse(res, 'Erro ao editar solução');
    },

    async closeProblemAdmin(problemId, reason) {
        const res = await fetch(`${API_BASE}/problems/${problemId}/close-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ reason })
        });
        return parseApiResponse(res, 'Erro ao encerrar pergunta administrativamente');
    },

    // 3. Busca Full-Text
    async search(query) {
        try {
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query || '')}`, {
                credentials: 'include'
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.warn('Busca offline em fallback...', e);
        }

        const cached = await getOfflineProblems();
        if (!cached || cached.length === 0) return [];
        return cached.filter(p => 
            p.title.toLowerCase().includes(query.toLowerCase()) || 
            (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
        );
    }
};
