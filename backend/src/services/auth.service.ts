import { supabase, supabaseAdmin } from '../config/supabase';

class AuthService {
  /**
   * Generate Google OAuth sign-in URL.
   * The frontend should redirect the user to this URL.
   */
  async signInWithGoogle(redirectTo: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Exchange an OAuth authorization code for a Supabase session.
   */
  async handleAuthCallback(code: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Register a new user with email and password (fallback to non-Google auth).
   * Also creates a profile entry.
   */
  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // auto-confirm for dev convenience
      user_metadata: { full_name: name.trim() },
    });

    if (error) throw new Error(error.message);

    // The trigger will auto-create a profile, but let's ensure name is correct
    if (data.user) {
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: data.user.id,
          name: name.trim(),
          email: normalizedEmail,
        });
    }

    return data.user;
  }

  /**
   * Sign in with email and password (fallback to non-Google auth).
   */
  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get the current user from a Supabase access token.
   */
  async getUser(token: string) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) throw new Error('Invalid or expired token');

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name ?? data.user.user_metadata?.full_name ?? '',
      avatar_url: profile?.avatar_url ?? data.user.user_metadata?.avatar_url ?? '',
      role: profile?.role ?? 'Student',
      bio: profile?.bio ?? '',
      skills: profile?.skills ?? [],
    };
  }

  /**
   * Sign out (invalidate session on Supabase side).
   */
  async logout(token: string) {
    // Use admin to revoke the session server-side
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (data.user) {
      await supabaseAdmin.auth.admin.signOut(token);
    }
  }
}

export default new AuthService();
