import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { resetToken, newPassword });
      toast.success('Password reset successful. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Paste the reset token and choose a new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reset Token</label>
            <textarea
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-xs ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              rows={3}
              placeholder="Paste token here"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <div className="mt-6 text-sm flex justify-between">
          <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500">Generate token</Link>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


