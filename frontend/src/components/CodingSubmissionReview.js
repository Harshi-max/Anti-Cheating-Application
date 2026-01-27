import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Check, X, AlertCircle } from 'lucide-react';

const CodingSubmissionReview = ({ examId, darkMode }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchCodeSubmissions();
    const interval = setInterval(fetchCodeSubmissions, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [examId]);

  const fetchCodeSubmissions = async () => {
    try {
      const response = await api.get(`/exams/${examId}/code-submissions`);
      setSubmissions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      // This endpoint might not exist yet, so we'll just handle it gracefully
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTestResultStatus = (testResult) => {
    if (testResult.error) {
      return { status: 'error', icon: <X className="w-4 h-4" />, color: 'text-red-600' };
    }
    if (testResult.passed) {
      return { status: 'passed', icon: <Check className="w-4 h-4" />, color: 'text-green-600' };
    }
    return { status: 'failed', icon: <X className="w-4 h-4" />, color: 'text-red-600' };
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return sub.status !== 'completed' && sub.status !== 'error';
    if (filterStatus === 'completed') return sub.status === 'completed' || sub.status === 'error';
    return true;
  });

  if (loading && submissions.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Coding Submissions Review</h2>
          <button
            onClick={fetchCodeSubmissions}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {['all', 'pending', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          {submissions.length === 0 ? 'No coding submissions yet' : 'No submissions matching the filter'}
        </div>
      ) : (
        <div className="divide-y max-h-96 overflow-y-auto">
          {filteredSubmissions.map((submission, idx) => (
            <div key={submission._id || idx} className="px-6 py-4">
              {/* Submission Header */}
              <button
                onClick={() =>
                  setExpandedSubmission(
                    expandedSubmission === submission._id ? null : submission._id
                  )
                }
                className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 -m-2 rounded"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {expandedSubmission === submission._id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {submission.user?.name || 'Unknown Student'} - Question {submission.questionIndex + 1}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {submission.language} • Submitted at{' '}
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {submission.score !== undefined && (
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {submission.score}/{submission.maxScore}
                        </p>
                      </div>
                    )}
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedSubmission === submission._id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Source Code */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source Code:</p>
                    <pre className={`p-3 rounded text-xs overflow-x-auto ${
                      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
                    }`}>
                      {submission.sourceCode}
                    </pre>
                  </div>

                  {/* Test Results */}
                  {submission.testResults && submission.testResults.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Results:</p>
                      <div className="space-y-2">
                        {submission.testResults.map((result, resultIdx) => {
                          const { status, icon, color } = getTestResultStatus(result);
                          return (
                            <div
                              key={resultIdx}
                              className={`p-3 rounded border-l-4 ${
                                status === 'passed'
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className={color}>{icon}</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  Test Case {resultIdx + 1}
                                </span>
                                {result.executionTimeMs && (
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    ({result.executionTimeMs}ms)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                                <div>
                                  <strong>Input:</strong> <code>{result.input}</code>
                                </div>
                                <div>
                                  <strong>Expected:</strong> <code>{result.expectedOutput}</code>
                                </div>
                                <div>
                                  <strong>Actual:</strong> <code>{result.actualOutput || 'No output'}</code>
                                </div>
                                {result.error && (
                                  <div className="text-red-600 dark:text-red-400">
                                    <strong>Error:</strong> {result.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Execution Logs */}
                  {submission.logs && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Execution Logs:</p>
                      <pre className={`p-3 rounded text-xs overflow-x-auto max-h-40 ${
                        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
                      }`}>
                        {submission.logs}
                      </pre>
                    </div>
                  )}

                  {/* Error Message */}
                  {submission.status === 'error' && (
                    <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {submission.testResults?.[0]?.error || 'Execution error occurred'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodingSubmissionReview;
