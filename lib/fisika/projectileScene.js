// Cartoon canvas for the projectile lab: cannon, ball with a face, trails, target, vectors, comic FX.
// React owns the controls; this engine owns the animation loop.
import { simulate, sampleAt, fmt } from '@/lib/fisika/projectile';
import { INK } from '@/lib/shared/color';
import { ink, cloud, star, comicWord, arrow, easeOutBack } from '@/lib/shared/cartoon';

const TRAIL_COLS = ['#ff4fa8', '#3fa9ff', '#ff8a3d', '#7a5cff', '#2bb673'];
const THEMES = {
  bumi:    { sky:['#9fdcff', '#e8f7ff'], ground:'#9be89b', night:false },
  bulan:   { sky:['#1d1838', '#3a3166'], ground:'#d9d9e3', night:true },
  mars:    { sky:['#f7c9a6', '#fde7d4'], ground:'#e8906a', night:false },
  jupiter: { sky:['#f6d7a3', '#fff1d6'], ground:'#e2b06e', night:false },
};
const rnd = (a, b) => a + Math.random()*(b - a);
const STEPS = [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

export function createProjectileScene(cv, { fonts = {}, onTick, onLand, onAim }){
  const ctx = cv.getContext('2d');
  const FONT_UI = fonts.ui || 'Fredoka, sans-serif', FONT_COMIC = fonts.comic || 'Bangers, sans-serif';
  let W = 360, H = 240, dpr = 1;
  let params = null, preview = null, world = 'bumi';
  let opts = { vectors:true, preview:false, slowmo:false };
  let cur = null;            // {sim, t, rate, landed, col, label}
  let trails = [];           // finished shots
  let target = null;         // {x, hit}
  let s = 10, sGoal = 10;    // pixels per meter (animated)
  let parts = [], words = [], aim = null, clock = 0, raf = 0, alive = true, tickAcc = 0, shotNo = 0;
  const clouds = Array.from({length:4}, (_, i) => ({x:rnd(0, 1), y:rnd(.08, .35), s:rnd(14, 22), v:rnd(.004, .01), i}));

  const ox = () => 58, gy = () => H - 40;
  const sx = x => ox() + x*s, sy = y => gy() - y*s;

  function resize(w){
    W = Math.max(300, Math.round(w)); H = Math.round(Math.min(440, Math.max(240, W*.56)));
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = W*dpr; cv.height = H*dpr; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fit(true);
  }

  function fit(snap){
    const sims = [preview, cur?.sim, ...trails.map(t => t.sim)].filter(Boolean);
    let xMax = Math.max(6, ...sims.map(m => m.range), target ? target.x + 4 : 0);
    let yMax = Math.max(4, ...sims.map(m => m.maxH), params ? params.h0 + 2 : 0);
    sGoal = Math.max(0.05, Math.min((W - ox() - 28)/(xMax*1.06), (gy() - 36)/(yMax*1.1)));
    if (snap) s = sGoal;
  }

  function setParams(p){
    params = p; world = p.world || 'bumi';
    preview = simulate(p);
    fit(false);
  }

  function fire(){
    if (!params) return null;
    if (cur && !cur.landed) return null;
    if (cur) keepTrail(cur);
    const sim = simulate(params);
    const rate = opts.slowmo ? .35 : Math.max(1, sim.tFlight/3.2);
    cur = { sim, t:0, rate, landed:false, col:TRAIL_COLS[shotNo % TRAIL_COLS.length], label:`${Math.round(params.angle)}°`, params:{...params} };
    shotNo++;
    parts.push(...Array.from({length:7}, () => ({k:'cloud', x:0, y:params.h0, vx:rnd(10, 60), vy:rnd(10, 40), t:0, life:rnd(.6, 1), sz:rnd(6, 10)})));
    words.push({text:'DOR!', x:'cannon', t:0, life:.9, col:'#ffd23f', size:30});
    fit(false);
    return sim;
  }

  function keepTrail(c){
    trails.push({sim:c.sim, col:c.col, label:c.label});
    if (trails.length > 4) trails.shift();
  }

  function land(){
    cur.landed = true;
    const r = cur.sim.range;
    let hit = false;
    if (target){
      const tol = Math.max(0.6, target.x*.03);
      hit = Math.abs(r - target.x) <= tol;
      target.hit = hit;
    }
    parts.push(...Array.from({length:9}, () => ({k:'cloud', x:r, y:0, vx:rnd(-40, 40), vy:rnd(5, 30), t:0, life:rnd(.6, 1.1), sz:rnd(6, 11), world:true})));
    if (hit){
      for (let i = 0; i < 16; i++) parts.push({k:'star', x:r, y:0, vx:rnd(-90, 90), vy:rnd(60, 160), t:0, life:rnd(.8, 1.3), sz:rnd(5, 9), col:['#ffd23f', '#ff4fa8', '#3fa9ff'][i % 3], rot:rnd(0, 6), world:true});
      words.push({text:'TEPAT!', wx:r, t:0, life:1.6, col:'#7dff9a', size:40});
    } else words.push({text:'BUK!', wx:r, t:0, life:1.1, col:'#ffd23f', size:32});
    onLand?.({ sim:cur.sim, hit, params:cur.params, col:cur.col });
  }

  function step(dt){
    clock += dt;
    s += (sGoal - s)*Math.min(1, dt*5);
    for (const c of clouds){ c.x += c.v*dt; if (c.x > 1.15) c.x = -.15; }
    if (cur && !cur.landed){
      cur.t = Math.min(cur.sim.tFlight, cur.t + dt*cur.rate);
      if (cur.t >= cur.sim.tFlight) land();
    }
    tickAcc += dt;
    if (cur && tickAcc > .06){ tickAcc = 0; onTick?.({ t:cur.t, p:sampleAt(cur.sim, cur.t), sim:cur.sim, rate:cur.rate, landed:cur.landed }); }
    // particle positions are in meters, velocities in screen px/s
    for (const p of parts){ p.t += dt; p.vy -= (p.k === 'star' ? 260 : 20)*dt; p.x += p.vx*dt/s; p.y += p.vy*dt/s; }
    parts = parts.filter(p => p.t < p.life);
    for (const w of words) w.t += dt;
    words = words.filter(w => w.t < w.life);
  }

  // ---------- drawing ----------
  function drawBackground(){
    const th = THEMES[world] || THEMES.bumi;
    const g = ctx.createLinearGradient(0, 0, 0, gy()); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (th.night){
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 40; i++){ const x = (i*97.3 % W), y = (i*41.7 % (gy()*.8)); ctx.globalAlpha = .4 + .4*Math.sin(clock*2 + i); ctx.fillRect(x, y, 2, 2); }
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(W - 52, 46, 20, 0, 6.283); ctx.fillStyle = '#7fb5ff'; ctx.fill(); ink(ctx, 3); ctx.stroke();   // Earth in the sky
      ctx.beginPath(); ctx.arc(W - 58, 40, 7, 0, 6.283); ctx.fillStyle = '#9be89b'; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(W - 48, 42, 20, 0, 6.283); ctx.fillStyle = '#ffd23f'; ctx.fill(); ink(ctx, 3); ctx.stroke();
      for (const c of clouds) cloud(ctx, c.x*W, c.y*gy(), c.s, '#ffffff', 1);
    }
    // ground + ruler
    ctx.fillStyle = th.ground; ctx.fillRect(0, gy(), W, H - gy());
    ink(ctx, 3); ctx.beginPath(); ctx.moveTo(0, gy()); ctx.lineTo(W, gy()); ctx.stroke();
    const step = STEPS.find(v => v*s >= 52) || 1000;
    ctx.font = `600 11px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = INK;
    for (let m = 0; sx(m) < W - 10; m += step){
      const x = sx(m);
      ink(ctx, 2); ctx.beginPath(); ctx.moveTo(x, gy()); ctx.lineTo(x, gy() + (m % (step*2) === 0 ? 9 : 6)); ctx.stroke();
      if (m > 0) ctx.fillText(`${m} m`, x, gy() + 12);
    }
  }

  function drawPath(sim, col, upto, dashed, alpha){
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
    if (dashed) ctx.setLineDash([2, 7]);
    ctx.beginPath();
    for (const p of sim.pts){ if (p.t > upto) break; const X = sx(p.x), Y = sy(p.y); p.t === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); }
    if (upto < sim.tFlight){ const q = sampleAt(sim, upto); ctx.lineTo(sx(q.x), sy(q.y)); }
    ctx.stroke(); ctx.restore();
  }

  function flag(x, label, col){
    const X = sx(x), Y = gy();
    ink(ctx, 2.5); ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, Y - 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X, Y - 26); ctx.lineTo(X + 18, Y - 21); ctx.lineTo(X, Y - 16); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ink(ctx, 2); ctx.stroke();
    ctx.font = `700 10px ${FONT_UI}`; ctx.fillStyle = INK; ctx.textBaseline = 'bottom';
    const right = X + 3 + ctx.measureText(label).width > W - 4;   // keep labels inside the canvas
    ctx.textAlign = right ? 'right' : 'left';
    ctx.fillText(label, right ? X - 3 : X + 3, Y - 28);
  }

  function drawTarget(){
    if (!target) return;
    const X = sx(target.x), Y = gy();
    ink(ctx, 3); ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, Y - 18); ctx.stroke();
    const R = 15, cy = Y - 18 - R;
    ['#ff5a5a', '#ffffff', '#ff5a5a', '#ffffff'].forEach((c, i) => { ctx.beginPath(); ctx.arc(X, cy, R*(1 - i*.25), 0, 6.283); ctx.fillStyle = c; ctx.fill(); ink(ctx, 2); ctx.stroke(); });
    ctx.font = `700 11px ${FONT_UI}`; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(`🎯 ${fmt(target.x, 1)} m`, X, cy - R - 3);
  }

  function drawTowerAndCannon(){
    const h0 = params?.h0 || 0, ang = (params?.angle ?? 45)*Math.PI/180;
    const px = ox(), py = sy(h0);
    if (h0 > 0){
      const top = py + 12;
      ctx.fillStyle = '#c9a27a'; ctx.fillRect(px - 26, top, 44, gy() - top); ink(ctx, 3); ctx.strokeRect(px - 26, top, 44, gy() - top);
      ink(ctx, 1.5);
      for (let y = top + 10; y < gy(); y += 10){ ctx.beginPath(); ctx.moveTo(px - 26, y); ctx.lineTo(px + 18, y); ctx.stroke(); }
      ctx.save(); ctx.translate(px - 34, (top + gy())/2); ctx.rotate(-Math.PI/2);
      ctx.font = `700 11px ${FONT_UI}`; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(`${fmt(h0, 1)} m`, 0, 0); ctx.restore();
    }
    // barrel
    ctx.save(); ctx.translate(px, py); ctx.rotate(-ang);
    const recoil = cur && cur.t < .25 && !cur.landed ? -6*(1 - cur.t/.25) : 0;
    ctx.beginPath(); ctx.roundRect(recoil - 4, -9, 46, 18, 6); ctx.fillStyle = '#5b6573'; ctx.fill(); ink(ctx, 3); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(recoil + 36, -11, 10, 22, 4); ctx.fillStyle = '#7b8594'; ctx.fill(); ink(ctx, 2.5); ctx.stroke();
    ctx.restore();
    // body with a face
    ctx.beginPath(); ctx.arc(px, py + 2, 14, 0, 6.283); ctx.fillStyle = '#ffbf69'; ctx.fill(); ink(ctx, 3); ctx.stroke();
    for (const d of [-5, 5]){ ctx.beginPath(); ctx.arc(px + d, py - 1, 3, 0, 6.283); ctx.fillStyle = '#fff'; ctx.fill(); ink(ctx, 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(px + d + 1, py - 1, 1.4, 0, 6.283); ctx.fillStyle = INK; ctx.fill(); }
    ink(ctx, 1.8); ctx.beginPath(); ctx.arc(px, py + 4, 4, .2, Math.PI - .2); ctx.stroke();
    // wheel
    ctx.beginPath(); ctx.arc(px - 2, py + 12, 7, 0, 6.283); ctx.fillStyle = '#8b5a2b'; ctx.fill(); ink(ctx, 2.5); ctx.stroke();
  }

  function drawBall(){
    if (!cur) return;
    const p = sampleAt(cur.sim, cur.t);
    if (cur.t < .015 && !cur.landed) return;
    const X = sx(p.x), Y = sy(p.y) - 8, r = 9;
    const squash = cur.landed ? .8 : 1;
    ctx.save(); ctx.translate(X, Y + (cur.landed ? 2 : 0)); ctx.scale(1/squash, squash);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fillStyle = params && cur.params.obj.col || '#fff'; ctx.fill(); ink(ctx, 3); ctx.stroke();
    const a = Math.atan2(-p.vy, p.vx), lx = Math.cos(a)*1.4, ly = Math.sin(a)*1.4;
    for (const d of [-3.5, 3.5]){ ctx.beginPath(); ctx.arc(d, -2, 2.6, 0, 6.283); ctx.fillStyle = '#fff'; ctx.fill(); ink(ctx, 1.2); ctx.stroke(); ctx.beginPath(); ctx.arc(d + lx, -2 + ly, 1.2, 0, 6.283); ctx.fillStyle = INK; ctx.fill(); }
    ctx.restore();
    if (opts.vectors && !cur.landed){
      const k = Math.min(2.4, 70/Math.max(cur.params.v0, 1));
      arrow(ctx, X, Y, X + p.vx*k, Y, '#ff5a5a');
      arrow(ctx, X, Y, X, Y - p.vy*k, '#3fa9ff');
      arrow(ctx, X, Y, X + p.vx*k, Y - p.vy*k, '#b07bff', 3);
      ctx.font = `700 11px ${FONT_UI}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      label(`vx ${fmt(p.vx, 1)}`, X + p.vx*k + 6, Y, '#ff5a5a');
      label(`vy ${fmt(p.vy, 1)}`, X + 6, Y - p.vy*k - (p.vy >= 0 ? 6 : -6), '#3fa9ff');
    }
  }

  function label(text, x, y, col){
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#fff'; ctx.strokeText(text, x, y); ctx.fillStyle = col === '#3fa9ff' ? '#1b6fb8' : col === '#ff5a5a' ? '#c12f2f' : INK; ctx.fillText(text, x, y);
  }

  function drawPeak(){
    if (!cur || cur.t < cur.sim.peak.t || cur.sim.peak.t <= 0.02) return;
    const pk = cur.sim.peak, X = sx(pk.x), Y = sy(pk.y) - 8;
    star(ctx, X, Y - 16, 7, '#ffd23f', clock);
    ctx.font = `700 11px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    label(`puncak ${fmt(pk.y, 1)} m`, X, Y - 26, INK);
  }

  function drawAim(){
    if (!aim) return;
    const px = ox(), py = sy(params?.h0 || 0);
    ctx.save(); ctx.setLineDash([6, 6]); ink(ctx, 2.5); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(aim.x, aim.y); ctx.stroke(); ctx.restore();
    ctx.font = `700 13px ${FONT_UI}`; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    label(`${Math.round(params.angle)}° · ${Math.round(params.v0)} m/s`, aim.x + 8, aim.y - 6, INK);
  }

  function drawFx(){
    for (const p of parts){
      const k = p.t/p.life, X = sx(p.x), Y = sy(p.y);
      if (p.k === 'cloud') cloud(ctx, X, Y - 6, p.sz*(1 + k*.6), '#f4f1ea', 1 - k);
      if (p.k === 'star') star(ctx, X, Y, p.sz*(1 - k*.3), p.col, p.rot + k*6);
    }
    for (const w of words){
      const k = w.t/w.life, a = k > .7 ? 1 - (k - .7)/.3 : 1;
      const pop = w.t < .16 ? easeOutBack(w.t/.16) : 1;
      let X, Y;
      if (w.x === 'cannon'){ X = ox() + 40; Y = sy(params?.h0 || 0) - 40; }
      else { X = Math.min(W - 60, Math.max(60, sx(w.wx))); Y = gy() - 58; }
      ctx.save(); ctx.globalAlpha = Math.max(0, a); comicWord(ctx, w.text, X, Y, w.size, w.col, FONT_COMIC, -.1, pop); ctx.restore();
    }
  }

  function drawHud(){
    if (cur && !cur.landed && cur.rate !== 1){
      ctx.font = `700 12px ${FONT_UI}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      label(cur.rate > 1 ? `⏩ dipercepat ×${fmt(cur.rate, 1)}` : `🐢 gerak lambat ×${fmt(cur.rate, 2)}`, 10, 10, INK);
    }
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    trails.forEach(tr => { drawPath(tr.sim, tr.col, Infinity, true, .75); flag(tr.sim.range, tr.label, tr.col); });
    if (opts.preview && preview && (!cur || cur.landed)) drawPath(preview, INK, Infinity, true, .45);
    drawTarget();
    if (cur){ drawPath(cur.sim, cur.col, cur.t, false, 1); if (cur.landed) flag(cur.sim.range, `${cur.label} · ${fmt(cur.sim.range, 1)} m`, cur.col); }
    drawTowerAndCannon();
    drawPeak();
    drawBall();
    drawAim();
    drawFx();
    drawHud();
  }

  let last = performance.now();
  function frame(now){
    const dt = Math.min(.05, (now - last)/1000); last = now;
    step(dt); draw();
    if (alive) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // ---------- aiming by dragging from the cannon ----------
  function aimAt(clientX, clientY){
    const r = cv.getBoundingClientRect();
    const x = clientX - r.left, y = clientY - r.top;
    const dx = x - ox(), dy = sy(params?.h0 || 0) - y;
    const angle = Math.max(0, Math.min(90, Math.round(Math.atan2(dy, dx)*180/Math.PI)));
    const v0 = Math.max(5, Math.min(50, Math.round(Math.hypot(dx, dy)/(W*.6)*50)));
    aim = {x, y};
    onAim?.({angle, v0});
  }
  const nearCannon = (clientX, clientY) => {
    const r = cv.getBoundingClientRect();
    return Math.hypot(clientX - r.left - ox(), clientY - r.top - sy(params?.h0 || 0)) < 90;
  };
  const md = e => { if (e.button) return; aimAt(e.clientX, e.clientY);
    const mm = ev => aimAt(ev.clientX, ev.clientY);
    const mu = () => { aim = null; document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu); };
  let touching = false;
  const ts = e => { const t = e.touches[0]; if (!nearCannon(t.clientX, t.clientY)) return; e.preventDefault(); touching = true; aimAt(t.clientX, t.clientY); };
  const tm = e => { if (!touching) return; e.preventDefault(); const t = e.touches[0]; aimAt(t.clientX, t.clientY); };
  const te = () => { touching = false; aim = null; };
  cv.addEventListener('mousedown', md);
  cv.addEventListener('touchstart', ts, {passive:false});
  cv.addEventListener('touchmove', tm, {passive:false});
  cv.addEventListener('touchend', te); cv.addEventListener('touchcancel', te);

  return {
    resize, setParams, fire,
    setOptions(o){ opts = {...opts, ...o}; },
    setTarget(x){ target = x == null ? null : {x, hit:false}; fit(false); },
    clearTrails(){ trails = []; cur = null; parts = []; words = []; fit(false); },
    destroy(){
      alive = false; cancelAnimationFrame(raf);
      cv.removeEventListener('mousedown', md); cv.removeEventListener('touchstart', ts); cv.removeEventListener('touchmove', tm);
      cv.removeEventListener('touchend', te); cv.removeEventListener('touchcancel', te);
    },
  };
}
