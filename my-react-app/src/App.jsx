import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Onboarding from './components/Onboarding';
import MainApp from './components/MainApp';
import AuthModal from './components/AuthModal';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingAnswers, setOnboardingAnswers] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('focusflow_auth_token') || null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setShowWelcome(true);
    }, 1500);
  }, []);

  const handleStartOnboarding = () => {
    setShowWelcome(false);
    setShowOnboarding(true);
  };

  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const handleOnboardingComplete = (answers) => {
    setShowOnboarding(false);
    setOnboardingAnswers(answers);
  };

  const handleAuthSuccess = (user, token) => {
    setUser(user);
    setToken(token);
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen transition-colors duration-300">
      {loading && <LoadingScreen />}
      {showWelcome && !loading && !showOnboarding && (
        <WelcomeScreen
          onStartOnboarding={handleStartOnboarding}
          onSignIn={handleSignIn}
        />
      )}
      {showOnboarding && !loading && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {!loading && !showWelcome && !showOnboarding && (
        <MainApp onboardingAnswers={onboardingAnswers} user={user} token={token} />
      )}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}

export default App;
