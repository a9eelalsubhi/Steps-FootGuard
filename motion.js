/* Motion lives separately from slide layouts so content revisions retain it. */
let clearDeviceLeaders = () => {};
function setupSceneMotion(stage) {
  clearDeviceLeaders();
  stage.classList.add('motion-ready');
  stage.querySelectorAll('.enter').forEach((el, i) => el.style.setProperty('--reveal-i', Math.min(i, 10)));
  const stagger = (selector) => stage.querySelectorAll(selector).forEach((el, i) => el.style.setProperty('--motion-i', i));
  stagger('.person,.chapter,.stat,.science-row,.chain-node,.stream-node,.result-node,.component-labels li,.how-photo,.considerations>div,.input-card,.process-step,.output-item,.risk-legend>span,.value-item,.market-tier,.deployment-sites>div');

  const scan = (el, className = '') => {
    if (!el || el.querySelector('.motion-scan')) return;
    const line = document.createElement('span');
    line.className = 'motion-scan ' + className;
    line.setAttribute('aria-hidden', 'true');
    el.append(line);
  };
  const thermal = stage.querySelector('.thermal-illustration');
  if (thermal) {
    const frame = document.createElement('div');
    frame.className = 'thermal-motion';
    thermal.before(frame);
    frame.append(thermal);
    scan(frame, 'thermal-motion-scan');
  }
  scan(stage.querySelector('.science-visual'), 'map-motion-scan');
  scan(stage.querySelector('.exploded-clean'), 'device-motion-scan');
  scan(stage.querySelector('.prototype-focus .device-browser'), 'prototype-motion-scan');
  stage.querySelectorAll('.how-photo').forEach(el => scan(el, 'how-motion-scan'));

  stage.querySelectorAll('.wiring-vector>g:first-of-type>path').forEach((path, i) => {
    const packet = path.cloneNode(false);
    packet.removeAttribute('marker-end');
    packet.setAttribute('class', 'data-packet');
    packet.style.setProperty('--motion-i', i);
    path.after(packet);
  });
  const hero = stage.querySelector('.hero-art');
  if (hero) {
    const orbit = document.createElement('span');
    orbit.className = 'motion-orbit';
    orbit.setAttribute('aria-hidden', 'true');
    hero.prepend(orbit);
  }
  clearDeviceLeaders = setupDeviceLeaders(stage);
}

function setupDeviceLeaders(stage) {
  const panel = stage.querySelector('.device-explainer');
  const image = panel?.querySelector('.exploded-clean > img');
  const labels = panel ? Array.from(panel.querySelectorAll('.component-labels li')) : [];
  if (!image || labels.length !== 9) return () => {};
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.classList.add('device-leaders');
  svg.setAttribute('aria-hidden', 'true');
  const nodes = labels.map(() => {
    const group = document.createElementNS(ns, 'g');
    const halo = document.createElementNS(ns, 'path');
    const line = document.createElementNS(ns, 'path');
    const dot = document.createElementNS(ns, 'circle');
    halo.classList.add('leader-halo');
    line.classList.add('leader-line');
    dot.classList.add('leader-dot');
    dot.setAttribute('r', '3');
    group.append(halo, line, dot);
    svg.append(group);
    return { halo, line, dot };
  });
  panel.append(svg);
  // Normalized coordinates on the unchanged exploded-view artwork.
  const leftTargets = [[.16,.17],[.718,.259],[.482,.288],[.20,.36],[.20,.459],[.20,.594],[.23,.738],[.54,.778],[.25,.852]];
  const rightTargets = [[.87,.19],[.718,.259],[.482,.288],[.85,.36],[.82,.47],[.86,.591],[.87,.75],[.54,.778],[.84,.85]];
  let frame = 0, disposed = false;
  const update = () => {
    if (disposed || !panel.isConnected || !image.naturalWidth) return;
    const box = panel.getBoundingClientRect();
    const photo = image.getBoundingClientRect();
    const scale = box.width / panel.offsetWidth;
    if (!scale) return;
    svg.setAttribute('viewBox', `0 0 ${panel.offsetWidth} ${panel.offsetHeight}`);
    const ratio = image.naturalWidth / image.naturalHeight;
    const w = Math.min(photo.width, photo.height * ratio);
    const h = w / ratio;
    const x = photo.left + (photo.width - w) / 2;
    const y = photo.top + (photo.height - h) / 2;
    const left = labels[0].getBoundingClientRect().left < photo.left;
    const targets = left ? leftTargets : rightTargets;
    labels.forEach((label, i) => {
      const rect = label.getBoundingClientRect();
      const startX = ((left ? rect.right : rect.left) - box.left) / scale + (left ? 5 : -5);
      const startY = (rect.top + rect.height / 2 - box.top) / scale;
      const endX = (x + targets[i][0] * w - box.left) / scale;
      const endY = (y + targets[i][1] * h - box.top) / scale;
      const bendX = startX + (left ? 16 : -16);
      const path = `M${startX.toFixed(2)} ${startY.toFixed(2)}H${bendX.toFixed(2)}L${endX.toFixed(2)} ${endY.toFixed(2)}`;
      nodes[i].halo.setAttribute('d', path);
      nodes[i].line.setAttribute('d', path);
      nodes[i].dot.setAttribute('cx', endX.toFixed(2));
      nodes[i].dot.setAttribute('cy', endY.toFixed(2));
    });
  };
  const tick = () => {
    if (disposed || !panel.isConnected) return;
    update();
    if (!document.body.classList.contains('reduced')) frame = requestAnimationFrame(tick);
  };
  const observer = new ResizeObserver(update);
  observer.observe(panel);
  image.addEventListener('load', update);
  frame = requestAnimationFrame(tick);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    image.removeEventListener('load', update);
  };
}

document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('motion-suspended', document.hidden);
});
