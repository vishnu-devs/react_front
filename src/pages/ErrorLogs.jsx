import React, { useState, useEffect } from 'react';

export default function ErrorLogs() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    setLogs(errorLogs);
  }, []);

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all error logs?')) {
      localStorage.setItem('errorLogs', '[]');
      setLogs([]);
      setSelectedLog(null);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear All Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logs List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Log Entries</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {logs.map((log, index) => (
              <div
                key={index}
                onClick={() => setSelectedLog(log)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                  selectedLog === log ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900 truncate">
                  {log.context || 'No Context'}
                </div>
                <div className="text-sm text-gray-500">{formatDate(log.timestamp)}</div>
                <div className="text-sm text-red-600 truncate">{log.message}</div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-center">
                No error logs found
              </div>
            )}
          </div>
        </div>

        {/* Log Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Log Details</h2>
          </div>
          <div className="p-4">
            {selectedLog ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
                  <p className="mt-1">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Context</h3>
                  <p className="mt-1">{selectedLog.context || 'No Context'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Message</h3>
                  <p className="mt-1 text-red-600">{selectedLog.message}</p>
                </div>
                {selectedLog.response && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Response Data</h3>
                    <pre className="mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.response, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedLog.stack && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Stack Trace</h3>
                    <pre className="mt-1 p-2 bg-gray-50 rounded overflow-x-auto text-xs">
                      {selectedLog.stack}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Select a log entry to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}