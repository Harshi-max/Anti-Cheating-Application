import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import FaceDetector from '../components/FaceDetector';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle, XCircle, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Exam = () => {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [exam, setExam] = useState(location.state?.exam || null);
  const [attemptId, setAttemptId] = useState(location.state?.attemptId || null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const faceDetectorRef = useRef(null);
  const examContainerRef = useRef(null);
  const violationTimeoutRef = useRef(null);

  const MAX_VIOLATIONS = 3;

  useEffect(() => {
    if (!exam || !attemptId) {
      fetchExamData();
    } else {
      initializeExam();
    }
  }, []);

  useEffect(() => {
    if (exam && exam.duration && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exam, submitted]);

  // Fullscreen enforcement
  useEffect(() => {
    if (!submitted) {
      enterFullscreen();
      checkFullscreen();
      const interval = setInterval(checkFullscreen, 1000);
      return () => clearInterval(interval);
    }
  }, [submitted]);

  // Anti-cheating detection
  useEffect(() => {
    if (submitted) return;

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('TAB_SWITCH', 'Tab switched or window minimized');
      }
    };

    // Window blur detection
    const handleBlur = () => {
      logViolation('WINDOW_BLUR', 'Window lost focus');
    };

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation('FULLSCREEN_EXIT', 'Exited fullscreen mode');
        enterFullscreen();
      }
    };

    // Copy/Paste prevention
    const handleCopy = (e) => {
      e.preventDefault();
      logViolation('COPY_PASTE', 'Copy attempt detected');
      toast.error('Copying is not allowed during the exam');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      logViolation('COPY_PASTE', 'Paste attempt detected');
      toast.error('Pasting is not allowed during the exam');
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error('Right-click is disabled during the exam');
    };

    const handleKeyDown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 's')
      ) {
        e.preventDefault();
        toast.error('This action is not allowed during the exam');
      }
      // Block Ctrl+C, Ctrl+V, Ctrl+X
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        logViolation('COPY_PASTE', `${e.key.toUpperCase()} key combination detected`);
        toast.error('Copy/Paste is not allowed during the exam');
      }
      // Block Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        logViolation('COPY_PASTE', 'Screenshot attempt detected');
        toast.error('Screenshots are not allowed during the exam');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [submitted]);

  const enterFullscreen = async () => {
    try {
      const element = examContainerRef.current || document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error('Error entering fullscreen:', error);
    }
  };

  const checkFullscreen = () => {
    const isFull = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
    setIsFullscreen(isFull);
    if (!isFull && !submitted) {
      enterFullscreen();
    }
  };

  const logViolation = async (type, description) => {
    if (!attemptId || submitted) return;

    try {
      const response = await api.post('/violations/log', {
        attemptId,
        type,
        description,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });

      const newViolationCount = response.data.violationCount;
      setViolationCount(newViolationCount);

      if (response.data.autoSubmitted) {
        setSubmitted(true);
        toast.error('Exam auto-submitted due to maximum violations');
        setTimeout(() => {
          navigate(`/exam/${examId}/results`);
        }, 2000);
        return;
      }

      // Show warning
      setWarningMessage(`${description}. Violations: ${newViolationCount}/${MAX_VIOLATIONS}`);
      setShowWarning(true);

      // Auto-hide warning after 5 seconds
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }
      violationTimeoutRef.current = setTimeout(() => {
        setShowWarning(false);
      }, 5000);

      toast.error(`Warning: ${description} (${newViolationCount}/${MAX_VIOLATIONS} violations)`);
    } catch (error) {
      console.error('Error logging violation:', error);
    }
  };

  const fetchExamData = async () => {
    try {
      const response = await api.post(`/exams/${examId}/start`);
      setExam(response.data.exam);
      setAttemptId(response.data.attemptId);
      initializeExam(response.data.exam);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load exam');
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeExam = (examData = exam) => {
    if (examData && examData.duration) {
      setTimeRemaining(examData.duration * 60);
    }
    fetchAttemptProgress();
    setIsLoading(false);
  };

  const fetchAttemptProgress = async () => {
    if (!attemptId) return;
    try {
      const response = await api.get(`/exams/${examId}/attempt/${attemptId}`);
      const attempt = response.data;
      const answerMap = {};
      attempt.answers.forEach((answer) => {
        if (answer.selectedAnswer !== null) {
          answerMap[answer.questionIndex] = answer.selectedAnswer;
        }
      });
      setAnswers(answerMap);
      setViolationCount(attempt.violationCount || 0);
      updateProgress(answerMap, attempt.totalQuestions);
    } catch (error) {
      console.error('Error fetching attempt:', error);
    }
  };

  const updateProgress = (answerMap, total) => {
    const answered = Object.keys(answerMap).length;
    setProgress((answered / total) * 100);
  };

  const handleAnswerChange = async (questionIndex, selectedAnswer) => {
    const newAnswers = { ...answers, [questionIndex]: selectedAnswer };
    setAnswers(newAnswers);
    updateProgress(newAnswers, exam.questions.length);

    try {
      await api.post(`/exams/${examId}/answer`, {
        attemptId,
        questionIndex,
        selectedAnswer: parseInt(selectedAnswer)
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleFaceViolation = (type, description) => {
    logViolation(type, description);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post(`/exams/${examId}/submit`, { attemptId });
      setSubmitted(true);
      setShowSubmitDialog(false);
      toast.success(`Exam submitted! Score: ${response.data.score}/${response.data.totalQuestions}`);
      setTimeout(() => {
        navigate(`/exam/${examId}/results`);
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    }
  };

  const handleAutoSubmit = () => {
    if (!submitted) {
      handleSubmit();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  const currentQ = exam.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;

  return (
    <div
      ref={examContainerRef}
      className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${!isFullscreen ? 'p-4' : ''}`}
    >
      {/* Back Button */}
      {!isFullscreen && (
        <div className="mb-4">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Home
          </button>
        </div>
      )}

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl p-8 max-w-md mx-4`}
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Warning!</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{warningMessage}</p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {MAX_VIOLATIONS - violationCount === 1
                    ? '⚠️ This is your final warning! One more violation will result in automatic submission.'
                    : `You have ${MAX_VIOLATIONS - violationCount} warnings remaining.`}
                </p>
              </div>
              <button
                onClick={() => setShowWarning(false)}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-4`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
            {!isFullscreen && (
              <button
                onClick={enterFullscreen}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Enter Fullscreen</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
              </span>
            </div>
            {violationCount > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Violations: {violationCount}/{MAX_VIOLATIONS}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress: {answeredCount}/{totalQuestions} answered</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-4`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Question {currentQuestion + 1} of {totalQuestions}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
                  disabled={currentQuestion === totalQuestions - 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">{currentQ.question}</p>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion] === index.toString()
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={answers[currentQuestion] === index.toString()}
                      onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                      className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitted}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Question Navigation */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Question Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    answers[index] !== undefined
                      ? 'bg-green-500 text-white'
                      : index === currentQuestion
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Face Detection */}
          <FaceDetector
            ref={faceDetectorRef}
            onCheatingIncident={handleFaceViolation}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl p-8 max-w-md mx-4`}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Submit Exam</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to submit the exam? This action cannot be undone.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Answered: {answeredCount} / {totalQuestions} questions
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;
