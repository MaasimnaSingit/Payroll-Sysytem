import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        {/* Loading text */}
        <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
        <p className="text-dark-400">Please wait while we prepare your dashboard</p>
        
        {/* Loading dots */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 