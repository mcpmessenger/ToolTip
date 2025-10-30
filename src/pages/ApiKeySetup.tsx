import React from 'react';
import { AuroraHero } from '../components/ui/futurastic-hero-section';
import ImagePreviewTooltip from '../components/ImagePreviewTooltip';

const ApiKeySetup: React.FC = () => {
  return (
    <AuroraHero hideText>
      <section className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4">API Key Setup</h1>
        <p className="text-gray-400 mb-8">Configure your LLM provider keys for the ToolTip Companion.</p>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Where keys are stored</h2>
            <p className="text-gray-300">
              Keys are stored in browser-managed storage (<code className="bg-gray-900 px-2 py-1 rounded">chrome.storage.sync</code>)
              and are only used locally by the extension. They are not hardcoded in the extension or website.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Get a provider key</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                OpenAI: <ImagePreviewTooltip imageSrc="/Screenshot%202025-10-30%20002034.png" alt="OpenAI create key"><a className="text-blue-400 underline" href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer">Create API key</a></ImagePreviewTooltip>
              </li>
              <li>
                Anthropic: <ImagePreviewTooltip imageSrc="/Screenshot%202025-10-30%20002118.png" alt="Anthropic create key"><a className="text-blue-400 underline" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">Create API key</a></ImagePreviewTooltip>
              </li>
              <li>
                Google AI Studio: <ImagePreviewTooltip imageSrc="/Screenshot%202025-10-30%20002201.png" alt="Google AI Studio create key"><a className="text-blue-400 underline" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Create API key</a></ImagePreviewTooltip>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Add your key in the extension</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Install and load the extension (see Features page for steps).</li>
              <li>Right-click the ToolTip Companion icon and choose <strong>Options</strong>.</li>
              <li>Paste your provider API key and choose the model.</li>
              <li>Save. The extension will use your key for AI features.</li>
            </ol>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">Security note</h3>
            <p className="text-yellow-200 text-sm">
              Use a non-production key with appropriate limits for testing. Keys can be removed any time from the Options page and from your provider dashboard.
            </p>
          </div>
        </div>
      </section>
    </AuroraHero>
  );
};

export default ApiKeySetup;


