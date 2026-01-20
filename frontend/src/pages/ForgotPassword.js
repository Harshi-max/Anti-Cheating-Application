import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data?.resetToken) {
        setToken(res.data.resetToken);
        toast.success('Reset token generated (copy it below)');
      } else {
        toast.success(res.data?.message || 'If the email exists, a reset link has been generated.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} w-full max-w-md rounded-lg shadow p-6 relative`}>
        <button
          onClick={() => navigate('/login')}
          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter your email to generate a reset token.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate reset token'}
          </button>
        </form>

        {token && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your reset token:</p>
            <textarea
              readOnly
              value={token}
              className={`w-full p-3 border rounded-lg text-xs ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
              }`}
              rows={3}
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Go to <Link to="/reset-password" className="text-indigo-600 hover:text-indigo-500">Reset Password</Link> and paste it.
            </p>
          </div>
        )}

        <div className="mt-6 text-sm">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;


