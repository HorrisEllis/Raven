// corvid-obs — v0.1.0
// Field observation logger for corvid behavioral signals

// ── SERVICE WORKER ──────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/Raven/sw.js', { scope: '/Raven/' }).catch(() => {});
}

// ── SIGNAL VOCABULARY ───────────────────────────────────────────────────────
// Each signal: id, plain label, technical id, category, icon key, caveat?
const SIGNALS = {
  vocal: {
    label: 'Voice',
    icon: 'call',
    signals: [
      { id: 'v1',  plain: 'Soft contact call',       tech: 'vocal.contact.call',       icon: 'call_soft',    desc: 'Quiet gurgling or knocking — talking to a partner or flock' },
      { id: 'v2',  plain: 'Answering a call',         tech: 'vocal.contact.response',   icon: 'call_reply',   desc: 'Responding to another raven\'s contact call' },
      { id: 'v3',  plain: 'Calling together',         tech: 'vocal.duet',               icon: 'call_duet',    desc: 'Two ravens calling in sync — strong pair bond signal' },
      { id: 'v4',  plain: 'Aerial alarm',             tech: 'vocal.alarm.aerial',       icon: 'alarm_air',    desc: 'Short rapid calls — something overhead (hawk, eagle)' },
      { id: 'v5',  plain: 'Ground alarm',             tech: 'vocal.alarm.terrestrial',  icon: 'alarm_ground', desc: 'Longer, lower calls — ground predator nearby' },
      { id: 'v6',  plain: 'Human alarm',              tech: 'vocal.alarm.human',        icon: 'alarm_human',  desc: 'Specific call for a recognized person — they know you', caveat: 'Individual ID requires sustained observation of same bird' },
      { id: 'v7',  plain: 'Escalating alarm',         tech: 'vocal.alarm.gradient',     icon: 'alarm_up',     desc: 'Getting louder / faster — threat is approaching' },
      { id: 'v8',  plain: 'Recruiting the group',     tech: 'vocal.mob.recruit',        icon: 'recruit',      desc: 'Calling others to respond to a threat' },
      { id: 'v9',  plain: 'Food call',                tech: 'vocal.food.call',          icon: 'food_call',    desc: 'Broadcasting a food find — shared with flock' },
      { id: 'v10', plain: 'Silent near food',         tech: 'vocal.food.withhold',      icon: 'food_silent',  desc: 'No food call despite food present — may be hiding cache location', caveat: 'Absence signal — requires knowing food is present. Single session cannot confirm strategy.' },
      { id: 'v11', plain: 'Begging',                  tech: 'vocal.beg',                icon: 'beg',          desc: 'High-pitched repeated calls — juveniles or subordinates wanting food' },
      { id: 'v12', plain: 'Dominance call',           tech: 'vocal.dominance',          icon: 'dom',          desc: 'Low, harsh — asserting rank or space' },
      { id: 'v13', plain: 'Appeasement call',         tech: 'vocal.submission',         icon: 'submit',       desc: 'Soft, high — backing down from conflict' },
      { id: 'v14', plain: 'Play invitation',          tech: 'vocal.play.solicitation',  icon: 'play_call',    desc: 'Distinct call that starts a play sequence' },
      { id: 'v15', plain: 'Pointing with voice',      tech: 'vocal.referential',        icon: 'refer',        desc: 'Call that directs another\'s attention to a specific thing or place' },
      { id: 'v16', plain: 'Mimicking another sound',  tech: 'vocal.mimicry',            icon: 'mimic',        desc: 'Reproducing a sound from another species or environment' },
      { id: 'v17', plain: 'Unfamiliar call',          tech: 'vocal.novel',              icon: 'novel',        desc: 'Call not heard before from this individual — note carefully', caveat: 'Novel calls are high significance but require population baseline to confirm' },
    ]
  },
  feather: {
    label: 'Feathers',
    icon: 'feather',
    signals: [
      { id: 'f1', plain: 'Throat feathers raised',  tech: 'feather.throat.hackle.raise', icon: 'hackle_up',   desc: 'Ruff standing up at throat — aroused, asserting, or excited' },
      { id: 'f2', plain: 'Throat feathers flat',    tech: 'feather.throat.hackle.flat',  icon: 'hackle_flat',  desc: 'Smooth throat — calm or submissive' },
      { id: 'f3', plain: 'Crest up',                tech: 'feather.crest.erect',         icon: 'crest_up',     desc: 'Head feathers raised — high attention, dominance, or excitement' },
      { id: 'f4', plain: 'Crest flat',              tech: 'feather.crest.flat',          icon: 'crest_flat',   desc: 'Head feathers smooth — calm or backing down' },
      { id: 'f5', plain: 'Feathers puffed out',     tech: 'feather.fluff',               icon: 'fluff',        desc: 'All-over fluffing — comfort, cold, or unwell. Context matters.' },
      { id: 'f6', plain: 'Feathers slicked tight',  tech: 'feather.slick',               icon: 'slick',        desc: 'Feathers pressed close to body — alert, ready to move' },
    ]
  },
  gaze: {
    label: 'Eyes & Head',
    icon: 'eye',
    signals: [
      { id: 'g1', plain: 'Looking directly at you',    tech: 'gaze.direct',          icon: 'gaze_direct',   desc: 'Sustained direct gaze — evaluating, curious, or asserting' },
      { id: 'g2', plain: 'Looking sideways',           tech: 'gaze.lateral',         icon: 'gaze_side',     desc: 'One eye toward you — primary inspection mode for ravens' },
      { id: 'g3', plain: 'Looking away',               tech: 'gaze.averted',         icon: 'gaze_away',     desc: 'Eyes turned off — submission or disengaging' },
      { id: 'g4', plain: 'Watching you closely',       tech: 'gaze.human.sustained', icon: 'gaze_human',    desc: 'Prolonged attention on a specific person — recognition likely active', caveat: 'Individual recognition confirmed only with longitudinal data' },
      { id: 'g5', plain: 'Scanning before hiding food',tech: 'gaze.cache.check',     icon: 'cache_scan',    desc: 'Rapid surveillance sweep before or after hiding food', caveat: 'Strategic modulation — observe who is present' },
      { id: 'g6', plain: 'Head tilted',                tech: 'head.tilt',            icon: 'head_tilt',     desc: 'Orienting ear or eye — high attention and engagement' },
      { id: 'g7', plain: 'Head bobbing',               tech: 'head.bob',             icon: 'head_bob',      desc: 'Repeated vertical movement — arousal, anticipation' },
      { id: 'g8', plain: 'Beak pointing at something', tech: 'beak.point',           icon: 'beak_point',    desc: 'Directing another\'s attention with beak — referential gesture' },
      { id: 'g9', plain: 'Beak clattering',            tech: 'beak.clatter',         icon: 'beak_clatter',  desc: 'Rapid beak clacking — threat display or excitement' },
      { id:'g10', plain: 'Wiping beak on perch',       tech: 'beak.wipe',            icon: 'beak_wipe',     desc: 'Displacement behavior — mild frustration or arousal' },
    ]
  },
  posture: {
    label: 'Body',
    icon: 'body',
    signals: [
      { id: 'p1', plain: 'Standing tall, upright',  tech: 'posture.upright.tall',  icon: 'tall',          desc: 'Full height, confident — dominance or high engagement' },
      { id: 'p2', plain: 'Crouched low',             tech: 'posture.crouch',        icon: 'crouch',        desc: 'Low body — submission, fear, or play invitation. Context matters.' },
      { id: 'p3', plain: 'Leaning toward something', tech: 'posture.lean.toward',   icon: 'lean_in',       desc: 'Body angled in — interested, engaged' },
      { id: 'p4', plain: 'Leaning away',             tech: 'posture.lean.away',     icon: 'lean_out',      desc: 'Body angled back — assessing a threat, not fleeing yet' },
      { id: 'p5', plain: 'Parallel to partner',      tech: 'posture.parallel',      icon: 'parallel',      desc: 'Matching another\'s orientation — affiliative, coordinated' },
    ]
  },
  movement: {
    label: 'Movement',
    icon: 'move',
    signals: [
      { id: 'm1', plain: 'Wings drooping',           tech: 'wing.droop',      icon: 'wing_droop',   desc: 'Wings hanging low — submission, juvenile bonding, or unwell' },
      { id: 'm2', plain: 'Wings spread wide',        tech: 'wing.spread',     icon: 'wing_spread',  desc: 'Full spread — dominance display or sun-bathing' },
      { id: 'm3', plain: 'Wing flutter toward other',tech: 'wing.flutter',    icon: 'wing_flutter', desc: 'Rapid flutter aimed at another — appeasement or pair bond' },
      { id: 'm4', plain: 'Hopping closer',           tech: 'hop.approach',    icon: 'hop_in',       desc: 'Moving toward — curiosity, maintaining safe distance' },
      { id: 'm5', plain: 'Hopping away',             tech: 'hop.retreat',     icon: 'hop_out',      desc: 'Moving back to assess from distance' },
      { id: 'm6', plain: 'Strutting',                tech: 'walk.strut',      icon: 'strut',        desc: 'Deliberate, high-step walk — confidence, dominance' },
      { id: 'm7', plain: 'Short repositioning flight',tech: 'flight.short',   icon: 'flight_short', desc: 'Brief hop to new spot — adjusting position, not fleeing' },
      { id: 'm8', plain: 'Full flight away',         tech: 'flight.full',     icon: 'flight_full',  desc: 'Leaving — threshold exceeded. Observation window closed.' },
    ]
  },
  social: {
    label: 'Social',
    icon: 'social',
    signals: [
      { id: 's1', plain: 'Preening each other',      tech: 'allopreening',         icon: 'allopreen',    desc: 'Mutual grooming — strong trust and pair bond indicator' },
      { id: 's2', plain: 'Touching beaks',           tech: 'bill.touch',           icon: 'bill_touch',   desc: 'Bill-to-bill contact — pair bond reinforcement' },
      { id: 's3', plain: 'Playing with an object',   tech: 'play.object',          icon: 'play_obj',     desc: 'Manipulating something for apparent enjoyment' },
      { id: 's4', plain: 'Aerial play',              tech: 'play.aerial',          icon: 'play_air',     desc: 'Acrobatic flight — positive arousal, often juveniles or bonded pairs' },
      { id: 's5', plain: 'Hiding food',              tech: 'cache.behavior',       icon: 'cache',        desc: 'Burying or concealing food — note who is watching', caveat: 'Record who is present — audience affects behavior (§CORVID1)' },
      { id: 's6', plain: 'Moving a hidden cache',    tech: 'cache.recache',        icon: 'recache',      desc: 'Relocating previously hidden food — was being watched', caveat: 'High significance. Requires knowing cache was already placed. Cannot confirm from single session.' },
      { id: 's7', plain: 'Group assembling',         tech: 'coalition.assembly',   icon: 'group',        desc: 'Non-paired individuals gathering — record count and context' },
    ]
  },
  regulation: {
    label: 'Calm / Rest',
    icon: 'calm',
    signals: [
      { id: 'r1', plain: 'Preening self',    tech: 'regulation.preen',        icon: 'preen',      desc: 'Self-grooming — parasympathetic, coming down, comfortable' },
      { id: 'r2', plain: 'Sunbathing',       tech: 'regulation.sunbathe',     icon: 'sun',        desc: 'Wings spread to sun — low arousal, feels safe' },
      { id: 'r3', plain: 'Bathing',          tech: 'regulation.bathe',        icon: 'bathe',      desc: 'Water or dust bathing — low arousal, comfortable' },
      { id: 'r4', plain: 'Roosting early',   tech: 'regulation.roost.early',  icon: 'roost',      desc: 'Going to roost before usual time — elevated arousal or stress' },
    ]
  }
};

// Category SVG icons (inline, field-readable silhouettes)
const CATEGORY_ICONS = {
  call:    `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="22" rx="10" ry="12" fill="currentColor"/><path d="M14 16 Q10 8 20 6 Q30 8 26 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M11 14 Q5 4 20 2 Q35 4 29 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".5"/></svg>`,
  feather: `<svg viewBox="0 0 40 40"><path d="M20 34 C20 34 8 22 10 12 C12 4 20 4 20 4 C20 4 28 4 30 12 C32 22 20 34 20 34Z" fill="currentColor"/><line x1="20" y1="34" x2="20" y2="8" stroke="white" stroke-width="1.5" opacity=".4"/></svg>`,
  eye:     `<svg viewBox="0 0 40 40"><path d="M4 20 Q20 6 36 20 Q20 34 4 20Z" fill="currentColor"/><circle cx="20" cy="20" r="5" fill="white"/><circle cx="21" cy="19" r="2.5" fill="#111"/></svg>`,
  body:    `<svg viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="12" ry="15" fill="currentColor"/><circle cx="20" cy="9" r="5" fill="currentColor"/></svg>`,
  move:    `<svg viewBox="0 0 40 40"><path d="M6 32 L20 8 L34 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 24 L30 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  social:  `<svg viewBox="0 0 40 40"><circle cx="13" cy="14" r="7" fill="currentColor"/><circle cx="27" cy="14" r="7" fill="currentColor"/><ellipse cx="13" cy="30" rx="9" ry="7" fill="currentColor"/><ellipse cx="27" cy="30" rx="9" ry="7" fill="currentColor"/></svg>`,
  calm:    `<svg viewBox="0 0 40 40"><path d="M20 6 L24 14 L34 15.5 L27 22 L28.7 32 L20 28 L11.3 32 L13 22 L6 15.5 L16 14Z" fill="currentColor"/></svg>`,
};

// ── SESSION LEDGER ──────────────────────────────────────────────────────────
class SessionLedger {
  constructor() {
    this.id = this._uid();
    this.startedAt = Date.now();
    this.species = 'raven';
    this.context = {};
    this.events = [];
  }

  _uid() {
    return 'corvid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6);
  }

  setContext(ctx) {
    this.context = { ...this.context, ...ctx };
  }

  log(signalId, signal, note = '') {
    const entry = {
      ts: Date.now(),
      id: this._uid(),
      signalId,
      tech: signal.tech,
      plain: signal.plain,
      note,
      hasCaveat: !!signal.caveat,
    };
    this.events.push(entry);
    return entry;
  }

  export() {
    return {
      session_id: this.id,
      species: this.species,
      started_at: new Date(this.startedAt).toISOString(),
      exported_at: new Date().toISOString(),
      context: this.context,
      event_count: this.events.length,
      events: this.events.map(e => ({
        ...e,
        ts_iso: new Date(e.ts).toISOString(),
        elapsed_s: ((e.ts - this.startedAt) / 1000).toFixed(1),
      })),
    };
  }

  summary() {
    const counts = {};
    this.events.forEach(e => { counts[e.tech] = (counts[e.tech] || 0) + 1; });
    return Object.entries(counts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tech, n]) => ({ tech, n }));
  }
}

// ── AUDIO ENGINE ────────────────────────────────────────────────────────────
class AudioEngine {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = null;
    this.analyser = null;
    this.stream = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.recording = false;
    this.animFrame = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      const source = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      this._draw();

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.mediaRecorder.start();
      this.recording = true;
      return true;
    } catch(e) {
      return false;
    }
  }

  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.mediaRecorder && this.recording) this.mediaRecorder.stop();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.ctx) this.ctx.close();
    this.recording = false;
  }

  getBlob() {
    if (!this.chunks.length) return null;
    return new Blob(this.chunks, { type: 'audio/webm' });
  }

  _draw() {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    const buf = new Uint8Array(this.analyser.frequencyBinCount);

    const loop = () => {
      this.animFrame = requestAnimationFrame(loop);
      this.analyser.getByteFrequencyData(buf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width / buf.length;
      buf.forEach((v, i) => {
        const h = (v / 255) * canvas.height;
        const alpha = 0.3 + (v / 255) * 0.7;
        ctx.fillStyle = `rgba(180,160,100,${alpha})`;
        ctx.fillRect(i * w, canvas.height - h, w - 1, h);
      });
    };
    loop();
  }
}

// ── CAMERA ENGINE ───────────────────────────────────────────────────────────
class CameraEngine {
  constructor(videoEl) {
    this.video = videoEl;
    this.stream = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      return true;
    } catch(e) {
      return false;
    }
  }

  stop() {
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
  }
}

// ── GPS ─────────────────────────────────────────────────────────────────────
function getLocation() {
  return new Promise(res => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5), acc: Math.round(p.coords.accuracy) }),
      () => res(null),
      { timeout: 8000 }
    );
  });
}

// ── APP STATE ───────────────────────────────────────────────────────────────
const state = {
  screen: 'setup',       // setup | session | review
  ledger: null,
  audio: null,
  camera: null,
  activeCategory: 'vocal',
  researchMode: false,
  sessionStarted: false,
  lastSignal: null,
  flashTimeout: null,
};

// ── RENDER ──────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (state.screen === 'setup') app.innerHTML = renderSetup();
  if (state.screen === 'session') app.innerHTML = renderSession();
  if (state.screen === 'review') app.innerHTML = renderReview();
  bindEvents();
}

function renderSetup() {
  return `
<div class="screen setup-screen">
  <div class="setup-header">
    <div class="logo-mark">
      <svg viewBox="0 0 60 60" class="logo-svg">
        <path d="M30 8 C18 8 10 18 10 30 C10 40 16 48 26 52 L26 48 C19 45 14 38 14 30 C14 20 21 12 30 12 C38 12 44 17 47 24 L30 24 L24 33 L36 33 L30 52 L50 28 L38 28 L44 16 C39 11 35 8 30 8Z" fill="var(--gold)"/>
      </svg>
    </div>
    <h1 class="app-title">CORVID<span class="title-obs">OBS</span></h1>
    <p class="app-sub">Field Observation Logger</p>
  </div>

  <div class="setup-form">
    <div class="field-group">
      <label class="field-label">Species</label>
      <div class="species-selector">
        <button class="species-btn active" data-species="raven">Common Raven</button>
        <button class="species-btn" data-species="crow">American Crow</button>
        <button class="species-btn" data-species="other">Other Corvid</button>
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">Subjects visible</label>
      <div class="count-selector">
        <button class="count-btn" data-count="1">1</button>
        <button class="count-btn" data-count="2">2</button>
        <button class="count-btn" data-count="3">3</button>
        <button class="count-btn" data-count="4+">4+</button>
        <button class="count-btn" data-count="unknown">?</button>
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">Estimated distance</label>
      <div class="dist-selector">
        <button class="dist-btn" data-dist="<5m">&lt;5m</button>
        <button class="dist-btn" data-dist="5-15m">5–15m</button>
        <button class="dist-btn" data-dist="15-30m">15–30m</button>
        <button class="dist-btn" data-dist="30-100m">30–100m</button>
        <button class="dist-btn" data-dist=">100m">&gt;100m</button>
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">Interface mode</label>
      <div class="mode-toggle">
        <button class="mode-btn active" data-mode="field">Field Guide <span class="mode-hint">plain language</span></button>
        <button class="mode-btn" data-mode="research">Research <span class="mode-hint">technical IDs</span></button>
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">Notes (optional)</label>
      <textarea class="notes-input" id="setup-notes" placeholder="Habitat, weather, behavior context..."></textarea>
    </div>
  </div>

  <button class="begin-btn" id="begin-session">
    <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
    Begin Session
  </button>
</div>`;
}

function renderSession() {
  const cats = Object.entries(SIGNALS);
  const activeSigs = SIGNALS[state.activeCategory]?.signals || [];

  return `
<div class="screen session-screen">
  <!-- Header bar -->
  <div class="session-header">
    <div class="session-meta">
      <span class="session-species">${state.ledger.species.toUpperCase()}</span>
      <span class="session-timer" id="session-timer">00:00</span>
    </div>
    <div class="session-controls">
      <button class="ctrl-btn" id="toggle-mode" title="${state.researchMode ? 'Field Guide' : 'Research'} mode">
        ${state.researchMode ? '👁' : '⚗'}
      </button>
      <button class="ctrl-btn end-btn" id="end-session">END</button>
    </div>
  </div>

  <!-- Camera viewfinder -->
  <div class="viewfinder-wrap">
    <video id="camera-feed" autoplay muted playsinline class="camera-feed"></video>
    <div class="vf-overlay">
      <div class="vf-corner tl"></div>
      <div class="vf-corner tr"></div>
      <div class="vf-corner bl"></div>
      <div class="vf-corner br"></div>
    </div>
    ${state.lastSignal ? `<div class="signal-flash" id="signal-flash">${state.lastSignal}</div>` : ''}
  </div>

  <!-- Audio waveform -->
  <div class="audio-wrap">
    <div class="audio-label">
      <span class="rec-dot"></span>
      <span>AUDIO</span>
    </div>
    <canvas id="waveform" class="waveform" width="600" height="48"></canvas>
  </div>

  <!-- Category tabs -->
  <div class="cat-tabs" id="cat-tabs">
    ${cats.map(([key, cat]) => `
      <button class="cat-tab ${key === state.activeCategory ? 'active' : ''}" data-cat="${key}">
        <span class="cat-icon">${CATEGORY_ICONS[cat.icon] || ''}</span>
        <span class="cat-label">${cat.label}</span>
      </button>
    `).join('')}
  </div>

  <!-- Signal grid -->
  <div class="signal-grid" id="signal-grid">
    ${activeSigs.map(sig => `
      <button class="signal-card" data-sig="${sig.id}" data-cat="${state.activeCategory}">
        <div class="sig-plain">${sig.plain}</div>
        ${state.researchMode ? `<div class="sig-tech">${sig.tech}</div>` : ''}
        ${sig.caveat ? `<div class="sig-caveat-dot" title="${sig.caveat}">⚠</div>` : ''}
      </button>
    `).join('')}
  </div>

  <!-- Event log strip -->
  <div class="event-strip" id="event-strip">
    ${(state.ledger.events.slice(-6).reverse()).map(e => `
      <div class="event-pill">
        <span class="ev-time">${elapsed(e.ts, state.ledger.startedAt)}</span>
        <span class="ev-plain">${e.plain}</span>
        ${e.hasCaveat ? '<span class="ev-warn">⚠</span>' : ''}
      </div>
    `).join('')}
  </div>
</div>`;
}

function renderReview() {
  const data = state.ledger.export();
  const top = state.ledger.summary();
  const duration = Math.round((Date.now() - state.ledger.startedAt) / 1000);
  const mins = Math.floor(duration/60);
  const secs = duration % 60;

  return `
<div class="screen review-screen">
  <div class="review-header">
    <div class="logo-mark small">
      <svg viewBox="0 0 60 60" class="logo-svg">
        <path d="M30 8 C18 8 10 18 10 30 C10 40 16 48 26 52 L26 48 C19 45 14 38 14 30 C14 20 21 12 30 12 C38 12 44 17 47 24 L30 24 L24 33 L36 33 L30 52 L50 28 L38 28 L44 16 C39 11 35 8 30 8Z" fill="var(--gold)"/>
      </svg>
    </div>
    <h2 class="review-title">Session Complete</h2>
    <p class="review-sub">${data.session_id}</p>
  </div>

  <div class="review-stats">
    <div class="stat-block">
      <div class="stat-num">${data.event_count}</div>
      <div class="stat-label">signals logged</div>
    </div>
    <div class="stat-block">
      <div class="stat-num">${mins}:${String(secs).padStart(2,'0')}</div>
      <div class="stat-label">duration</div>
    </div>
    <div class="stat-block">
      <div class="stat-num">${data.species}</div>
      <div class="stat-label">species</div>
    </div>
  </div>

  ${top.length ? `
  <div class="review-section">
    <h3 class="review-sec-title">Most observed</h3>
    ${top.map(t => `
      <div class="top-signal">
        <span class="top-tech">${t.tech}</span>
        <span class="top-count">×${t.n}</span>
      </div>
    `).join('')}
  </div>` : ''}

  ${data.context.gps ? `
  <div class="review-section">
    <h3 class="review-sec-title">Location</h3>
    <p class="review-detail">${data.context.gps.lat}, ${data.context.gps.lng} (±${data.context.gps.acc}m)</p>
  </div>` : ''}

  <div class="review-section">
    <h3 class="review-sec-title">Session log</h3>
    <div class="event-log">
      ${data.events.map(e => `
        <div class="log-row ${e.hasCaveat ? 'has-caveat' : ''}">
          <span class="log-time">${e.elapsed_s}s</span>
          <span class="log-plain">${e.plain}</span>
          <span class="log-tech">${e.tech}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="review-actions">
    <button class="export-btn" id="export-json">Export JSON</button>
    <button class="new-btn" id="new-session">New Session</button>
  </div>
</div>`;
}

function elapsed(ts, start) {
  const s = Math.round((ts - start) / 1000);
  const m = Math.floor(s/60);
  return `${m}:${String(s%60).padStart(2,'0')}`;
}

// ── EVENTS ──────────────────────────────────────────────────────────────────
let timerInterval = null;

function bindEvents() {
  // Setup screen
  document.querySelectorAll('.species-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.species-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('.dist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dist-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.researchMode = btn.dataset.mode === 'research';
    });
  });

  const beginBtn = document.getElementById('begin-session');
  if (beginBtn) beginBtn.addEventListener('click', beginSession);

  // Session screen
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeCategory = tab.dataset.cat;
      render();
      // Re-attach camera and audio to new DOM elements
      attachMedia();
    });
  });

  document.querySelectorAll('.signal-card').forEach(card => {
    card.addEventListener('click', () => {
      const sigId = card.dataset.sig;
      const catKey = card.dataset.cat;
      const sig = SIGNALS[catKey]?.signals.find(s => s.id === sigId);
      if (!sig) return;
      const entry = state.ledger.log(sigId, sig);
      state.lastSignal = sig.plain;

      // Flash feedback
      card.classList.add('tapped');
      setTimeout(() => card.classList.remove('tapped'), 400);

      // Update event strip only
      const strip = document.getElementById('event-strip');
      if (strip) {
        const pill = document.createElement('div');
        pill.className = 'event-pill new';
        pill.innerHTML = `<span class="ev-time">${elapsed(entry.ts, state.ledger.startedAt)}</span><span class="ev-plain">${sig.plain}</span>${sig.caveat ? '<span class="ev-warn">⚠</span>' : ''}`;
        strip.insertBefore(pill, strip.firstChild);
        if (strip.children.length > 6) strip.lastChild.remove();
        setTimeout(() => pill.classList.remove('new'), 400);
      }

      // Show caveat if present
      if (sig.caveat) showCaveat(sig.caveat);
    });
  });

  const toggleMode = document.getElementById('toggle-mode');
  if (toggleMode) toggleMode.addEventListener('click', () => {
    state.researchMode = !state.researchMode;
    render();
    attachMedia();
  });

  const endBtn = document.getElementById('end-session');
  if (endBtn) endBtn.addEventListener('click', endSession);

  // Review screen
  const exportBtn = document.getElementById('export-json');
  if (exportBtn) exportBtn.addEventListener('click', exportSession);

  const newBtn = document.getElementById('new-session');
  if (newBtn) newBtn.addEventListener('click', () => {
    state.screen = 'setup';
    state.ledger = null;
    state.lastSignal = null;
    render();
  });
}

function showCaveat(text) {
  let existing = document.getElementById('caveat-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'caveat-toast';
  toast.className = 'caveat-toast';
  toast.innerHTML = `<span class="caveat-warn">⚠</span> ${text}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 400); }, 4000);
}

async function beginSession() {
  const species = document.querySelector('.species-btn.active')?.dataset.species || 'raven';
  const count = document.querySelector('.count-btn.active')?.dataset.count || 'unknown';
  const dist = document.querySelector('.dist-btn.active')?.dataset.dist || 'unknown';
  const notes = document.getElementById('setup-notes')?.value || '';

  state.ledger = new SessionLedger();
  state.ledger.species = species;

  const gps = await getLocation();
  state.ledger.setContext({ subjects: count, distance: dist, notes, gps });

  state.screen = 'session';
  render();
  attachMedia();
  startTimer();
}

function attachMedia() {
  // Camera
  const videoEl = document.getElementById('camera-feed');
  if (videoEl) {
    if (!state.camera) {
      state.camera = new CameraEngine(videoEl);
      state.camera.start();
    } else {
      videoEl.srcObject = state.camera.stream;
      videoEl.play().catch(() => {});
    }
  }

  // Audio
  const waveEl = document.getElementById('waveform');
  if (waveEl) {
    if (!state.audio) {
      state.audio = new AudioEngine(waveEl);
      state.audio.start();
    } else {
      state.audio.canvas = waveEl;
    }
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const el = document.getElementById('session-timer');
    if (!el || !state.ledger) return;
    const s = Math.round((Date.now() - state.ledger.startedAt) / 1000);
    el.textContent = `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }, 1000);
}

function endSession() {
  clearInterval(timerInterval);
  if (state.camera) { state.camera.stop(); state.camera = null; }
  if (state.audio) { state.audio.stop(); state.audio = null; }
  state.screen = 'review';
  render();
}

function exportSession() {
  const data = state.ledger.export();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.session_id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── BOOT ────────────────────────────────────────────────────────────────────
render();
