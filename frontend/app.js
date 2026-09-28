/* ================================================================
   STORMIS — APPLICATION LOGIC
   
   Self-contained frontend. All data from data.js (DEMO object).
   No backend API calls required.
   ================================================================ */

/* ---- UTILITIES ---- */
const wait = ms => new Promise(r => setTimeout(r, ms));
const $ = id => document.getElementById(id);

/* ---- LIVE CLOCK ---- */
function updateClock() {
    const now = new Date();
    $('liveClock').textContent = now.toLocaleTimeString('en-US', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

/* ================================================================
   NAVIGATION
   ================================================================ */

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const page = $('page-' + pageId);
    if (page) page.classList.add('active');
    const nav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (nav) nav.classList.add('active');
    // Initialize page-specific maps on first visit
    if (pageId === 'forecast' && !forecastMapInit) initForecastMap();
    if (pageId === 'efi' && !efiMapInit) initEFIMap();
    if (pageId === 'alerts' && !alertMapInit) initAlertMap();
    if (pageId === 'efi') animateEFIScore();
    if (pageId === 'analysis') animateBenchmarkBars();
    if (pageId === 'system') replayLogs();
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
});

/* DEMO MODAL */
function toggleDemoModal() {
    const m = $('demoModal');
    m.classList.toggle('show');
}

/* ================================================================
   OVERVIEW: KPI CARDS
   ================================================================ */

function renderKPIs() {
    const kpis = [
        { label: "Active Events", value: DEMO.kpi.activeEvents, cls: "cyan", sub: "Detected anomalies" },
        { label: "Severe Events", value: DEMO.kpi.severeEvents, cls: "red", sub: "Requires action" },
        { label: "Peak EFI", value: DEMO.kpi.peakEFI, cls: "cyan", sub: "Extreme forecast index" },
        { label: "Max Anomaly", value: DEMO.kpi.maxAnomaly, cls: "red", sub: "Temperature deviation" },
        { label: "Forecast Members", value: DEMO.kpi.forecastMembers, cls: "", sub: "NEPS-G ensemble" },
        { label: "Impact Radius", value: DEMO.kpi.impactRadius, cls: "green", sub: "Hyper-local targeting" }
    ];
    $('kpiGrid').innerHTML = kpis.map((k, i) => `
        <div class="kpi-card" style="animation: fadeIn .4s ease ${i * .08}s both;">
            <div class="kpi-label">${k.label}</div>
            <div class="kpi-value ${k.cls}">${k.value}</div>
            <div class="kpi-sub">${k.sub}</div>
        </div>
    `).join('');
}

/* ================================================================
   OVERVIEW: PIPELINE
   ================================================================ */

function renderPipeline() {
    const stages = DEMO.pipelineStages;
    let html = '';
    stages.forEach((s, i) => {
        html += `<div class="pipeline-node" id="pnode-${s.id}">
            <div class="pipeline-node-icon">${s.icon}</div>
            <div class="pipeline-node-label">${s.label}</div>
            <div class="pipeline-node-status" id="pstatus-${s.id}">WAITING</div>
        </div>`;
        if (i < stages.length - 1) {
            html += `<div class="pipeline-arrow" id="parrow-${i}">→</div>`;
        }
    });
    $('pipelineFlow').innerHTML = html;
}

let pipelineRunning = false;

async function runPipeline() {
    if (pipelineRunning) return;
    pipelineRunning = true;
    const btn = $('runPipelineBtn');
    btn.disabled = true;
    btn.textContent = '⟳ RUNNING...';
    $('pipelineStatus').textContent = 'RUNNING';

    // Reset all nodes
    DEMO.pipelineStages.forEach((s, i) => {
        const node = $('pnode-' + s.id);
        node.classList.remove('active', 'done');
        $('pstatus-' + s.id).textContent = 'WAITING';
        if (i > 0) {
            const arrow = $('parrow-' + (i - 1));
            if (arrow) arrow.classList.remove('done');
        }
    });

    // Animate each stage
    for (let i = 0; i < DEMO.pipelineStages.length; i++) {
        const stage = DEMO.pipelineStages[i];
        const node = $('pnode-' + stage.id);
        const status = $('pstatus-' + stage.id);

        node.classList.add('active');
        status.textContent = stage.loadMsg;
        $('overviewMapStatus').textContent = stage.loadMsg;
        await wait(800 + Math.random() * 600);

        node.classList.remove('active');
        node.classList.add('done');
        status.textContent = stage.doneMsg;

        if (i < DEMO.pipelineStages.length - 1) {
            const arrow = $('parrow-' + i);
            if (arrow) arrow.classList.add('done');
        }
    }

    $('pipelineStatus').textContent = 'CYCLE COMPLETE';
    $('overviewMapStatus').textContent = 'Forecast cycle complete — all stages nominal';

    // Show event summary
    renderEventSummary();
    renderOverviewAlerts();
    renderOverviewMap();

    btn.disabled = false;
    btn.textContent = '▶ RUN FORECAST CYCLE';
    pipelineRunning = false;
}

function renderEventSummary() {
    const s = DEMO.scenario;
    $('activeEventTag').textContent = 'EVT-001';
    $('eventSummary').innerHTML = `
        <div style="font-size:11px; color:var(--cyan); font-weight:800; letter-spacing:1px;">EVENT ID: EVT-001</div>
        <div style="font-size:20px; font-weight:800; margin-top:6px;">${s.name}</div>
        <div style="display:inline-block; margin-top:10px; padding:5px 12px; background:var(--red-glow); border:1px solid rgba(248,113,113,.2); border-radius:5px; font-size:10px; font-weight:800; color:var(--red); letter-spacing:.7px;">SEVERE</div>
        <div style="margin-top:16px;">
            <div class="detail-row"><div class="detail-label">Forecast</div><div class="detail-value">${s.date} • ${s.utc}</div></div>
            <div class="detail-row"><div class="detail-label">Location</div><div class="detail-value">${s.centroid.lat}° N, ${s.centroid.lon}° E</div></div>
            <div class="detail-row"><div class="detail-label">Peak EFI</div><div class="detail-value" style="color:var(--cyan);">${s.peakEFI}</div></div>
            <div class="detail-row"><div class="detail-label">Anomaly</div><div class="detail-value" style="color:var(--red);">+${s.maxAnomaly}°C</div></div>
            <div class="detail-row"><div class="detail-label">Movement</div><div class="detail-value" style="color:var(--amber);">${s.movement}</div></div>
            <div class="detail-row"><div class="detail-label">Impact Radius</div><div class="detail-value">${s.impactRadiusKm} km</div></div>
        </div>
    `;
}

function renderOverviewAlerts() {
    const top = DEMO.alerts.slice(0, 2);
    $('overviewAlertFeed').innerHTML = top.map(a => `
        <div class="alert-card ${a.severity.toLowerCase()} ${a.severity === 'SEVERE' ? 'pulse' : ''}" style="margin-bottom:10px;">
            <span class="alert-severity-badge ${a.severity.toLowerCase()}">${a.severity}</span>
            <div class="alert-title-text" style="font-size:13px;">${a.title}</div>
            <div style="margin-top:6px; font-size:10px; color:var(--text-dim);">EFI: ${a.efi} • Anomaly: ${a.anomaly}</div>
        </div>
    `).join('');
}

/* ================================================================
   OVERVIEW MAP (Leaflet)
   ================================================================ */

let overviewMap;

function initOverviewMap() {
    overviewMap = L.map('map', { zoomControl: true }).setView([25.5, 76.0], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        attribution: '© CartoDB © OSM'
    }).addTo(overviewMap);
}

function renderOverviewMap() {
    if (!overviewMap) return;
    // Draw EFI grid cells
    DEMO.efiGrid.forEach(cell => {
        const color = efiColor(cell.efi);
        L.rectangle(
            [[cell.lat - 0.9, cell.lon - 0.9], [cell.lat + 0.9, cell.lon + 0.9]],
            { color: color, fillColor: color, fillOpacity: 0.35, weight: 1 }
        ).addTo(overviewMap).bindPopup(`<strong>EFI Cell</strong><br>EFI: ${cell.efi}<br>Lat: ${cell.lat}° Lon: ${cell.lon}°`);
    });

    // Draw trajectory
    const trajCoords = DEMO.trajectory.map(t => [t.lat, t.lon]);
    L.polyline(trajCoords, { color: '#22d3ee', weight: 3, dashArray: '8 4' }).addTo(overviewMap);

    DEMO.trajectory.forEach((t, i) => {
        const isLast = i === DEMO.trajectory.length - 1;
        L.circleMarker([t.lat, t.lon], {
            radius: isLast ? 9 : 5,
            fillColor: isLast ? '#f87171' : '#22d3ee',
            color: isLast ? '#fca5a5' : '#67e8f9',
            fillOpacity: .9,
            weight: 2
        }).addTo(overviewMap).bindPopup(`<strong>Day ${t.day}</strong><br>${t.label}<br>EFI: ${t.efi}<br>Anomaly: +${t.anomaly}°C`);
    });

    // 5km impact circle
    const last = DEMO.trajectory[DEMO.trajectory.length - 1];
    L.circle([last.lat, last.lon], {
        radius: 5000,
        color: '#f87171',
        fillColor: '#f87171',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5 3'
    }).addTo(overviewMap);
}

function efiColor(efi) {
    if (efi >= 0.85) return '#f87171';
    if (efi >= 0.7) return '#fb923c';
    if (efi >= 0.5) return '#fbbf24';
    if (efi >= 0.3) return '#3b82f6';
    return '#1e3a5f';
}

/* ================================================================
   FORECAST MONITOR
   ================================================================ */

let forecastMapInit = false;
let forecastMap;

function initForecastMap() {
    forecastMap = L.map('forecastMap', { zoomControl: true }).setView([25.5, 76.0], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, attribution: '© CartoDB'
    }).addTo(forecastMap);
    forecastMapInit = true;
    renderForecastDays();
    setTimeout(() => forecastMap.invalidateSize(), 100);
}

function renderForecastDays() {
    $('forecastDaysList').innerHTML = DEMO.forecastDays.map((d, i) => `
        <div class="forecast-day-btn ${d.active ? 'active' : ''}" onclick="selectForecastDay(${i})">
            <span class="forecast-day-label">${d.label}</span>
            <span class="forecast-day-date">${d.date} • ${d.hour}</span>
        </div>
    `).join('');
}

function selectForecastDay(index) {
    document.querySelectorAll('.forecast-day-btn').forEach((b, i) => {
        b.classList.toggle('active', i === index);
    });
    const day = DEMO.forecastDays[index];
    $('forecastMapTag').textContent = `${day.label} — ${day.hour}`;
    $('forecastMapStatus').textContent = `Showing forecast for ${day.date} (${day.hour})`;

    // Update map: show EFI cells with variation per day
    if (!forecastMap) return;
    forecastMap.eachLayer(l => { if (l instanceof L.Rectangle || l instanceof L.CircleMarker) forecastMap.removeLayer(l); });

    const scale = 0.6 + (index / 7) * 0.5;
    DEMO.efiGrid.forEach(cell => {
        const adjustedEfi = Math.min(cell.efi * scale, 1.0);
        const color = efiColor(adjustedEfi);
        L.rectangle(
            [[cell.lat - 0.9, cell.lon - 0.9], [cell.lat + 0.9, cell.lon + 0.9]],
            { color: color, fillColor: color, fillOpacity: 0.4, weight: 1 }
        ).addTo(forecastMap);
    });
}

/* ================================================================
   EFI TRACKING MAP
   ================================================================ */

let efiMapInit = false;
let efiMapObj;

function initEFIMap() {
    efiMapObj = L.map('efiMap', { zoomControl: true }).setView([27.5, 75.0], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, attribution: '© CartoDB'
    }).addTo(efiMapObj);
    efiMapInit = true;
    setTimeout(() => efiMapObj.invalidateSize(), 100);

    // Draw EFI heatmap
    DEMO.efiGrid.forEach(cell => {
        const color = efiColor(cell.efi);
        L.rectangle(
            [[cell.lat - 0.9, cell.lon - 0.9], [cell.lat + 0.9, cell.lon + 0.9]],
            { color: 'transparent', fillColor: color, fillOpacity: 0.5, weight: 0 }
        ).addTo(efiMapObj);
    });

    // Draw trajectory with animation
    const trajCoords = DEMO.trajectory.map(t => [t.lat, t.lon]);
    L.polyline(trajCoords, { color: '#22d3ee', weight: 3, opacity: 0.8 }).addTo(efiMapObj);

    DEMO.trajectory.forEach((t, i) => {
        const isLast = i === DEMO.trajectory.length - 1;
        L.circleMarker([t.lat, t.lon], {
            radius: isLast ? 10 : 6,
            fillColor: isLast ? '#f87171' : '#22d3ee',
            color: isLast ? '#fca5a5' : '#67e8f9',
            fillOpacity: .9, weight: 2
        }).addTo(efiMapObj).bindPopup(
            `<strong>Day ${t.day} — ${t.label}</strong><br>EFI: ${t.efi}<br>Anomaly: +${t.anomaly}°C`
        );

        // Day labels
        L.marker([t.lat + 0.3, t.lon], {
            icon: L.divIcon({
                className: '',
                html: `<div style="background:rgba(10,15,26,.85); color:#22d3ee; padding:2px 7px; border-radius:4px; font-size:9px; font-weight:700; white-space:nowrap; border:1px solid rgba(34,211,238,.2);">Day ${t.day}</div>`,
                iconSize: null
            })
        }).addTo(efiMapObj);
    });

    // 5km impact circle
    const last = DEMO.trajectory[DEMO.trajectory.length - 1];
    L.circle([last.lat, last.lon], {
        radius: 5000, color: '#f87171', fillColor: '#f87171', fillOpacity: 0.12, weight: 2, dashArray: '5 3'
    }).addTo(efiMapObj);
}

/* EFI SCORE ANIMATION */
function animateEFIScore() {
    const target = 0.91;
    let current = 0;
    const display = $('efiScoreDisplay');
    const step = () => {
        current += 0.02;
        if (current >= target) { current = target; display.textContent = current.toFixed(2); return; }
        display.textContent = current.toFixed(2);
        requestAnimationFrame(step);
    };
    display.textContent = '0.00';
    setTimeout(step, 300);

    // Draw distribution curves
    drawDistribution('climCanvas', 'rgba(59,130,246,.6)', 0.45, 0.12);
    drawDistribution('ensCanvas', 'rgba(248,113,113,.6)', 0.7, 0.08);
}

function drawDistribution(canvasId, color, mean, stddev) {
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x++) {
        const xNorm = x / w;
        const y = Math.exp(-0.5 * Math.pow((xNorm - mean) / stddev, 2)) / (stddev * Math.sqrt(2 * Math.PI));
        const yScaled = h - (y * stddev * Math.sqrt(2 * Math.PI)) * h * 0.85;
        ctx.lineTo(x, Math.max(yScaled, 0));
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = color.replace(/[\d.]+\)$/, '1)');
    ctx.lineWidth = 2;
    ctx.stroke();
}

/* ================================================================
   AI DOWNSCALING
   ================================================================ */

let diffusionRunning = false;

async function runDiffusion() {
    if (diffusionRunning) return;
    diffusionRunning = true;

    const btn = $('generateBtn');
    const prog = $('diffusionProgress');
    const log = $('diffusionLog');
    const bar = $('diffProgressBar');
    const result = $('diffusionResult');

    btn.disabled = true;
    btn.textContent = '⟳ GENERATING...';
    $('diffusionStatus').textContent = 'GENERATING';
    prog.style.display = 'block';
    result.style.display = 'none';
    log.innerHTML = '';
    bar.style.width = '0%';

    const steps = DEMO.diffusionSteps;
    for (let i = 0; i < steps.length; i++) {
        const pct = Math.round(((i + 1) / steps.length) * 100);
        bar.style.width = pct + '%';
        log.innerHTML += `<div style="color:${i === steps.length - 1 ? 'var(--green)' : 'var(--text-muted)'};">${steps[i]}</div>`;
        log.scrollTop = log.scrollHeight;
        await wait(350 + Math.random() * 250);
    }

    $('diffusionStatus').textContent = 'FINE FIELD GENERATED';
    result.style.display = 'grid';
    btn.disabled = false;
    btn.textContent = '▶ GENERATE FINE FIELD';
    diffusionRunning = false;

    // Draw heatmap visualizations
    drawHeatmap('coarseCanvas', false);
    drawHeatmap('fineCanvas', true);
}

function drawHeatmap(canvasId, isFine) {
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cellSize = isFine ? 12 : 28;
    const hotX = w * 0.6, hotY = h * 0.4;
    const sigma = isFine ? w * 0.18 : w * 0.35;

    for (let x = 0; x < w; x += cellSize) {
        for (let y = 0; y < h; y += cellSize) {
            const cx = x + cellSize / 2, cy = y + cellSize / 2;
            const dist = Math.sqrt((cx - hotX) ** 2 + (cy - hotY) ** 2);
            let intensity = Math.exp(-(dist * dist) / (2 * sigma * sigma));

            if (isFine) {
                intensity *= 1 + 0.15 * Math.sin(x * 0.08) * Math.cos(y * 0.08);
                intensity = Math.min(intensity, 1);
            } else {
                intensity *= 0.75;
            }

            const r = Math.round(20 + intensity * 220);
            const g = Math.round(30 + (1 - intensity) * 40 + intensity * 60);
            const b = Math.round(40 + (1 - intensity) * 80);
            ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + intensity * 0.4})`;
            ctx.fillRect(x, y, cellSize - (isFine ? 1 : 2), cellSize - (isFine ? 1 : 2));
        }
    }
}

/* ================================================================
   ALERT CENTER
   ================================================================ */

function renderAlerts() {
    // Severity summary
    const sevCounts = { SEVERE: 0, MODERATE: 0, LOW: 0 };
    DEMO.alerts.forEach(a => { if (sevCounts[a.severity] !== undefined) sevCounts[a.severity]++; });

    $('severityGrid').innerHTML = `
        <div class="severity-card sev-severe"><div class="sev-label">SEVERE</div><div class="sev-count">${String(sevCounts.SEVERE).padStart(2, '0')}</div></div>
        <div class="severity-card sev-moderate"><div class="sev-label">MODERATE</div><div class="sev-count">${String(sevCounts.MODERATE).padStart(2, '0')}</div></div>
        <div class="severity-card sev-low"><div class="sev-label">LOW</div><div class="sev-count">${String(sevCounts.LOW).padStart(2, '0')}</div></div>
    `;

    $('alertCountTag').textContent = `${DEMO.alerts.length} ALERTS`;

    // Alert cards
    $('alertsList').innerHTML = DEMO.alerts.map(a => `
        <div class="alert-card ${a.severity.toLowerCase()} ${a.severity === 'SEVERE' ? 'pulse' : ''}">
            <span class="alert-severity-badge ${a.severity.toLowerCase()}">${a.severity}</span>
            <div class="alert-title-text">${a.title}</div>
            <div class="alert-region">${a.region}</div>
            <div class="alert-meta">
                <div class="alert-meta-item"><div class="meta-label">EFI</div><div class="meta-value" style="color:var(--cyan);">${a.efi}</div></div>
                <div class="alert-meta-item"><div class="meta-label">Anomaly</div><div class="meta-value" style="color:var(--red);">${a.anomaly}</div></div>
                <div class="alert-meta-item"><div class="meta-label">Radius</div><div class="meta-value">${a.radius}</div></div>
            </div>
            <div class="alert-action">${a.action}</div>
            <span class="alert-status-badge ${a.status.toLowerCase()}">${a.status}</span>
            <div style="margin-top:8px; font-size:9px; color:var(--text-dim);">${a.time}</div>
        </div>
    `).join('');
}

let alertMapInit = false;
let alertMapObj;

function initAlertMap() {
    alertMapObj = L.map('alertMap', { zoomControl: true }).setView([26.5, 76.0], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, attribution: '© CartoDB'
    }).addTo(alertMapObj);
    alertMapInit = true;
    setTimeout(() => alertMapObj.invalidateSize(), 100);

    // Plot trajectory
    const trajCoords = DEMO.trajectory.map(t => [t.lat, t.lon]);
    L.polyline(trajCoords, { color: '#22d3ee', weight: 2, dashArray: '6 4', opacity: 0.6 }).addTo(alertMapObj);

    // Plot alert markers
    DEMO.alerts.forEach(a => {
        const color = a.severity === 'SEVERE' ? '#f87171' : a.severity === 'MODERATE' ? '#fbbf24' : '#3b82f6';
        const marker = L.circleMarker([a.centroid.lat, a.centroid.lon], {
            radius: a.severity === 'SEVERE' ? 12 : 8,
            fillColor: color, color: color, fillOpacity: 0.4, weight: 2
        }).addTo(alertMapObj);

        marker.bindPopup(`
            <strong>EVENT: ${a.title}</strong><br>
            SEVERITY: ${a.severity}<br>
            EFI: ${a.efi}<br>
            ANOMALY: ${a.anomaly}<br>
            RADIUS: ${a.radius}<br>
            TIME: ${a.time}
        `);

        if (a.severity === 'SEVERE') {
            L.circle([a.centroid.lat, a.centroid.lon], {
                radius: 5000, color: '#f87171', fillColor: '#f87171', fillOpacity: 0.08, weight: 1.5, dashArray: '4 3'
            }).addTo(alertMapObj);
        }
    });
}

function flyToEvent() {
    if (!alertMapObj) return;
    const severe = DEMO.alerts.find(a => a.severity === 'SEVERE');
    if (severe) {
        alertMapObj.flyTo([severe.centroid.lat, severe.centroid.lon], 8, { duration: 1.5 });
    }
}

/* ================================================================
   EVENT ANALYSIS (BENCHMARKS)
   ================================================================ */

function renderBenchmarks() {
    // Peak temp bars
    const maxTemp = 48.5;
    $('benchmarkPeakTemp').innerHTML = DEMO.benchmark.peakTemp.map((b, i) => {
        const pct = (b.value / maxTemp) * 100;
        const cls = i === 3 ? 'green-bar' : i === 1 ? 'cyan-bar' : i === 0 ? 'muted-bar' : 'amber-bar';
        return `<div class="bar-chart-row">
            <div class="bar-label">${b.label}</div>
            <div class="bar-track">
                <div class="bar-fill ${cls}" id="bar-temp-${i}" style="width:0%;">${b.value}°C</div>
            </div>
        </div>`;
    }).join('') + `<div style="margin-top:10px; font-size:10px; color:var(--text-dim);">Diffusion ensemble mean recovers the extreme peak exactly (47.7°C vs 47.7°C ERA5 truth).</div>`;

    // Sharpness bars
    $('benchmarkSharpness').innerHTML = DEMO.benchmark.spatialSharpness.map((b, i) => {
        const cls = i === 3 ? 'green-bar' : i === 1 ? 'cyan-bar' : i === 2 ? 'amber-bar' : 'muted-bar';
        return `<div class="bar-chart-row">
            <div class="bar-label">${b.label}</div>
            <div class="bar-track">
                <div class="bar-fill ${cls}" id="bar-sharp-${i}" style="width:0%;">${b.value}</div>
            </div>
        </div>`;
    }).join('');
}

function animateBenchmarkBars() {
    const maxTemp = 48.5;
    DEMO.benchmark.peakTemp.forEach((b, i) => {
        setTimeout(() => {
            const el = $('bar-temp-' + i);
            if (el) el.style.width = (b.value / maxTemp * 100) + '%';
        }, i * 200);
    });
    DEMO.benchmark.spatialSharpness.forEach((b, i) => {
        setTimeout(() => {
            const el = $('bar-sharp-' + i);
            if (el) el.style.width = (b.value * 100) + '%';
        }, i * 200 + 400);
    });
}

/* ================================================================
   SYSTEM STATUS
   ================================================================ */

function renderSystemStatus() {
    // Component grid
    $('systemGrid').innerHTML = DEMO.systemComponents.map(c => `
        <div class="system-item">
            <div class="system-item-name">${c.name}</div>
            <div class="system-item-status"><span class="s-dot"></span> ${c.status}</div>
        </div>
    `).join('');

    // API endpoints
    $('apiEndpoints').innerHTML = DEMO.apiEndpoints.map(e => `
        <div class="api-row">
            <span class="api-method ${e.method.toLowerCase()}">${e.method}</span>
            <span class="api-path">${e.path}</span>
            <span class="api-status ok">${e.status} ${e.statusText}</span>
        </div>
    `).join('');
}

async function replayLogs() {
    const terminal = $('systemTerminal');
    terminal.innerHTML = '';
    $('logStatus').textContent = 'STREAMING';

    for (let i = 0; i < DEMO.systemLogs.length; i++) {
        const line = DEMO.systemLogs[i];
        const cls = line.includes('complete') || line.includes('generated') || line.includes('nominal') ? 'success' :
                    line.includes('detected') || line.includes('SEVERE') ? 'warn' :
                    line.includes('Loading') || line.includes('Computing') || line.includes('Sampling') ? 'info' : '';
        terminal.innerHTML += `<div class="log-line ${cls}" style="animation-delay:${i * 0.05}s;"><span class="log-msg">${line}</span></div>`;
        terminal.scrollTop = terminal.scrollHeight;
        await wait(200 + Math.random() * 150);
    }
    $('logStatus').textContent = 'COMPLETE';
}

async function testApi() {
    const btn = $('testApiBtn');
    const resp = $('apiResponse');
    btn.disabled = true;
    btn.textContent = '⟳ TESTING...';
    resp.style.display = 'block';
    resp.innerHTML = '<div style="color:var(--text-dim); font-size:11px;">Request sent...</div>';

    await wait(800);
    resp.innerHTML = '<div style="color:var(--amber); font-size:11px;">Processing...</div>';
    await wait(600);

    const json = JSON.stringify(DEMO.apiTestResponse, null, 2);
    const formatted = json
        .replace(/"(\w+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-number">$1</span>');

    resp.innerHTML = `
        <div style="color:var(--green); font-size:11px; font-weight:700; margin-bottom:8px;">200 OK</div>
        <div class="json-block">${formatted}</div>
    `;

    btn.disabled = false;
    btn.textContent = '⟶ TEST API';
}

/* ================================================================
   INITIALIZATION
   ================================================================ */

function init() {
    renderKPIs();
    renderPipeline();
    initOverviewMap();
    renderAlerts();
    renderBenchmarks();
    renderSystemStatus();

    // Draw initial heatmaps
    setTimeout(() => {
        drawHeatmap('coarseCanvas', false);
        drawHeatmap('fineCanvas', true);
    }, 200);
}

// Wait for DOM + Leaflet
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
