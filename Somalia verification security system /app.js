// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ==========================================
// YOUR CONFIGURED FIREBASE SETTINGS
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_WEB_API_KEY",
    authDomain: "somaliasecuritymap.firebaseapp.com",
    databaseURL: "https://somaliasecuritymap-default-rtdb.firebaseio.com/",
    projectId: "somaliasecuritymap",
    storageBucket: "somaliasecuritymap.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let db = null;
let logsRef = null;

try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    logsRef = ref(db, 'security_sitrep_logs');
} catch (e) {
    console.log("Firebase initialization error: ", e);
}

// Unstoppable Continuous Peep Sound Controller
let audioCtx = null;
let alarmInterval = null;

function playContinuousPeepSound() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        [0, 120, 240].forEach((delay, i) => {
            setTimeout(() => {
                if (!alarmInterval) return;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.setValueAtTime(1046.50 + (i * 200), audioCtx.currentTime);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.08);
            }, delay);
        });
    } catch(e) {}
}

function startUnstoppablePeep() {
    if (alarmInterval) return;
    playContinuousPeepSound();
    alarmInterval = setInterval(playContinuousPeepSound, 500);
}

function stopPeep() {
    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
}

// Cyberpunk Matrix falling code generator for Page 1
const matrixContainer = document.getElementById('matrix-code');
const codeSnippets = [
    "CYBER_SEC_YUSUF_ALI_YUSUF_HASSAN", "FIREBASE_SYNC_ONLINE",
    "MOGADISHU_COMMAND_SECURE", "AFGOOYE_HIGH_RISK_MATRIX", "THREAT_AUDIT_ACTIVE",
    "AAG_AMMAAN_HIIL", "XARUNTA_DOWLADDA_MOGADISHU"
];
function generateMatrix() {
    let html = "";
    for (let i = 0; i < 22; i++) {
        html += codeSnippets[Math.floor(Math.random() * codeSnippets.length)] + "<br>";
    }
    matrixContainer.innerHTML = html;
}
setInterval(generateMatrix, 180);

// ==========================================
// AUTOMATIC 15s STARTUP SCAN ON APP LOAD
// ==========================================
const startupTimer = document.getElementById('startup-timer');

window.addEventListener('DOMContentLoaded', () => {
    startUnstoppablePeep();
    
    let startupLeft = 15;
    startupTimer.textContent = startupLeft + "s";
    
    const startupInterval = setInterval(() => {
        startupLeft--;
        startupTimer.textContent = startupLeft + "s";
        if (startupLeft <= 0) {
            clearInterval(startupInterval);
            stopPeep();
            
            // Transition automatically to Dashboard (Page 2)
            document.getElementById('page-upload').classList.remove('active-page');
            document.getElementById('page-dashboard').classList.add('active-page');
            setTimeout(() => map.invalidateSize(), 300);
        }
    }, 1000);
});

// Page Navigation Controls
document.getElementById('nav-to-news').addEventListener('click', () => {
    document.getElementById('page-dashboard').classList.remove('active-page');
    document.getElementById('page-news').classList.add('active-page');
});

document.getElementById('nav-to-dashboard').addEventListener('click', () => {
    document.getElementById('page-news').classList.remove('active-page');
    document.getElementById('page-dashboard').classList.add('active-page');
    setTimeout(() => map.invalidateSize(), 300);
});

// Initialize Leaflet Map
const map = L.map('map').setView([2.0469, 45.3182], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap | Created by Yusuf Ali Yusuf Hassan'
}).addTo(map);

// Render markers & set up click/scan handlers with individual live local Somali time
const firebaseLogList = document.getElementById('firebase-log-list');
const scanModal = document.getElementById('scan-modal');
const scanTimer = document.getElementById('scan-timer');
const scanTitle = document.getElementById('scan-title');
const scanSubtitle = document.getElementById('scan-subtitle');
const rainfallDisplay = document.getElementById('rainfall-display');

document.querySelectorAll('.sector-button').forEach(btn => {
    const lat = parseFloat(btn.getAttribute('data-lat'));
    const lng = parseFloat(btn.getAttribute('data-lng'));
    const title = btn.getAttribute('data-title');
    const desc = btn.getAttribute('data-desc');
    const descSo = btn.getAttribute('data-desc-so');
    const risk = btn.getAttribute('data-risk');

    let pinColor = risk === 'high' ? '#ef4444' : (risk === 'medium' ? '#f59e0b' : '#10b981');

    const icon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="width: 16px; height: 16px; background: ${pinColor}; border-radius: 50%; box-shadow: 0 0 12px ${pinColor}; border: 2px solid #fff;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    L.marker([lat, lng], { icon }).addTo(map).bindPopup(`<b>[${risk.toUpperCase()}] ${title}</b><br>${desc}<br><em>${descSo}</em>`);

    // Tap sector handler: Generates exact live local Somali time when clicked
    btn.addEventListener('click', () => {
        map.setView([lat, lng], 13);
        
        // Push entry to Firebase database with exact local time at the moment of clicking
        if (logsRef) {
            const currentSomaliTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Africa/Mogadishu',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            }).format(new Date());

            push(logsRef, {
                title: title,
                risk: risk,
                desc: desc,
                descSo: descSo,
                timestamp: currentSomaliTime
            });
        }

        if (risk === 'high') {
            scanModal.className = "scan-overlay scan-red";
        } else if (risk === 'medium') {
            scanModal.className = "scan-overlay scan-yellow";
        } else {
            scanModal.className = "scan-overlay scan-green";
        }

        scanTitle.textContent = `SCANNING // BAARID: ${title.toUpperCase()}`;
        scanSubtitle.textContent = `15s Threat Audit & Weather Metrics (${risk.toUpperCase()} RISK)...`;
        
        startUnstoppablePeep();

        scanModal.style.display = 'flex';
        let timeLeft = 15;
        scanTimer.textContent = timeLeft + "s";

        const rainInterval = setInterval(() => {
            const randomRain = (Math.random() * 25).toFixed(1);
            rainfallDisplay.textContent = `RAINFALL / ROOBKA: ${randomRain} mm/h`;
        }, 150);

        const countdown = setInterval(() => {
            timeLeft--;
            scanTimer.textContent = timeLeft + "s";
            if (timeLeft <= 0) {
                clearInterval(countdown);
                clearInterval(rainInterval);
                stopPeep();
                scanModal.style.display = 'none';
                
                // Transition automatically to Page 3 (News & Live SitRep)
                document.getElementById('page-dashboard').classList.remove('active-page');
                document.getElementById('page-news').classList.add('active-page');
            }
        }, 1000);
    });
});

// Listen for live Firebase logs on Page 3 with bilingual display and clean readable layout
if (logsRef) {
    onChildAdded(logsRef, (snapshot) => {
        const data = snapshot.val();
        const li = document.createElement('li');
        li.className = `risk-${data.risk}`;
        li.innerHTML = `
            <div class="log-title">[${data.risk.toUpperCase()}] ${data.title}</div>
            <div class="log-en"><strong>English:</strong> ${data.desc}</div>
            <div class="log-so"><strong>Soomaali:</strong> ${data.descSo || 'Aag la hubiyay oo la ilaalinayo.'}</div>
            <span style="position: absolute; right: 15px; top: 15px; color: #94a3b8; font-size: 0.7rem; font-family: var(--font-mono);">${data.timestamp}</span>
        `;
        li.style.position = 'relative';
        firebaseLogList.prepend(li);
    });
}