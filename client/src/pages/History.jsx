import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, deleteDetection, getStats } from '../services/api';
import { 
  FiClock, FiAlertTriangle, FiCheckCircle, FiTrash2, 
  FiChevronLeft, FiChevronRight, FiBarChart2 
} from 'react-icons/fi';

function History() {
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyData, statsData] = await Promise.all([
        getHistory(page, 10),
        getStats()
      ]);
      
      setDetections(historyData.detections || []);
      setTotalPages(historyData.totalPages || 1);
      setStats(statsData);
    } catch (err) {
      setError(err.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this detection?')) {
      return;
    }

    try {
      await deleteDetection(id);
      setDetections(detections.filter(d => d._id !== id));
    } catch (err) {
      setError(err.error || 'Failed to delete');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Detection History</h1>
          <p className="text-gray-600">View your past deepfake analysis results</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiBarChart2 className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
                  <p className="text-sm text-gray-500">Total Scans</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <FiAlertTriangle className="text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.fakes || 0}</p>
                  <p className="text-sm text-gray-500">Fakes Detected</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <FiCheckCircle className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.real || 0}</p>
                  <p className="text-sm text-gray-500">Real Images</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FiClock className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.avgConfidence?.toFixed(1) || 0}%
                  </p>
                  <p className="text-sm text-gray-500">Avg Confidence</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
            {error}
          </div>
        )}

        {/* Detection List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {detections.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No history yet</h3>
              <p className="text-gray-500 mb-4">Start analyzing images to build your detection history</p>
              <Link to="/" className="btn btn-primary">
                Analyze Image
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Image</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Result</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Confidence</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detections.map((detection) => (
                      <tr key={detection._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {(detection.imageUrl || detection.filename) && (
                              <img
                                src={detection.imageUrl || `/uploads/${detection.filename}`}
                                alt={detection.originalName}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            <span className="text-sm text-gray-700 truncate max-w-xs">
                              {detection.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                            detection.result?.isDeepfake 
                              ? 'bg-danger-100 text-danger-700' 
                              : 'bg-success-100 text-success-700'
                          }`}>
                            {detection.result?.isDeepfake ? (
                              <>
                                <FiAlertTriangle className="text-xs" />
                                <span>FAKE</span>
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="text-xs" />
                                <span>REAL</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  detection.result?.isDeepfake ? 'bg-danger-500' : 'bg-success-500'
                                }`}
                                style={{ width: `${detection.result?.confidence || 0}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {detection.result?.confidence?.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-500">
                            {formatDate(detection.processedAt || detection.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleDelete(detection._id)}
                            className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft />
                    <span>Previous</span>
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;
