import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Проверяем наличие переменных окружения
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

// Client для работы с Storage (серверная часть)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const BUCKET_NAME = 'bagcheck-images';

// Функция для загрузки файла
export const uploadToSupabase = async (
    file: Buffer,
    fileName: string,
    contentType?: string
): Promise<{ url: string; path: string }> => {
    try {
        const filePath = `tickets/${Date.now()}_${fileName}`;

        console.log(`📤 Uploading to Supabase: ${filePath}`);
        console.log(`📦 Bucket: ${BUCKET_NAME}`);
        console.log(`📄 Content-Type: ${contentType || 'image/jpeg'}`);
        console.log(`📏 File size: ${file.length} bytes`);

        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                contentType: contentType || 'image/jpeg',
                upsert: false
            });

        if (error) {
            console.error('❌ Supabase upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        console.log('✅ Upload successful:', data);

        // Получаем публичный URL
        const { data: urlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        console.log('🔗 Public URL:', urlData.publicUrl);

        return {
            url: urlData.publicUrl,
            path: filePath
        };
    } catch (error) {
        console.error('❌ Error in uploadToSupabase:', error);
        throw error;
    }
};

// Функция для удаления файла
export const deleteFromSupabase = async (
    filePath: string
): Promise<void> => {
    try {
        const { error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }

        console.log(`🗑️ File deleted successfully: ${filePath}`);
    } catch (error) {
        console.error('❌ Error in deleteFromSupabase:', error);
        throw error;
    }
};

// Тестовая функция для проверки подключения
export const testSupabaseConnection = async (): Promise<boolean> => {
    try {
        const { data, error } = await supabaseAdmin.storage.listBuckets();

        if (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }

        console.log('✅ Supabase connection successful');
        console.log('📦 Available buckets:', data?.map(b => b.name));
        return true;
    } catch (error) {
        console.error('❌ Connection test error:', error);
        return false;
    }
};