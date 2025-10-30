import React from 'react';
import { AuroraHero } from '../components/ui/futurastic-hero-section';

const PrivacyPolicy: React.FC = () => {
  return (
    <AuroraHero hideText>
      <article className="max-w-4xl mx-auto prose prose-invert prose-p:leading-relaxed">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Privacy Policy</h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-xl font-semibold mt-8">Overview</h2>
        <p>
          ToolTip Companion respects your privacy. This website does not collect personal information beyond
          standard analytics and error logs necessary to operate the site. The open‑source browser extension stores
          settings locally in your browser and uses provider APIs only when you choose to enable them.
        </p>

        <h2 className="text-xl font-semibold mt-8">Data We Process</h2>
        <ul className="list-disc pl-6">
          <li>Website operational logs and basic analytics (aggregated, non‑identifying).</li>
          <li>Extension configuration saved via browser storage (e.g., chrome.storage.sync) on your device.</li>
          <li>Optional API requests to your selected LLM provider when features are used.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">What We Don’t Do</h2>
        <ul className="list-disc pl-6">
          <li>We do not sell personal data.</li>
          <li>We do not hardcode or collect your provider API keys on the website.</li>
          <li>We do not track browsing history outside of what is necessary for requested features.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">Your Choices</h2>
        <ul className="list-disc pl-6">
          <li>You can clear extension data at any time from the extension’s Options page.</li>
          <li>You can revoke or rotate provider API keys from your provider dashboard.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">Contact</h2>
        <p>
          Questions? Contact the maintainers via the project repository.
        </p>
      </article>
    </AuroraHero>
  );
};

export default PrivacyPolicy;


