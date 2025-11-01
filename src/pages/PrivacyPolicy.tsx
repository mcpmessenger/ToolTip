import React from 'react';
import { AuroraHero } from '../components/ui/futurastic-hero-section';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      <AuroraHero hideText={true} />
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <article className="max-w-4xl mx-auto px-4 py-24 prose prose-invert prose-p:leading-relaxed prose-headings:text-white prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4 prose-strong:text-white prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 prose-ul:text-gray-300 prose-li:text-gray-300">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img 
              src="/glippy.png" 
              alt="ToolTip Companion Logo" 
              className="w-40 h-40 md:w-48 md:h-48"
            />
          </div>

          <h1 className="text-4xl font-bold mb-4 text-white">Privacy Policy</h1>
          <p className="text-gray-400 mb-12">Last Updated: November 1, 2025</p>

          <h2>INTRODUCTION</h2>
          <p className="text-gray-300">
            Tooltip Companion ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome browser extension ("Extension").
          </p>

          <h2>INFORMATION WE COLLECT</h2>

          <p className="text-gray-300 font-semibold mt-4">Optional API Keys</p>
          <p className="text-gray-300">
            If you choose to use AI chat features, you may provide your OpenAI API key. This is stored locally in your browser using Chrome's secure storage. We never access or transmit your API keys to our servers.
          </p>

          <p className="text-gray-300 font-semibold mt-4">Screenshots</p>
          <p className="text-gray-300">When you hover over links, the Extension captures screenshots to show previews. These screenshots are:</p>
          <ul className="text-gray-300">
            <li>Cached locally in your browser's IndexedDB storage</li>
            <li>Processed by a backend service (which you can self-host)</li>
            <li>Not sent to us or any third parties</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">No Personal Data</p>
          <p className="text-gray-300">
            The Extension does not collect, store, or transmit any personal identifying information such as your name, email address, phone number, or location.
          </p>

          <h2>HOW WE USE YOUR INFORMATION</h2>
          <ul className="text-gray-300">
            <li><strong className="text-white">Local Storage:</strong> All data is stored locally in your browser</li>
            <li><strong className="text-white">Backend Processing:</strong> Screenshots are processed by your configured backend service</li>
            <li><strong className="text-white">No Third-Party Sharing:</strong> We do not sell, trade, or share your information</li>
          </ul>

          <h2>PERMISSIONS EXPLAINED</h2>
          <ul className="text-gray-300">
            <li><strong className="text-white">storage:</strong> Save your preferences locally (backend URL, API key)</li>
            <li><strong className="text-white">contextMenus:</strong> Right-click menu for link previews</li>
            <li><strong className="text-white">tabs:</strong> Access current tab URL for context</li>
            <li><strong className="text-white">activeTab:</strong> Capture screenshots when requested</li>
            <li><strong className="text-white">windows:</strong> Manage extension windows</li>
            <li><strong className="text-white">host_permissions (all_urls):</strong> Enable link previews on any website</li>
          </ul>

          <h2>DATA SECURITY</h2>
          <p className="text-gray-300">
            All Extension data is stored locally in your browser using Chrome's built-in security mechanisms. No sensitive data is transmitted to our servers.
          </p>

          <h2>THIRD-PARTY SERVICES</h2>

          <p className="text-gray-300 font-semibold mt-4">OpenAI</p>
          <p className="text-gray-300">
            If you use AI chat features and provide an OpenAI API key, your queries are sent directly to OpenAI according to their privacy policy: <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">https://openai.com/policies/privacy-policy</a>
          </p>

          <p className="text-gray-300 font-semibold mt-4">Backend Services</p>
          <p className="text-gray-300">
            Screenshots are processed by a backend service. If you use our cloud-hosted backend, data is processed according to our terms. If you self-host, your data never leaves your control.
          </p>

          <h2>YOUR RIGHTS</h2>
          <ul className="text-gray-300">
            <li><strong className="text-white">Access:</strong> View your data in the Extension's options page</li>
            <li><strong className="text-white">Delete:</strong> Uninstall the Extension or clear browser storage</li>
            <li><strong className="text-white">Control:</strong> Disable features or use without API key</li>
          </ul>

          <h2>CHILDREN'S PRIVACY</h2>
          <p className="text-gray-300">
            Our Extension is not intended for children under 13 (or 16 in the EU). We do not knowingly collect information from children.
          </p>

          <h2>CHANGES TO THIS POLICY</h2>
          <p className="text-gray-300">
            We may update this Privacy Policy. We will post the updated policy on this page and update the "Last Updated" date.
          </p>

          <h2>CONTACT US</h2>
          <p className="text-gray-300">If you have questions about this Privacy Policy, please contact us:</p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Website:</strong> tooltipcompanion.com</li>
            <li><strong className="text-white">Email:</strong> support@tooltipcompanion.com</li>
            <li><strong className="text-white">Extension Support:</strong> Use the Options page in the Extension</li>
          </ul>

          <h2>CONSENT</h2>
          <p className="text-gray-300">
            By using Tooltip Companion, you consent to this Privacy Policy.
          </p>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <p className="text-gray-400 text-sm text-center italic">
              This Privacy Policy is effective as of November 1, 2025. For the most current version, please visit <a href="https://tooltipcompanion.com/privacy">tooltipcompanion.com/privacy</a>.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
