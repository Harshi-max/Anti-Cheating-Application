import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Plus, Users, BookOpen, AlertTriangle, UserCheck, UserX, Eye, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Admin = () => {
  const { logout } = React.useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState({ totalExams: 0, activeExams: 0, totalViolations: 0 });
  const [completedExams, setCompletedExams] = useState([]);
  const [violations, setViolations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);
  const [monitoringData, setMonitoringData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    duration: 30,
    startTime: '',
    endTime: '',
    isPublished: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [examsResponse, statsResponse, completedResponse, violationsResponse, usersResponse] = await Promise.all([
        api.get('/exams'),
        api.get('/exams/admin/stats'),
        api.get('/exams/admin/completed-exams'),
        api.get('/exams/admin/violations'),
        api.get('/exams/admin/users')
      ]);
      setExams(examsResponse.data);
      setStats(statsResponse.data);
      setCompletedExams(completedResponse.data);
      setViolations(violationsResponse.data);
      setAllUsers(usersResponse.data);
    } catch (error) {
      console.error('Admin dashboard fetch error:', error?.response || error);
      toast.error(error?.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined
      };
      await api.post('/exams', payload);
      toast.success('Exam created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
        duration: 30,
        startTime: '',
        endTime: '',
        isPublished: true
      });
      fetchAllData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create exam');
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleAssignUsers = async (examId, userIds) => {
    try {
      await api.post(`/exams/${examId}/assign`, { userIds });
      toast.success('Users assigned successfully!');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to assign users');
    }
  };

  const handleUnassignUsers = async (examId, userIds) => {
    try {
      await api.post(`/exams/${examId}/unassign`, { userIds });
      toast.success('Users unassigned successfully!');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to unassign users');
    }
  };

  const handleViewMonitoring = async (examId) => {
    try {
      const response = await api.get(`/exams/admin/monitoring/${examId}`);
      setMonitoringData(response.data);
      setShowMonitoringModal(true);
    } catch (error) {
      toast.error('Failed to fetch monitoring data');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This will also delete all related attempts and violations.')) {
      return;
    }
    
    try {
      await api.delete(`/exams/${examId}`);
      toast.success('Exam deleted successfully!');
      fetchAllData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete exam');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExams}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedExams || 0}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Attempts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedAttempts || 0}</p>
              </div>
            </div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Violations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViolations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Exam Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Exam
          </button>
        </div>

        {/* Create Exam Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm mb-6`}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Exam</h2>
            <form onSubmit={handleCreateExam}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time (optional - defaults to now)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time (optional - defaults to 30 days from start)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publish exam immediately (students can see it)
                  </span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  rows={3}
                  required
                />
              </div>

              {/* Questions */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add Question
                  </button>
                </div>
                {formData.questions.map((q, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-lg">
                    <input
                      type="text"
                      placeholder="Question"
                      value={q.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg mb-2 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center mb-1">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => updateQuestion(index, 'correctAnswer', optIndex)}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          placeholder={`Option ${optIndex + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[optIndex] = e.target.value;
                            updateQuestion(index, 'options', newOptions);
                          }}
                          className={`flex-1 px-3 py-1 border rounded ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Exam
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Overview Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Completed Exams */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Completed Exams</h2>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {completedExams.slice(0, 5).map((attempt) => (
                <div key={attempt._id} className="px-6 py-3 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {attempt.exam?.title || 'Unknown exam'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {attempt.user ? `${attempt.user.name} (${attempt.user.userId})` : 'Unknown user'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{attempt.score}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {completedExams.length === 0 && (
                <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No completed exams yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Violations */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Violations</h2>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {violations.slice(0, 5).map((violation) => (
                <div key={violation._id} className="px-6 py-3 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{violation.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(violation.user && violation.user.name) || 'Unknown user'} -{' '}
                        {(violation.exam && violation.exam.title) || 'Unknown exam'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {violation.timestamp ? new Date(violation.timestamp).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {violations.length === 0 && (
                <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No violations recorded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exams Management</h2>
          </div>
          <div className="divide-y">
            {exams.map((exam) => (
              <div key={exam._id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{exam.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exam.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {exam.questions.length} questions • {exam.duration} minutes
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Assigned to: {exam.assignedUsers?.length || 0} users
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      exam.isPublished
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {exam.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      exam.isActive
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowAssignmentModal(true);
                    }}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Manage Users
                  </button>
                  <button
                    onClick={() => handleViewMonitoring(exam._id)}
                    className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Monitor
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam._id)}
                    className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Assignment Modal */}
      {showAssignmentModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Manage Users - {selectedExam.title}
                </h2>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Assigned Users</h3>
                <div className="space-y-2">
                  {selectedExam.assignedUsers?.map((user) => (
                    <div key={user._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-900 dark:text-white">{user.name} ({user.userId})</span>
                      <button
                        onClick={() => handleUnassignUsers(selectedExam._id, [user._id])}
                        className="text-red-600 hover:text-red-800"
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {(!selectedExam.assignedUsers || selectedExam.assignedUsers.length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400">No users assigned</p>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Users</h3>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      const unassigned = allUsers.filter(user =>
                        !selectedExam.assignedUsers?.some(assigned => assigned._id === user._id)
                      );
                      if (unassigned.length === 0) return;
                      handleAssignUsers(selectedExam._id, unassigned.map(u => u._id));
                    }}
                  >
                    Give access to all
                  </button>
                </div>
                <div className="space-y-2">
                  {allUsers.filter(user => 
                    !selectedExam.assignedUsers?.some(assigned => assigned._id === user._id)
                  ).map((user) => (
                    <div key={user._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-900 dark:text-white">{user.name} ({user.userId})</span>
                      <button
                        onClick={() => handleAssignUsers(selectedExam._id, [user._id])}
                        className="text-green-600 hover:text-green-800"
                      >
                        <UserCheck className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {allUsers.filter(user => 
                    !selectedExam.assignedUsers?.some(assigned => assigned._id === user._id)
                  ).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400">All users are already assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Modal */}
      {showMonitoringModal && monitoringData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Exam Monitoring - {monitoringData.exam?.title || 'Exam'}
                </h2>
                <button
                  onClick={() => setShowMonitoringModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{monitoringData.stats.totalAttempts}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Attempts</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{monitoringData.stats.completedAttempts}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{monitoringData.stats.totalViolations}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Violations</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Students Who Attempted</h3>
                <div className="space-y-2">
                  {monitoringData.studentsAttempted.map((attempt) => (
                    <div key={attempt._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{attempt.user.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({attempt.user.userId})</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        {attempt.submittedAt ? (
                          <>
                            <span className="text-green-600 dark:text-green-400">Completed</span>
                            <span className="text-gray-600 dark:text-gray-400">Score: {attempt.score}%</span>
                          </>
                        ) : (
                          <span className="text-yellow-600 dark:text-yellow-400">In Progress</span>
                        )}
                        <span className="text-red-600 dark:text-red-400">Violations: {attempt.violationCount}</span>
                      </div>
                    </div>
                  ))}
                  {monitoringData.studentsAttempted.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400">No students have attempted this exam yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;