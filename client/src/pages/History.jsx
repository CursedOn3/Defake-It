import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, deleteDetection, getStats } from '../services/api';
import { 
  FiClock, FiAlertTriangle, FiCheckCircle, FiTrash2, 
  FiChevronLeft, FiChevronRight, FiBarChart2, FiFilter,
  FiSearch, FiDownload, FiX 
} from 'react-icons/fi';

function History() {
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, filterType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterType !== 'all') {
        params.type = filterType;
      }

      const [historyData, statsData] = await Promise.all([
        getHistory(params.page, params.limit, params.type),
        getStats()
      ]);
      
      setDetections(historyData.data?.detections || historyData.detections || []);
      setTotalPages(historyData.data?.pagination?.pages || historyData.totalPages || 1);
      setStats(statsData.data || statsData);
    } catch (err) {
      setError(err.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filteredDetections = detections.filter((detection) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      detection.originalName?.toLowerCase().includes(query) ||
      detection.modelUsed?.toLowerCase().includes(query) ||
      detection.prediction?.toLowerCase().includes(query)
    );
  });

  const exportToCSV = () => {
    const headers = ['Date', 'File Name', 'Result', 'Confidence', 'Model Used'];
    const csvData = filteredDetections.map(d => [
      new Date(d.createdAt).toLocaleDateString(),
      d.originalName,
      d.prediction?.toUpperCase(),
      `${d.confidence?.toFixed(2)}%`,
      d.modelUsed || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepguard-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
                  <p className="text-2xl font-bold text-gray-800">{stats.fake || stats.fakes || 0}</p>
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
                    {stats.avgConfidence || 0}%
                  </p>
                  <p className="text-sm text-gray-500">Avg Confidence</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by filename or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>

            {/* Filter and Export Buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-primary-50 border-primary-500 text-primary-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiFilter />
                <span>Filters</span>
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredDetections.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiDownload />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('fake')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'fake'
                      ? 'bg-danger-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Fakes Only
                </button>
                <button
                  onClick={() => setFilterType('real')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'real'
                      ? 'bg-success-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Real Only
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
            {error}
          </div>
        )}

        {/* Detection List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {filteredDetections.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchQuery ? 'No results found' : 'No history yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search or filters' 
                  : 'Start analyzing images to build your detection history'}
              </p>
              {!searchQuery && (
                <Link to="/detect" className="btn btn-primary">
                  Analyze Image
                </Link>
              )}
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
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Model</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredDetections.map((detection) => (
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
                            detection.prediction === 'fake'
                              ? 'bg-danger-100 text-danger-700' 
                              : 'bg-success-100 text-success-700'
                          }`}>
                            {detection.prediction === 'fake' ? (
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
                                  detection.prediction === 'fake' ? 'bg-danger-500' : 'bg-success-500'
                                }`}
                                style={{ width: `${detection.confidence || 0}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {detection.confidence?.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {detection.modelUsed || 'Default'}
                          </span>
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
