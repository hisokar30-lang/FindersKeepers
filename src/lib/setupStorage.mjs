import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env.local');

// Manually parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
    envContent.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('=').map(part => part.trim()))
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBuckets() {
    const buckets = ['item-photos', 'avatars', 'chat-photos'];

    for (const bucketName of buckets) {
        console.log(`Checking bucket: ${bucketName}...`);
        const { data, error } = await supabase.storage.getBucket(bucketName);

        if (error && error.message.includes('not found')) {
            console.log(`Bucket ${bucketName} not found. Creating...`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
                fileSizeLimit: 5242880 // 5MB
            });

            if (createError) {
                console.error(`Failed to create bucket ${bucketName}:`, createError.message);
            } else {
                console.log(`Bucket ${bucketName} created successfully.`);
            }
        } else if (error) {
            console.error(`Error checking bucket ${bucketName}:`, error.message);
        } else {
            console.log(`Bucket ${bucketName} already exists.`);
        }
    }
}

setupBuckets().catch(console.error);
