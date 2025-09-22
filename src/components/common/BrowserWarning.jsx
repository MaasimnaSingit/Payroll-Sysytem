import React from 'react';

const BrowserWarning = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Warning Icon */}
        <div className="mx-auto h-24 w-24 bg-red-600 rounded-full flex items-center justify-center mb-6">
          <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Warning Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚫 Desktop App Only
          </h1>
          
          <div className="bg-red-800/50 border border-red-600 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              This is a Desktop Application
            </h2>
            
            <p className="text-red-100 text-lg mb-4">
              The Payroll & Attendance System is designed to run as a desktop application using Electron.
            </p>
            
            <p className="text-red-200 mb-6">
              You cannot access this application through a web browser. Please use the desktop app instead.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              How to Launch the Desktop App:
            </h3>
            
            <div className="text-left space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-mono">1</span>
                <span>Close this browser tab</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-mono">2</span>
                <span>Open your terminal/command prompt</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-mono">3</span>
                <span>Navigate to the project directory</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-mono">4</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">npm run dev</span>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              <strong>Technical Note:</strong> This application uses Electron to provide a native desktop experience 
              with secure access to local databases and system resources. Web browser access is intentionally disabled 
              for security and functionality reasons.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-gray-400 text-sm">
          <p>Payroll & Attendance System v1.0.0</p>
          <p>Desktop Application - Electron + React + Vite</p>
        </div>
      </div>
    </div>
  );
};

export default BrowserWarning; 