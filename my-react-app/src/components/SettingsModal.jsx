import React from 'react';

export default function SettingsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close settings"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Dark Mode</span>
            <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs">Coming soon</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Notifications</span>
            <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
} 