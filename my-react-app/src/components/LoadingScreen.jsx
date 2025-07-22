import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <div className="mb-8">
        <svg className="animate-spin h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Focus Flow...</h2>
      <p className="text-gray-600 text-center max-w-xs">"The journey of a thousand miles begins with one step."</p>
    </div>
  );
} 