// script.js

// Global state variables
let recognition = null;
let isListening = false;
let audioCtx = null;
let visualizerActive = false;

// Language fallback chain — tries az-AZ first, if fails goes to az, then tr, then en-US
const LANG_CHAIN = ['az-AZ', 'az', 'tr-TR', 'en-US'];
let langIndex = 0;
let langFailed = false;

// DOM Elements
const btnMic = document.getElementById('btnMic');
const btnMicText = document.getElementById('btnMicText');
const micStatusLabel = document.getElementById('micStatusLabel');
const statusIndicator = document.getElementById('statusIndicator');
const speechBubble = document.getElementById('speechBubble');
const boyCharacter = document.getElementById('boyCharacter');
const micWaveContainer = document.getElementById('micWaveContainer');
const commandButtons = document.querySelectorAll('.btn-command');
const startOverlay = document.getElementById('startOverlay');
const btnStartOverlay = document.getElementById('btnStartOverlay');
const transcriptBox = document.getElementById('transcriptBox');
const transcriptText = document.getElementById('transcriptText');

// SVG Mouth Elements
const mouthNormal = document.getElementById('mouthNormal');
const mouthLaugh = document.getElementById('mouthLaugh');
const mouthCry = document.getElementById('mouthCry');
const mouthOpen = document.getElementById('mouthOpen');

// SVG Eyes Elements
const normalEyes = document.getElementById('normalEyes');
const happyEyes = document.getElementById('happyEyes');
const cryingEyes = document.getElementById('cryingEyes');
const teardrops = document.getElementById('teardrops');

// Sound Synthesizer Class / Helper Functions
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Procedural Audio Synthesizers for cute cartoon effects
const soundEffects = {
    otur: () => {
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    },
    dur: () => {
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    },
    gel: () => {
        initAudio();
        const now = audioCtx.currentTime;
        // 4 walking footsteps
        for (let i = 0; i < 4; i++) {
            const startTime = now + i * 0.4;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(90, startTime);
            osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.12);
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.13);
        }
    },
    get: () => {
        initAudio();
        const now = audioCtx.currentTime;
        // 4 walking footsteps, slightly faster
        for (let i = 0; i < 4; i++) {
            const startTime = now + i * 0.35;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, startTime);
            osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.1);
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.11);
        }
    },
    gul: () => {
        initAudio();
        const now = audioCtx.currentTime;
        // Cute step-wise upward giggle notes
        for (let i = 0; i < 6; i++) {
            const timeOffset = i * 0.12;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(450 + (i * 80) + Math.random() * 50, now + timeOffset);
            osc.frequency.exponentialRampToValueAtTime(650 + (i * 80), now + timeOffset + 0.08);
            gain.gain.setValueAtTime(0.15, now + timeOffset);
            gain.gain.linearRampToValueAtTime(0, now + timeOffset + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + 0.12);
        }
    },
    agla: () => {
        initAudio();
        const now = audioCtx.currentTime;
        // Slide down pitch with tremolo/vibrato (whimpers)
        for (let i = 0; i < 3; i++) {
            const timeOffset = i * 0.6;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(420, now + timeOffset);
            osc.frequency.linearRampToValueAtTime(260, now + timeOffset + 0.45);
            
            // Vibrato (pitch modulation)
            const vibratoOsc = audioCtx.createOscillator();
            const vibratoGain = audioCtx.createGain();
            vibratoOsc.frequency.value = 14; 
            vibratoGain.gain.value = 20; 
            vibratoOsc.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            
            gain.gain.setValueAtTime(0, now + timeOffset);
            gain.gain.linearRampToValueAtTime(0.18, now + timeOffset + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + timeOffset + 0.5);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            vibratoOsc.start(now + timeOffset);
            osc.start(now + timeOffset);
            
            vibratoOsc.stop(now + timeOffset + 0.55);
            osc.stop(now + timeOffset + 0.55);
        }
    },
    'agiz-ac': () => {
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.22);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    },
    'qulaq-tut': () => {
        initAudio();
        const now = audioCtx.currentTime;
        // Two sine waves creating a bright metallic ring tone
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = 950;
        osc2.type = 'sine';
        osc2.frequency.value = 1350;
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
    },
    'el-cal': () => {
        initAudio();
        const now = audioCtx.currentTime;
        
        // Generate random sound samples for claps
        const bufferSize = audioCtx.sampleRate * 0.08; // 80ms duration
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        // 4 fast claps
        for (let c = 0; c < 4; c++) {
            const clapTime = now + c * 0.25;
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 900;
            filter.Q.value = 2.5;
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.25, clapTime);
            gain.gain.exponentialRampToValueAtTime(0.01, clapTime + 0.06);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            noise.start(clapTime);
            noise.stop(clapTime + 0.08);
        }
    }
};

// Update character visuals (SVG elements showing/hiding)
function updateCharacterVisuals(state) {
    // 1. Reset all visual displays
    mouthNormal.style.display = 'block';
    mouthLaugh.style.display = 'none';
    mouthCry.style.display = 'none';
    mouthOpen.style.display = 'none';

    normalEyes.style.display = 'block';
    happyEyes.style.display = 'none';
    cryingEyes.style.display = 'none';
    teardrops.style.display = 'none';

    // Remove all classes from boy SVG
    boyCharacter.className.baseVal = '';

    // 2. Apply state visuals
    if (state === 'otur') {
        boyCharacter.classList.add('state-otur');
    } else if (state === 'dur') {
        // default idle standing visual
    } else if (state === 'gel') {
        boyCharacter.classList.add('state-gel');
    } else if (state === 'get') {
        boyCharacter.classList.add('state-get');
    } else if (state === 'gul') {
        boyCharacter.classList.add('state-gul');
        mouthNormal.style.display = 'none';
        mouthLaugh.style.display = 'block';
        normalEyes.style.display = 'none';
        happyEyes.style.display = 'block';
    } else if (state === 'agla') {
        boyCharacter.classList.add('state-agla');
        mouthNormal.style.display = 'none';
        mouthCry.style.display = 'block';
        normalEyes.style.display = 'none';
        cryingEyes.style.display = 'block';
        teardrops.style.display = 'block';
    } else if (state === 'agiz-ac') {
        boyCharacter.classList.add('state-agiz-ac');
        mouthNormal.style.display = 'none';
        mouthOpen.style.display = 'block';
    } else if (state === 'qulaq-tut') {
        boyCharacter.classList.add('state-qulaq-tut');
    } else if (state === 'el-cal') {
        boyCharacter.classList.add('state-el-cal');
    }
}

// Speech feedback phrases matching state
const feedbackPhrases = {
    otur: "Mən oturdum! 🧎‍♂️",
    dur: "Ayaq üstəyəm! 🧍‍♂️",
    gel: "Sənə tərəf gəlirəm! 🚶‍♂️",
    get: "Geri qayıdıram! 🏃‍♂️",
    gul: "Haha, çox gülməlidir! 😄",
    agla: "Ühühü, niyə ağladırsan məni? 😢",
    'agiz-ac': "Aaa, bax açdım! 😮",
    'qulaq-tut': "Qulağımı tutdum! 👂",
    'el-cal': "Çap-çap, əl çalıram! 👏"
};

// Trigger Action
function triggerAction(actionName) {
    if (!feedbackPhrases[actionName] && actionName !== 'dur') return;
    
    // Set UI button highlighting
    commandButtons.forEach(btn => {
        if (btn.getAttribute('data-command') === actionName) {
            btn.classList.add('active-command');
        } else {
            btn.classList.remove('active-command');
        }
    });

    // Update Speech Bubble Text
    const text = feedbackPhrases[actionName] || "Ayaq üstəyəm! 🧍‍♂️";
    speechBubble.textContent = text;
    speechBubble.style.animation = 'none';
    void speechBubble.offsetWidth; // Trigger reflow for animation reset
    speechBubble.style.animation = 'bubbleBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    // Update visuals & play sound effects
    updateCharacterVisuals(actionName);
    
    if (soundEffects[actionName]) {
        soundEffects[actionName]();
    }

    // Auto-return to idle after action animation completes (except Sit & Walk/Come/Go which are stable states)
    if (['gul', 'agla', 'agiz-ac', 'qulaq-tut', 'el-cal'].includes(actionName)) {
        setTimeout(() => {
            // Only return to normal if user hasn't triggered another action in the meantime
            const activeBtn = document.querySelector('.btn-command.active-command');
            if (activeBtn && activeBtn.getAttribute('data-command') === actionName) {
                // Return to normal
                updateCharacterVisuals('dur');
                activeBtn.classList.remove('active-command');
                speechBubble.textContent = "Növbəti əmrini gözləyirəm! 😊";
            }
        }, actionName === 'agla' ? 2200 : actionName === 'gel' || actionName === 'get' ? 2000 : 1500);
    }
}

// Helper: try to match a transcript and trigger action. Returns true if matched.
function tryParseCommand(transcript) {
    let text = transcript.toLowerCase().trim();
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

    if (text.includes("otur") || text.includes("əyləş") || text.includes("cök") || text.includes("çök") || text.includes("oturasan")) {
        triggerAction('otur'); return true;
    } else if (text.includes("dur") || text.includes("ayağa qalx") || text.includes("ayaqa qalx") || text.includes("qalx")) {
        triggerAction('dur'); return true;
    } else if (text.includes("gəl") || text.includes("gel") || text.includes("yaxınlaş") || text.includes("yaxinlas")) {
        triggerAction('gel'); return true;
    } else if (text.includes("get") || text.includes("uzaqlaş") || text.includes("uzaqlas")) {
        triggerAction('get'); return true;
    } else if (text.includes("gül") || text.includes("gul") || text.includes("gülümsə") || text.includes("gulumse") || text.includes("gülmək")) {
        triggerAction('gul'); return true;
    } else if (text.includes("ağla") || text.includes("agla") || text.includes("ağlamaq") || text.includes("aglamaq")) {
        triggerAction('agla'); return true;
    } else if (text.includes("ağzını aç") || text.includes("agzini ac") || text.includes("ağzı aç") || text.includes("agzi ac") || text === "aç" || text === "ac") {
        triggerAction('agiz-ac'); return true;
    } else if (text.includes("qulağını tut") || text.includes("qulagini tut") || text.includes("qulaq") || text === "tut") {
        triggerAction('qulaq-tut'); return true;
    } else if (text.includes("əl çal") || text.includes("el cal") || text.includes("əlçal") || text.includes("elcal") || text.includes("alqış") || text.includes("alqis") || text === "çal" || text === "cal") {
        triggerAction('el-cal'); return true;
    }
    return false;
}

// Command Parsing Logic (calls tryParseCommand, shows fallback bubble if unrecognized)
function parseVoiceCommand(transcript) {
    // Convert to lowercase, trim and strip standard punctuation (.,?! etc.)
    let text = transcript.toLowerCase().trim();
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    console.log("Parsing voice transcript:", text);

    if (text.includes("otur") || text.includes("əyləş") || text.includes("cök") || text.includes("çök") || text.includes("oturasan")) {
        triggerAction('otur');
    } else if (text.includes("dur") || text.includes("ayağa qalx") || text.includes("ayaqa qalx") || text.includes("qalx")) {
        triggerAction('dur');
    } else if (text.includes("gəl") || text.includes("gel") || text.includes("yaxınlaş") || text.includes("yaxinlas")) {
        triggerAction('gel');
    } else if (text.includes("get") || text.includes("uzaqlaş") || text.includes("uzaqlas")) {
        triggerAction('get');
    } else if (text.includes("gül") || text.includes("gul") || text.includes("gülümsə") || text.includes("gulumse") || text.includes("gülmək")) {
        triggerAction('gul');
    } else if (text.includes("ağla") || text.includes("agla") || text.includes("ağlamaq") || text.includes("aglamaq")) {
        triggerAction('agla');
    } else if (text.includes("ağzını aç") || text.includes("agzini ac") || text.includes("ağzı aç") || text.includes("agzi ac")) {
        triggerAction('agiz-ac');
    } else if (text.includes("qulağını tut") || text.includes("qulagini tut") || text.includes("qulaq")) {
        triggerAction('qulaq-tut');
    } else if (text.includes("əl çal") || text.includes("el cal") || text.includes("əlçal") || text.includes("elcal") || text.includes("alqış") || text.includes("alqis")) {
        triggerAction('el-cal');
    } else if (text === "aç" || text === "ac") {
        triggerAction('agiz-ac');
    } else if (text === "tut") {
        triggerAction('qulaq-tut');
    } else if (text === "çal" || text === "cal") {
        triggerAction('el-cal');
    } else {
        speechBubble.textContent = `Bunu başa düşmədim: "${transcript}" 🤔`;
    }
}

// Audio Mic Visualizer Functions (Simulated to prevent microphone capture conflicts on tablets/mobiles)
function startVisualizer() {
    visualizerActive = true;
    const bars = document.querySelectorAll('.wave-bar');
    
    let time = 0;
    function animate() {
        if (!visualizerActive) return;
        
        bars.forEach((bar, index) => {
            // Generate a natural-looking voice oscillation
            const base = Math.sin(time + index * 0.5) * 15 + 20;
            const noise = Math.random() * 12 - 6;
            const height = Math.max(5, Math.min(45, base + noise));
            bar.style.height = `${height}px`;
        });
        
        time += 0.25;
        requestAnimationFrame(animate);
    }
    
    animate();
}

function stopVisualizer() {
    visualizerActive = false;
    const bars = document.querySelectorAll('.wave-bar');
    bars.forEach(bar => {
        bar.style.height = '5px';
    });
}

// Speech Recognition Initialization
function setupSpeechRecognition(langIdx = 0) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        micStatusLabel.textContent = "Cihazınız səs tanıma funksiyalasını dəstəkləmir.";
        btnMic.style.display = 'none';
        return;
    }

    // Clean up previous recognition
    if (recognition) {
        try { recognition.abort(); } catch(e) {}
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // Hear results as they come in
    recognition.lang = LANG_CHAIN[langIdx] || 'az-AZ';
    recognition.maxAlternatives = 3; // Consider multiple interpretations

    console.log("Using recognition language:", recognition.lang);

    recognition.onstart = () => {
        isListening = true;
        langFailed = false;
        btnMic.classList.add('listening');
        btnMicText.textContent = "Dinləyirəm... (Dayandır)";
        micStatusLabel.textContent = "İndi danışmaq olar — əmri deyin!";
        micStatusLabel.style.color = "var(--text-secondary)";
        statusIndicator.querySelector('.status-dot').style.backgroundColor = '#ef4444';
        statusIndicator.querySelector('.status-dot').style.boxShadow = '0 0 8px #ef4444';
        statusIndicator.querySelector('.status-text').textContent = "Dinləyir";
        micWaveContainer.classList.add('listening');
        transcriptBox.style.display = 'flex';
        transcriptText.textContent = '...';
        startVisualizer();
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        
        if (event.error === 'language-not-supported' || event.error === 'service-not-allowed') {
            // Try next language in chain
            const nextIdx = langIdx + 1;
            if (nextIdx < LANG_CHAIN.length) {
                console.log("Language not supported, trying:", LANG_CHAIN[nextIdx]);
                micStatusLabel.textContent = `Dil dəyişdirilir... (${LANG_CHAIN[nextIdx]})`;
                setupSpeechRecognition(nextIdx);
                startListening();
                return;
            }
        }
        
        if (event.error === 'not-allowed') {
            stopListening();
            micStatusLabel.textContent = "Mikrofona icazə verilmədi. Ayarlardan mikrofona icazə verin.";
            micStatusLabel.style.color = "var(--error)";
            return;
        }
        
        if (event.error === 'no-speech') {
            return; // Silence, ignore
        }
        
        if (event.error === 'audio-capture') {
            stopListening();
            micStatusLabel.textContent = "Mikrofon tapılmadı və ya başqa proqram istifadə edir.";
            micStatusLabel.style.color = "var(--error)";
            return;
        }
        
        if (event.error === 'network') {
            micStatusLabel.textContent = "İnternet xətası — səs tanıma üçün internet lazımdır.";
            micStatusLabel.style.color = "var(--error)";
        }
    };

    recognition.onend = () => {
        if (isListening) {
            setTimeout(() => {
                if (isListening) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.warn("Auto-restart failed:", e);
                        stopListening();
                        micStatusLabel.textContent = "Dinləmə dayandı. Yenidən başlatmaq üçün düyməyə toxunun.";
                    }
                }
            }, 350);
        }
    };

    recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                // Collect all alternatives and pick one that matches
                let matched = false;
                for (let a = 0; a < result.length; a++) {
                    const alt = result[a].transcript;
                    console.log(`Alt ${a}: "${alt}" (${Math.round(result[a].confidence * 100)}%)`);
                    if (tryParseCommand(alt)) {
                        finalText = alt;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    finalText = result[0].transcript;
                    parseVoiceCommand(finalText);
                }
            } else {
                interimText = result[0].transcript;
            }
        }
        
        const displayText = finalText || interimText;
        if (displayText) {
            transcriptText.textContent = displayText;
        }
    };
}

function startListening() {
    initAudio();
    if (recognition) {
        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start speech recognition:", e);
        }
    }
}

function stopListening() {
    isListening = false;
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            console.error("Failed to stop speech recognition:", e);
        }
    }
    btnMic.classList.remove('listening');
    btnMicText.textContent = "Dinləmə Aktiv";
    micStatusLabel.textContent = "Dinləmə dayandı — düyməyə toxunun.";
    micStatusLabel.style.color = "var(--text-secondary)";
    statusIndicator.querySelector('.status-dot').style.backgroundColor = 'var(--success)';
    statusIndicator.querySelector('.status-dot').style.boxShadow = '0 0 8px var(--success)';
    statusIndicator.querySelector('.status-text').textContent = "Hazırdır";
    micWaveContainer.classList.remove('listening');
    stopVisualizer();
}

// Event Listeners
btnMic.addEventListener('click', () => {
    if (!isListening) {
        startListening();
    } else {
        stopListening();
    }
});

// Click handlers for manual actions grid
commandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const command = btn.getAttribute('data-command');
        triggerAction(command);
    });
});

// Overlay button — user's first gesture, mic is auto-started
btnStartOverlay.addEventListener('click', () => {
    // Hide overlay with animation
    startOverlay.classList.add('hidden');
    setTimeout(() => {
        startOverlay.style.display = 'none';
    }, 500);
    
    // Initialize and immediately start speech recognition
    initAudio();
    setupSpeechRecognition(0);
    startListening();
});

// Initialize on page load — setup recognition but don't start (wait for overlay tap)
window.addEventListener('DOMContentLoaded', () => {
    setupSpeechRecognition(0);
});
