import { createClient } from '@supabase/supabase-js';

// Export the URL for use in image utility functions
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Use the correct environment variable for the Supabase key
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add console logs to help debug the environment variables in production
console.log('Supabase URL available:', !!supabaseUrl);
console.log('Supabase Key available:', !!supabaseKey);

// Create a single instance of the Supabase client to be used throughout the app
let supabase;

try {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are missing');
  }
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Provide a fallback client to prevent the app from crashing
  supabase = { from: () => ({ select: () => ({ data: null, error: null }) }) } as any;
}

export { supabase };
