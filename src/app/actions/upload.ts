'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadImageAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // 1. Validation
        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: 'File size exceeds 5MB limit' };
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return { success: false, error: 'Only JPG, PNG, and WebP images are allowed' };
        }

        // 2. Generate Unique Filename
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // 3. Convert File to ArrayBuffer for Supabase
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 4. Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from('images')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return { success: false, error: `Upload failed: ${error.message}` };
        }

        // 5. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('images')
            .getPublicUrl(data.path);

        return {
            success: true,
            url: publicUrl,
            fileName: fileName
        };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Internal upload error:', errorMessage);
        return { success: false, error: errorMessage };
    }
}
