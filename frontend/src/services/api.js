import { supabase, searchProblems, getProblemById, createProblemWithSteps, uploadStepImage } from './supabase';

export const api = {
    // 1. Busca Rápida no Supabase (com Modelo de Equipamento e Insumos)
    async search(query) {
        if (!query || !query.trim()) return [];
        try {
            const data = await searchProblems(query);
            return (data || []).map(p => ({
                id: p.id,
                title: p.title,
                category: p.category || 'Geral',
                snippet: p.description,
                equipment_model: p.equipment_model,
                supplies_info: p.supplies_info,
                views_count: p.views_count || 0,
                has_steps: Boolean(p.solutions?.[0]?.steps?.length > 0)
            }));
        } catch (err) {
            console.error('Erro na busca pelo Supabase:', err);
            return [];
        }
    },

    // 2. Detalhes da Publicação
    async getProblemById(id) {
        const data = await getProblemById(id);
        if (!data) throw new Error('Publicação não encontrada.');
        return data;
    },

    // 3. Criar Publicação com Passos e Insumos
    async createProblem(data) {
        return await createProblemWithSteps(data);
    },

    // 4. Upload de Imagem de Passo para o Storage
    async uploadImage(file) {
        return await uploadStepImage(file);
    },

    // 5. Listar Empresas
    async getCompanies() {
        const { data, error } = await supabase.from('companies').select('*').order('name');
        if (error) return [{ id: 1, name: 'MEJC' }];
        return data || [{ id: 1, name: 'MEJC' }];
    },

    // 6. Adicionar Solução Alternativa da Comunidade (Wiki)
    async addSolution(problemId, { content, steps = [] }) {
        const { data, error } = await supabase
            .from('solutions')
            .insert([
                {
                    problem_id: problemId,
                    content,
                    steps,
                    is_primary: false
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};