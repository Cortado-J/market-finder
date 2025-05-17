// src/components/Login.tsx
import { supabase } from '../utils/supabase'; // Adjusted path to your supabase client

export default function Login() {
  async function sendMagicLink() {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

    if (!adminEmail) {
      alert('Admin email is not configured. Please set VITE_ADMIN_EMAIL in your .env.local file.');
      console.error('VITE_ADMIN_EMAIL is not set.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: adminEmail,
      options: {
        // Optional: you can specify a redirect URL here if it's different
        // from what's set in your Supabase project settings.
        // emailRedirectTo: 'http://localhost:5173/some-path',
      }
    });

    if (error) {
      alert('Error sending magic link: ' + error.message);
      console.error('Error sending magic link:', error);
    } else {
      alert(`Magic link sent to ${adminEmail}! Check your email.`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Admin Login</h1>
        <p className="mb-6 text-center text-gray-300">
          A magic link will be sent to the pre-configured admin email address.
        </p>
        <button
          onClick={sendMagicLink}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors font-medium"
        >
          Send Admin Magic Link
        </button>
      </div>
    </div>
  );
}
