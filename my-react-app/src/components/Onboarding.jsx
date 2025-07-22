import { useState } from 'react';

const questions = [
  {
    title: "What's your biggest focus challenge?",
    subtitle: "This helps us personalize your experience",
    type: "radio",
    options: [
      { value: "overwhelmed", label: "I get easily overwhelmed and need gentle guidance" },
      { value: "motivation", label: "I struggle with motivation and need extra encouragement" },
      { value: "flexibility", label: "I have good days and bad days - I need flexibility" },
      { value: "sensitivity", label: "I'm highly sensitive to pressure and criticism" },
      { value: "structure", label: "I need structure but also understanding when I fall short" },
      { value: "procrastination", label: "I procrastinate and need help staying on track" },
      { value: "distraction", label: "I get distracted easily and lose focus" },
      { value: "optimization", label: "I'm generally focused but want to optimize my productivity" }
    ]
  },
  {
    title: "What's your natural energy pattern?",
    type: "radio",
    options: [
      { value: "early_bird", label: "Early Bird" },
      { value: "night_owl", label: "Night Owl" },
      { value: "flexible", label: "Flexible" }
    ]
  },
  {
    title: "What's your primary goal?",
    type: "radio",
    options: [
      { value: "career_growth", label: "Career Growth" },
      { value: "creative_projects", label: "Creative Projects" },
      { value: "learning", label: "Learning" },
      { value: "health", label: "Health" },
      { value: "entrepreneurship", label: "Entrepreneurship" }
    ]
  },
  {
    title: "Preferred motivation style?",
    type: "radio",
    options: [
      { value: "philosophical_wisdom", label: "Philosophical Wisdom" },
      { value: "success_stories", label: "Success Stories" },
      { value: "achievement_tracking", label: "Achievement Tracking" },
      { value: "gentle_reminders", label: "Gentle Reminders" }
    ]
  },
  {
    title: "Ideal focus session length?",
    type: "radio",
    options: [
      { value: "25_min", label: "25 min Pomodoro" },
      { value: "90_min", label: "90 min Deep Work" },
      { value: "3_plus_hour", label: "3+ hour Marathon" },
      { value: "flexible", label: "Flexible" }
    ]
  },
  {
    title: "Would you like to display your focus timer on your device's lock screen?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ]
  },
  {
    title: "Which lock screen widget style do you prefer?",
    type: "radio",
    options: [
      { value: "zen_minimal", label: "Zen Minimal" },
      { value: "achievement_vibrant", label: "Achievement Vibrant" },
      { value: "hybrid_adaptive", label: "Hybrid Adaptive" }
    ]
  }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = questions[step];
  const total = questions.length;
  const progress = Math.round(((step + 1) / total) * 100);

  const handleChange = (e) => {
    setAnswers({ ...answers, [step]: e.target.value });
  };

  const handleNext = () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-30 flex items-center justify-center transition-all duration-1000">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600 font-medium">Step {step + 1} of {total}</span>
            <span className="text-sm text-slate-600 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-white/50 backdrop-blur-sm rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{current.title}</h2>
          {current.subtitle && <p className="text-lg text-slate-600 mb-6">{current.subtitle}</p>}
          <div className="space-y-4">
            {current.options.map((option, idx) => (
              <label key={option.value} className="flex items-center p-4 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/90 hover:border-blue-200 cursor-pointer transition-all duration-500 radio-option shadow-sm hover:shadow-md">
                <input
                  type="radio"
                  name={`question_${step}`}
                  value={option.value}
                  checked={answers[step] === option.value}
                  onChange={handleChange}
                  className="mr-4 w-5 h-5 text-blue-600"
                />
                <span className="text-slate-700 text-left leading-relaxed text-lg">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="px-6 py-3 text-slate-500 hover:text-slate-700 transition-colors duration-300 focus:outline-none font-medium disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg hover:shadow-xl"
          >
            {step === total - 1 ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
} 