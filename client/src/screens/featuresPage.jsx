import Chatbot from "../components/Chatbot";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 font-sans relative flex flex-col">
      {/* Header */}
      <header className="w-full text-center py-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Wellness Dashboard</h1>
        <p className="text-gray-600 mt-2">Personalized Support & Insights</p>
      </header>

      {/* Suggestion Section */}
      <section className="px-6 mb-8">
        <h2 className="text-xl font-semibold text-indigo-700 mb-3">
          Personalized Local Recommendations
        </h2>
        <p className="text-gray-600">
          Based on your location, we suggest nearby mental health events, workshops,
          and safe spaces to connect with others.
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 flex-1">
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="font-semibold text-gray-700">Mood Tracking & Insights</h3>
          <p className="text-sm text-gray-500 mt-2">
            Visualize mood patterns, triggers, and suggestions like “Evenings are harder,
            want me to check in earlier instead?”
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="font-semibold text-gray-700">Micro-Intervention Playground</h3>
          <p className="text-sm text-gray-500 mt-2">
            Quick 30–90 sec activities like breathing, grounding, puzzles, journaling,
            and guided audios to lift your mood.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="font-semibold text-gray-700">Privacy & Control</h3>
          <p className="text-sm text-gray-500 mt-2">
            Full control over your data with toggles for location, voice, and journals.
            One-click “Delete My Data” option.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="font-semibold text-gray-700">Anger Channeling Tools</h3>
          <p className="text-sm text-gray-500 mt-2">
            Mini activities like vent journaling, clenching fists, or scribbling
            help release anger safely.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-gray-500 text-sm">
        Powered by <span className="font-semibold text-indigo-600">AI Companion</span>
      </footer>

      <Chatbot visible={true} />
    </div>
  );
}
