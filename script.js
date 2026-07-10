// script.js - v3.0 - Simple, reliable, mobile-first

// ─── GLOBALS ─────────────────────────────────────────────
let recognition   = null;
let isListening   = false;
let audioCtx      = null;
let visualActive  = false;

// ─── DOM REFS ─────────────────────────────────────────────
const btnMic         = document.getElementById('btnMic');
const btnMicText     = document.getElementById('btnMicText');
const micStatusLabel = document.getElementById('micStatusLabel');
const statusDot      = document.querySelector('.status-dot');
const statusTxt      = document.querySelector('.status-text');
const speechBubble   = document.getElementById('speechBubble');
const boyChar        = document.getElementById('boyCharacter');
const micWave        = document.getElementById('micWaveContainer');
const cmdBtns        = document.querySelectorAll('.btn-command');
const overlay        = document.getElementById('startOverlay');
const btnOverlay     = document.getElementById('btnStartOverlay');
const txBox          = document.getElementById('transcriptBox');
const txText         = document.getElementById('transcriptText');

// SVG face parts
const mouthNormal = document.getElementById('mouthNormal');
const mouthLaugh  = document.getElementById('mouthLaugh');
const mouthCry    = document.getElementById('mouthCry');
const mouthOpen   = document.getElementById('mouthOpen');
const normalEyes  = document.getElementById('normalEyes');
const happyEyes   = document.getElementById('happyEyes');
const cryingEyes  = document.getElementById('cryingEyes');
const teardrops   = document.getElementById('teardrops');

// ─── AUDIO INIT ───────────────────────────────────────────
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// ─── SOUND EFFECTS ────────────────────────────────────────
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
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + 0.35);
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
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + 0.35);
    },
    gel: () => {
        initAudio();
        const now = audioCtx.currentTime;
        for (let i = 0; i < 4; i++) {
            const t = now + i * 0.4;
            const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(90, t); osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
            g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
            osc.connect(g); g.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.13);
        }
    },
    get: () => {
        initAudio();
        const now = audioCtx.currentTime;
        for (let i = 0; i < 4; i++) {
            const t = now + i * 0.35;
            const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(80, t); osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
            g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.connect(g); g.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.11);
        }
    },
    gul: () => {
        initAudio();
        const now = audioCtx.currentTime;
        for (let i = 0; i < 6; i++) {
            const t = now + i * 0.12;
            const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
            osc.type = 'triangle'; osc.frequency.setValueAtTime(450 + i * 80 + Math.random() * 50, t); osc.frequency.exponentialRampToValueAtTime(650 + i * 80, t + 0.08);
            g.gain.setValueAtTime(0.15, t); g.gain.linearRampToValueAtTime(0, t + 0.1);
            osc.connect(g); g.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.12);
        }
    },
    agla: () => {
        initAudio();
        const now = audioCtx.currentTime;
        for (let i = 0; i < 3; i++) {
            const t = now + i * 0.6;
            const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
            const vib = audioCtx.createOscillator(); const vg = audioCtx.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(420, t); osc.frequency.linearRampToValueAtTime(260, t + 0.45);
            vib.frequency.value = 14; vg.gain.value = 20;
            vib.connect(vg); vg.connect(osc.frequency);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.1); g.gain.linearRampToValueAtTime(0, t + 0.5);
            osc.connect(g); g.connect(audioCtx.destination);
            vib.start(t); osc.start(t); vib.stop(t + 0.55); osc.stop(t + 0.55);
        }
    },
    'agiz-ac': () => {
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(220, now); osc.frequency.exponentialRampToValueAtTime(550, now + 0.22);
        g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(g); g.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.22);
    },
    'qulaq-tut': () => {
        initAudio();
        const now = audioCtx.currentTime;
        const o1 = audioCtx.createOscillator(); const o2 = audioCtx.createOscillator(); const g = audioCtx.createGain();
        o1.type = 'sine'; o1.frequency.value = 950;
        o2.type = 'sine'; o2.frequency.value = 1350;
        g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        o1.connect(g); o2.connect(g); g.connect(audioCtx.destination);
        o1.start(now); o2.start(now); o1.stop(now + 0.5); o2.stop(now + 0.5);
    },
    'el-cal': () => {
        initAudio();
        const bufSize = audioCtx.sampleRate * 0.08;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const now = audioCtx.currentTime;
        for (let c = 0; c < 4; c++) {
            const t = now + c * 0.25;
            const ns = audioCtx.createBufferSource(); ns.buffer = buf;
            const f = audioCtx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2.5;
            const g = audioCtx.createGain(); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
            ns.connect(f); f.connect(g); g.connect(audioCtx.destination); ns.start(t); ns.stop(t + 0.08);
        }
    }
};

// ─── CHARACTER VISUALS ────────────────────────────────────
const phrases = {
    otur:       'Oturdum! 🧎‍♂️',
    dur:        'Ayaq üstəyəm! 🧍‍♂️',
    gel:        'Sənə gəlirəm! 🚶‍♂️',
    get:        'Geri qayıdıram! 🏃‍♂️',
    gul:        'Haha çox gülməlidir! 😄',
    agla:       'Ühühü niyə ağladırsan? 😢',
    'agiz-ac':  'Aaa, açdım! 😮',
    'qulaq-tut':'Qulağımı tutdum! 👂',
    'el-cal':   'Çap-çap, əl çalıram! 👏'
};

function updateFace(state) {
    mouthNormal.style.display = 'block';
    mouthLaugh.style.display  = 'none';
    mouthCry.style.display    = 'none';
    mouthOpen.style.display   = 'none';
    normalEyes.style.display  = 'block';
    happyEyes.style.display   = 'none';
    cryingEyes.style.display  = 'none';
    teardrops.style.display   = 'none';

    if (state === 'gul') {
        mouthNormal.style.display = 'none'; mouthLaugh.style.display = 'block';
        normalEyes.style.display  = 'none'; happyEyes.style.display  = 'block';
    } else if (state === 'agla') {
        mouthNormal.style.display = 'none'; mouthCry.style.display   = 'block';
        normalEyes.style.display  = 'none'; cryingEyes.style.display = 'block';
        teardrops.style.display   = 'block';
    } else if (state === 'agiz-ac') {
        mouthNormal.style.display = 'none'; mouthOpen.style.display  = 'block';
    }
}

let resetTimer = null;

function resetToIdle() {
    boyChar.className.baseVal = '';
    updateFace('idle');
    cmdBtns.forEach(b => b.classList.remove('active-command'));
    speechBubble.textContent = 'Növbəti əmrini gözləyirəm! 😊';
    if (txText) txText.textContent = ''; // Clear text from the UI after action ends
}

function triggerAction(name) {
    // Cancel any pending reset
    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }

    // Highlight active button
    cmdBtns.forEach(b => b.classList.toggle('active-command', b.dataset.command === name));

    // Speech bubble
    const msg = phrases[name] || '😊';
    speechBubble.textContent = msg;
    speechBubble.style.animation = 'none';
    void speechBubble.offsetWidth;
    speechBubble.style.animation = 'bubbleBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    // SVG state class
    boyChar.className.baseVal = '';
    if (name !== 'dur') boyChar.classList.add('state-' + name);
    updateFace(name);

    // Sound
    if (soundEffects[name]) soundEffects[name]();

    // Auto-reset ALL actions back to idle after a short delay
    const delays = { agla: 2200, gel: 2000, get: 2000, otur: 2000 };
    const delay = delays[name] || 1800;
    resetTimer = setTimeout(resetToIdle, delay);
}

// ─── COMMAND MATCHING ─────────────────────────────────────
// Clean incoming text and map to command
function matchCommand(raw) {
    // Normalize: lowercase, strip punctuation, collapse spaces
    const t = raw.toLowerCase()
        .replace(/[.,!?;:'"(){}\[\]\/\\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    console.log('[Voice] heard:', t);

    // Strict Azerbaijani commands only (using word boundaries \b to prevent mixing)
    if (/\botur\b|\bəyləş\b|\bçök\b|\bcök\b/.test(t)) {
        return 'otur';
    }
    if (/\bdur\b|\bayağa\b|\bayaqa\b|\bqalx\b/.test(t)) {
        return 'dur';
    }
    if (/\bgəl\b|\bgel\b|\byaxınlaş\b/.test(t)) {
        return 'gel';
    }
    if (/\bget\b|\buzaqlaş\b/.test(t)) {
        return 'get';
    }
    if (/\bgül\b|\bgul\b|\bgülümsə\b/.test(t)) {
        return 'gul';
    }
    if (/\bağla\b|\bagla\b|\bağlamaq\b/.test(t)) {
        return 'agla';
    }
    if (/\bağzını\s+aç\b|\bagzini\s+ac\b|\bağzı\s+aç\b|\bagzi\s+ac\b|\baç\b|\bac\b/.test(t)) {
        return 'agiz-ac';
    }
    if (/\bqulağını\s+tut\b|\bqulagini\s+tut\b|\bqulaq\s+tut\b/.test(t)) {
        return 'qulaq-tut';
    }
    if (/\bəl\s+çal\b|\bel\s+cal\b|\bəlçal\b|\belcal\b|\balqış\b/.test(t)) {
        return 'el-cal';
    }

    return null; // unrecognized
}

// ─── VISUALIZER ───────────────────────────────────────────
function startVisualizer() {
    visualActive = true;
    const bars = document.querySelectorAll('.wave-bar');
    let t = 0;
    (function loop() {
        if (!visualActive) return;
        bars.forEach((b, i) => {
            b.style.height = Math.max(5, Math.min(42, Math.sin(t + i * 0.6) * 16 + 22 + Math.random() * 8)) + 'px';
        });
        t += 0.22;
        requestAnimationFrame(loop);
    })();
}
function stopVisualizer() {
    visualActive = false;
    document.querySelectorAll('.wave-bar').forEach(b => b.style.height = '5px');
}

// ─── SPEECH RECOGNITION ───────────────────────────────────
let lastTriggerTime = 0;
const TRIGGER_LOCKOUT_MS = 1800;
// Language fallback: az-AZ → tr-TR (silent, user sees Azerbaijani UI)
const LANG_CHAIN = ['az-AZ', 'tr-TR'];
let langIndex = 0;

function tryTriggerAction(command) {
    const now = Date.now();
    if (now - lastTriggerTime < TRIGGER_LOCKOUT_MS) return;
    lastTriggerTime = now;
    if (txText) txText.textContent = '';
    triggerAction(command);
    // NOTE: Do NOT abort() here — let the session end naturally on mobile
}

function buildRecognition(langIdx) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.continuous      = false; // false = most stable on all mobile browsers
    r.interimResults  = false; // false = only fire on complete utterance
    r.maxAlternatives = 3;
    r.lang            = LANG_CHAIN[langIdx] || 'az-AZ';
    console.log('[SR] lang =', r.lang);
    return r;
}

function attachHandlers() {
    recognition.onstart = () => {
        isListening = true;
        btnMic.classList.add('listening');
        btnMicText.textContent = 'Dinləyirəm… (Dayandır)';
        micStatusLabel.textContent = 'Danışın — əmri deyin!';
        micStatusLabel.style.color = '';
        statusDot.style.cssText = 'background:#ef4444; box-shadow:0 0 8px #ef4444';
        statusTxt.textContent = 'Dinləyir';
        micWave.classList.add('listening');
        txBox.style.display = 'flex';
        txText.textContent = '…';
        startVisualizer();
    };

    recognition.onerror = (e) => {
        console.warn('[SR] error:', e.error);

        // Non-fatal: ignore and let onend handle restart
        if (e.error === 'no-speech' || e.error === 'aborted') return;

        if (e.error === 'not-allowed') {
            stopListening();
            micStatusLabel.textContent = 'Mikrofona icazə rədd edildi!';
            micStatusLabel.style.color = 'var(--error)';
            return;
        }

        // Language not supported → silently try next language in chain
        if (e.error === 'language-not-supported' || e.error === 'service-not-allowed') {
            langIndex = (langIndex + 1) % LANG_CHAIN.length;
            console.log('[SR] switching lang →', LANG_CHAIN[langIndex]);
            // Rebuild with next language; onend will restart
            recognition = buildRecognition(langIndex);
            if (recognition) attachHandlers();
            return;
        }

        // Network or other: show a short warning but keep going
        console.warn('[SR] non-fatal error, will retry:', e.error);
    };

    recognition.onend = () => {
        if (!isListening) return;
        // Wait briefly then restart — simple session-based loop
        setTimeout(() => {
            if (!isListening) return;
            try {
                recognition.start();
            } catch (err) {
                console.warn('[SR] restart failed, rebuilding:', err);
                recognition = buildRecognition(langIndex);
                if (recognition) {
                    attachHandlers();
                    setTimeout(() => {
                        try { recognition.start(); } catch (_) {}
                    }, 500);
                }
            }
        }, 500);
    };

    recognition.onresult = (e) => {
        // Only read the latest final result
        const result = e.results[e.results.length - 1];
        if (!result) return;

        let matched = false;
        for (let a = 0; a < result.length; a++) {
            const alt = result[a].transcript;
            console.log(`[SR] alt${a}: "${alt}"`);
            const cmd = matchCommand(alt);
            if (cmd) {
                txText.textContent = alt;
                tryTriggerAction(cmd);
                matched = true;
                break;
            }
        }
        if (!matched) {
            txText.textContent = result[0].transcript;
        }
    };
}

function startListening() {
    initAudio();
    if (!recognition) return;
    try { recognition.start(); }
    catch (err) { console.error('[SR] start failed:', err); }
}

function stopListening() {
    isListening = false;
    try { if (recognition) recognition.stop(); } catch (_) {}
    btnMic.classList.remove('listening');
    btnMicText.textContent = 'Dinləmə Aktiv';
    micStatusLabel.textContent = 'Dayandı — düyməyə toxunun.';
    micStatusLabel.style.color = '';
    statusDot.style.cssText = 'background:var(--success); box-shadow:0 0 8px var(--success)';
    statusTxt.textContent = 'Hazırdır';
    micWave.classList.remove('listening');
    stopVisualizer();
}

// ─── EVENT LISTENERS ──────────────────────────────────────
// Overlay first-tap: ask mic permission + start
btnOverlay.addEventListener('click', () => {
    overlay.classList.add('hidden');
    setTimeout(() => overlay.style.display = 'none', 500);

    initAudio();
    langIndex = 0;
    recognition = buildRecognition(langIndex);
    if (!recognition) {
        micStatusLabel.textContent = 'Brauzeriniz səs tanımanı dəstəkləmir.';
        return;
    }
    attachHandlers();
    startListening();
});

// Manual mic toggle button
btnMic.addEventListener('click', () => {
    isListening ? stopListening() : startListening();
});

// Manual command buttons
cmdBtns.forEach(btn => {
    btn.addEventListener('click', () => triggerAction(btn.dataset.command));
});

// Setup on load
window.addEventListener('DOMContentLoaded', () => {
    recognition = buildRecognition(langIndex);
    if (recognition) attachHandlers();
});

