import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { LogOut, BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, violations: 0 });
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/user/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams/assigned');
      setExams(response.data);
    } catch (error) {
      toast.error('Failed to fetch exams');
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      const response = await api.post(`/exams/${examId}/start`);
      navigate(`/exam/${examId}/instructions`, { state: { attemptId: response.data.attemptId, exam: response.data.exam } });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start exam';
      toast.error(message);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue', icon: Clock };
    } else if (now > endTime) {
      return { status: 'ended', label: 'Ended', color: 'gray', icon: XCircle };
    } else {
      return { status: 'active', label: 'Active', color: 'green', icon: CheckCircle };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-indigo-600 mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">ExamPortal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">Welcome, {user?.name}</span>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Exams</h1>
          <p className="text-gray-600 dark:text-gray-400">Select an exam to begin</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Violations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.violations}</p>
              </div>
            </div>
          </div>
        </div>

        {exams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No exams assigned to you.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam, index) => {
              const examStatus = getExamStatus(exam);
              const StatusIcon = examStatus.icon;
              const canStart = examStatus.status === 'active';

              return (
                <motion.div
                  key={exam._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exam.title}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${examStatus.color}-100 text-${examStatus.color}-800 dark:bg-${examStatus.color}-900 dark:text-${examStatus.color}-200`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {examStatus.label}
                      </span>
                    </div>

                    {exam.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{exam.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        Duration: {exam.duration} minutes
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Questions: {exam.questions?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Start: {new Date(exam.startTime).toLocaleString()}</div>
                        <div>End: {new Date(exam.endTime).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div className={`px-6 py-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => handleStartExam(exam._id)}
                      disabled={!canStart}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                        canStart
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canStart ? 'Start Exam' : examStatus.status === 'upcoming' ? 'Not Started' : 'Ended'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
