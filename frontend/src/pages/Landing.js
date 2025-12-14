import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Shield,
  Clock,
  BarChart3,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const Landing = () => {
  const { darkMode, toggleDarkMode } = React.useContext(ThemeContext);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'AI-Powered Anti-Cheating',
      description: 'Advanced face detection and behavior monitoring to ensure exam integrity'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-Time Monitoring',
      description: 'Continuous monitoring of tab switches, window focus, and suspicious activities'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Instant Results',
      description: 'Get your exam results immediately after submission with detailed analytics'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Secure & Reliable',
      description: 'Built with industry-standard security practices and JWT authentication'
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <span className="text-2xl font-bold">ExamPortal</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Link
            to="/login"
            className="px-4 py-2 text-indigo-600 font-semibold hover:text-indigo-700"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Secure Online Examinations
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Take your exams with confidence. Our AI-powered anti-cheating system ensures fairness and integrity.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <span>Start Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-shadow"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="text-indigo-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={`mt-20 p-12 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl text-center`}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Join thousands of students taking secure online exams
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors"
          >
            Create Your Account
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;

