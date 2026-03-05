import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file The file or blob to upload
 * @param bucket The storage bucket name (e.g., 'item-photos', 'avatars', 'chat-photos')
 * @param path The folder path within the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadPhoto(
    file: File | Blob,
    bucket: string = 'item-photos',
    path: string = 'general'
): Promise<string> {
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'png';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Failed to upload to ${bucket}: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
}
