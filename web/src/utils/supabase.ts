import { createClient } from '@supabase/supabase-js';

// Export the URL for use in image utility functions
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Use the correct environment variable for the Supabase key
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single instance of the Supabase client to be used throughout the app
export const supabase = createClient(supabaseUrl, supabaseKey);
