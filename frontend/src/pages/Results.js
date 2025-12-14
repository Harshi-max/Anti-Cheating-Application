import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Home, Award, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Results = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Get the latest attempt for this exam
      const response = await api.get(`/exams/${examId}/attempt`);
      setResults(response.data);
    } catch (error) {
      toast.error('Failed to fetch results');
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No results found</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const score = results.score || 0;
  const totalQuestions = results.totalQuestions || 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 60;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-8`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {passed ? (
                <Award className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {results.exam?.title || 'Exam Results'}
            </h1>
            <p className={`text-2xl font-semibold ${
              passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {passed ? 'Passed' : 'Failed'}
            </p>
          </div>

          {/* Score Card */}
          <div className={`rounded-lg p-6 mb-6 ${
            passed
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {score}/{totalQuestions}
              </div>
              <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                {percentage}%
              </div>
            </div>
          </div>

          {/* Exam Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-semibold ${
                results.status === 'auto_submitted'
                  ? 'text-red-600 dark:text-red-400'
                  : results.status === 'flagged'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {results.status === 'auto_submitted' && 'Auto-Submitted (Violations)'}
                {results.status === 'flagged' && 'Flagged'}
                {results.status === 'completed' && 'Completed'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Start Time:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(results.startTime).toLocaleString()}
              </span>
            </div>
            {results.endTime && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">End Time:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(results.endTime).toLocaleString()}
                </span>
              </div>
            )}
            {results.violationCount > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Violations:</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  {results.violationCount}
                </span>
              </div>
            )}
          </div>

          {/* Violations Warning */}
          {results.violationCount > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Exam Violations Detected
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your exam had {results.violationCount} violation(s) recorded. Please review the exam rules for future attempts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;

