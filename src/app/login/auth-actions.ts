"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function registerUserAction(email: string, name: string) {
    try {
        // 1. Create the auth user with a random password (since we're simulating a respectful one-click registration)
        const password = Math.random().toString(36).slice(-12);

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Automatically confirm for premium flow
            user_metadata: { full_name: name }
        });

        if (error) throw error;

        // 2. Create the profile record
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: data.user.id,
                email,
                name,
                role: 'user',
                trust_score: 100,
                updated_at: new Date().toISOString(),
            });

        if (profileError) throw profileError;

        return { success: true, user: { id: data.user.id, email, name } };
    } catch (error: any) {
        console.error("Registration Error:", error.message);
        return { success: false, error: error.message };
    }
}

export async function loginUserAction(email: string) {
    try {
        // In a real production app, we'd use Magic Links or standard Passwords.
        // For this specific "Respectful View" request, we'll verify the profile exists via Admin client.
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) {
            return { success: false, error: "User not found. Please create an account." };
        }

        return { success: true, user: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
