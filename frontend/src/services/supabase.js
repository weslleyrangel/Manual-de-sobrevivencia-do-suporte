import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 1. Upload de Imagem/Print para o Supabase Storage
 * Salva no bucket 'step-images' e retorna a URL pública direta
 */
export async function uploadStepImage(file) {
    if (!file) return null;

    const fileExt = file.name ? file.name.split('.').pop() : 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `prints/${fileName}`;

    const { data, error } = await supabase.storage
        .from('step-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Erro no upload da imagem:', error);
        throw error;
    }

    const { data: publicUrlData } = supabase.storage
        .from('step-images')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

/**
 * 2. Buscador Rápido de Atendimento
 * Pesquisa em Título, Descrição, Categoria, Modelo do Equipamento e Insumo
 */
export async function searchProblems(query) {
    if (!query || !query.trim()) return [];

    const cleanQuery = query.trim();

    const { data, error } = await supabase
        .from('problems')
        .select(`
      id,
      title,
      category,
      description,
      equipment_model,
      supplies_info,
      views_count,
      created_at,
      solutions (
        id,
        content,
        steps,
        is_primary
      )
    `)
        .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,equipment_model.ilike.%${cleanQuery}%,supplies_info.ilike.%${cleanQuery}%`)
        .order('views_count', { ascending: false })
        .limit(30);

    if (error) {
        console.error('Erro na busca no Supabase:', error);
        return [];
    }

    return data;
}

/**
 * 3. Buscar Detalhes de um Problema pelo ID com suas Soluções
 */
export async function getProblemById(id) {
    const { data, error } = await supabase
        .from('problems')
        .select(`
      *,
      company:companies(id, name),
      solutions (
        id,
        content,
        steps,
        media_urls,
        is_primary,
        created_at
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Erro ao buscar problema:', error);
        return null;
    }

    return data;
}

/**
 * 4. Criar Novo Problema com Passos e Prints Vinculados
 */
export async function createProblemWithSteps({ title, category, description, equipment_model, supplies_info, steps }) {
    // 1. Cadastra o Problema
    const { data: problem, error: problemError } = await supabase
        .from('problems')
        .insert([
            {
                title,
                category: category || 'Atendimento',
                description,
                equipment_model: equipment_model || null,
                supplies_info: supplies_info || null,
                company_id: 1 // Empresa MEJC piloto
            }
        ])
        .select()
        .single();

    if (problemError) throw problemError;

    // 2. Se houver passos estruturados, salva na tabela solutions
    if (steps && steps.length > 0) {
        const { error: solutionError } = await supabase
            .from('solutions')
            .insert([
                {
                    problem_id: problem.id,
                    content: description,
                    steps: steps, // Guarda o JSON com { title, description, image_url }
                    is_primary: true
                }
            ]);

        if (solutionError) throw solutionError;
    }

    return problem;
}