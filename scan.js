/* Signature motion: the live foot scan on the cover, and the ΔT early-warning on the thermal scene.
   Both are built after each scene renders, run on GSAP timelines, and fall back to their final frame
   when motion is reduced. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const isAr = () => document.documentElement.lang !== 'en';
  const t = (ar, en) => (isAr() ? ar : en);
  const reduced = () => (typeof reduce !== 'undefined' && reduce) || !window.gsap;
  let active = [];
  const killAll = () => { active.forEach(tl => tl.kill()); active = []; };

  // one sole: heel-to-toe outline plus five toes; drawn for the right foot, mirrored for the left
  const SOLE = 'M62 70c-15 2-24 16-24 34 0 17 7 29 6 45-1 15-9 27-9 46 0 25 12 49 33 51 21 2 32-18 31-42-1-21-8-35-7-54 1-17 9-31 7-50-2-19-17-32-37-30z';
  const TOES = [[56, 50, 11, 15], [76, 50, 7, 10], [89, 57, 6, 8.5], [99, 67, 5.5, 7.5], [106, 79, 5, 6.5]];
  // shapes carry their own transform: <clipPath> may not contain <g>
  const foot = (mirror, extra = '') => {
    const tr = mirror ? 'transform="translate(240 0) scale(-1 1)"' : '';
    return `<path ${tr} ${extra} d="${SOLE}"/>${TOES.map(([x, y, rx, ry]) => `<ellipse ${tr} ${extra} cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('')}`;
  };
  const feet = extra => foot(true, extra) + foot(false, extra);

  /* ---------- cover: live scan card ---------- */
  function heroScan(stage) {
    const art = stage.querySelector('.hero-art');
    if (!art || art.querySelector('.scan-card')) return;
    const card = document.createElement('div');
    card.className = 'scan-card';
    card.setAttribute('aria-hidden', 'true');
    const uid = 'sc' + Math.random().toString(36).slice(2, 7);
    card.innerHTML = `
      <div class="scan-card-head"><span class="scan-live"></span><b>FootGuard</b><span class="scan-step">${t('فحص مباشر', 'Live scan')}</span></div>
      <svg viewBox="0 0 240 280" class="scan-feet">
        <defs>
          <clipPath id="${uid}-soles">${feet()}</clipPath>
          <radialGradient id="${uid}-hot"><stop offset="0" stop-color="#ff3b2f"/><stop offset=".45" stop-color="#ff9a1f"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>
          <radialGradient id="${uid}-warm"><stop offset="0" stop-color="#f2c84b"/><stop offset="1" stop-color="#f2c84b" stop-opacity="0"/></radialGradient>
          <linearGradient id="${uid}-cool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8fd9"/><stop offset="1" stop-color="#1fb5a6"/></linearGradient>
          <filter id="${uid}-blur"><feGaussianBlur stdDeviation="9"/></filter>
          ${['rgb', 'heat', 'press'].map(k => `<clipPath id="${uid}-r-${k}"><rect class="reveal-${k}" x="0" y="0" width="240" height="0"/></clipPath>`).join('')}
        </defs>
        <g class="layer layer-base" clip-path="url(#${uid}-soles)"><rect width="240" height="280" fill="#e9d2c1"/><rect width="240" height="280" fill="#d9b49c" opacity=".35" filter="url(#${uid}-blur)"/></g>
        <g class="layer layer-rgb" clip-path="url(#${uid}-r-rgb)"><g clip-path="url(#${uid}-soles)">
          <rect width="240" height="280" fill="#efd6c4"/>
          <circle cx="178" cy="52" r="10" fill="#e98b7a" opacity=".8" filter="url(#${uid}-blur)"/>
          <circle cx="178" cy="52" r="5" fill="#f6c1b0" stroke="#c9604c" stroke-width="1.2"/>
        </g></g>
        <g class="layer layer-heat" clip-path="url(#${uid}-r-heat)"><g clip-path="url(#${uid}-soles)">
          <rect width="240" height="280" fill="url(#${uid}-cool)"/>
          <circle cx="70" cy="215" r="34" fill="url(#${uid}-warm)" opacity=".7"/>
          <circle cx="170" cy="215" r="34" fill="url(#${uid}-warm)" opacity=".7"/>
          <circle class="hotspot" cx="180" cy="60" r="38" fill="url(#${uid}-hot)"/>
        </g></g>
        <g class="layer layer-press" clip-path="url(#${uid}-r-press)"><g clip-path="url(#${uid}-soles)">
          <rect width="240" height="280" fill="#123d45"/>
          ${pressureDots()}
        </g></g>
        <g class="outline" fill="none" stroke="#17636a" stroke-width="2.2">${feet()}</g>
        <line class="scan-beam" x1="18" x2="222" y1="0" y2="0"/>
        <g class="risk-marker" opacity="0"><circle class="risk-ring" cx="178" cy="54" r="14"/><circle cx="178" cy="54" r="5"/></g>
        <text class="foot-label" x="64" y="276">${t('يمين', 'Right')}</text><text class="foot-label" x="176" y="276">${t('يسار', 'Left')}</text>
      </svg>
      <div class="scan-modes">${[['rgb', t('بصري', 'Visual')], ['heat', t('حراري', 'Thermal')], ['press', t('ضغط', 'Pressure')], ['result', t('النتيجة', 'Result')]]
        .map(([k, l]) => `<span data-mode="${k}">${l}</span>`).join('')}</div>
      <div class="scan-result"><b>${t('خطورة مرتفعة', 'High concern')}</b><span>${t('الإصبع الكبير · القدم اليسرى', 'Hallux · left foot')}</span><em>${t('← إحالة للمختص', 'Refer to clinician →')}</em></div>`;
    art.append(card);

    const q = s => card.querySelector(s);
    const chips = [...stage.querySelectorAll('.hero-process > div')];
    const mode = k => {
      card.querySelectorAll('.scan-modes span').forEach(s => s.classList.toggle('on', s.dataset.mode === k));
      const idx = { rgb: 0, heat: 1, press: 1, result: 2 }[k];
      chips.forEach((c, i) => c.classList.toggle('scan-on', i === idx || (k === 'result' && i === 3)));
    };
    const final = () => {
      ['rgb', 'heat', 'press'].forEach(k => q('.reveal-' + k).setAttribute('height', 280));
      q('.layer-press').style.opacity = 0.0; q('.risk-marker').setAttribute('opacity', 1);
      card.classList.add('show-result'); mode('result');
    };
    if (reduced()) { final(); return; }

    const beam = q('.scan-beam');
    const sweep = (k, label) => {
      const tl = gsap.timeline();
      tl.call(() => mode(label))
        .set(beam, { attr: { y1: 0, y2: 0 }, opacity: 1 })
        .to([q('.reveal-' + k)], { attr: { height: 280 }, duration: 1.6, ease: 'power1.inOut' }, '<')
        .to(beam, { attr: { y1: 280, y2: 280 }, duration: 1.6, ease: 'power1.inOut' }, '<')
        .to(beam, { opacity: 0, duration: 0.2 });
      return tl;
    };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, defaults: { ease: 'power2.out' },
      onRepeat: () => card.classList.remove('show-result') });
    tl.set(['.reveal-rgb', '.reveal-heat', '.reveal-press'].map(s => q(s)), { attr: { height: 0 } })
      .set(q('.layer-press'), { opacity: 1 })
      .set(q('.risk-marker'), { attr: { opacity: 0 } })
      .add(sweep('rgb', 'rgb'), '+=0.4')
      .add(sweep('heat', 'heat'), '+=0.5')
      .fromTo(q('.hotspot'), { attr: { r: 18 } }, { attr: { r: 40 }, duration: 0.9, repeat: 1, yoyo: true }, '-=0.6')
      .add(sweep('press', 'press'), '+=0.3')
      .to(q('.layer-press'), { opacity: 0, duration: 0.6 }, '+=0.6')
      .call(() => { mode('result'); card.classList.add('show-result'); })
      .to(q('.risk-marker'), { attr: { opacity: 1 }, duration: 0.3 })
      .fromTo(q('.risk-ring'), { attr: { r: 6 }, opacity: 1 }, { attr: { r: 22 }, opacity: 0, duration: 1.1, repeat: 2, ease: 'power1.out' }, '<')
      .to({}, { duration: 1.6 });
    active.push(tl);
  }

  function pressureDots() {
    // denser, larger dots under heel and forefoot; colour runs teal → gold → red with load
    let out = '';
    for (let y = 40; y < 270; y += 9) for (let x = 20; x < 225; x += 9) {
      const heel = Math.max(0, 1 - Math.abs(y - 225) / 45), fore = Math.max(0, 1 - Math.abs(y - 105) / 40);
      const left = x > 120, extra = left && y < 120 ? 0.35 : 0;
      const v = Math.min(1, heel * 0.9 + fore * 0.75 + extra + 0.1);
      const c = v > 0.75 ? '#ff5a3c' : v > 0.5 ? '#f2b33d' : v > 0.3 ? '#3fc3a6' : '#2a7f8a';
      out += `<circle cx="${x}" cy="${y}" r="${(1.4 + v * 3).toFixed(1)}" fill="${c}"/>`;
    }
    return out;
  }

  /* ---------- thermal scene: ΔT crosses the 2.2 °C threshold ---------- */
  function deltaT(stage) {
    const box = stage.querySelector('.thermal-feature');
    const ill = box?.querySelector('.thermal-illustration');
    if (!box || !ill || box.querySelector('.dt-widget')) return;
    const uid = 'dt' + Math.random().toString(36).slice(2, 7);
    const w = document.createElement('div');
    w.className = 'dt-widget';
    w.innerHTML = `
      <svg viewBox="0 0 240 250" class="dt-feet" aria-hidden="true">
        <defs><clipPath id="${uid}-c">${feet()}</clipPath>
          <radialGradient id="${uid}-h"><stop offset="0" stop-color="#ff3b2f"/><stop offset=".5" stop-color="#ff9a1f"/><stop offset="1" stop-color="#ff9a1f" stop-opacity="0"/></radialGradient>
          <linearGradient id="${uid}-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f86d6"/><stop offset="1" stop-color="#1fb5a6"/></linearGradient></defs>
        <g clip-path="url(#${uid}-c)"><rect width="240" height="250" fill="url(#${uid}-b)"/><circle class="dt-hot" cx="178" cy="80" r="0" fill="url(#${uid}-h)"/></g>
        <g fill="none" stroke="#ffffffcc" stroke-width="2">${feet()}</g>
      </svg>
      <div class="dt-meter">
        <div class="dt-read"><span>${t('الفرق بين القدمين', 'Difference between feet')}</span><b><i class="dt-val">0.4</i>°C</b></div>
        <div class="dt-bar"><i class="dt-fill"></i><span class="dt-mark" style="--at:${(2.2 / 3.2) * 100}%"><em>2.2</em></span></div>
        <div class="dt-alert">${t('إنذار مبكر: خطر تقرّح', 'Early warning: ulcer risk')}</div>
      </div>`;
    ill.replaceWith(w);
    const val = w.querySelector('.dt-val');
    const set = v => { val.textContent = v.toFixed(1); w.querySelector('.dt-fill').style.width = Math.min(100, v / 3.2 * 100) + '%'; w.classList.toggle('over', v > 2.2); };
    if (reduced()) { set(2.6); w.querySelector('.dt-hot').setAttribute('r', 46); return; }
    const o = { v: 0.4 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 0.6 });
    tl.set(o, { v: 0.4, onComplete: () => set(0.4) })
      .set(w.querySelector('.dt-hot'), { attr: { r: 0 } })
      .to(o, { v: 2.6, duration: 3.2, ease: 'power1.inOut', onUpdate: () => set(o.v) })
      .to(w.querySelector('.dt-hot'), { attr: { r: 46 }, duration: 3.2, ease: 'power1.inOut' }, '<')
      .to({}, { duration: 2.4 });
    active.push(tl);
  }

  /* ---------- solution scene: data travels from each input into the decision core, then out ---------- */
  function dataPath(stage) {
    const diagram = stage.querySelector('.solution-diagram');
    const fusion = diagram?.querySelector('.fusion');
    if (!diagram || !fusion || diagram.querySelector('.data-path') || document.body.classList.contains('phone')) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'data-path'); svg.setAttribute('aria-hidden', 'true');
    diagram.style.position = 'relative'; diagram.prepend(svg);
    // measure in the stage's unscaled coordinates
    const scale = stage.getBoundingClientRect().width / stage.offsetWidth || 1;
    const box = diagram.getBoundingClientRect();
    const pt = (el, sx, sy) => { const r = el.getBoundingClientRect(); return [(r.left + r.width * sx - box.left) / scale, (r.top + r.height * sy - box.top) / scale]; };
    svg.setAttribute('viewBox', `0 0 ${diagram.offsetWidth} ${diagram.offsetHeight}`);
    const core = pt(fusion, 0.5, 0.15), coreOut = pt(fusion, 0.5, 0.9);
    const paths = [];
    const add = (a, b, cls) => {
      const p = document.createElementNS(NS, 'path');
      const my = (a[1] + b[1]) / 2;
      p.setAttribute('d', `M${a[0]} ${a[1]} C${a[0]} ${my} ${b[0]} ${my} ${b[0]} ${b[1]}`);
      p.setAttribute('class', 'dp-line ' + cls); svg.append(p); paths.push(p); return p;
    };
    const ins = [...diagram.querySelectorAll('.stream-node')].map(n => add(pt(n, 0.5, 1), core, 'in'));
    const outs = [...diagram.querySelectorAll('.result-node')].map(n => add(coreOut, pt(n, 0.5, 0), 'out'));
    if (reduced()) return;
    const dot = path => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 5); c.setAttribute('class', 'dp-dot'); svg.append(c); return { c, path, len: path.getTotalLength() }; };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
    const run = (list, at) => list.forEach((path, i) => {
      const d = dot(path), o = { t: 0 };
      tl.fromTo(o, { t: 0 }, { t: 1, duration: 1.1, ease: 'power1.inOut', onUpdate: () => { const q = d.path.getPointAtLength(o.t * d.len); d.c.setAttribute('cx', q.x); d.c.setAttribute('cy', q.y); }, onStart: () => d.c.style.opacity = 1, onComplete: () => d.c.style.opacity = 0 }, at + i * 0.12);
    });
    run(ins, 0);
    tl.fromTo(fusion, { boxShadow: '0 0 0 0 #d5a64700' }, { boxShadow: '0 0 0 10px #d5a64733', duration: 0.4, yoyo: true, repeat: 1 }, 1.5);
    run(outs, 2.1);
    active.push(tl);
  }

  /* ---------- comparison: rivals first, then the STEPS row lights up green ---------- */
  function comparison(stage) {
    const table = stage.querySelector('.comparison table');
    if (!table || reduced()) return;
    const ours = table.querySelector('.our-row');
    const rivals = [...table.querySelectorAll('tbody tr')].filter(r => r !== ours);
    const tl = gsap.timeline({ delay: 0.5 });
    tl.from(table.querySelectorAll('thead th'), { opacity: 0, y: -8, duration: 0.3, stagger: 0.04 })
      .from(rivals, { opacity: 0, x: 20, duration: 0.35, stagger: 0.18 })
      .from(ours, { opacity: 0, duration: 0.3 })
      .from(ours.querySelectorAll('.compare-check'), { scale: 0, duration: 0.35, stagger: 0.09, ease: 'back.out(2.2)' })
      .to(ours, { boxShadow: '0 0 0 3px #2fae6a66, 0 14px 30px -12px #2fae6a88', duration: 0.5 });
    active.push(tl);
  }

  /* ---------- injuries scene: the walking route behind "60+ km" ---------- */
  function route(stage) {
    const photo = stage.querySelector('.hajj-photo');
    if (!photo || photo.querySelector('.hajj-route')) return;
    const r = document.createElement('div');
    r.className = 'hajj-route'; r.setAttribute('aria-hidden', 'true');
    const stops = [[t('منى', 'Mina'), 12, 70], [t('عرفات', 'Arafat'), 88, 34], [t('مزدلفة', 'Muzdalifah'), 52, 46], [t('منى', 'Mina'), 16, 74]];
    r.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path class="route-line" d="M12 70 C40 40 70 20 88 34 C78 46 62 44 52 46 C38 50 24 66 16 74"/></svg>
      ${stops.slice(0, 3).map(([n, x, y]) => `<span class="route-stop" style="left:${x}%;top:${y}%">${n}</span>`).join('')}<i class="route-walker"></i>`;
    photo.append(r);
    const line = r.querySelector('.route-line'), walker = r.querySelector('.route-walker');
    const len = line.getTotalLength();
    line.style.strokeDasharray = len; line.style.strokeDashoffset = reduced() ? 0 : len;
    if (reduced()) { walker.style.display = 'none'; return; }
    const o = { t: 0 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, delay: 0.8 });
    tl.set(line, { strokeDashoffset: len }).set(o, { t: 0 })
      .to(o, { t: 1, duration: 4.5, ease: 'none', onUpdate: () => {
        line.style.strokeDashoffset = len * (1 - o.t);
        const q = line.getPointAtLength(o.t * len); walker.style.left = q.x + '%'; walker.style.top = q.y + '%';
      } })
      .to(walker, { scale: 1.6, opacity: 0, duration: 0.5 })
      .set(walker, { scale: 1, opacity: 1 });
    active.push(tl);
  }

  function enhance() {
    const stage = document.querySelector('#stage');
    if (!stage) return;
    killAll();
    heroScan(stage);
    deltaT(stage);
    route(stage);
    comparison(stage);
    requestAnimationFrame(() => setTimeout(() => dataPath(stage), 900)); // after reveal transforms settle
  }
  document.addEventListener('DOMContentLoaded', () => {
    const stage = document.querySelector('#stage');
    new MutationObserver(enhance).observe(stage, { childList: true });
    enhance();
  });
})();
