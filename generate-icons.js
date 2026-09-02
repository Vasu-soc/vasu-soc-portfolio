const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'assets', 'tools');
if (!fs.existsSync(toolsDir)) {
  fs.mkdirSync(toolsDir, { recursive: true });
}

// Helper to write .svg only (no fake .png)
function write(name, svg) {
  const svgPath = path.join(toolsDir, name + '.svg');
  fs.writeFileSync(svgPath, svg.trim(), 'utf8');
}

// 1. Splunk — chevron / play icon in brand red-green
write('splunk', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="splunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1353"/>
      <stop offset="100%" stop-color="#65B62E"/>
    </linearGradient>
    <filter id="splunkGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#splunkGlow)">
    <path d="M55 55 L125 100 L55 145" fill="none" stroke="url(#splunkGrad)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="148" cy="100" r="14" fill="#65B62E"/>
  </g>
  <text x="100" y="188" font-family="monospace" font-size="18" font-weight="bold" fill="#FF1353" text-anchor="middle" letter-spacing="1">SPLUNK</text>
</svg>`);

// 2. Microsoft Sentinel — shield shape in Azure blue
write('sentinel', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="sentinelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0078D4"/>
      <stop offset="100%" stop-color="#00E5FF"/>
    </linearGradient>
    <filter id="sentinelGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#sentinelGlow)">
    <path d="M100 28 L158 55 C158 115 100 162 100 162 C100 162 42 115 42 55 Z" fill="rgba(0,120,212,0.25)" stroke="url(#sentinelGrad)" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="100" cy="95" r="16" fill="#0078D4" opacity="0.9"/>
    <text x="100" y="101" font-family="monospace" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">M</text>
  </g>
  <text x="100" y="186" font-family="monospace" font-size="15" font-weight="bold" fill="#0078D4" text-anchor="middle">SENTINEL</text>
</svg>`);

// 3. Cortex XSOAR — orange/red hexagon
write('cortex', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="cortexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B2B"/>
      <stop offset="100%" stop-color="#FF3E3E"/>
    </linearGradient>
    <filter id="cortexGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#cortexGlow)">
    <polygon points="100,30 155,62 155,128 100,160 45,128 45,62" fill="rgba(255,107,43,0.2)" stroke="url(#cortexGrad)" stroke-width="6"/>
    <polygon points="100,58 130,74 130,110 100,126 70,110 70,74" fill="rgba(255,62,62,0.3)" stroke="#FF6B2B" stroke-width="3"/>
    <circle cx="100" cy="92" r="12" fill="#FF6B2B"/>
  </g>
  <text x="100" y="186" font-family="monospace" font-size="14" font-weight="bold" fill="#FF6B2B" text-anchor="middle">CORTEX XSOAR</text>
</svg>`);

// 4. IBM QRadar — diamond / blue IBM style
write('qradar', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="qradarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1F70C1"/>
      <stop offset="100%" stop-color="#052FAD"/>
    </linearGradient>
    <filter id="qradarGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#qradarGlow)">
    <rect x="52" y="52" width="96" height="96" rx="8" fill="rgba(31,112,193,0.2)" stroke="url(#qradarGrad)" stroke-width="5" transform="rotate(45 100 100)"/>
    <text x="100" y="108" font-family="Arial,sans-serif" font-size="26" font-weight="900" fill="#1F70C1" text-anchor="middle">IBM</text>
  </g>
  <text x="100" y="186" font-family="monospace" font-size="16" font-weight="bold" fill="#1F70C1" text-anchor="middle">QRADAR</text>
</svg>`);

// 5. CrowdStrike Falcon — falcon wing shape in orange
write('crowdstrike', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="csGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FC3D21"/>
      <stop offset="100%" stop-color="#FF7A00"/>
    </linearGradient>
    <filter id="csGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#csGlow)">
    <path d="M100 40 C60 40 35 75 35 100 L55 90 C55 90 60 65 100 65 Z" fill="url(#csGrad)" opacity="0.9"/>
    <path d="M100 40 C140 40 165 75 165 100 L145 90 C145 90 140 65 100 65 Z" fill="url(#csGrad)" opacity="0.7"/>
    <circle cx="100" cy="100" r="18" fill="#FC3D21"/>
    <path d="M35 100 L100 160 L165 100" fill="none" stroke="url(#csGrad)" stroke-width="5" stroke-linejoin="round"/>
  </g>
  <text x="100" y="188" font-family="monospace" font-size="13" font-weight="bold" fill="#FC3D21" text-anchor="middle">CROWDSTRIKE</text>
</svg>`);

// 6. Elastic — E letter with elastic brand green
write('elastic', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="elasticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F04E98"/>
      <stop offset="50%" stop-color="#FEC514"/>
      <stop offset="100%" stop-color="#00BFB3"/>
    </linearGradient>
    <filter id="elasticGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#elasticGlow)">
    <ellipse cx="100" cy="100" rx="60" ry="60" fill="none" stroke="url(#elasticGrad)" stroke-width="8"/>
    <ellipse cx="100" cy="100" rx="35" ry="35" fill="rgba(0,191,179,0.25)"/>
    <text x="100" y="111" font-family="Arial,sans-serif" font-size="40" font-weight="900" fill="url(#elasticGrad)" text-anchor="middle">e</text>
  </g>
  <text x="100" y="186" font-family="monospace" font-size="16" font-weight="bold" fill="#00BFB3" text-anchor="middle">ELASTIC SIEM</text>
</svg>`);

// 7. Wireshark — shark fin in blue-teal
write('wireshark', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="wsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1679A7"/>
      <stop offset="100%" stop-color="#00E5FF"/>
    </linearGradient>
    <filter id="wsGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#wsGlow)">
    <path d="M40 140 Q60 80 100 35 Q110 70 105 90 Q145 60 160 140 Z" fill="rgba(22,121,167,0.3)" stroke="url(#wsGrad)" stroke-width="5" stroke-linejoin="round"/>
    <path d="M40 140 L160 140" stroke="url(#wsGrad)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="100" cy="90" r="8" fill="#00E5FF"/>
  </g>
  <text x="100" y="186" font-family="monospace" font-size="13" font-weight="bold" fill="#1679A7" text-anchor="middle">WIRESHARK</text>
</svg>`);

// 8. TheHive — honeycomb in amber/yellow
write('thehive', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="hiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFC300"/>
      <stop offset="100%" stop-color="#FF8C00"/>
    </linearGradient>
    <filter id="hiveGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#hiveGlow)">
    <polygon points="100,30 132,48 132,84 100,102 68,84 68,48" fill="rgba(255,195,0,0.25)" stroke="url(#hiveGrad)" stroke-width="5"/>
    <polygon points="100,62 116,71 116,89 100,98 84,89 84,71" fill="rgba(255,140,0,0.4)" stroke="#FFC300" stroke-width="3"/>
    <polygon points="100,98 132,116 132,152 100,170 68,152 68,116" fill="rgba(255,195,0,0.15)" stroke="url(#hiveGrad)" stroke-width="4"/>
    <circle cx="100" cy="80" r="9" fill="#FFC300"/>
  </g>
  <text x="100" y="194" font-family="monospace" font-size="15" font-weight="bold" fill="#FFC300" text-anchor="middle">THE HIVE</text>
</svg>`);

// 9. Wazuh — W letter in teal/cyan
write('wazuh', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="wazuhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00A7B5"/>
      <stop offset="100%" stop-color="#3DD9EB"/>
    </linearGradient>
    <filter id="wazuhGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#wazuhGlow)">
    <path d="M35 45 L60 145 L100 90 L140 145 L165 45" fill="none" stroke="url(#wazuhGrad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="100" y="188" font-family="monospace" font-size="16" font-weight="bold" fill="#00A7B5" text-anchor="middle">WAZUH XDR</text>
</svg>`);

// 10. Zeek — Z letter in purple/blue network monitor
write('zeek', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="zeekGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B2EFF"/>
      <stop offset="100%" stop-color="#00E5FF"/>
    </linearGradient>
    <filter id="zeekGlow">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#zeekGlow)">
    <path d="M45 45 L155 45 L45 145 L155 145" fill="none" stroke="url(#zeekGrad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="100" y="188" font-family="monospace" font-size="18" font-weight="bold" fill="#7B2EFF" text-anchor="middle">ZEEK NIDS</text>
</svg>`);

console.log(`Generated 10 transparent SIEM/SOAR/EDR tool icons in ${toolsDir}`);
