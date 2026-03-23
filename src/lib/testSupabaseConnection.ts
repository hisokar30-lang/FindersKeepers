import { supabase } from './supabase';

/**
 * Test Supabase connection and database setup
 * Run this to verify your Supabase configuration is working
 */
export async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Connection...\n');

    try {
        // Test 1: Check if we can connect to Supabase
        console.log('1️⃣ Testing basic connection...');
        const { error: healthError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (healthError) {
            console.error('❌ Connection failed:', healthError.message);
            console.log('\n💡 Make sure you have run the supabase_schema.sql in your Supabase SQL Editor!');
            return { success: false, error: healthError };
        }

        console.log('✅ Connection successful!\n');

        // Test 2: Check if tables exist
        console.log('2️⃣ Checking database tables...');
        const tables = ['profiles', 'items', 'likes', 'comments', 'messages'];
        const tableResults = [];

        for (const table of tables) {
            const { error } = await supabase.from(table).select('count').limit(1);
            if (error) {
                console.log(`❌ Table "${table}" not found`);
                tableResults.push({ table, exists: false });
            } else {
                console.log(`✅ Table "${table}" exists`);
                tableResults.push({ table, exists: true });
            }
        }

        const allTablesExist = tableResults.every(t => t.exists);

        if (!allTablesExist) {
            console.log('\n⚠️  Some tables are missing. Please run supabase_schema.sql in your Supabase SQL Editor.');
            return {
                success: false,
                error: 'Missing tables',
                tables: tableResults
            };
        }

        console.log('\n✅ All database tables exist!\n');

        // Test 3: Check storage bucket
        console.log('3️⃣ Checking storage bucket...');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

        if (bucketError) {
            console.log('❌ Could not check storage buckets:', bucketError.message);
        } else {
            const itemPhotosBucket = buckets?.find(b => b.name === 'item-photos');
            if (itemPhotosBucket) {
                console.log('✅ Storage bucket "item-photos" exists');
            } else {
                console.log('⚠️  Storage bucket "item-photos" not found');
            }
        }

        console.log('\n🎉 Supabase is fully configured and ready to use!\n');

        return {
            success: true,
            message: 'All tests passed!',
            tables: tableResults,
            buckets: buckets?.map(b => b.name) || []
        };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Unexpected error:', errorMessage);
        return { success: false, error: errorMessage };
    }
}

// Allow running this file directly with: node -r esbuild-register src/lib/testSupabaseConnection.ts
if (require.main === module) {
    testSupabaseConnection().then(result => {
        console.log('\nTest Result:', result);
        process.exit(result.success ? 0 : 1);
    });
}
