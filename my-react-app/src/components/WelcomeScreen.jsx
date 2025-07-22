export default function WelcomeScreen({ onStartOnboarding, onSignIn }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-blue-50 z-40 flex items-center justify-center p-4 transition-opacity duration-500">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-6">🎯</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to FocusFlow</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your personal focus coach that helps you build sustainable focus habits through personalized coaching, smart reminders, and culturally diverse wisdom.
        </p>
        <div className="space-y-4">
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Start Onboarding"
            onClick={onStartOnboarding}
          >
            Get Started
          </button>
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Sign In"
            onClick={onSignIn}
          >
            Sign In to Save Progress
          </button>
        </div>
      </div>
    </div>
  );
} 