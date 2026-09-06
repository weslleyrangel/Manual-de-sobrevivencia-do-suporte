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

    async resendVerification(email) {
        const res = await fetch(`${API_BASE}/auth/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email })
        });
        return parseApiResponse(res, 'Falha ao reenviar e-mail de ativação');
    },

    async forgotPassword(email) {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email })
        });
        return parseApiResponse(res, 'Falha ao solicitar recuperação de senha');
    },

    async resetPassword(token, password) {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token, password })
        });
        return parseApiResponse(res, 'Falha ao redefinir senha');
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

    async acceptSolution(problemId, solutionId, options = {}) {
        const res = await fetch(`${API_BASE}/problems/${problemId}/solutions/${solutionId}/accept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(options)
        });
        return parseApiResponse(res, 'Erro ao processar solução');
    },

    async unacceptSolution(problemId) {
        const res = await fetch(`${API_BASE}/problems/${problemId}/solutions/unaccept/accept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ desmarcar: true })
        });
        return parseApiResponse(res, 'Erro ao desmarcar solução');
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

    // 3. Admin Endpoints
    async getAdminStats() {
        const res = await fetch(`${API_BASE}/admin/stats`, {
            credentials: 'include'
        });
        return parseApiResponse(res, 'Erro ao obter métricas administrativas');
    },

    async getAdminUsers(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.role) queryParams.append('role', params.role);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const res = await fetch(`${API_BASE}/admin/users?${queryParams.toString()}`, {
            credentials: 'include'
        });
        return parseApiResponse(res, 'Erro ao listar usuários');
    },

    async updateAdminUserRole(userId, role, jobTitle) {
        const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ role, job_title: jobTitle })
        });
        return parseApiResponse(res, 'Erro ao atualizar papel do usuário');
    },

    async updateAdminUserStatus(userId, statusData) {
        const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(statusData)
        });
        return parseApiResponse(res, 'Erro ao atualizar status do usuário');
    },

    async resendAdminUserVerification(userId) {
        const res = await fetch(`${API_BASE}/admin/users/${userId}/resend-verification`, {
            method: 'POST',
            credentials: 'include'
        });
        return parseApiResponse(res, 'Erro ao reenviar e-mail de verificação');
    },

    async getAdminProblems(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.category) queryParams.append('category', params.category);
        if (params.status) queryParams.append('status', params.status);
        if (params.has_solution !== undefined) queryParams.append('has_solution', params.has_solution);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const res = await fetch(`${API_BASE}/admin/problems?${queryParams.toString()}`, {
            credentials: 'include'
        });
        return parseApiResponse(res, 'Erro ao listar publicações para moderação');
    },

    async moderateAdminProblem(problemId, data) {
        const res = await fetch(`${API_BASE}/admin/problems/${problemId}/moderation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return parseApiResponse(res, 'Erro ao moderar publicação');
    },

    async deleteAdminProblem(problemId) {
        const res = await fetch(`${API_BASE}/admin/problems/${problemId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return parseApiResponse(res, 'Erro ao excluir publicação');
    },

    // 4. Busca Full-Text
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
