"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env');
}
/** Public (anon) client — respects RLS policies */
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl ?? '', supabaseAnonKey ?? '');
/** Service-role client — bypasses RLS for server-side admin operations */
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl ?? '', supabaseServiceKey ?? '');
