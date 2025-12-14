import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const ExamInstructions = () => {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const exam = location.state?.exam;
  const attemptId = location.state?.attemptId;
  const [agreed, setAgreed] = useState(false);

  if (!exam || !attemptId) {
    navigate('/home');
    return null;
  }

  const instructions = [
    'Ensure you have a stable internet connection',
    'Close all other applications and browser tabs',
    'Do not switch tabs or minimize the browser window',
    'Keep your face visible to the camera at all times',
    'Do not use copy, paste, or screenshot functions',
    'The exam will be automatically submitted if you violate rules 3 times',
    'You cannot return to previous questions after submission',
    'The timer will start once you begin the exam'
  ];

  const handleStart = () => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    navigate(`/exam/${examId}`, { state: { attemptId, exam } });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-8`}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h1>
            {exam.description && (
              <p className="text-gray-600 dark:text-gray-400">{exam.description}</p>
            )}
          </div>

          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Important Instructions</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please read all instructions carefully before starting the exam. Violations of exam rules will result in automatic submission.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Exam Details</h2>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="font-medium">Duration:</span>
                <span>{exam.duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Questions:</span>
                <span>{exam.questions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Question Type:</span>
                <span>Multiple Choice (MCQ)</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rules & Guidelines</h2>
            <ul className="space-y-3">
              {instructions.map((instruction, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">⚠️ Anti-Cheating Measures</h3>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• Face detection will monitor your presence</li>
              <li>• Tab switching and window blur will be detected</li>
              <li>• Copy, paste, and screenshot attempts are blocked</li>
              <li>• Fullscreen mode is required and enforced</li>
              <li>• Maximum 3 violations allowed before auto-submission</li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 mr-3 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300">
                I have read and understood all the instructions and agree to abide by the exam rules and anti-cheating policies.
              </span>
            </label>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleStart}
              disabled={!agreed}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                agreed
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Start Exam</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamInstructions;

