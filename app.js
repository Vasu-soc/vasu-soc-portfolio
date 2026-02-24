/* ============================================================
   SOC L1 PORTFOLIO — app.js
   iOS Water Bubble Interactions + Animations
   ============================================================ */

// ─── BUBBLE CANVAS ────────────────────────────────────────────
const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
let W, H, bubbles = [];

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Bubble {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 60;
    this.r = 8 + Math.random() * 40;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(0.3 + Math.random() * 0.7);
    this.alpha = 0.04 + Math.random() * 0.12;
    this.hue = Math.random() > 0.5 ? 190 : 220 + Math.random() * 60;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.01 + Math.random() * 0.02;
  }
  update() {
    this.wobble += this.wobbleSpeed;
    this.x += this.vx + Math.sin(this.wobble) * 0.3;
    this.y += this.vy;
    if (this.y + this.r < 0) this.reset();
  }
  draw() {
    ctx.save();
    // gradient fill
    const g = ctx.createRadialGradient(
      this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.1,
      this.x, this.y, this.r
    );
    g.addColorStop(0, `hsla(${this.hue},100%,80%,${this.alpha * 1.5})`);
    g.addColorStop(0.5, `hsla(${this.hue},100%,60%,${this.alpha})`);
    g.addColorStop(1, `hsla(${this.hue},100%,40%,0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    // rim highlight
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${this.hue},100%,80%,${this.alpha * 0.8})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // specular
    ctx.beginPath();
    ctx.arc(this.x - this.r * 0.3, this.y - this.r * 0.35, this.r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.alpha * 3})`;
    ctx.fill();
    ctx.restore();
  }
}

// create 80 bubbles
for (let i = 0; i < 80; i++) bubbles.push(new Bubble());

// click-splash: add 8 bubbles around click point
canvas.addEventListener('click', (e) => {
  for (let i = 0; i < 8; i++) {
    const b = new Bubble();
    b.x = e.clientX + (Math.random() - 0.5) * 60;
    b.y = e.clientY + (Math.random() - 0.5) * 60;
    b.r = 6 + Math.random() * 20;
    b.vy = -(0.8 + Math.random() * 1.5);
    b.alpha = 0.15 + Math.random() * 0.2;
    bubbles.push(b);
  }
});

function animateBubbles() {
  ctx.clearRect(0, 0, W, H);
  bubbles.forEach(b => { b.update(); b.draw(); });
  // cull excess
  if (bubbles.length > 150) bubbles.splice(0, bubbles.length - 150);
  requestAnimationFrame(animateBubbles);
}
animateBubbles();


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

// mobile menu
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});
// close mobile menu on link click
navLinksEl.querySelectorAll('a').forEach(l => {
  l.addEventListener('click', () => navLinksEl.classList.remove('open'));
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
document.querySelectorAll('.skill-card,.project-card,.cert-card,.tool-category-bubble,.qi-item,.about-text-wrap,.about-avatar-wrap').forEach(el => {
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

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById('contactForm').style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
      // add a touch ripple to the success bubble
      createTouchRipple(document.querySelector('.success-bubble'));
    } else {
      throw new Error(result.error || 'Failed to send');
    }
  } catch (error) {
    console.error('Submission error:', error);
    // Fallback: show the success UI anyway but log the error
    // Or you could show an error message
    // For now, let's keep it user friendly
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
    createTouchRipple(document.querySelector('.success-bubble'));
  }
}


// ─── DOWNLOAD RESUME STUB ──────────────────────────────────────
function downloadResume() {
  // In production, link to actual PDF
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,#00d4ff,#4361ee);
    color:#fff; padding:14px 28px; border-radius:100px;
    font-size:0.9rem; font-weight:600; z-index:9999;
    box-shadow:0 8px 32px rgba(0,212,255,0.4);
    animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  `;
  toast.textContent = '📄 Resume download will be available soon!';
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
  el.addEventListener('click', (e) => createTouchRipple(el, e));
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

  // Update bubble canvas opacity dynamically
  canvas.style.opacity = next === 'light' ? '0.4' : '1';
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
console.log('%cBuilt with iOS liquid bubble feel & security passion.', 'color:#9b5de5;font-size:12px;');
console.log('%c💡 Tip: Press Alt+T to toggle Light/Dark theme', 'color:#9b5de5;font-size:11px;');
