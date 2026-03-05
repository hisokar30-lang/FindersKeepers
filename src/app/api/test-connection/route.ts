import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/testSupabaseConnection';

/**
 * API Route to test Supabase connection
 * Visit: http://localhost:3000/api/test-connection
 */
export async function GET() {
    const result = await testSupabaseConnection();

    return NextResponse.json(result, {
        status: result.success ? 200 : 500
    });
}
