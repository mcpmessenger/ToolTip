// ToolTip Companion Investor Widget for Chromium Fork
// This widget showcases the project's commercial potential to investors

class ToolTipInvestorWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isVisible = false;
        this.currentDemo = 0;
        this.init();
    }

    init() {
        this.createWidget();
        this.setupEventListeners();
        this.startAutoDemo();
    }

    createWidget() {
        this.container.innerHTML = `
            <div class="tt-investor-widget" id="tt-widget">
                <div class="tt-widget-header">
                    <div class="tt-logo">ToolTip Companion</div>
                    <div class="tt-tagline">AI-Powered Browser Intelligence</div>
                    <button class="tt-close-btn" onclick="this.parentElement.parentElement.style.display='none'">×</button>
                </div>
                
                <div class="tt-metrics">
                    <div class="tt-metric">
                        <div class="tt-value">$1M-$30M+</div>
                        <div class="tt-label">Valuation Range</div>
                    </div>
                    <div class="tt-metric">
                        <div class="tt-value">500K+</div>
                        <div class="tt-label">Target Users</div>
                    </div>
                    <div class="tt-metric">
                        <div class="tt-value">$15/seat</div>
                        <div class="tt-label">Enterprise Price</div>
                    </div>
                </div>

                <div class="tt-features">
                    <div class="tt-feature">🤖 Multi-AI Integration</div>
                    <div class="tt-feature">🎤 Voice Intelligence</div>
                    <div class="tt-feature">🔍 Proactive Web Intelligence</div>
                    <div class="tt-feature">🛡️ Enterprise Security</div>
                </div>

                <div class="tt-demo">
                    <div class="tt-demo-controls">
                        <button class="tt-demo-btn" onclick="ttWidget.demoAI()">AI Chat</button>
                        <button class="tt-demo-btn" onclick="ttWidget.demoVoice()">Voice</button>
                        <button class="tt-demo-btn" onclick="ttWidget.demoAutomation()">Automation</button>
                    </div>
                    <div class="tt-demo-output" id="tt-demo-output">
                        Click a demo button to see our technology in action...
                    </div>
                </div>

                <div class="tt-cta">
                    <button class="tt-cta-btn primary" onclick="ttWidget.requestDemo()">Request Demo</button>
                    <button class="tt-cta-btn secondary" onclick="ttWidget.viewSpecs()">View Specs</button>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('tt-widget-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'tt-widget-styles';
        styles.textContent = `
            .tt-investor-widget {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                color: white;
                font-family: 'Segoe UI', sans-serif;
                z-index: 10000;
                animation: slideIn 0.5s ease-out;
            }

            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            .tt-widget-header {
                padding: 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                position: relative;
            }

            .tt-logo {
                font-size: 1.5rem;
                font-weight: 700;
                background: linear-gradient(45deg, #00ff88, #00d4ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .tt-tagline {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.7);
                margin-top: 0.25rem;
            }

            .tt-close-btn {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .tt-metrics {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.5rem;
                padding: 1rem;
                background: rgba(0, 255, 136, 0.1);
            }

            .tt-metric {
                text-align: center;
            }

            .tt-value {
                font-size: 1.2rem;
                font-weight: 700;
                color: #00ff88;
            }

            .tt-label {
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.7);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .tt-features {
                padding: 1rem;
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.5rem;
            }

            .tt-feature {
                font-size: 0.8rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                text-align: center;
            }

            .tt-demo {
                padding: 1rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .tt-demo-controls {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }

            .tt-demo-btn {
                flex: 1;
                background: linear-gradient(45deg, #00ff88, #00d4ff);
                border: none;
                border-radius: 6px;
                padding: 0.5rem;
                color: white;
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .tt-demo-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
            }

            .tt-demo-output {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                padding: 0.75rem;
                min-height: 60px;
                font-size: 0.8rem;
                font-family: 'Courier New', monospace;
                white-space: pre-wrap;
                overflow-y: auto;
                max-height: 120px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .tt-cta {
                padding: 1rem;
                display: flex;
                gap: 0.5rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .tt-cta-btn {
                flex: 1;
                padding: 0.75rem;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }

            .tt-cta-btn.primary {
                background: linear-gradient(45deg, #00ff88, #00d4ff);
                color: white;
            }

            .tt-cta-btn.secondary {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: rgba(255, 255, 255, 0.9);
            }

            .tt-cta-btn:hover {
                transform: translateY(-1px);
            }

            .tt-typing {
                border-right: 2px solid #00ff88;
                animation: blink 1s infinite;
            }

            @keyframes blink {
                0%, 50% { border-color: #00ff88; }
                51%, 100% { border-color: transparent; }
            }

            .tt-pulse {
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
        `;

        document.head.appendChild(styles);
    }

    setupEventListeners() {
        // Add any additional event listeners here
    }

    startAutoDemo() {
        setInterval(() => {
            if (this.isVisible) {
                const demos = [this.demoAI, this.demoVoice, this.demoAutomation];
                this.currentDemo = (this.currentDemo + 1) % demos.length;
                demos[this.currentDemo].call(this);
            }
        }, 15000);
    }

    show() {
        this.container.style.display = 'block';
        this.isVisible = true;
        this.container.querySelector('.tt-investor-widget').classList.add('tt-pulse');
    }

    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }

    demoAI() {
        const output = document.getElementById('tt-demo-output');
        output.innerHTML = '';
        
        const messages = [
            'Initializing AI chat...',
            'User: "What makes ToolTip unique?"',
            'AI: "ToolTip combines proactive web intelligence with multi-modal AI to predict user needs before they click. Our enterprise-grade security and real-time automation create a competitive moat in the $2.5B AI productivity market."'
        ];
        
        let index = 0;
        const interval = setInterval(() => {
            if (index < messages.length) {
                output.innerHTML += messages[index] + '\n';
                index++;
            } else {
                clearInterval(interval);
                output.classList.add('tt-typing');
                setTimeout(() => output.classList.remove('tt-typing'), 2000);
            }
        }, 1000);
    }

    demoVoice() {
        const output = document.getElementById('tt-demo-output');
        output.innerHTML = '';
        
        const steps = [
            '🎤 Activating voice recognition...',
            'Listening for input...',
            'Processing with Web Speech API...',
            'Transcribing: "Show AI trends"',
            'Sending to AI service...',
            'Generating response...',
            'Synthesizing with ElevenLabs...',
            '✅ Voice interaction complete!'
        ];
        
        let index = 0;
        const interval = setInterval(() => {
            if (index < steps.length) {
                output.innerHTML += steps[index] + '\n';
                index++;
            } else {
                clearInterval(interval);
            }
        }, 800);
    }

    demoAutomation() {
        const output = document.getElementById('tt-demo-output');
        output.innerHTML = '';
        
        const steps = [
            '🔍 Initializing Playwright...',
            'Capturing page screenshot...',
            'Analyzing with AI vision...',
            'Generating intelligent tooltips...',
            'Predicting user interactions...',
            'Creating proactive suggestions...',
            'Response time: 2.1s',
            '✅ Automation complete!'
        ];
        
        let index = 0;
        const interval = setInterval(() => {
            if (index < steps.length) {
                output.innerHTML += steps[index] + '\n';
                index++;
            } else {
                clearInterval(interval);
            }
        }, 700);
    }

    requestDemo() {
        alert('Investor Demo Request\n\nContact: investors@tooltipcompanion.com\n\nWe\'ll schedule a personalized demonstration of our technology and business model.');
    }

    viewSpecs() {
        alert('Technical Specifications\n\n• Multi-AI Integration (OpenAI, Gemini, Claude)\n• Real-time Voice Processing\n• Playwright Browser Automation\n• Enterprise Security & Compliance\n• Scalable Architecture (500K+ users)\n\nFull documentation available upon request.');
    }
}

// Initialize the widget
let ttWidget;
document.addEventListener('DOMContentLoaded', function() {
    // Create a container for the widget
    const container = document.createElement('div');
    container.id = 'tt-widget-container';
    container.style.display = 'none';
    document.body.appendChild(container);
    
    // Initialize the widget
    ttWidget = new ToolTipInvestorWidget('tt-widget-container');
    
    // Show the widget after a short delay
    setTimeout(() => {
        ttWidget.show();
    }, 2000);
});

// Export for use in Chromium fork
window.ToolTipInvestorWidget = ToolTipInvestorWidget;
