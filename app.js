// corvid-obs v0.1.1 — camera-first transparent UI + voice logging

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/Raven/sw.js', { scope: '/Raven/' }).catch(() => {});
}

// ── SIGNAL VOCAB ────────────────────────────────────────────────────────────
const SIGNALS = {
  vocal: {
    label: 'Voice', icon: 'V',
    signals: [
      { id:'v1',  plain:'Soft contact call',        tech:'vocal.contact.call',      voice:['contact call','soft call','contact'],       caveat: null },
      { id:'v2',  plain:'Answering a call',          tech:'vocal.contact.response',  voice:['answering','response','reply'],             caveat: null },
      { id:'v3',  plain:'Calling together',          tech:'vocal.duet',              voice:['duet','calling together','pair call'],      caveat: null },
      { id:'v4',  plain:'Aerial alarm',              tech:'vocal.alarm.aerial',      voice:['aerial alarm','hawk alarm','raptor'],       caveat: null },
      { id:'v5',  plain:'Ground alarm',              tech:'vocal.alarm.terrestrial', voice:['ground alarm','terrestrial alarm'],         caveat: null },
      { id:'v6',  plain:'Human alarm',               tech:'vocal.alarm.human',       voice:['human alarm','person alarm'],              caveat:'Individual ID requires sustained observation' },
      { id:'v7',  plain:'Escalating alarm',          tech:'vocal.alarm.gradient',    voice:['escalating','getting louder','intensifying'],caveat: null },
      { id:'v8',  plain:'Recruiting the group',      tech:'vocal.mob.recruit',       voice:['recruiting','mob call','rally'],           caveat: null },
      { id:'v9',  plain:'Food call',                 tech:'vocal.food.call',         voice:['food call','food find','food'],            caveat: null },
      { id:'v10', plain:'Silent near food',          tech:'vocal.food.withhold',     voice:['silent near food','no food call','withhold'],caveat:'Absence signal — requires knowing food is present' },
      { id:'v11', plain:'Begging',                   tech:'vocal.beg',               voice:['begging','beg'],                          caveat: null },
      { id:'v12', plain:'Dominance call',            tech:'vocal.dominance',         voice:['dominance','asserting','dominant'],        caveat: null },
      { id:'v13', plain:'Appeasement call',          tech:'vocal.submission',        voice:['appeasement','submissive','backing down'], caveat: null },
      { id:'v14', plain:'Play invitation',           tech:'vocal.play.solicitation', voice:['play call','play','invitation'],           caveat: null },
      { id:'v15', plain:'Pointing with voice',       tech:'vocal.referential',       voice:['referential','pointing','directing'],      caveat: null },
      { id:'v16', plain:'Mimicking a sound',         tech:'vocal.mimicry',           voice:['mimicry','mimicking','copying'],           caveat: null },
      { id:'v17', plain:'Unfamiliar call',           tech:'vocal.novel',             voice:['novel','unfamiliar','new call'],           caveat:'Requires population baseline to confirm novelty' },
    ]
  },
  feather: {
    label: 'Feathers', icon: 'F',
    signals: [
      { id:'f1', plain:'Throat feathers raised', tech:'feather.throat.hackle.raise', voice:['hackle up','throat up','ruff up'],    caveat: null },
      { id:'f2', plain:'Throat feathers flat',   tech:'feather.throat.hackle.flat',  voice:['hackle flat','throat flat'],          caveat: null },
      { id:'f3', plain:'Crest up',               tech:'feather.crest.erect',         voice:['crest up','crest raised'],            caveat: null },
      { id:'f4', plain:'Crest flat',             tech:'feather.crest.flat',          voice:['crest flat','crest down'],            caveat: null },
      { id:'f5', plain:'Feathers puffed out',    tech:'feather.fluff',               voice:['puffed','fluffed','puffed out'],      caveat:'Could indicate cold or illness — note context' },
      { id:'f6', plain:'Feathers slicked tight', tech:'feather.slick',               voice:['slicked','tight','alert posture'],    caveat: null },
    ]
  },
  gaze: {
    label: 'Head', icon: 'H',
    signals: [
      { id:'g1',  plain:'Direct gaze at you',        tech:'gaze.direct',          voice:['direct gaze','looking at me','eye contact'], caveat: null },
      { id:'g2',  plain:'Sideways look',             tech:'gaze.lateral',         voice:['lateral','sideways','one eye'],              caveat: null },
      { id:'g3',  plain:'Looking away',              tech:'gaze.averted',         voice:['looking away','averted','disengaged'],       caveat: null },
      { id:'g4',  plain:'Watching you closely',      tech:'gaze.human.sustained', voice:['watching me','sustained gaze','tracking me'],caveat:'Individual recognition — requires longitudinal data' },
      { id:'g5',  plain:'Cache surveillance scan',   tech:'gaze.cache.check',     voice:['cache scan','checking','surveillance'],      caveat:'Note who else is present' },
      { id:'g6',  plain:'Head tilted',               tech:'head.tilt',            voice:['head tilt','tilting'],                      caveat: null },
      { id:'g7',  plain:'Head bobbing',              tech:'head.bob',             voice:['head bob','bobbing'],                       caveat: null },
      { id:'g8',  plain:'Beak pointing at something',tech:'beak.point',           voice:['beak point','pointing','gesturing'],         caveat: null },
      { id:'g9',  plain:'Beak clattering',           tech:'beak.clatter',         voice:['beak clatter','clattering'],                caveat: null },
      { id:'g10', plain:'Wiping beak',               tech:'beak.wipe',            voice:['beak wipe','wiping'],                       caveat: null },
    ]
  },
  posture: {
    label: 'Body', icon: 'B',
    signals: [
      { id:'p1', plain:'Standing tall',          tech:'posture.upright.tall', voice:['standing tall','upright','tall'],        caveat: null },
      { id:'p2', plain:'Crouched low',           tech:'posture.crouch',       voice:['crouched','low','crouching'],            caveat:'Context determines meaning — submission or play' },
      { id:'p3', plain:'Leaning toward',         tech:'posture.lean.toward',  voice:['leaning in','leaning toward','engaged'], caveat: null },
      { id:'p4', plain:'Leaning away',           tech:'posture.lean.away',    voice:['leaning away','leaning back'],           caveat: null },
      { id:'p5', plain:'Parallel to partner',    tech:'posture.parallel',     voice:['parallel','side by side','matching'],    caveat: null },
    ]
  },
  movement: {
    label: 'Move', icon: 'M',
    signals: [
      { id:'m1', plain:'Wings drooping',          tech:'wing.droop',    voice:['wings drooping','drooped'],          caveat: null },
      { id:'m2', plain:'Wings spread wide',       tech:'wing.spread',   voice:['wings spread','spreading'],          caveat: null },
      { id:'m3', plain:'Wing flutter at other',   tech:'wing.flutter',  voice:['wing flutter','fluttering'],         caveat: null },
      { id:'m4', plain:'Hopping closer',          tech:'hop.approach',  voice:['hopping closer','approaching','hop in'], caveat: null },
      { id:'m5', plain:'Hopping away',            tech:'hop.retreat',   voice:['hopping away','retreating','hop out'],  caveat: null },
      { id:'m6', plain:'Strutting',               tech:'walk.strut',    voice:['strutting','strut'],                 caveat: null },
      { id:'m7', plain:'Short repositioning',     tech:'flight.short',  voice:['short flight','repositioning'],      caveat: null },
      { id:'m8', plain:'Flying away',             tech:'flight.full',   voice:['flying away','fled','gone'],         caveat: null },
    ]
  },
  social: {
    label: 'Social', icon: 'S',
    signals: [
      { id:'s1', plain:'Mutual preening',    tech:'allopreening',        voice:['allopreening','mutual preening','grooming each other'], caveat: null },
      { id:'s2', plain:'Beak touching',      tech:'bill.touch',          voice:['bill touch','beak touch','touching beaks'],            caveat: null },
      { id:'s3', plain:'Object play',        tech:'play.object',         voice:['object play','playing with'],                          caveat: null },
      { id:'s4', plain:'Aerial play',        tech:'play.aerial',         voice:['aerial play','acrobatics','flying play'],              caveat: null },
      { id:'s5', plain:'Hiding food',        tech:'cache.behavior',      voice:['caching','hiding food','cache'],                       caveat:'Note who is watching — audience affects behavior' },
      { id:'s6', plain:'Moving hidden food', tech:'cache.recache',       voice:['recaching','moving cache','relocating'],               caveat:'High significance. Cannot confirm strategy from single session.' },
      { id:'s7', plain:'Group assembling',   tech:'coalition.assembly',  voice:['group assembling','gathering','group'],                caveat: null },
    ]
  },
  calm: {
    label: 'Calm', icon: 'C',
    signals: [
      { id:'r1', plain:'Preening self',   tech:'regulation.preen',       voice:['preening','self preening','grooming'],  caveat: null },
      { id:'r2', plain:'Sunbathing',      tech:'regulation.sunbathe',    voice:['sunbathing','sun'],                    caveat: null },
      { id:'r3', plain:'Bathing',         tech:'regulation.bathe',       voice:['bathing','bath'],                      caveat: null },
      { id:'r4', plain:'Roosting early',  tech:'regulation.roost.early', voice:['roosting early','early roost'],        caveat:'Elevated stress indicator' },
    ]
  }
};

// Build flat voice → signal lookup
const VOICE_MAP = [];
for (const [catKey, cat] of Object.entries(SIGNALS)) {
  for (const sig of cat.signals) {
    for (const phrase of (sig.voice || [])) {
      VOICE_MAP.push({ phrase: phrase.toLowerCase(), sig, catKey });
    }
  }
}

// ── SESSION LEDGER ──────────────────────────────────────────────────────────
class Ledger {
  constructor() {
    this.id = 'corvid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,5);
    this.startedAt = Date.now();
    this.species = 'raven';
    this.context = {};
    this.events = [];
  }

  setCtx(obj) { Object.assign(this.context, obj); }

  log(sig, source = 'tap') {
    const e = {
      ts: Date.now(), elapsed: Date.now() - this.startedAt,
      id: Math.random().toString(36).slice(2,8),
      tech: sig.tech, plain: sig.plain,
      hasCaveat: !!sig.caveat, source
    };
    this.events.push(e);
    return e;
  }

  summary() {
    const c = {};
    this.events.forEach(e => c[e.tech] = (c[e.tech]||0)+1);
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([t,n])=>({t,n}));
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
        elapsed_s: (e.elapsed/1000).toFixed(1)
      }))
    };
  }
}

// ── AUDIO ENGINE ────────────────────────────────────────────────────────────
class AudioEngine {
  constructor() { this.stream = null; this.analyser = null; this.raf = null; }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ac = new AC();
      const src = this.ac.createMediaStreamSource(this.stream);
      this.analyser = this.ac.createAnalyser();
      this.analyser.fftSize = 128;
      src.connect(this.analyser);
      return true;
    } catch(e) { return false; }
  }

  drawLoop(canvas) {
    const ctx = canvas.getContext('2d');
    const buf = new Uint8Array(this.analyser.frequencyBinCount);
    const draw = () => {
      this.raf = requestAnimationFrame(draw);
      this.analyser.getByteFrequencyData(buf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width / buf.length;
      buf.forEach((v, i) => {
        const h = (v/255) * canvas.height;
        const a = 0.25 + (v/255)*0.6;
        ctx.fillStyle = `rgba(200,168,75,${a})`;
        ctx.fillRect(i*w, canvas.height-h, Math.max(1,w-1), h);
      });
    };
    draw();
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.stream) this.stream.getTracks().forEach(t=>t.stop());
    if (this.ac) this.ac.close();
  }
}

// ── CAMERA ENGINE ───────────────────────────────────────────────────────────
class CameraEngine {
  constructor(videoEl) { this.video = videoEl; this.stream = null; }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width:{ideal:1920}, height:{ideal:1080} },
        audio: false
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      return true;
    } catch(e) { return false; }
  }

  stop() { if (this.stream) this.stream.getTracks().forEach(t=>t.stop()); }
}

// ── VOICE RECOGNITION ───────────────────────────────────────────────────────
class VoiceEngine {
  constructor(onMatch) {
    this.onMatch = onMatch;
    this.active = false;
    this.rec = null;
    this._init();
  }

  _init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    this.rec = new SR();
    this.rec.continuous = true;
    this.rec.interimResults = true;
    this.rec.lang = 'en-US';

    this.rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript.toLowerCase().trim();
      if (last.isFinal) this._match(text);
      else this._showInterim(text);
    };

    this.rec.onend = () => {
      if (this.active) {
        try { this.rec.start(); } catch(e) {}
      }
    };
  }

  _match(text) {
    let best = null, bestLen = 0;
    for (const entry of VOICE_MAP) {
      if (text.includes(entry.phrase) && entry.phrase.length > bestLen) {
        best = entry; bestLen = entry.phrase.length;
      }
    }
    if (best) this.onMatch(best.sig, text);
    hideVoiceInterim();
  }

  _showInterim(text) {
    const el = document.getElementById('voice-heard');
    if (el) el.textContent = text;
    document.getElementById('voice-status').classList.add('visible');
  }

  toggle() {
    if (!this.rec) return false;
    this.active = !this.active;
    if (this.active) {
      try { this.rec.start(); } catch(e) {}
    } else {
      try { this.rec.stop(); } catch(e) {}
      hideVoiceInterim();
    }
    return this.active;
  }

  stop() {
    this.active = false;
    if (this.rec) try { this.rec.stop(); } catch(e) {}
  }

  get available() { return !!this.rec; }
}

function hideVoiceInterim() {
  document.getElementById('voice-status').classList.remove('visible');
  const el = document.getElementById('voice-heard');
  if (el) el.textContent = '';
}

// ── GPS ─────────────────────────────────────────────────────────────────────
function getGPS() {
  return new Promise(res => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5), acc: Math.round(p.coords.accuracy) }),
      () => res(null), { timeout: 6000 }
    );
  });
}

// ── APP STATE ───────────────────────────────────────────────────────────────
let ledger = null;
let audioEng = null;
let cameraEng = null;
let voiceEng = null;
let timerInt = null;
let activeCat = 'vocal';
let researchMode = false;

// ── PILL SELECTORS ──────────────────────────────────────────────────────────
function bindPills(groupId) {
  document.querySelectorAll(`#${groupId} .pill`).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(`#${groupId} .pill`).forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function pillVal(groupId) {
  return document.querySelector(`#${groupId} .pill.active`)?.dataset.v || null;
}

// ── CATEGORY TABS ───────────────────────────────────────────────────────────
function renderCatTabs() {
  const el = document.getElementById('cat-tabs');
  el.innerHTML = Object.entries(SIGNALS).map(([key, cat]) => `
    <button class="cat-tab ${key===activeCat?'active':''}" data-cat="${key}">
      <span style="font-family:monospace;font-size:11px;opacity:.7">${cat.icon}</span>
      ${cat.label}
    </button>
  `).join('');
  el.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeCat = tab.dataset.cat;
      renderCatTabs();
      renderSigGrid();
    });
  });
}

// ── SIGNAL GRID ─────────────────────────────────────────────────────────────
function renderSigGrid() {
  const sigs = SIGNALS[activeCat]?.signals || [];
  const el = document.getElementById('sig-grid');
  el.innerHTML = sigs.map(sig => `
    <button class="sig-btn" data-id="${sig.id}" data-cat="${activeCat}">
      <div class="sig-plain">${sig.plain}</div>
      ${researchMode ? `<div class="sig-tech">${sig.tech}</div>` : ''}
      ${sig.caveat ? `<span class="sig-warn">⚠</span>` : ''}
    </button>
  `).join('');

  el.querySelectorAll('.sig-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sig = SIGNALS[btn.dataset.cat]?.signals.find(s=>s.id===btn.dataset.id);
      if (sig) logSignal(sig, 'tap', btn);
    });
  });
}

// ── LOG SIGNAL ──────────────────────────────────────────────────────────────
function logSignal(sig, source = 'tap', btnEl = null) {
  const entry = ledger.log(sig, source);

  // Tap flash on button
  if (btnEl) {
    btnEl.classList.add('tapped');
    setTimeout(() => btnEl.classList.remove('tapped'), 350);
  }

  // Flash on viewfinder
  flashSig(sig.plain);

  // Event strip
  addEventPill(entry);

  // Caveat toast
  if (sig.caveat) showCaveat(sig.caveat);
}

function flashSig(text) {
  const el = document.getElementById('sig-flash');
  el.textContent = text;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1900);
}

function addEventPill(entry) {
  const strip = document.getElementById('event-strip');
  const s = Math.round(entry.elapsed/1000);
  const t = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const pill = document.createElement('div');
  pill.className = 'ev-pill';
  pill.innerHTML = `<span class="ev-t">${t}</span><span class="ev-p">${entry.plain}</span>${entry.hasCaveat?'<span class="ev-w">⚠</span>':''}`;
  strip.insertBefore(pill, strip.firstChild);
  while (strip.children.length > 5) strip.lastChild.remove();
}

// ── CAVEAT TOAST ─────────────────────────────────────────────────────────────
let caveatTimer = null;
function showCaveat(text) {
  const el = document.getElementById('caveat');
  el.innerHTML = `<span class="caveat-icon">⚠</span>${text}`;
  el.classList.add('show');
  clearTimeout(caveatTimer);
  caveatTimer = setTimeout(() => el.classList.remove('show'), 4500);
}

// ── TIMER ────────────────────────────────────────────────────────────────────
function startTimer() {
  clearInterval(timerInt);
  timerInt = setInterval(() => {
    if (!ledger) return;
    const s = Math.round((Date.now()-ledger.startedAt)/1000);
    const el = document.getElementById('hud-timer');
    if (el) el.textContent = `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }, 1000);
}

// ── SCREENS ──────────────────────────────────────────────────────────────────
function show(id) {
  ['setup','session','review'].forEach(s => {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  });
}

// ── BEGIN SESSION ────────────────────────────────────────────────────────────
async function beginSession() {
  ledger = new Ledger();
  ledger.species = pillVal('species-pills') || 'raven';
  ledger.setCtx({
    subjects: pillVal('count-pills') || 'unknown',
    distance: pillVal('dist-pills') || 'unknown',
    notes: document.getElementById('setup-notes').value.trim(),
    mode: pillVal('mode-pills') || 'field'
  });
  researchMode = pillVal('mode-pills') === 'research';

  // GPS (non-blocking)
  getGPS().then(gps => { if (gps) ledger.setCtx({ gps }); });

  // Camera
  cameraEng = new CameraEngine(document.getElementById('camera'));
  await cameraEng.start();

  // Audio
  audioEng = new AudioEngine();
  const audioOk = await audioEng.start();

  show('session');

  // Waveform
  if (audioOk) {
    const canvas = document.getElementById('waveform');
    // size canvas to actual display size
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    audioEng.drawLoop(canvas);
  }

  // HUD
  document.getElementById('hud-species').textContent =
    ledger.species.charAt(0).toUpperCase() + ledger.species.slice(1);
  startTimer();

  // Voice engine
  voiceEng = new VoiceEngine((sig, heard) => {
    logSignal(sig, 'voice');
    const el = document.getElementById('voice-heard');
    if (el) el.textContent = '✓ ' + sig.plain;
    setTimeout(hideVoiceInterim, 1200);
  });

  // UI
  renderCatTabs();
  renderSigGrid();

  // Voice toggle
  document.getElementById('voice-toggle').addEventListener('click', () => {
    if (!voiceEng.available) { showCaveat('Speech recognition not available in this browser'); return; }
    const active = voiceEng.toggle();
    document.getElementById('voice-toggle').classList.toggle('active', active);
    if (!active) hideVoiceInterim();
  });

  document.getElementById('mode-toggle').addEventListener('click', () => {
    researchMode = !researchMode;
    document.getElementById('mode-toggle').textContent = researchMode ? '👁' : '⚗';
    renderSigGrid();
  });

  document.getElementById('end-btn').addEventListener('click', endSession);
}

// ── END SESSION ──────────────────────────────────────────────────────────────
function endSession() {
  clearInterval(timerInt);
  if (voiceEng) voiceEng.stop();
  if (audioEng) audioEng.stop();
  if (cameraEng) cameraEng.stop();

  // Render review
  const data = ledger.export();
  const dur = Math.round((Date.now()-ledger.startedAt)/1000);
  document.getElementById('review-id').textContent = data.session_id;
  document.getElementById('rv-count').textContent = data.event_count;
  document.getElementById('rv-dur').textContent = `${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')}`;
  document.getElementById('rv-species').textContent = ledger.species;

  // Top signals
  const top = ledger.summary();
  document.getElementById('rv-top').innerHTML = top.length
    ? top.map(({t,n}) => `<div class="top-row"><span>${t}</span><span>×${n}</span></div>`).join('')
    : '<div style="color:var(--text-dim);font-size:11px">No signals logged</div>';

  // Log
  document.getElementById('rv-log').innerHTML = data.events.length
    ? data.events.map(e => `
        <div class="log-row">
          <span class="log-t">${e.elapsed_s}s</span>
          <span class="log-p">${e.plain}</span>
          <span class="log-k">${e.tech}</span>
        </div>`).join('')
    : '<div style="padding:12px;color:var(--text-dim);font-size:11px">No events</div>';

  show('review');
}

// ── EXPORT ───────────────────────────────────────────────────────────────────
function exportJSON() {
  const data = ledger.export();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${data.session_id}.json`;
  a.click(); URL.revokeObjectURL(url);
}

// ── BIND SETUP ───────────────────────────────────────────────────────────────
bindPills('species-pills');
bindPills('count-pills');
bindPills('dist-pills');
bindPills('mode-pills');

document.getElementById('begin-btn').addEventListener('click', beginSession);
document.getElementById('export-btn').addEventListener('click', exportJSON);
document.getElementById('new-btn').addEventListener('click', () => {
  ledger = null;
  show('setup');
});
