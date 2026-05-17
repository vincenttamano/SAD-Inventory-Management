import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { updatePassword } from '../services/authService';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
      setError('This reset link has expired. Please request a new one.');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      const nextError = 'Passwords do not match.';
      setError(nextError);
      toast.error(nextError);
      return;
    }

    if (password.trim().length < 6) {
      const nextError = 'Password must be at least 6 characters.';
      setError(nextError);
      toast.error(nextError);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      const nextSuccess = 'Password updated. You can now sign in.';
      setSuccess(nextSuccess);
      toast.success(nextSuccess);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      const nextError = err.message || 'Unable to update password.';
      setError(nextError);
      toast.error(nextError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="JT Dental Clinic" className="w-32 h-32" />
          <p className="text-gray-600 text-xl text-center mt-4">Reset Password</p>
        </div>

        {!sessionReady && !error && (
          <p className="text-center text-gray-500 text-sm">Waiting for session... Please wait.</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        {sessionReady && (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-700 disabled:bg-gold-400 text-white py-3 rounded-lg transition duration-200 font-medium"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
