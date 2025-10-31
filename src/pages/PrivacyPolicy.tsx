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
          <p className="text-gray-400 mb-8">Last Updated: October 30, 2025</p>
          <p className="text-gray-400 mb-12">Effective Date: October 30, 2025</p>

          <p className="text-gray-300">
            Welcome to Tooltip Companion. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Chrome browser extension ("Extension") and visit our website at tooltipcompanion.com ("Website"). Please read this Privacy Policy carefully.
          </p>

          <h2>1. Introduction</h2>
          <p className="text-gray-300">
            Tooltip Companion ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy applies to:
          </p>
          <ul className="text-gray-300">
            <li>The Tooltip Companion Chrome browser extension</li>
            <li>The Tooltip Companion website at tooltipcompanion.com</li>
          </ul>
          <p className="text-gray-300">
            By using our Extension or Website, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information Collected by the Extension</h3>
          <p className="text-gray-300 font-semibold">API Keys (Optional):</p>
          <ul className="text-gray-300">
            <li>If you choose to use AI chat features, you may provide your OpenAI API key</li>
            <li>API keys are stored locally in your browser using Chrome's secure storage (`chrome.storage.sync`)</li>
            <li><strong className="text-white">We never access or transmit your API keys to our servers</strong></li>
            <li>API keys are only sent directly to OpenAI's API from your browser when you use chat features</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">Backend Service URL:</p>
          <ul className="text-gray-300">
            <li>You may configure a backend service URL for screenshot capture and OCR features</li>
            <li>This URL is stored locally in your browser</li>
            <li>Default is set to a cloud-hosted service, but you can configure your own local backend</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">Screenshots and Cached Data:</p>
          <ul className="text-gray-300">
            <li>The Extension may capture screenshots of web pages when you hover over links</li>
            <li>Screenshots are cached locally in your browser's IndexedDB storage</li>
            <li>Screenshots are processed by your configured backend service (which may be self-hosted or cloud-hosted)</li>
            <li>Screenshots are not sent to us unless you explicitly configure a backend service we host</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">URLs:</p>
          <ul className="text-gray-300">
            <li>The Extension accesses URLs of pages you visit to provide link previews</li>
            <li>URLs are only used locally or sent to your configured backend service</li>
            <li>URLs are not collected or stored by us</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">No Personal Information:</p>
          <ul className="text-gray-300">
            <li>The Extension does not collect, store, or transmit any personal identifying information (PII) such as your name, email address, phone number, or location</li>
          </ul>

          <h3>2.2 Information Collected by the Website</h3>
          <p className="text-gray-300">When you visit tooltipcompanion.com:</p>
          <p className="text-gray-300 font-semibold mt-4">Automatically Collected Information:</p>
          <ul className="text-gray-300">
            <li>Standard web analytics data (page views, browser type, device type) through standard analytics tools</li>
            <li>IP address (anonymized where possible)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">Information You Provide:</p>
          <ul className="text-gray-300">
            <li>If you contact us through the website, we collect the information you provide (name, email, message content)</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          
          <h3>3.1 Extension Data Usage</h3>
          <p className="text-gray-300 font-semibold mt-4">Local Processing:</p>
          <ul className="text-gray-300">
            <li>API keys are used only to make direct API calls from your browser to OpenAI (not through our servers)</li>
            <li>Screenshots are processed by your configured backend service (which may be self-hosted)</li>
            <li>All data remains local to your browser unless you configure a cloud backend service</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">Caching:</p>
          <ul className="text-gray-300">
            <li>Screenshots are cached in your browser's IndexedDB to improve performance</li>
            <li>Cached data remains on your device and is not transmitted to us</li>
          </ul>

          <h3>3.2 Website Data Usage</h3>
          <ul className="text-gray-300">
            <li>Analytics data is used to understand website usage and improve user experience</li>
            <li>Contact information is used to respond to your inquiries</li>
            <li>No data from the Website is linked to Extension usage</li>
          </ul>

          <h2>4. Permissions Explained</h2>
          <p className="text-gray-300">The Extension requests the following permissions and uses them as follows:</p>

          <p className="text-gray-300 font-semibold mt-4"><strong>`storage`:</strong></p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Purpose:</strong> Store your preferences (backend URL, API keys) locally in your browser</li>
            <li><strong className="text-white">Data:</strong> Settings and configuration only</li>
            <li><strong className="text-white">Storage Location:</strong> Chrome's secure storage (local to your browser)</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4"><strong>`contextMenus`:</strong></p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Purpose:</strong> Provide right-click menu options for link previews</li>
            <li><strong className="text-white">Data:</strong> No data collection, UI functionality only</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4"><strong>`tabs`:</strong></p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Purpose:</strong> Access the current tab's URL to provide context for tooltips</li>
            <li><strong className="text-white">Data:</strong> URLs accessed only locally, not transmitted</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4"><strong>`activeTab`:</strong></p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Purpose:</strong> Capture screenshots of the current page when requested</li>
            <li><strong className="text-white">Data:</strong> Screenshots processed locally or sent to your configured backend</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4"><strong>`windows`:</strong></p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Purpose:</strong> Manage extension windows and UI elements</li>
            <li><strong className="text-white">Data:</strong> No data collection, UI functionality only</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4"><strong>`host_permissions` (access to all URLs):</strong></p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Purpose:</strong> Enable link previews for any website you visit</li>
            <li><strong className="text-white">Data:</strong> URLs accessed only locally, not transmitted to us</li>
            <li><strong className="text-white">Note:</strong> This permission is necessary because the Extension needs to preview links on any website</li>
          </ul>

          <h2>5. Data Storage and Security</h2>
          
          <h3>5.1 Local Storage</h3>
          <ul className="text-gray-300">
            <li>All Extension data (API keys, settings, cached screenshots) is stored locally in your browser</li>
            <li>Data is stored using Chrome's built-in security mechanisms</li>
            <li>Data remains on your device and is not automatically synced to external servers</li>
          </ul>

          <h3>5.2 Cloud Services (If Configured)</h3>
          <p className="text-gray-300">If you configure a cloud-hosted backend service:</p>
          <ul className="text-gray-300">
            <li>Screenshots and OCR requests may be sent to that service</li>
            <li>The service operator's privacy policy applies to data sent to that service</li>
            <li>We do not control or have access to data sent to third-party backend services</li>
          </ul>

          <h3>5.3 Security Measures</h3>
          <ul className="text-gray-300">
            <li>All communications use HTTPS encryption</li>
            <li>API keys are stored using Chrome's secure storage API</li>
            <li>No sensitive data is transmitted to our servers by default</li>
            <li>We follow industry-standard security practices</li>
          </ul>

          <h2>6. Third-Party Services</h2>
          
          <h3>6.1 OpenAI (If You Use AI Chat)</h3>
          <ul className="text-gray-300">
            <li>If you provide an OpenAI API key, your chat messages are sent directly to OpenAI</li>
            <li>OpenAI's privacy policy applies: <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">OpenAI Privacy Policy</a></li>
            <li>We do not have access to your chat conversations</li>
            <li>API keys are never sent to our servers</li>
          </ul>

          <h3>6.2 Backend Services</h3>
          <ul className="text-gray-300">
            <li>Screenshots and OCR processing may be handled by a backend service</li>
            <li>If you use our cloud-hosted backend, data is processed according to our terms</li>
            <li>If you use a self-hosted backend, that service's privacy policy applies</li>
            <li>Backend services only receive URLs and image data necessary for processing</li>
          </ul>

          <h3>6.3 Website Analytics</h3>
          <ul className="text-gray-300">
            <li>We may use analytics services (e.g., Google Analytics) on our website</li>
            <li>These services collect anonymized usage data</li>
            <li>You can opt out through your browser settings or ad blockers</li>
          </ul>

          <h2>7. Data Sharing and Disclosure</h2>
          <p className="text-gray-300 font-semibold">We do not:</p>
          <ul className="text-gray-300">
            <li>Sell your personal information</li>
            <li>Share your data with third parties for marketing purposes</li>
            <li>Access your API keys or cached screenshots</li>
            <li>Track your browsing behavior across websites</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">We may disclose data only if:</p>
          <ul className="text-gray-300">
            <li>Required by law or legal process</li>
            <li>Necessary to protect our rights or prevent harm</li>
            <li>With your explicit consent</li>
          </ul>

          <h2>8. Your Rights and Choices</h2>
          
          <h3>8.1 Access and Control</h3>
          <p className="text-gray-300 font-semibold mt-4">View Your Data:</p>
          <ul className="text-gray-300">
            <li>Access Extension settings through the Options page (right-click extension icon → Options)</li>
            <li>View cached data through browser DevTools (Application → IndexedDB)</li>
          </ul>

          <p className="text-gray-300 font-semibold mt-4">Delete Your Data:</p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Local Extension Data:</strong> Uninstall the Extension or clear browser storage</li>
            <li><strong className="text-white">Website Data:</strong> Clear cookies and local storage through browser settings</li>
            <li><strong className="text-white">Backend Data:</strong> If using our cloud backend, contact us to request deletion</li>
          </ul>

          <h3>8.2 Opt-Out Options</h3>
          <ul className="text-gray-300">
            <li><strong className="text-white">Disable Extension:</strong> You can disable or uninstall the Extension at any time</li>
            <li><strong className="text-white">Don't Use AI Features:</strong> You can use the Extension without providing an API key</li>
            <li><strong className="text-white">Self-Host Backend:</strong> You can run your own backend service for complete control</li>
          </ul>

          <h3>8.3 GDPR and CCPA Rights</h3>
          <p className="text-gray-300">If you are in the EU, UK, or California, you have additional rights:</p>
          <ul className="text-gray-300">
            <li>Right to access your data</li>
            <li>Right to deletion</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to withdraw consent</li>
          </ul>
          <p className="text-gray-300">
            To exercise these rights, contact us at [contact email].
          </p>

          <h2>9. Children's Privacy</h2>
          <p className="text-gray-300">
            Our Extension and Website are not intended for children under 13 (or 16 in the EU). We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>

          <h2>10. International Data Transfers</h2>
          <ul className="text-gray-300">
            <li>Extension data is stored locally on your device</li>
            <li>If you use a cloud backend, data may be processed in the service provider's location</li>
            <li>We use appropriate safeguards for any international transfers</li>
          </ul>

          <h2>11. Data Retention</h2>
          <ul className="text-gray-300">
            <li><strong className="text-white">Extension Data:</strong> Stored locally until you uninstall the Extension or clear browser data</li>
            <li><strong className="text-white">Website Data:</strong> Analytics data retained according to standard practices (typically 26 months)</li>
            <li><strong className="text-white">Contact Information:</strong> Retained until you request deletion or it's no longer needed</li>
          </ul>

          <h2>12. Changes to This Privacy Policy</h2>
          <p className="text-gray-300">We may update this Privacy Policy from time to time. We will:</p>
          <ul className="text-gray-300">
            <li>Post the updated policy on this page</li>
            <li>Update the "Last Updated" date</li>
            <li>Notify users of material changes through the Extension or Website</li>
          </ul>
          <p className="text-gray-300">
            Continued use of the Extension or Website after changes constitutes acceptance of the updated policy.
          </p>

          <h2>13. Chrome Web Store Compliance</h2>
          <p className="text-gray-300">This Extension complies with Chrome Web Store policies:</p>
          <ul className="text-gray-300">
            <li><strong className="text-white">Single Purpose:</strong> Provides link previews and AI assistance</li>
            <li><strong className="text-white">User Data Privacy:</strong> Minimal data collection, local storage by default</li>
            <li><strong className="text-white">Permissions:</strong> All permissions are necessary and clearly explained</li>
            <li><strong className="text-white">Transparency:</strong> This Privacy Policy clearly explains data practices</li>
          </ul>

          <h2>14. Contact Us</h2>
          <p className="text-gray-300">If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
          <p className="text-gray-300">
            <strong className="text-white">Website:</strong> <a href="https://tooltipcompanion.com">tooltipcompanion.com</a><br />
            <strong className="text-white">Email:</strong> [Your contact email - to be added]<br />
            <strong className="text-white">Privacy Inquiries:</strong> [privacy@tooltipcompanion.com - to be added]
          </p>

          <h2>15. Additional Information</h2>
          <p className="text-gray-300">
            <strong className="text-white">Extension Version:</strong> 1.3.0<br />
            <strong className="text-white">Chrome Web Store Listing:</strong> [Link to be added after publication]
          </p>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <p className="text-gray-300 italic text-center">
              <strong className="text-white">By using Tooltip Companion, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.</strong>
            </p>
          </div>

          <p className="text-gray-400 text-sm text-center mt-8 italic">
            This Privacy Policy is effective as of October 30, 2025. For the most current version, please visit <a href="https://tooltipcompanion.com/privacy">tooltipcompanion.com/privacy</a>.
          </p>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
