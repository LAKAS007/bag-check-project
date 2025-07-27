import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client для работы с Storage (серверная часть)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Функция для загрузки файла
export const uploadToSupabase = async (
    file: Buffer,
    fileName: string,
    bucket: string = 'bagcheck-images'
): Promise<{ url: string; path: string }> => {
    const filePath = `tickets/${Date.now()}_${fileName}`;

    console.log(`📤 Uploading to Supabase: ${filePath}`);

    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, file, {
            contentType: 'image/*',
            upsert: false
        });

    if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('✅ Upload successful:', data);

    // Получаем публичный URL
    const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return {
        url: urlData.publicUrl,
        path: filePath
    };
};

// Функция для удаления файла
export const deleteFromSupabase = async (
    filePath: string,
    bucket: string = 'bagcheck-images'
): Promise<void> => {
    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
};