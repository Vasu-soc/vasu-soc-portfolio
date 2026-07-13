/* ============================================================
   SOC L1 PORTFOLIO — app.js
   iOS Water Bubble Interactions + Animations
   ============================================================ */

// ─── CYBER NETWORK CANVAS & SECURITY DASHBOARD ENGINE ──────────────
// Dynamic Web Audio Synthesizer
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('soc-muted') === 'true';
    this.initToggle();
  }
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  playBlip(freq = 800, type = 'sine', duration = 0.08, vol = 0.05) {
    if (this.muted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Sound playback failed", e);
    }
  }
  playKeyboard() {
    this.playBlip(600 + Math.random() * 400, 'triangle', 0.04, 0.02);
  }
  playSuccess() {
    this.playBlip(523.25, 'sine', 0.1, 0.06); // C5
    setTimeout(() => this.playBlip(659.25, 'sine', 0.15, 0.06), 80); // E5
  }
  playAlert() {
    this.playBlip(180, 'sawtooth', 0.3, 0.08);
    setTimeout(() => this.playBlip(150, 'sawtooth', 0.3, 0.08), 180);
  }
  playClick() {
    this.playBlip(300, 'sine', 0.05, 0.04);
  }
  playHover() {
    this.playBlip(1200, 'sine', 0.02, 0.015);
  }
  initToggle() {
    const btn = document.getElementById('soundToggle');
    const icon = document.getElementById('soundToggleIcon');
    if (!btn) return;
    
    // Update UI on load
    if (this.muted) {
      btn.classList.add('muted');
      icon.className = 'fas fa-volume-mute';
    } else {
      btn.classList.remove('muted');
      icon.className = 'fas fa-volume-up';
    }
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.muted = !this.muted;
      localStorage.setItem('soc-muted', this.muted);
      
      if (this.muted) {
        btn.classList.add('muted');
        icon.className = 'fas fa-volume-mute';
      } else {
        btn.classList.remove('muted');
        icon.className = 'fas fa-volume-up';
        this.playSuccess();
      }
    });
  }
}
const sfx = new SoundFX();

const canvas = document.getElementById('cyberCanvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [];
let mouse = { x: null, y: null, radius: 150 };
let ripples = [];
let streams = [];
let radarAngle = 0;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

// Binary Stream Class for attractive background data streams
class DataStream {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vy = 0.3 + Math.random() * 0.8;
    this.chars = ['0', '1', 'x', 'a', 'f', 'e', 'c', '0', '1', 'd', 'b'];
    this.text = this.generateText();
    this.alpha = 0.02 + Math.random() * 0.05;
    this.fontSize = 8 + Math.random() * 5;
  }
  generateText() {
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += this.chars[Math.floor(Math.random() * this.chars.length)];
    }
    return s;
  }
  update() {
    this.y += this.vy;
    if (this.y > H) {
      this.y = -30;
      this.x = Math.random() * W;
    }
    if (Math.random() < 0.02) this.text = this.generateText();
  }
  draw() {
    ctx.save();
    ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? `rgba(0, 229, 255, ${this.alpha})` : `rgba(0, 100, 180, ${this.alpha * 0.7})`;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class Node {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r = 2.0 + Math.random() * 2.5;
    this.alpha = 0.35 + Math.random() * 0.55;
    this.state = "secure"; // "secure" or "compromised"
    this.infectTimer = 0;
    this.ping = 0; // Visual flash value when radar sweeps over
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;

    // Mouse attraction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x += (dx / dist) * force * 0.5;
        this.y += (dy / dist) * force * 0.5;
      }
    }

    // Infect ripple hit
    ripples.forEach(r => {
      const dx = this.x - r.x;
      const dy = this.y - r.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dist - r.currentRadius) < 15 && this.state !== "compromised") {
        this.state = "compromised";
        this.infectTimer = 180;
      }
    });

    if (this.state === "compromised") {
      this.infectTimer--;
      if (this.infectTimer <= 0) {
        this.state = "secure";
      }
    }

    if (this.ping > 0) {
      this.ping -= 0.02;
    }
  }
  draw() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Draw radar sweep ping ring
    if (this.ping > 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + (1.0 - this.ping) * 12, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? `rgba(0, 229, 255, ${this.ping * 0.25})` : `rgba(0, 100, 180, ${this.ping * 0.18})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    
    if (this.state === "compromised") {
      ctx.fillStyle = `rgba(255, 23, 68, ${this.alpha})`;
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 8;
    } else {
      if (isDark) {
        ctx.fillStyle = this.ping > 0 
          ? `rgba(0, 229, 255, ${Math.min(1.0, this.alpha + this.ping * 0.5)})` 
          : `rgba(0, 229, 255, ${this.alpha})`;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = this.ping > 0 ? 10 : 5;
      } else {
        ctx.fillStyle = `rgba(0, 100, 180, ${this.alpha})`;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Generate Nodes & Data Streams
for (let i = 0; i < 70; i++) {
  nodes.push(new Node());
}
for (let i = 0; i < 25; i++) {
  streams.push(new DataStream());
}

class ThreatRipple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.maxRadius = 150 + Math.random() * 60;
    this.currentRadius = 0;
    this.speed = 3.5;
    this.alpha = 0.8;
  }
  update() {
    this.currentRadius += this.speed;
    this.alpha = 1 - (this.currentRadius / this.maxRadius);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 23, 68, ${this.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

canvas.addEventListener('click', (e) => {
  ripples.push(new ThreatRipple(e.clientX, e.clientY));
  sfx.playAlert();
  if (ripples.length > 5) ripples.shift();
});

function animateCyberNetwork() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  ctx.clearRect(0, 0, W, H);

  // Draw & update background data streams
  streams.forEach(s => { s.update(); s.draw(); });

  // Update & Draw nodes
  nodes.forEach(n => { n.update(); n.draw(); });

  // Update & Draw ripples
  ripples = ripples.filter(r => {
    r.update();
    r.draw();
    return r.currentRadius < r.maxRadius;
  });

  // Calculate radar sweep angle
  radarAngle += 0.004;
  if (radarAngle > Math.PI * 2) radarAngle = 0;

  const centerX = W / 2;
  const centerY = H / 2;
  const radarRadius = Math.max(W, H) * 0.8;

  // Check sweep collisions with nodes
  nodes.forEach(n => {
    const angleToNode = Math.atan2(n.y - centerY, n.x - centerX);
    let diff = angleToNode - radarAngle;
    // Normalize difference to -PI to PI
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    // Highlight if within radar arc (approx 10 degrees)
    if (diff > 0 && diff < 0.12 && n.ping <= 0) {
      n.ping = 1.0;
    }
  });

  // Draw rotating radar scan gradient arc
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radarRadius, radarAngle - 0.25, radarAngle);
  ctx.closePath();
  const radarGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radarRadius);
  if (isDark) {
    radarGrad.addColorStop(0, 'rgba(0, 229, 255, 0.025)');
    radarGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
  } else {
    radarGrad.addColorStop(0, 'rgba(0, 100, 180, 0.015)');
    radarGrad.addColorStop(1, 'rgba(0, 100, 180, 0)');
  }
  ctx.fillStyle = radarGrad;
  ctx.fill();
  ctx.restore();

  // Radar thin line edge
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + Math.cos(radarAngle) * radarRadius, centerY + Math.sin(radarAngle) * radarRadius);
  ctx.strokeStyle = isDark ? 'rgba(0, 229, 255, 0.04)' : 'rgba(0, 100, 180, 0.02)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw linking lines between close nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        
        let alpha = (100 - dist) / 100 * 0.12;
        
        // Boost line alpha if pinged
        if (nodes[i].ping > 0 || nodes[j].ping > 0) {
          alpha *= 1.8;
        }

        if (nodes[i].state === "compromised" || nodes[j].state === "compromised") {
          ctx.strokeStyle = `rgba(255, 23, 68, ${alpha * 2.2})`;
          ctx.lineWidth = 1.0;
        } else {
          ctx.strokeStyle = isDark ? `rgba(0, 229, 255, ${alpha})` : `rgba(0, 100, 180, ${alpha})`;
          ctx.lineWidth = 0.6;
        }
        ctx.stroke();
      }
    }
  }

  // Draw hover mouse scanlines
  if (mouse.x !== null && mouse.y !== null) {
    nodes.forEach(n => {
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        const alpha = (mouse.radius - dist) / mouse.radius * 0.15;
        ctx.strokeStyle = isDark ? `rgba(0, 229, 255, ${alpha})` : `rgba(0, 100, 180, ${alpha})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    });
  }

  requestAnimationFrame(animateCyberNetwork);
}
animateCyberNetwork();

// Ticker logs
const threatLogs = [
  "SYS:// Security Operations Center initialized.",
  "WARN:// Brute force attempt from Tor Exit Node 185.220.101.44 (Blocked)",
  "INFO:// Port scan detected from subnet 10.15.2.0/24 (Mitigated)",
  "ALERT:// Cobalt Strike beacon signature flagged on workstation WS-FIN-04",
  "INFO:// SentinelAgent running heuristic triage on IIS Log stream",
  "SUCCESS:// Firewalls sync complete. Zero compromised vectors found.",
  "WARN:// Phishing report received from HR dept. Domain auto-blocked.",
  "INFO:// Splunk indexer queue healthy. Status: SECURE",
  "ALERT:// SQL injection attempt detected at /api/users (WAF blocked)",
  "SUCCESS:// EDR health check: 142 endpoints reporting active status.",
  "INFO:// Threat intelligence feeds refreshed from MISP platform."
];

function startLiveThreatFeed() {
  const el = document.getElementById('liveAlertFeed');
  const statusInd = document.querySelector('.status-indicator');
  const statusTxt = document.querySelector('.status-text');
  if (!el) return;
  
  let index = 0;
  el.textContent = threatLogs[index];
  
  setInterval(() => {
    index = (index + 1) % threatLogs.length;
    const log = threatLogs[index];
    
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = log;
      el.style.opacity = '1';
      
      if (log.startsWith("ALERT")) {
        if (statusInd) statusInd.classList.add('critical');
        if (statusTxt) statusTxt.textContent = "ALERT: BREACH SUSPECT";
        sfx.playAlert();
        
        setTimeout(() => {
          if (statusInd) statusInd.classList.remove('critical');
          if (statusTxt) statusTxt.textContent = "SYSTEM STATUS: SECURED";
        }, 5000);
      } else if (log.startsWith("WARN")) {
        sfx.playBlip(320, 'triangle', 0.15, 0.04);
      } else {
        sfx.playBlip(900, 'sine', 0.02, 0.01);
      }
    }, 200);
  }, 4800);
}


// ─── ENHANCED SOC TERMINAL ENGINE ──────────────────────────────
const termHistory = [];
let termHistoryIdx = -1;
let matrixModeInterval = null;
let termTypingLocked = false;

function toggleTerminalWindow() {
  const term = document.getElementById('cyberTerminal');
  const btnIcon = document.querySelector('#minimizeTerminal i');
  if (!term) return;
  term.classList.toggle('collapsed');
  if (term.classList.contains('collapsed')) {
    if (btnIcon) btnIcon.className = 'fas fa-chevron-up';
  } else {
    if (btnIcon) btnIcon.className = 'fas fa-chevron-down';
    const inp = document.getElementById('terminalInput');
    if (inp) inp.focus();
    sfx.playClick();
  }
}



// Typewriter print — queues characters one by one

function typewriterLine(text, type = 'info', delayStart = 0, speed = 18) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const output = document.getElementById('terminalOutput');
      if (!output) { resolve(); return; }
      const line = document.createElement('div');
      line.className = `term-line ${type}`;
      output.appendChild(line);
      let i = 0;
      const interval = setInterval(() => {
        line.textContent += text[i];
        i++;
        output.scrollTop = output.scrollHeight;
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    }, delayStart);
  });
}

function writeTerminalLine(text, type = 'cmd', delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const output = document.getElementById('terminalOutput');
      if (!output) { resolve(); return; }
      const line = document.createElement('div');
      line.className = `term-line ${type}`;
      line.textContent = text;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
      resolve();
    }, delay);
  });
}

function writeDivider(label = '') {
  const output = document.getElementById('terminalOutput');
  if (!output) return;
  const line = document.createElement('div');
  line.className = 'term-line divider';
  line.textContent = label
    ? `── ${label} ${'─'.repeat(Math.max(0, 42 - label.length))}─`
    : '─'.repeat(48);
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// Sequential write helper
async function writeLines(lines, baseDelay = 0, step = 80) {
  for (let i = 0; i < lines.length; i++) {
    await writeTerminalLine(lines[i].text, lines[i].type, baseDelay + i * step);
  }
}

// Autocomplete input hint
const termAutocomplete = {
  cmds: ['help','about','skills','projects','alert','contact','clear','whoami',
         'date','ping','status','scan','mitre','tools','certs','banner','matrix',
         'history','exit','sudo'],
  hint(val) {
    if (!val) return '';
    const match = this.cmds.find(c => c.startsWith(val.toLowerCase()) && c !== val.toLowerCase());
    return match ? match.slice(val.length) : '';
  }
};

// Arrow key history & tab autocomplete
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('terminalInput');
  if (!inp) return;
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (termHistoryIdx < termHistory.length - 1) {
        termHistoryIdx++;
        inp.value = termHistory[termHistory.length - 1 - termHistoryIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (termHistoryIdx > 0) {
        termHistoryIdx--;
        inp.value = termHistory[termHistory.length - 1 - termHistoryIdx];
      } else {
        termHistoryIdx = -1;
        inp.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const hint = termAutocomplete.hint(inp.value);
      if (hint) inp.value += hint;
    }
  });
});

async function handleTerminalSubmit(e) {
  e.preventDefault();
  if (termTypingLocked) return;
  const input = document.getElementById('terminalInput');
  const rawCmd = input.value.trim();
  input.value = '';
  if (!rawCmd) return;

  // Save history
  if (rawCmd && (termHistory.length === 0 || termHistory[termHistory.length - 1] !== rawCmd)) {
    termHistory.push(rawCmd);
    if (termHistory.length > 50) termHistory.shift();
  }
  termHistoryIdx = -1;

  await writeTerminalLine(`guest@vasu-soc:~$ ${rawCmd}`, 'cmd');
  sfx.playKeyboard();

  const cmd = rawCmd.toLowerCase().trim();
  const args = cmd.split(' ');
  const baseCmd = args[0];

  termTypingLocked = true;
  try {
    await dispatchTerminalCommand(baseCmd, args.slice(1), rawCmd);
  } finally {
    termTypingLocked = false;
  }
}

async function dispatchTerminalCommand(cmd, args, rawCmd) {
  const delay = 120;

  // ── help ──────────────────────────────────────────────────────
  if (cmd === 'help') {
    writeDivider('COMMAND REFERENCE');
    const cmds = [
      { text: '  whoami          – Display operator identity & session info', type: 'info' },
      { text: '  about           – Load full security analyst profile', type: 'info' },
      { text: '  skills          – View technical skills matrix with ratings', type: 'info' },
      { text: '  projects        – List security tools & architectures built', type: 'info' },
      { text: '  certs           – Show certifications & training credentials', type: 'info' },
      { text: '  tools           – Display security toolset arsenal', type: 'info' },
      { text: '  contact         – Show secure contact channels', type: 'info' },
      { text: '  status          – Live SOC system health dashboard', type: 'info' },
      { text: '  scan [ip]       – Simulate network port scan on a host', type: 'info' },
      { text: '  ping [host]     – Simulate ICMP ping to a target host', type: 'info' },
      { text: '  mitre [tactic]  – Look up MITRE ATT&CK framework tactics', type: 'info' },
      { text: '  alert           – Trigger active threat invasion simulation', type: 'info' },
      { text: '  matrix          – Toggle Matrix rain mode overlay', type: 'info' },
      { text: '  banner          – Print SOC ASCII art banner', type: 'info' },
      { text: '  date            – Show current UTC timestamp & uptime', type: 'info' },
      { text: '  history         – Show last 10 commands entered', type: 'info' },
      { text: '  sudo            – Attempt privilege escalation (try it)', type: 'info' },
      { text: '  clear           – Clear the terminal output', type: 'info' },
      { text: '  exit            – Collapse the terminal window', type: 'info' },
    ];
    await writeLines(cmds, 0, 45);
    writeDivider();
    await writeTerminalLine('  TIP: Use ↑↓ arrow keys to navigate history. Tab to autocomplete.', 'muted', 45 * cmds.length + 80);

  // ── whoami ────────────────────────────────────────────────────
  } else if (cmd === 'whoami') {
    writeDivider('OPERATOR IDENTITY');
    const lines = [
      { text: '  USER       : guest (read-only access granted)', type: 'info' },
      { text: '  ANALYST    : IMMARAJU VASU', type: 'success' },
      { text: '  ROLE       : SOC Level 1 Security Analyst', type: 'info' },
      { text: '  CLEARANCE  : L1-DEFENDER / BLUE-TEAM OPS', type: 'warn' },
      { text: '  SESSION    : Active | Encrypted | TLS 1.3', type: 'success' },
      { text: '  LOCATION   : Hyderabad, Telangana, India', type: 'info' },
      { text: '  TRAINING   : SIEMXPERT SOC Analyst Program', type: 'info' },
    ];
    await writeLines(lines, 0, 60);

  // ── about ─────────────────────────────────────────────────────
  } else if (cmd === 'about') {
    writeDivider('SECURITY PROFILE');
    await writeLines([
      { text: '  NAME   : Immaraju Vasu', type: 'success' },
      { text: '  TITLE  : Cybersecurity – SOC L1 Analyst (Trainee)', type: 'info' },
      { text: '  FOCUS  : Threat Detection | Incident Response | SIEM', type: 'info' },
    ], 0, 55);
    await writeTerminalLine('', 'info', 200);
    await typewriterLine('  Highly disciplined defender specializing in continuous', 'info', 220, 14);
    await typewriterLine('  monitoring, log analysis, and rapid response to threat', 'info', 0, 14);
    await typewriterLine('  incursions using industry-standard SIEM & EDR platforms.', 'info', 0, 14);
    await writeTerminalLine('', 'info', 50);
    await writeLines([
      { text: '  Training at SIEMXPERT with hands-on labs in:', type: 'muted' },
      { text: '    ▸ Splunk Enterprise SIEM', type: 'muted' },
      { text: '    ▸ Microsoft Sentinel', type: 'muted' },
      { text: '    ▸ Elastic SIEM + Zeek', type: 'muted' },
      { text: '    ▸ CrowdStrike Falcon EDR', type: 'muted' },
    ], 50, 50);

  // ── skills ────────────────────────────────────────────────────
  } else if (cmd === 'skills') {
    writeDivider('TECHNICAL SKILLS MATRIX');
    const skills = [
      { name: 'Alert Triage (SIEM/IDS/IPS)', pct: 88 },
      { name: 'Log Analysis (Syslog/Windows Events)', pct: 85 },
      { name: 'Network Traffic Analysis (Wireshark)', pct: 82 },
      { name: 'Incident Response & Containment', pct: 80 },
      { name: 'Threat Intelligence (MISP/OSINT)', pct: 78 },
      { name: 'Vulnerability Assessment', pct: 75 },
      { name: 'Python Scripting for Security', pct: 72 },
      { name: 'Cloud Security (Azure Sentinel)', pct: 70 },
    ];
    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      const filled = Math.round(s.pct / 5);
      const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
      await writeTerminalLine(`  ${s.name.padEnd(38)} [${bar}] ${s.pct}%`,
        s.pct >= 85 ? 'success' : s.pct >= 78 ? 'info' : 'warn', i * 60);
    }

  // ── projects ──────────────────────────────────────────────────
  } else if (cmd === 'projects') {
    writeDivider('PROJECT ARSENAL');
    const projects = [
      { id: '01', name: 'Homelab SOC Environment', desc: 'Splunk + PfSense + Windows AD + IDS', status: 'ACTIVE' },
      { id: '02', name: 'Phishing Email Analyzer', desc: 'Header/domain/URL automated parsing tool', status: 'STABLE' },
      { id: '03', name: 'SentinelAgent', desc: 'Autonomous log triage & classification bot', status: 'ACTIVE' },
      { id: '04', name: 'Log Generator', desc: 'Security events testing simulator for SIEM', status: 'STABLE' },
    ];
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      await writeTerminalLine(`  [${p.id}] ${p.name}`, 'success', i * 80);
      await writeTerminalLine(`       DESC   : ${p.desc}`, 'info', i * 80 + 20);
      await writeTerminalLine(`       STATUS : ${p.status}`, p.status === 'ACTIVE' ? 'success' : 'warn', i * 80 + 40);
      await writeTerminalLine('', 'info', i * 80 + 55);
    }

  // ── certs ─────────────────────────────────────────────────────
  } else if (cmd === 'certs') {
    writeDivider('CERTIFICATIONS & TRAINING');
    await writeLines([
      { text: '  ✓ Google Cybersecurity Professional Certificate', type: 'success' },
      { text: '    Platform : Coursera | Status: COMPLETED', type: 'muted' },
      { text: '', type: 'info' },
      { text: '  ✓ SOC L1 Analyst Program – SIEMXPERT', type: 'success' },
      { text: '    Platform : SIEMXPERT | Status: IN PROGRESS', type: 'warn' },
      { text: '', type: 'info' },
      { text: '  ✓ TryHackMe – SOC Level 1 Learning Path', type: 'success' },
      { text: '    Platform : TryHackMe | Status: COMPLETED', type: 'muted' },
      { text: '', type: 'info' },
      { text: '  ○ CompTIA Security+ (Target: 2025)', type: 'warn' },
      { text: '    Status : PLANNED', type: 'muted' },
    ], 0, 55);

  // ── tools ─────────────────────────────────────────────────────
  } else if (cmd === 'tools') {
    writeDivider('SECURITY TOOLSET');
    const categories = [
      { cat: 'SIEM Platforms', tools: 'Splunk · Microsoft Sentinel · Elastic SIEM · IBM QRadar' },
      { cat: 'EDR / AV', tools: 'CrowdStrike Falcon · Windows Defender · ESET' },
      { cat: 'Network Analysis', tools: 'Wireshark · tcpdump · Zeek · Nmap' },
      { cat: 'Threat Intel', tools: 'MISP · VirusTotal · Shodan · AbuseIPDB' },
      { cat: 'Scripting', tools: 'Python · Bash · PowerShell' },
      { cat: 'Frameworks', tools: 'MITRE ATT&CK · NIST CSF · ISO 27001' },
    ];
    for (let i = 0; i < categories.length; i++) {
      await writeTerminalLine(`  ▸ ${categories[i].cat}`, 'success', i * 70);
      await writeTerminalLine(`    ${categories[i].tools}`, 'info', i * 70 + 30);
    }

  // ── contact ───────────────────────────────────────────────────
  } else if (cmd === 'contact') {
    writeDivider('SECURE CONTACT CHANNELS');
    await writeLines([
      { text: '  📞 Tel      : +91 9553866278', type: 'success' },
      { text: '  ✉ Email    : immarajuvasu2@gmail.com', type: 'info' },
      { text: '  🔗 LinkedIn : linkedin.com/in/immarajuvasu3', type: 'info' },
      { text: '  🐙 GitHub   : github.com/vasu-soc', type: 'info' },
      { text: '', type: 'info' },
      { text: '  All comms are end-to-end encrypted. Response SLA: 24hrs.', type: 'muted' },
    ], 0, 60);

  // ── status ────────────────────────────────────────────────────
  } else if (cmd === 'status') {
    writeDivider('SOC SYSTEM STATUS');
    const uptime = Math.floor(performance.now() / 1000);
    const uptimeStr = `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${uptime%60}s`;
    await writeLines([
      { text: '  ◉ SIEM Engine         : ONLINE  [Splunk v9.1.2]', type: 'success' },
      { text: '  ◉ Threat Feed         : LIVE    [MISP 2.4.x sync active]', type: 'success' },
      { text: '  ◉ EDR Coverage        : 142/142 endpoints reporting', type: 'success' },
      { text: '  ◉ Firewall Status     : ARMED   [PfSense 2.7.2]', type: 'success' },
      { text: '  ◉ IDS/IPS             : ACTIVE  [Snort 3.x rulebase loaded]', type: 'success' },
      { text: '  ◎ Vuln Scanner        : IDLE    [Last scan: 2h ago]', type: 'warn' },
      { text: '  ◉ Network Monitoring  : ACTIVE  [Zeek + Wireshark taps]', type: 'success' },
      { text: '', type: 'info' },
      { text: `  SESSION UPTIME        : ${uptimeStr}`, type: 'muted' },
      { text: `  THREAT LEVEL          : LOW (No active incidents)`, type: 'success' },
    ], 0, 55);

  // ── scan [ip] ─────────────────────────────────────────────────
  } else if (cmd === 'scan') {
    const target = args[0] || '192.168.1.1';
    writeDivider(`NMAP SCAN: ${target}`);
    await writeTerminalLine(`  Initiating port scan on ${target}...`, 'info');
    const ports = [
      { port: 22,   svc: 'ssh',     state: 'open',   ver: 'OpenSSH 8.9p1' },
      { port: 80,   svc: 'http',    state: 'open',   ver: 'Apache 2.4.54' },
      { port: 443,  svc: 'https',   state: 'open',   ver: 'TLS 1.3' },
      { port: 3306, svc: 'mysql',   state: 'filtered', ver: 'Unknown' },
      { port: 8080, svc: 'http-alt',state: 'closed', ver: '' },
      { port: 445,  svc: 'smb',     state: Math.random()>0.5?'open':'closed', ver: 'Samba 4.x' },
    ];
    await writeTerminalLine(`  Starting Nmap 7.94 at ${new Date().toUTCString()}`, 'muted', 300);
    await writeTerminalLine(`  Nmap scan report for ${target}`, 'muted', 600);
    for (let i = 0; i < ports.length; i++) {
      const p = ports[i];
      const col = p.state === 'open' ? 'warn' : p.state === 'filtered' ? 'error' : 'muted';
      await writeTerminalLine(
        `  ${String(p.port+'/tcp').padEnd(10)} ${p.state.padEnd(10)} ${p.svc.padEnd(12)} ${p.ver}`,
        col, 800 + i * 200
      );
    }
    await writeTerminalLine('  ── Scan complete. Review open ports for exposure risk. ──', 'warn', 800 + ports.length * 200 + 200);

  // ── ping [host] ───────────────────────────────────────────────
  } else if (cmd === 'ping') {
    const host = args[0] || '8.8.8.8';
    writeDivider(`PING: ${host}`);
    await writeTerminalLine(`  PING ${host}: 56 data bytes`, 'info');
    for (let i = 0; i < 4; i++) {
      const ms = (Math.random() * 20 + 8).toFixed(2);
      await writeTerminalLine(`  64 bytes from ${host}: icmp_seq=${i+1} ttl=116 time=${ms} ms`, 'success', i * 400);
    }
    await writeTerminalLine('', 'info', 1650);
    await writeTerminalLine(`  --- ${host} ping statistics ---`, 'muted', 1700);
    await writeTerminalLine('  4 packets transmitted, 4 received, 0% packet loss', 'success', 1750);

  // ── mitre [tactic] ────────────────────────────────────────────
  } else if (cmd === 'mitre') {
    const tactic = args.join(' ') || '';
    writeDivider('MITRE ATT&CK FRAMEWORK');
    const tactics = {
      'recon':        { id:'TA0043', desc:'Adversary gathers info to plan future operations' },
      'initial':      { id:'TA0001', desc:'Gaining first foothold via phishing, exploits, etc.' },
      'execution':    { id:'TA0002', desc:'Running malicious code on a victim system' },
      'persistence':  { id:'TA0003', desc:'Maintaining foothold across system restarts' },
      'privilege':    { id:'TA0004', desc:'Gaining higher-level permissions on target systems' },
      'lateral':      { id:'TA0008', desc:'Moving through the environment to pivot further' },
      'exfil':        { id:'TA0010', desc:'Stealing data from the target network' },
      'impact':       { id:'TA0040', desc:'Disrupting availability or destroying systems/data' },
      'c2':           { id:'TA0011', desc:'Communicating with compromised systems to control them' },
      'discovery':    { id:'TA0007', desc:'Learning about the environment (hosts, users, configs)' },
    };
    if (tactic && tactics[tactic]) {
      const t = tactics[tactic];
      await writeTerminalLine(`  TACTIC : ${tactic.toUpperCase()}`, 'success');
      await writeTerminalLine(`  ID     : ${t.id}`, 'info');
      await writeTerminalLine(`  DESC   : ${t.desc}`, 'info');
    } else {
      await writeTerminalLine('  Available tactics to query:', 'info');
      for (const [key, val] of Object.entries(tactics)) {
        await writeTerminalLine(`  mitre ${key.padEnd(12)} – ${val.id}  ${val.desc.slice(0,44)}...`, 'muted', 0);
      }
      await writeTerminalLine("", 'info');
      await writeTerminalLine("  Example: mitre lateral", 'warn');
    }

  // ── banner ────────────────────────────────────────────────────
  } else if (cmd === 'banner') {
    const art = [
      '  ██╗   ██╗ █████╗ ███████╗██╗   ██╗',
      '  ██║   ██║██╔══██╗██╔════╝██║   ██║',
      '  ██║   ██║███████║███████╗██║   ██║',
      '  ╚██╗ ██╔╝██╔══██║╚════██║██║   ██║',
      '   ╚████╔╝ ██║  ██║███████║╚██████╔╝',
      '    ╚═══╝  ╚═╝  ╚═╝╚══════╝ ╚═════╝ ',
      '  SOC L1 ANALYST — THREAT OPS CENTER',
      '  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄',
    ];
    for (let i = 0; i < art.length; i++) {
      await writeTerminalLine(art[i], i < 6 ? 'success' : 'warn', i * 50);
    }

  // ── date ──────────────────────────────────────────────────────
  } else if (cmd === 'date') {
    const now = new Date();
    await writeLines([
      { text: `  UTC   : ${now.toUTCString()}`, type: 'success' },
      { text: `  LOCAL : ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`, type: 'info' },
      { text: `  EPOCH : ${Math.floor(now.getTime() / 1000)}`, type: 'muted' },
    ], 0, 60);

  // ── history ───────────────────────────────────────────────────
  } else if (cmd === 'history') {
    writeDivider('COMMAND HISTORY');
    if (termHistory.length === 0) {
      await writeTerminalLine('  No commands in history yet.', 'muted');
    } else {
      const recent = termHistory.slice(-10);
      for (let i = 0; i < recent.length; i++) {
        await writeTerminalLine(`  ${String(i + 1).padStart(3)}  ${recent[i]}`, 'info', i * 40);
      }
    }

  // ── sudo ──────────────────────────────────────────────────────
  } else if (cmd === 'sudo') {
    await writeTerminalLine('  [sudo] password for guest: ', 'warn');
    await writeTerminalLine('  Sorry, user guest is not in the sudoers file.', 'error', 600);
    await writeTerminalLine('  This incident will be reported to the SOC team. 🛡', 'warn', 900);
    sfx.playAlert();

  // ── matrix ────────────────────────────────────────────────────
  } else if (cmd === 'matrix') {
    if (matrixModeInterval) {
      clearInterval(matrixModeInterval);
      matrixModeInterval = null;
      document.body.classList.remove('matrix-mode');
      await writeTerminalLine('  [MATRIX MODE] Deactivated. Welcome back.', 'success');
    } else {
      document.body.classList.add('matrix-mode');
      await writeTerminalLine('  [MATRIX MODE] ACTIVATED — Type "matrix" again to exit.', 'warn');
      sfx.playAlert();
      // Increase data stream speed + green tint
      matrixModeInterval = setInterval(() => {
        streams.forEach(s => {
          s.y += 0.5; // extra speed boost
        });
      }, 16);
    }

  // ── alert ─────────────────────────────────────────────────────
  } else if (cmd === 'alert') {
    await triggerSecurityInvasion();

  // ── clear ─────────────────────────────────────────────────────
  } else if (cmd === 'clear') {
    const out = document.getElementById('terminalOutput');
    if (out) out.innerHTML = '';

  // ── exit ──────────────────────────────────────────────────────
  } else if (cmd === 'exit') {
    await writeTerminalLine('  Closing secure terminal session...', 'warn');
    setTimeout(() => toggleTerminalWindow(), 600);

  // ── unknown command ───────────────────────────────────────────
  } else {
    await writeTerminalLine(`  bash: ${rawCmd}: command not found`, 'error');
    await writeTerminalLine("  Type 'help' for the full command list.", 'muted', 80);
    sfx.playBlip(250, 'sawtooth', 0.15, 0.05);
  }
}

async function triggerSecurityInvasion() {
  const term = document.getElementById('cyberTerminal');
  const statusInd = document.querySelector('.status-indicator');
  const statusTxt = document.querySelector('.status-text');
  const el = document.getElementById('liveAlertFeed');
  
  sfx.playAlert();
  if (term) term.classList.remove('collapsed');
  if (term) term.classList.add('alert-state');
  if (statusInd) statusInd.classList.add('critical');
  if (statusTxt) statusTxt.textContent = 'CRITICAL:// ALERT BREACH';
  if (el) el.textContent = 'ALERT:// HOST EXPLOITED. MEMORY DUMP CORRUPTED.';
  
  writeDivider('INCIDENT RESPONSE INITIATED');
  const alertLines = [
    { text: '  [!!!] CRITICAL ALERT — CVE-2026-X01 DETECTED', type: 'error' },
    { text: '  VECTOR  : Memory corruption + lateral movement via SMB', type: 'error' },
    { text: '  STATUS  : CONTAINMENT ISOLATION ACTIVE', type: 'warn' },
  ];
  await writeLines(alertLines, 0, 60);

  const steps = [
    { t: '  [1/5] Mapping live network topology graph...', type: 'info', d: 700 },
    { t: '  [2/5] Compromised node found: IP 192.168.1.104 (WS-FIN-04)', type: 'error', d: 1400 },
    { t: '  [3/5] Pushing firewall block ACL to perimeter router...', type: 'warn', d: 2200 },
    { t: '  [4/5] EDR isolation API call → WS-FIN-04 quarantined.', type: 'warn', d: 3000 },
    { t: '  [5/5] Memory dump collected. DFIR team notified.', type: 'info', d: 3800 },
    { t: '  ─────────────────────────────────────────────────', type: 'muted', d: 4500 },
    { t: '  RESULT: Containment SUCCESSFUL. No further lateral spread.', type: 'success', d: 5000 },
    { t: '  Systems returning to SECURED state. Incident logged.', type: 'success', d: 5600 },
  ];

  steps.forEach(s => {
    setTimeout(() => {
      writeTerminalLine(s.t, s.type);
      if (s.type === 'success') sfx.playSuccess();
      else sfx.playBlip(500, 'sine', 0.08, 0.03);
      if (s.t.includes('Incident logged')) {
        if (term) term.classList.remove('alert-state');
        if (statusInd) statusInd.classList.remove('critical');
        if (statusTxt) statusTxt.textContent = 'SYSTEM STATUS: SECURED';
        if (el) el.textContent = 'SUCCESS:// Breach contained. All logs cleared.';
      }
    }, s.d);
  });
}




// ─── NAV: SCROLL SHRINK + ACTIVE LINK ──────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // shrink nav
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // active link
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.dataset.section === current);
  });
});

// mobile menu — premium slide + X animation
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

// Create backdrop element once
const menuBackdrop = document.createElement('div');
menuBackdrop.className = 'nav-menu-backdrop';
document.body.appendChild(menuBackdrop);

function openMobileMenu() {
  navLinksEl.classList.add('open');
  hamburger.classList.add('open');
  menuBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  navLinksEl.classList.remove('open');
  hamburger.classList.remove('open');
  menuBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  if (navLinksEl.classList.contains('open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

// Close menu when backdrop is tapped
menuBackdrop.addEventListener('click', closeMobileMenu);

// Close menu on nav link click
navLinksEl.querySelectorAll('a').forEach(l => {
  l.addEventListener('click', closeMobileMenu);
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinksEl.classList.contains('open')) {
    closeMobileMenu();
  }
});


// ─── SMOOTH SCROLL HELPER ──────────────────────────────────────
function scrollSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}


// ─── SKILL BARS ANIMATION ──────────────────────────────────────
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const card = e.target;
    const delay = parseInt(card.dataset.delay || 0);
    setTimeout(() => {
      card.querySelectorAll('.skill-bar').forEach(bar => {
        const pct = bar.dataset.pct;
        bar.querySelector('.skill-fill').style.width = pct + '%';
      });
    }, delay);
    skillObs.unobserve(card);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-card').forEach(c => skillObs.observe(c));


// ─── STAT COUNTER ANIMATION ────────────────────────────────────
function animateCount(el, target, suffix) {
  let start = 0;
  const duration = 1800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const val = parseInt(e.target.dataset.val);
    const suffix = e.target.dataset.suffix || '';
    const numEl = e.target.querySelector('.stat-num');
    animateCount(numEl, val, suffix);
    statObs.unobserve(e.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-bubble').forEach(s => statObs.observe(s));


// ─── REVEAL ON SCROLL ──────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

// add reveal class to all cards + sections
document.querySelectorAll('.skill-card,.project-card,.cert-card,.badge-card,.tool-category-bubble,.qi-item,.about-text-wrap,.about-avatar-wrap').forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});


// ─── TIMELINE ANIMATION ────────────────────────────────────────
const tlObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      tlObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.timeline-item').forEach((el, i) => {
  el.style.transitionDelay = (i * 120) + 'ms';
  tlObs.observe(el);
});


// ─── CASE MODAL DATA ───────────────────────────────────────────
const caseData = {
  '1': {
    id: 'CASE-0x01',
    title: 'Ransomware Outbreak — Lateral Movement Detection',
    severity: 'HIGH',
    siem: 'Splunk SIEM',
    mttr: '8 min',
    hosts: '12',
    iocs: ['192.168.10.44', 'evil-dropper.exe', 'SHA256: a3f9c2d...', '445/SMB', 'WNCRY extension'],
    timeline: [
      { time: '09:02', event: 'SIEM alert fired — unusual SMB traffic on 192.168.10.x/24 subnet' },
      { time: '09:04', event: 'Correlated event logs showing WannaCry-like file rename patterns (.WNCRY)' },
      { time: '09:06', event: 'Identified Patient Zero: DESKTOP-HQ7X2 — isolated from network via EDR' },
      { time: '09:08', event: 'Blocked lateral movement — ACL applied on core switch ports 10-22' },
      { time: '09:10', event: 'IOCs submitted to threat intel and escalated to L2 for full remediation' },
    ],
    outcome: 'Contained to 12 hosts. Shadow copies were preserved on 80% of endpoints, enabling full restore without ransom payment. Post-IR report submitted.',
    mitre: ['T1486 – Data Encrypted for Impact', 'T1021.002 – SMB/Windows Admin Shares', 'T1570 – Lateral Tool Transfer'],
  },
  '2': {
    id: 'CASE-0x02',
    title: 'Phishing Campaign — Executive Credential Theft',
    severity: 'CRITICAL',
    siem: 'Microsoft Sentinel',
    mttr: '12 min',
    hosts: '5 execs',
    iocs: ['phishme-corp.xyz', 'OAuth token: eyJ0...', 'MFA bypass via EvilGinx', 'Source IP: 91.108.4.1'],
    timeline: [
      { time: '14:11', event: 'Sentinel alert — impossible travel: CEO login from India and UK within 3 min' },
      { time: '14:14', event: 'Identified adversary-in-the-middle (AiTM) phishing kit intercepting OAuth tokens' },
      { time: '14:17', event: 'Revoked all active sessions for 5 targeted executives via Azure AD' },
      { time: '14:20', event: 'Reset credentials and enforced FIDO2 hardware key MFA for execs' },
      { time: '14:23', event: 'Created custom Sentinel rule to detect AiTM patterns. Escalated to CISO.' },
    ],
    outcome: 'No data exfiltration confirmed. Executive mailboxes audited — no unauthorized email forwarding rules found. Custom detection rule deployed globally.',
    mitre: ['T1566 – Phishing', 'T1528 – Steal Application Access Token', 'T1110.003 – Password Spraying'],
  },
  '3': {
    id: 'CASE-0x03',
    title: 'C2 Beaconing — Cobalt Strike Detection',
    severity: 'MEDIUM',
    siem: 'Elastic SIEM + Zeek',
    mttr: '20 min',
    hosts: '1 workstation',
    iocs: ['185.220.101.52', 'beacon interval: 60s ±10%', 'HTTPS to port 443', 'User-Agent: Mozilla/4.0 CMS'],
    timeline: [
      { time: '11:05', event: 'Anomaly detection flagged periodic HTTPS outbound from WS-FIN-04 every 60s' },
      { time: '11:10', event: 'Wireshark PCAP analysis — jitter pattern indicates Cobalt Strike watermark' },
      { time: '11:14', event: 'Zeek logs confirmed 847 beacons to 185.220.101.52 over 14 hours' },
      { time: '11:18', event: 'Host isolated via CrowdStrike Falcon — memory dump collected for DFIR' },
      { time: '11:25', event: 'C2 IP added to global blocklist. Yara rule created for beacon pattern.' },
    ],
    outcome: 'Single host compromised. Initial access vector traced to malicious macro in finance Excel file. Threat actor had no lateral movement opportunities.',
    mitre: ['T1071.001 – Web Protocols', 'T1573.002 – Asymmetric Cryptography', 'T1055 – Process Injection'],
  },
  '4': {
    id: 'CASE-0x04',
    title: 'SQL Injection — Web Application Attack',
    severity: 'HIGH',
    siem: 'Splunk + WAF Logs',
    mttr: '15 min',
    hosts: 'Web App DB',
    iocs: ["' OR 1=1--", 'UNION SELECT payload', 'IP: 104.21.67.4', '/api/users?id= param'],
    timeline: [
      { time: '16:30', event: 'WAF triggered SQL injection alert on /api/users endpoint — 312 attempts' },
      { time: '16:34', event: 'Proxy logs confirmed time-based blind SQLi using SLEEP() payloads' },
      { time: '16:38', event: 'Attacker IP blocked at perimeter firewall. Rate limiting applied to /api/*' },
      { time: '16:42', event: 'AppSec team notified — emergency parameterized query patch deployed' },
      { time: '16:45', event: 'DB audit logs reviewed — no successful data exfiltration confirmed' },
    ],
    outcome: 'Attack blocked before successful data extraction. Emergency patching took 2 hours. WAF ruleset updated with OWASP Top 10 SQLi signatures.',
    mitre: ['T1190 – Exploit Public-Facing Application', 'T1505.003 – Web Shell', 'T1059 – Command and Scripting Interpreter'],
  },
  '5': {
    id: 'CASE-0x05',
    title: 'Brute Force — RDP Credential Stuffing',
    severity: 'LOW',
    siem: 'IBM QRadar + SOAR',
    mttr: '5 min',
    hosts: '40+ IPs blocked',
    iocs: ['Multiple RU/CN IPs', 'EventID 4625 x1000+', 'Port 3389', 'Admin account targets'],
    timeline: [
      { time: '03:14', event: 'QRadar alert — EventID 4625 spike: 1,200 failed RDP logins in 2 minutes' },
      { time: '03:16', event: 'GeoIP analysis — IPs sourced from 18 countries via Tor exit nodes' },
      { time: '03:17', event: 'SOAR playbook triggered: auto-block all source IPs via firewall API' },
      { time: '03:19', event: '43 IPs blocked. Account lockout threshold reduced from 10 to 5 attempts' },
    ],
    outcome: 'Zero successful logins. SOAR automation handled isolation in under 2 minutes. Recommended migration to VPN+MFA gateway to remove public RDP exposure.',
    mitre: ['T1110 – Brute Force', 'T1133 – External Remote Services', 'T1078 – Valid Accounts'],
  },
  '6': {
    id: 'CASE-0x06',
    title: 'Insider Threat — Data Exfiltration to USB',
    severity: 'CRITICAL',
    siem: 'Splunk + DLP + EDR',
    mttr: '25 min',
    hosts: 'Single Employee',
    iocs: ['USB ID: VID_0781', '14GB transfer in 8 min', 'Accessed 800+ HR files', 'After-hours activity 22:00'],
    timeline: [
      { time: '22:05', event: 'DLP alert — large volume USB write detected on endpoint HR-PC-019 after hours' },
      { time: '22:10', event: 'EDR telemetry confirmed 14GB copied: customer data, HR records, contracts' },
      { time: '22:15', event: 'Employee identity confirmed — departing staff with 3-day notice' },
      { time: '22:20', event: 'Account access revoked. Badge access disabled. Legal + HR notified' },
      { time: '22:30', event: 'Forensic image of endpoint created. Evidence chain documented for legal.' },
    ],
    outcome: 'Evidence chain preserved for potential legal action. USB device serial traced. DLP policy updated to block unauthorized USB on all endpoints company-wide.',
    mitre: ['T1052.001 – Exfiltration over USB', 'T1078 – Valid Accounts', 'T1213 – Data from Information Repositories'],
  },
};

function openCase(id) {
  const d = caseData[id];
  if (!d) return;

  const sevColor = { HIGH: '#ffaa44', CRITICAL: '#ff6b7a', MEDIUM: '#ffd700', LOW: '#06d6a0' };
  const col = sevColor[d.severity] || '#06d6a0';

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-case-header">
      <div class="modal-case-id">${d.id} · ${d.siem}</div>
      <h2>${d.title}</h2>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:12px;">
        <span style="background:rgba(255,255,255,0.06);border-radius:100px;padding:4px 14px;font-size:0.78rem;font-weight:700;color:${col};">
          ⚡ SEVERITY: ${d.severity}
        </span>
        <span style="background:rgba(0,212,255,0.08);border-radius:100px;padding:4px 14px;font-size:0.78rem;font-weight:600;color:#00d4ff;">
          🕐 MTTR: ${d.mttr}
        </span>
        <span style="background:rgba(255,255,255,0.05);border-radius:100px;padding:4px 14px;font-size:0.78rem;color:rgba(240,248,255,0.6);">
          🖥 ${d.hosts}
        </span>
      </div>
    </div>

    <div class="modal-section">
      <h4>📊 Key Metrics</h4>
      <div class="modal-metrics">
        <div class="modal-metric">
          <span class="val">${d.mttr}</span>
          <span class="lbl">MTTR</span>
        </div>
        <div class="modal-metric">
          <span class="val">${d.iocs.length}</span>
          <span class="lbl">IOCs Found</span>
        </div>
        <div class="modal-metric">
          <span class="val">${d.mitre.length}</span>
          <span class="lbl">MITRE TTPs</span>
        </div>
      </div>
    </div>

    <div class="modal-section">
      <h4>⏱ Incident Timeline</h4>
      <div class="modal-timeline">
        ${d.timeline.map(t => `
          <div class="modal-tl-item">
            <span>${t.time}</span>
            <div class="modal-tl-dot"></div>
            <p>${t.event}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="modal-section">
      <h4>🔍 Indicators of Compromise (IOCs)</h4>
      <div class="ioc-list">
        ${d.iocs.map(i => `<span class="ioc-item">${i}</span>`).join('')}
      </div>
    </div>

    <div class="modal-section">
      <h4>🗺 MITRE ATT&CK Techniques</h4>
      <div class="project-mitre">
        ${d.mitre.map(m => `<span class="mitre-tag">${m}</span>`).join('')}
      </div>
    </div>

    <div class="modal-section">
      <h4>✅ Outcome &amp; Remediation</h4>
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;">${d.outcome}</p>
    </div>
  `;

  document.getElementById('caseModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('caseModal')) closeCaseModal();
}
function closeCaseModal() {
  document.getElementById('caseModal').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCaseModal(); });

// ─── CONTACT FORM ──────────────────────────────────────────────
async function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('submit-btn');
  const originalBtnText = btn.innerHTML;

  // Initialize EmailJS
  try {
    emailjs.init("firKmCUDMKwaYV2cJ");
  } catch (e) {
    console.error("EmailJS init failed");
  }

  // Basic validation check
  const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  let allFilled = true;
  inputs.forEach(input => {
    if (!input.value.trim()) allFilled = false;
  });

  if (!allFilled) {
    alert("Please fill in all required fields.");
    return;
  }

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Dispatching...';
  btn.disabled = true;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.date = new Date().toISOString();

  try {
    // 1. Save to LocalStorage (Always works for Dashboard)
    const localMsgs = JSON.parse(localStorage.getItem('sent_messages') || '[]');
    localMsgs.unshift(data);
    localStorage.setItem('sent_messages', JSON.stringify(localMsgs));

    // 2. Send Real Email via EmailJS
    try {
      const serviceID = 'service_default';
      const templateID = 'template_portfolio';
      await emailjs.sendForm(serviceID, templateID, form);
      console.log("Email sent successfully!");
    } catch (mailErr) {
      console.warn('Email service sync unavailable, logged locally.');
    }

    // 3. Attempt Backend Sync
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Backend offline, sync pending.');
    }

    // Success UI
    document.getElementById('contactForm').style.display = 'none';
    const successDiv = document.getElementById('formSuccess');
    successDiv.style.display = 'block';

    const successTitle = successDiv.querySelector('h3');
    const successText = successDiv.querySelector('p');

    successTitle.textContent = "Message sent Successfully";
    successText.textContent = "I will receive your email and respond shortly.";

    createTouchRipple(successDiv.querySelector('.success-bubble'));

  } catch (error) {
    console.error('Submission error:', error);
    btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
    btn.disabled = false;
    setTimeout(() => { btn.innerHTML = originalBtnText; }, 3000);
  }
}


// ─── MESSAGES MODAL LOGIC ──────────────────────────────────────
const messagesModal = document.getElementById('messagesModal');
const messagesList = document.getElementById('messagesList');
let isAdminAuthenticated = false;

async function openMessagesModal() {
  messagesModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (!isAdminAuthenticated) {
    document.getElementById('adminLoginView').style.display = 'block';
    document.getElementById('adminMessagesView').style.display = 'none';
    document.getElementById('portalSub').textContent = "Identity verification required to view logs.";
  } else {
    document.getElementById('adminLoginView').style.display = 'none';
    document.getElementById('adminMessagesView').style.display = 'block';
    document.getElementById('portalSub').textContent = "Reviewing all messages sent via the portfolio.";
    await fetchMessages();
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('adminEmail').value.trim();
  const passwordInput = document.getElementById('adminPassword').value.trim();
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('loginError');

  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
  errorMsg.style.display = 'none';

  // 1. Local Comparison (Case-insensitive for email)
  const MASTER_EMAIL = "immarajuvasu2@gmail.com";
  const MASTER_PASS = "200421";

  if (emailInput.toLowerCase() === MASTER_EMAIL.toLowerCase() && passwordInput === MASTER_PASS) {
    console.log("Local authentication successful.");
    isAdminAuthenticated = true;
    document.getElementById('adminLoginView').style.display = 'none';
    document.getElementById('adminMessagesView').style.display = 'block';
    document.getElementById('portalSub').textContent = "Reviewing all messages sent via the portfolio.";
    await fetchMessages();
    return;
  }

  // 2. Server Fallback
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, password: passwordInput })
    });

    const result = await response.json();

    if (result.success) {
      isAdminAuthenticated = true;
      document.getElementById('adminLoginView').style.display = 'none';
      document.getElementById('adminMessagesView').style.display = 'block';
      document.getElementById('portalSub').textContent = "Reviewing all messages sent via the portfolio.";
      await fetchMessages();
    } else {
      throw new Error(result.message || "Unauthorized access detected.");
    }
  } catch (err) {
    console.error("Login failure:", err);
    errorMsg.style.display = 'block';
    errorMsg.innerHTML = `<i class="fas fa-user-shield"></i> Access Denied: ${err.message || "Verification Failed"}`;
    setTimeout(() => {
      if (!isAdminAuthenticated) errorMsg.style.display = 'none';
    }, 5000);
  } finally {
    loginBtn.innerHTML = '<i class="fas fa-unlock"></i> Authenticate';
  }
}


function adminLogout() {
  isAdminAuthenticated = false;
  document.getElementById('adminLoginView').style.display = 'block';
  document.getElementById('adminMessagesView').style.display = 'none';
  document.getElementById('portalSub').textContent = "Identity verification required to view logs.";
  document.getElementById('adminEmail').value = '';
  document.getElementById('adminPassword').value = '';
}

function closeMessagesModal() {
  messagesModal.classList.remove('open');
  document.body.style.overflow = '';
}

function closeMessagesModalOnOverlay(e) {
  if (e.target === messagesModal) closeMessagesModal();
}

// Automatically remove local messages older than 7 days
function cleanOldLocalMessages() {
  const localMsgs = JSON.parse(localStorage.getItem('sent_messages') || '[]');
  const now = new Date();
  const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);

  const filteredMsgs = localMsgs.filter(msg => {
    const msgDate = new Date(msg.date).getTime();
    return msgDate > sevenDaysAgo;
  });

  localStorage.setItem('sent_messages', JSON.stringify(filteredMsgs));
}

async function fetchMessages() {
  cleanOldLocalMessages();
  let allMessages = [];

  // 1. Get from LocalStorage
  const localMsgs = JSON.parse(localStorage.getItem('sent_messages') || '[]');
  allMessages = [...localMsgs];

  // 2. Try to supplement from Backend
  try {
    const response = await fetch('/api/contact');
    if (response.ok) {
      const serverMsgs = await response.json();
      const uniqueServerMsgs = serverMsgs.filter(s =>
        !localMsgs.some(l => (l.message === s.message && l.email === s.email))
      );
      allMessages = [...localMsgs, ...uniqueServerMsgs];
    }
  } catch (err) {
    console.warn('Server offline, showing local cache.');
  }

  // Sort by date descending
  allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
  displayMessages(allMessages);
}

function displayMessages(messages) {
  if (!messages || messages.length === 0) {
    messagesList.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-muted);">
      <i class="fas fa-inbox fa-2x"></i>
      <p style="margin-top: 10px;">Security logs are empty. No messages detected.</p>
    </div>`;
    return;
  }

  messagesList.innerHTML = messages.map(msg => `
    <div class="msg-item">
      <div class="msg-header">
        <span class="msg-sender"><i class="fas fa-user-circle"></i> ${msg.firstName || msg.fname} ${msg.lastName || msg.lname}</span>
        <span class="msg-time">${new Date(msg.date).toLocaleString()}</span>
      </div>
      <span class="msg-subject" style="color: var(--cyan); font-weight: 700; display: block; margin-bottom: 8px;">Subject: ${msg.subject}</span>
      <p class="msg-body">${msg.message}</p>
      <div style="margin-top: 12px; font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-reply"></i> ${msg.email}
      </div>
    </div>
  `).join('');
}



// ─── DOWNLOAD RESUME ──────────────────────────────────────
function downloadResume() {
  const link = document.createElement('a');
  link.href = 'assets/certs/Vasu-soc-analyst.pdf';
  link.download = 'Vasu-soc-analyst.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,#00d4ff,#4361ee);
    color:#fff; padding:14px 28px; border-radius:100px;
    font-size:0.9rem; font-weight:600; z-index:9999;
    box-shadow:0 8px 32px rgba(0,212,255,0.4);
    animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  `;
  toast.textContent = '📄 Vasu-soc-analyst.pdf download started!';
  document.head.insertAdjacentHTML('beforeend', `<style>@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>`);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}


// ─── TOUCH RIPPLE ON CLICK ─────────────────────────────────────
function createTouchRipple(el, e) {
  if (!el) return;
  const circle = document.createElement('span');
  const diam = Math.max(el.offsetWidth, el.offsetHeight) * 2;
  circle.style.cssText = `
    position:absolute;
    width:${diam}px; height:${diam}px;
    border-radius:50%;
    background:rgba(255,255,255,0.25);
    transform:translate(-50%,-50%) scale(0);
    animation:rippleEffect 0.7s linear;
    pointer-events:none;
    left:${e ? e.clientX - el.getBoundingClientRect().left : el.offsetWidth / 2}px;
    top:${e ? e.clientY - el.getBoundingClientRect().top : el.offsetHeight / 2}px;
  `;
  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}
document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes rippleEffect {
      to { transform: translate(-50%,-50%) scale(1); opacity: 0; }
    }
  </style>
`);

document.querySelectorAll('.liquid-btn,.stat-bubble,.skill-card,.glass-card').forEach(el => {
  el.addEventListener('click', (e) => {
    createTouchRipple(el, e);
    if (typeof sfx !== 'undefined') sfx.playClick();
  });
  el.addEventListener('mouseenter', () => {
    if (typeof sfx !== 'undefined') sfx.playHover();
  });
});


// ─── PARALLAX ORB ──────────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  document.querySelectorAll('.orb').forEach((el, i) => {
    const factor = (i + 1) * 0.4;
    el.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
  // float badges gentle parallax
  document.querySelectorAll('.float-badge').forEach((fb, i) => {
    const f = ((i % 3) + 1) * 0.15;
    fb.style.transform = `translate(${x * f}px, ${y * f}px)`;
  });
});


// ─── SECTION HEADER REVEAL ─────────────────────────────────────
const headerObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      headerObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.section-header').forEach(el => {
  el.style.cssText += 'opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease;';
  headerObs.observe(el);
});


// ─── LIQUID BUTTON HOVER SOUND (optional visual feedback) ──────
document.querySelectorAll('.liquid-btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transition = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)';
  });
});


// ─── TILT EFFECT ON CARDS ──────────────────────────────────────
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    const tiltX = -(y / (r.height / 2)) * 5;
    const tiltY = (x / (r.width / 2)) * 5;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
  });
});


// ─── THEME TOGGLE ──────────────────────────────────────────────
const themeToggleBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

// Apply saved preference on load (default: dark)
const savedTheme = localStorage.getItem('soc-theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const current = htmlEl.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  // iOS-style water ripple burst from the toggle button
  const rect = themeToggleBtn.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.style.cssText = `
    position:fixed;
    left:${rect.left + rect.width / 2}px;
    top:${rect.top + rect.height / 2}px;
    width:8px; height:8px;
    border-radius:50%;
    background:${next === 'light'
      ? 'radial-gradient(circle, rgba(255,200,0,0.6), rgba(0,212,255,0.3))'
      : 'radial-gradient(circle, rgba(0,212,255,0.6), rgba(155,93,229,0.3))'};
    transform:translate(-50%,-50%) scale(0);
    animation: themeBurst 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
    pointer-events:none;
    z-index:99999;
  `;
  document.body.appendChild(burst);
  burst.addEventListener('animationend', () => burst.remove());

  // Switch theme
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem('soc-theme', next);

  // Update cyber canvas opacity dynamically
  canvas.style.opacity = next === 'light' ? '0.4' : '1';
  sfx.playClick();
}

// Inject burst keyframe once
document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes themeBurst {
      0%   { transform: translate(-50%,-50%) scale(0);   opacity: 1; }
      60%  { transform: translate(-50%,-50%) scale(180); opacity: 0.4; }
      100% { transform: translate(-50%,-50%) scale(220); opacity: 0; }
    }
  </style>
`);

themeToggleBtn.addEventListener('click', toggleTheme);

// Keyboard shortcut: Alt + T
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key.toLowerCase() === 't') toggleTheme();
});


// ─── SCROLL TO TOP ──────────────────────────────────────────────
const scrollTopBtn = document.getElementById('scrollTopBtn');

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});


const badgeModal = document.getElementById('badgeModal');
const badgeIframe = document.getElementById('badgeIframe');
const badgeImg = document.getElementById('badgeImg');

function openBadgeModal(url) {
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  if (isImage) {
    badgeIframe.style.display = 'none';
    badgeImg.style.display = 'block';
    badgeImg.src = url;
    badgeIframe.src = '';
  } else {
    badgeImg.style.display = 'none';
    badgeIframe.style.display = 'block';
    badgeIframe.src = url;
    badgeImg.src = '';
  }

  badgeModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBadgeModal() {
  badgeModal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    badgeIframe.src = '';
    badgeImg.src = '';
  }, 400);
}

function closeBadgeModalOnOverlay(e) {
  if (e.target === badgeModal) {
    closeBadgeModal();
  }
}


console.log('%c🛡 SOC L1 Portfolio Loaded', 'color:#00d4ff;font-size:16px;font-weight:bold;');
console.log('%cBuilt with premium Cyber Security Operations Center theme & security passion.', 'color:#bd00ff;font-size:12px;');
console.log('%c💡 Tip: Press Alt+T to toggle Light/Dark theme', 'color:#bd00ff;font-size:11px;');

// Initialize operations ticker
startLiveThreatFeed();
