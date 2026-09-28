/* ================================================================
   STORMIS — DEMO DATA
   
   All dashboard pages read from this single data source.
   
   Scenario: May 2020 North India Heatwave
   This is SIMULATED DEMO data for prototype demonstration.
   ================================================================ */

const DEMO = {

    meta: {
        project: "STORMIS",
        subtitle: "Extreme Weather Intelligence",
        fullName: "Spatio-Temporal Observation & Risk Monitoring Intelligence System",
        problemStatement: "SIH26078",
        mode: "DEMO / PROTOTYPE",
        forecastCycle: "26 MAY 2020 • 00 UTC",
        model: "NEPS-G Ensemble",
        members: 23,
        forecastRange: "+3 to +10 Days",
        baseline: "ERA5 1991–2020",
        variable: "2m Temperature",
        sourceResolution: 12,
        targetResolution: 5,
        enhancement: "4×"
    },

    kpi: {
        activeEvents: 3,
        severeEvents: 1,
        peakEFI: 0.91,
        maxAnomaly: "+4.8°C",
        forecastMembers: 23,
        impactRadius: "5 km"
    },

    scenario: {
        name: "North India Heatwave",
        region: "North India",
        type: "HEATWAVE",
        date: "26 MAY 2020",
        utc: "12 UTC",
        peakEFI: 0.91,
        maxAnomaly: 4.8,
        impactRadiusKm: 5,
        trackConfidence: 92,
        centroid: { lat: 28.61, lon: 77.21 },
        movement: "EAST-NORTHEAST",
        benchmarkPeak: 47.7
    },

    forecastDays: [
        { label: "D+3", date: "29 MAY", hour: "T+72",  active: false },
        { label: "D+4", date: "30 MAY", hour: "T+96",  active: false },
        { label: "D+5", date: "31 MAY", hour: "T+120", active: true  },
        { label: "D+6", date: "01 JUN", hour: "T+144", active: false },
        { label: "D+7", date: "02 JUN", hour: "T+168", active: false },
        { label: "D+8", date: "03 JUN", hour: "T+192", active: false },
        { label: "D+9", date: "04 JUN", hour: "T+216", active: false },
        { label: "D+10",date: "05 JUN", hour: "T+240", active: false }
    ],

    trajectory: [
        { day: 1, lat: 26.85, lon: 73.02, efi: 0.52, anomaly: 2.1, label: "Rajasthan" },
        { day: 2, lat: 27.18, lon: 74.55, efi: 0.68, anomaly: 3.2, label: "East Rajasthan" },
        { day: 3, lat: 27.62, lon: 75.80, efi: 0.79, anomaly: 3.9, label: "Haryana Border" },
        { day: 4, lat: 28.15, lon: 76.60, efi: 0.87, anomaly: 4.4, label: "Haryana" },
        { day: 5, lat: 28.61, lon: 77.21, efi: 0.91, anomaly: 4.8, label: "Delhi NCR" }
    ],

    efiGrid: [
        { lat: 25.0, lon: 70.0, efi: 0.15 },
        { lat: 25.0, lon: 72.0, efi: 0.22 },
        { lat: 25.0, lon: 74.0, efi: 0.35 },
        { lat: 25.0, lon: 76.0, efi: 0.28 },
        { lat: 25.0, lon: 78.0, efi: 0.18 },
        { lat: 27.0, lon: 70.0, efi: 0.30 },
        { lat: 27.0, lon: 72.0, efi: 0.52 },
        { lat: 27.0, lon: 74.0, efi: 0.68 },
        { lat: 27.0, lon: 76.0, efi: 0.79 },
        { lat: 27.0, lon: 78.0, efi: 0.45 },
        { lat: 29.0, lon: 70.0, efi: 0.20 },
        { lat: 29.0, lon: 72.0, efi: 0.42 },
        { lat: 29.0, lon: 74.0, efi: 0.71 },
        { lat: 29.0, lon: 76.0, efi: 0.91 },
        { lat: 29.0, lon: 78.0, efi: 0.65 },
        { lat: 31.0, lon: 70.0, efi: 0.12 },
        { lat: 31.0, lon: 72.0, efi: 0.25 },
        { lat: 31.0, lon: 74.0, efi: 0.48 },
        { lat: 31.0, lon: 76.0, efi: 0.55 },
        { lat: 31.0, lon: 78.0, efi: 0.30 }
    ],

    alerts: [
        {
            id: "ALERT-001",
            severity: "SEVERE",
            type: "HEATWAVE",
            title: "Severe Heatwave — North India",
            region: "Delhi NCR / Haryana / Punjab",
            efi: 0.91,
            anomaly: "+4.8°C",
            radius: "5 km",
            time: "26 MAY 2020 • 12 UTC",
            status: "ACTIVE",
            action: "Prioritize local disaster-management review. Issue NDRF advisory.",
            centroid: { lat: 28.61, lon: 77.21 }
        },
        {
            id: "ALERT-002",
            severity: "MODERATE",
            type: "HEAT ANOMALY",
            title: "Moderate Heat Anomaly — Rajasthan",
            region: "East Rajasthan / Jaipur",
            efi: 0.74,
            anomaly: "+2.9°C",
            radius: "12 km",
            time: "26 MAY 2020 • 12 UTC",
            status: "MONITOR",
            action: "Continue monitoring. Alert SDMA if EFI exceeds 0.85.",
            centroid: { lat: 26.92, lon: 75.78 }
        },
        {
            id: "ALERT-003",
            severity: "MODERATE",
            type: "HEAT ANOMALY",
            title: "Moderate Heat Anomaly — UP West",
            region: "Western Uttar Pradesh",
            efi: 0.69,
            anomaly: "+2.4°C",
            radius: "12 km",
            time: "26 MAY 2020 • 12 UTC",
            status: "MONITOR",
            action: "Monitor trend. Review next forecast cycle.",
            centroid: { lat: 28.45, lon: 78.98 }
        },
        {
            id: "ALERT-004",
            severity: "LOW",
            type: "WARM SPELL",
            title: "Low-Level Warm Spell — Gujarat",
            region: "Northern Gujarat",
            efi: 0.45,
            anomaly: "+1.5°C",
            radius: "25 km",
            time: "26 MAY 2020 • 12 UTC",
            status: "WATCH",
            action: "No immediate action required.",
            centroid: { lat: 23.22, lon: 72.64 }
        },
        {
            id: "ALERT-005",
            severity: "LOW",
            type: "WARM SPELL",
            title: "Low-Level Warm Spell — MP",
            region: "Northern Madhya Pradesh",
            efi: 0.42,
            anomaly: "+1.3°C",
            radius: "25 km",
            time: "26 MAY 2020 • 12 UTC",
            status: "WATCH",
            action: "No immediate action required.",
            centroid: { lat: 24.58, lon: 77.41 }
        }
    ],

    benchmark: {
        peakTemp: [
            { label: "Coarse / Bilinear", value: 47.1, note: "lost 0.6°C" },
            { label: "Diffusion Ensemble Mean", value: 47.7, note: "exact recovery" },
            { label: "Single Diffusion", value: 48.0, note: "generative spread" },
            { label: "ERA5 Fine Truth", value: 47.7, note: "ground truth" }
        ],
        spatialSharpness: [
            { label: "Coarse / Bilinear", value: 0.535, note: "33% smoothed" },
            { label: "Diffusion Ensemble Mean", value: 0.781, note: "" },
            { label: "Single Diffusion", value: 0.985, note: "sharp gradients" },
            { label: "ERA5 Fine Truth", value: 0.798, note: "reference" }
        ]
    },

    pipelineStages: [
        { id: "ensemble",   label: "Ensemble",    icon: "◈", loadMsg: "Loading 23 members...",            doneMsg: "23 / 23 members loaded" },
        { id: "climatology", label: "Climatology", icon: "◉", loadMsg: "Loading 30-year baseline...",     doneMsg: "ERA5 1991–2020 baseline loaded" },
        { id: "efi",         label: "EFI Engine",  icon: "◆", loadMsg: "Computing extreme probability...", doneMsg: "EFI grid generated • Peak 0.91" },
        { id: "tracking",    label: "Tracking",    icon: "◎", loadMsg: "Detecting anomaly footprint...",   doneMsg: "Trajectory identified • 5 points" },
        { id: "diffusion",   label: "Diffusion",   icon: "◇", loadMsg: "Generating fine-scale field...",   doneMsg: "Downscaling complete • 4× enhanced" },
        { id: "alerts",      label: "Alerts",      icon: "◈", loadMsg: "Classifying severity levels...",   doneMsg: "3 alerts generated" }
    ],

    systemComponents: [
        { name: "Data Ingestion",   status: "ONLINE", color: "green" },
        { name: "NEPS-G Ensemble",  status: "23 / 23 MEMBERS", color: "green" },
        { name: "ERA5 Baseline",    status: "AVAILABLE", color: "green" },
        { name: "EFI Engine",       status: "READY", color: "green" },
        { name: "Tracking Engine",  status: "READY", color: "green" },
        { name: "Diffusion Model",  status: "READY", color: "green" },
        { name: "Alert API",        status: "ONLINE", color: "green" },
        { name: "Dashboard",        status: "ONLINE", color: "green" }
    ],

    systemLogs: [
        "[14:02:11] Forecast cycle initialized — 26 MAY 2020 00 UTC",
        "[14:02:12] Loading NEPS-G ensemble members...",
        "[14:02:13] 23 ensemble members available and validated",
        "[14:02:14] ERA5 climatology loaded (1991–2020, 30-year quantiles)",
        "[14:02:15] Computing EFI field across 20 grid cells",
        "[14:02:16] Extreme anomaly detected — EFI 0.91 at 28.61°N, 77.21°E",
        "[14:02:17] Tracking trajectory — 5 centroid positions extracted",
        "[14:02:17] Movement: EAST-NORTHEAST, confidence 92%",
        "[14:02:18] Diffusion downscaling initialized (4× enhancement)",
        "[14:02:19] Sampling timestep 400 / 400...",
        "[14:02:20] Applying coarse-consistency projection",
        "[14:02:21] Fine-scale field generated — peak 47.7°C preserved",
        "[14:02:22] Alert engine: 1 SEVERE, 2 MODERATE, 2 LOW",
        "[14:02:23] Forecast cycle complete — all stages nominal"
    ],

    apiEndpoints: [
        { method: "GET",  path: "/health",               status: 200, statusText: "OK" },
        { method: "GET",  path: "/alerts",                status: 200, statusText: "OK" },
        { method: "GET",  path: "/alerts?date=2020-05-26", status: 200, statusText: "OK" },
        { method: "POST", path: "/process/2020-05-26",    status: 200, statusText: "OK" }
    ],

    apiTestResponse: {
        status: "success",
        forecast_cycle: "2020-05-26T00:00:00Z",
        model: "NEPS-G",
        members: 23,
        alerts: 3,
        severity: "severe",
        peak_efi: 0.91,
        peak_anomaly: 4.8,
        impact_radius_km: 5,
        centroid: { lat: 28.61, lon: 77.21 },
        mode: "DEMO / PROTOTYPE"
    },

    diffusionSteps: [
        "Initializing conditional diffusion model...",
        "Loading coarse forecast field (12 km)...",
        "Sampling timestep 400 / 400...",
        "Sampling timestep 320 / 400...",
        "Sampling timestep 240 / 400...",
        "Sampling timestep 160 / 400...",
        "Sampling timestep 80 / 400...",
        "Sampling timestep 20 / 400...",
        "Applying coarse-consistency projection...",
        "Calculating uncertainty spread...",
        "Generation complete."
    ]
};
