import React from 'react';
import { AuroraHero } from '../components/ui/futurastic-hero-section';

const Features: React.FC = () => {
  return (
    <AuroraHero hideText>
      <section className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4">ToolTip Companion Features</h1>
        <p className="text-gray-400 mb-10">A quick tour of what the extension and website provide.</p>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Hover Preview</h2>
            <p className="text-gray-300">Instant tooltips that show what will happen before you click. Works across most sites with smart detection.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">AI-Powered Chat</h2>
            <p className="text-gray-300">Ask questions about the current page or actions. Uses your configured LLM provider securely.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Smart Caching</h2>
            <p className="text-gray-300">Reduces redundant requests and speeds up previews using a local-first strategy.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Secure API Key Management</h2>
            <p className="text-gray-300">Keys are stored using browser-managed storage and never hardcoded. See API Key Setup for details.</p>
          </div>
        </div>

        <hr className="my-10 border-gray-800" />

        <section>
          <h2 className="text-xl font-semibold mb-4">Install the Open-Source Extension</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>
              Clone the repository: <code className="bg-gray-900 px-2 py-1 rounded">git clone https://github.com/mcpmessenger/Tooltip-Companion-Chrome-Extension.git</code>
            </li>
            <li>
              Open the Extensions page and enable Developer mode: <code className="bg-gray-900 px-2 py-1 rounded">chrome://extensions</code> or <code className="bg-gray-900 px-2 py-1 rounded">edge://extensions</code>
            </li>
            <li>Click "Load unpacked" and select the folder that contains <code className="bg-gray-900 px-2 py-1 rounded">manifest.json</code>.</li>
            <li>
              Configure backend in the extension&apos;s Options (right-click icon → Options). For local testing use <code className="bg-gray-900 px-2 py-1 rounded">http://localhost:3000</code> or your hosted backend URL.
            </li>
          </ol>
        </section>
      </section>
    </AuroraHero>
  );
};

export default Features;


