import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Activity, UserCircle, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication - accept any email/password
    if (email && password) {
      localStorage.setItem('dentalClinicUser', JSON.stringify({
        id: '1',
        email,
        name: role === 'admin' ? 'Dr. Smith (Admin)' : 'Staff Member',
        role,
      }));
      navigate('/');
    } else {
      setError('Please enter both email and password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dental Clinic</h1>
          <p className="text-gray-600 mt-2">Inventory Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition ${
                  role === 'staff'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UserCircle className={`w-8 h-8 mb-2 ${role === 'staff' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${role === 'staff' ? 'text-blue-900' : 'text-gray-700'}`}>
                  Staff
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">View & Record Usage</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition ${
                  role === 'admin'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ShieldCheck className={`w-8 h-8 mb-2 ${role === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${role === 'admin' ? 'text-blue-900' : 'text-gray-700'}`}>
                  Admin
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">Full Access</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="admin@dentalclinic.com"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200 font-medium"
          >
            Sign In as {role === 'admin' ? 'Admin' : 'Staff'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo credentials: Use any email and password</p>
        </div>
      </div>
    </div>
  );
}