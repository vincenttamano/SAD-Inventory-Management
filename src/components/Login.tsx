import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Activity, UserCircle, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../utils/supabase';

export function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!identifier || !password) {
        setError('Please enter both your email/username and password.');
        return;
      }

      // First, fetch user from database to verify role and get their email for auth
      // Test if we can read from the table at all
      const { data: allUsers, error: testError } = await supabase
        .from('User')
        .select('*')
        .limit(1);
      
      console.log('Test query (all users):', { allUsers, testError });

      // Try to find by email first, then by username
      let { data: users, error: fetchError } = await supabase
        .from('User')
        .select('*')
        .eq('email', identifier);

      console.log('Email query result:', { identifier, users, fetchError });

      if (fetchError) {
        console.error('Email query error:', fetchError);
        // Don't throw, try username instead
      }

      if (!users || users.length === 0) {
        // If not found by email, try by username
        const { data: usersByName, error: nameError } = await supabase
          .from('User')
          .select('*')
          .eq('username', identifier);
        
        console.log('Username query result:', { identifier, usersByName, nameError });

        if (nameError) {
          console.error('Username query error:', nameError);
          throw nameError;
        }
        users = usersByName;
      }

      if (!users || users.length === 0) {
        setError('User not found.');
        setLoading(false);
        return;
      }

      const user = users[0];

      // Check if user's role matches selected role
      if (user.role !== role) {
        setError('Invalid role selection for this user.');
        setLoading(false);
        return;
      }

      // Verify password against the table
      if (user.password !== password) {
        setError('Invalid password.');
        setLoading(false);
        return;
      }

      // Store user session (without password)
      const sessionUser = {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role as UserRole,
      };
      localStorage.setItem('dentalClinicUser', JSON.stringify(sessionUser));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
         
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="JT Dental Clinic" className="w-40 h-40" />
            <br />
          <p className="text-gray-600 text-xl text- text-center">Inventory Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700  mb-3">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition ${role === 'staff'
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <UserCircle className={`w-8 h-8 mb-2 ${role === 'staff' ? 'text-gold-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${role === 'staff' ? 'text-gold-900' : 'text-gray-700'}`}>
                  Staff
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">View & Record Usage</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition ${role === 'admin'
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <ShieldCheck className={`w-8 h-8 mb-2 ${role === 'admin' ? 'text-gold-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${role === 'admin' ? 'text-gold-900' : 'text-gray-700'}`}>
                  Admin
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">Full Access</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-600 hover:bg-gold-700 disabled:bg-gold-400 text-white py-3 rounded-lg transition duration-200 font-medium"
          >
            {loading ? 'Signing in...' : `Sign In as ${role === 'admin' ? 'Admin' : 'Staff'}`}
          </button>
        </form>
      </div>
    </div>
  );
}