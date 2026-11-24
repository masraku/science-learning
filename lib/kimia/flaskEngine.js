// Cartoon reaction flask: a self-contained canvas engine (tokens, physics, cartoon FX).
// React mounts it once and talks to it through add() / clear() / onEvent.
import { resolve, itemLabel, itemColor, registerCompound } from '@/lib/kimia/reactionEngine';
import { INK, rgba, mix } from '@/lib/shared/color';

const rnd = (a, b) => a + Math.random()*(b-a);
const pub = t => ({label:t.label, col:t.col, item:t.item});

/**
 * @param {HTMLCanvasElement} cv
 * @param {{onEvent:(e:object)=>void, initialH?:number, fonts?:{ui:string, comic:string}}} opts
 *   events: {type:'added', item} | {type:'cleared'} | {type:'none', a, b, kept, msg} | {type:'result', r, a, b}
 */
export function createFlask(cv, {onEvent, initialH, fonts = {}}){
  const FONT_UI = fonts.ui || 'Fredoka, sans-serif';
  const FONT_COMIC = fonts.comic || 'Bangers, sans-serif';
    const ctx = cv.getContext('2d');
    const W = 360; let H = 160;
    function resize(h){
      H = h; cv.style.aspectRatio = `${W}/${H}`;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(initialH || 160);
  const CX = () => W/2, CY = () => H*0.56, BR = () => H*0.4, TR = () => H*0.125;
  let tokens = [], phase = 'idle', phaseT = 0, pending = null, stale = false;
  let parts = [], fxs = [], flash = 0, shake = 0, liquid = '#bfe9ff', liquidTo = null;
  let raf = 0, alive = true;

  function mkToken(item){
    const a = rnd(-.8, .8);
    return {item, label:itemLabel(item), col:itemColor(item), x:CX()+Math.sin(a)*BR()*.4, y:CY()-BR()*1.5, vx:rnd(-30,30), vy:120, r:TR(), scale:0, morph:null, mood:'happy', moodT:0, blink:rnd(1,4)};
  }
  function addToChamber(item){
    if (phase === 'merging') return;
    tokens = tokens.filter(t => t.leaving === undefined);
    if (tokens.length >= 2 || stale){ tokens = []; stale = false; liquidTo = '#bfe9ff'; }
    fxs = fxs.filter(f => f.k !== 'text');
    tokens.push(mkToken(item));
    parts.push({k:'splash', x:CX(), y:CY()-BR()*.1, t:0, life:.5});
    if (tokens.length === 2){ fxs = []; phase = 'merging'; phaseT = 0; pending = resolve(tokens[0].item, tokens[1].item); tokens.forEach(t => t.mood = 'wow'); }
    else onEvent({type:'added', item});
  }
  function clearChamber(silent){ tokens = []; phase = 'idle'; stale = false; parts = []; fxs = []; liquid = '#bfe9ff'; liquidTo = null; if (!silent) onEvent({type:'cleared'}); }

  function react(){
    const r = pending; pending = null;
    const [a, b] = tokens;
    if (r.none){
      a.vx = -170; b.vx = 170; a.vy = -60; b.vy = -60; a.mood = b.mood = 'meh'; a.moodT = b.moodT = 2.5; phase = 'idle';
      if (a.keep){ stale = false; b.leaving = 1.1; } else stale = true;
      fxs.push({k:'text', str:'BOING!', t:0, dur:1.2, col:'#8ecbff', size:30});
      onEvent({type:'none', a:pub(a), b:pub(b), kept:!!a.keep, msg:r.msg});
      return;
    }
    const p = r.product;
    const tok = {item:{t:'cmp', id:p.id, f:p.f, name:p.name, col:p.col}, label:p.f, col:p.col, x:CX(), y:CY(), vx:0, vy:-40, r:TR()*1.18, scale:0, morph:null, mood:'happy', moodT:0, blink:2};
    if (r.fx.includes('rust')){ tok.morph = {from:a.col, to:p.col, t:0, dur:2.6}; tok.scale = 1; }
    if (r.fx.includes('explode') || r.fx.includes('bigboom')){ tok.mood = 'dizzy'; tok.moodT = 2.2; }
    else { tok.mood = 'yay'; tok.moodT = 1.6; }
    tok.keep = true; tokens = [tok]; phase = 'idle'; stale = false;
    liquidTo = mix('#bfe9ff', p.col, .35);
    runFx(r);
    registerCompound(p);
    onEvent({type:'result', r, a:pub(a), b:pub(b)});
  }

  // =================== CARTOON FX ===================
  const WORD = {explode:'DUAR!', bigboom:'DUAAARR!!', fire:'WUSSH!', flash:'SILAU!', spark:'CRETEK!', smoke:'PUFF!', gas:'FSSS…', fizz:'CESSS!', glow:'MEMBARA!', color:'TADA!', molecule:'KLIK!', alloy:'CLING!'};
  const WORD_COL = {explode:'#ffd23f', bigboom:'#ffd23f', fire:'#ff8a3d', flash:'#fff176', spark:'#ffd23f', smoke:'#e8e8f0', gas:'#d9f2ff', fizz:'#bfe9ff', glow:'#ff8a3d', color:'#ff9de2', molecule:'#8ecbff', alloy:'#e6edf3'};
  function runFx(r){
    const flameCol = r.flame || '#ff8a3d';
    const words = r.fx.filter(f => WORD[f]);
    if (words.length && !r.fx.includes('pop')) fxs.push({k:'text', str:WORD[words[0]], t:0, dur:1.4, col:WORD_COL[words[0]], size: words[0]==='bigboom' ? 44 : 36, delay: 0});
    for (const f of r.fx){
      if (f === 'explode' || f === 'bigboom'){
        const big = f === 'bigboom' ? 1.45 : 1;
        flash = .85; shake = 1.1*big;
        fxs.push({k:'burst', t:0, dur:.95, R:H*.62*big, spikes:14});
        parts.push({k:'ring', x:CX(), y:CY(), r:12, vr:420*big, t:0, life:.45});
        for (let i = 0; i < 22*big; i++){ const a = Math.random()*6.283, s = rnd(160, 380)*big; parts.push({k:'debris', x:CX(), y:CY(), vx:Math.cos(a)*s, vy:Math.sin(a)*s-60, rot:rnd(0,6), vr:rnd(-12,12), t:0, life:rnd(.7,1.2), sz:rnd(4,8), col:['#ffd23f','#ff8a3d','#ff4f4f','#ffffff'][i%4]}); }
        for (let i = 0; i < 7*big; i++) parts.push({k:'cloud', x:CX()+rnd(-40,40)*big, y:CY()+rnd(-20,20), vx:rnd(-40,40), vy:rnd(-55,-20), t:-.25, life:rnd(1.3,1.9), sz:rnd(14,22)*big, col:'#f2f0f7'});
      }
      if (f === 'pop'){ fxs.push({k:'later', t:0, dur:.9, run:() => { flash = .5; shake = .6; fxs.push({k:'burst', t:0, dur:.6, R:H*.38, spikes:10}); fxs.push({k:'text', str:'POP!', t:0, dur:1.1, col:'#ffd23f', size:34}); for (let i = 0; i < 10; i++){ const a = Math.random()*6.283; parts.push({k:'debris', x:CX(), y:CY(), vx:Math.cos(a)*220, vy:Math.sin(a)*220-60, rot:0, vr:rnd(-10,10), t:0, life:.8, sz:rnd(3,6), col:'#ffd23f'}); } }}); }
      if (f === 'fire'){ fxs.push({k:'flame', t:0, dur:2.1, col:flameCol}); fxs.push({k:'emit', t:0, dur:2, rate:14, make:() => ({k:'ember', x:CX()+rnd(-30,30), y:CY()+rnd(-10,10), vx:rnd(-20,20), vy:rnd(-120,-70), t:0, life:rnd(.5,.9), sz:rnd(2,3.5), col:flameCol})}); }
      if (f === 'flash'){ flash = 1; fxs.push({k:'rays', t:0, dur:1.3, col:'#fff176', n:16, hold:true}); fxs.push({k:'flashHold', t:0, dur:1}); }
      if (f === 'spark') fxs.push({k:'emit', t:0, dur:1.3, rate:26, make:() => { const a = rnd(-Math.PI*.95, -Math.PI*.05), s = rnd(150,300); return {k:'star', x:CX(), y:CY(), vx:Math.cos(a)*s, vy:Math.sin(a)*s, t:0, life:rnd(.4,.8), sz:rnd(4,7), col:Math.random()<.5 ? '#ffd23f' : '#fff6a8', grav:true}; }});
      if (f === 'smoke') fxs.push({k:'emit', t:0, dur:2.2, rate:7, delay:.15, make:() => ({k:'cloud', x:CX()+rnd(-28,28), y:CY()+rnd(-10,8), vx:rnd(-20,20), vy:rnd(-50,-22), t:0, life:rnd(1.4,2.2), sz:rnd(10,16), col:r.smoke || '#efeff5'})});
      if (f === 'gas'){ fxs.push({k:'emit', t:0, dur:2, rate:14, make:() => bubble()}); fxs.push({k:'emit', t:0, dur:2, rate:5, make:() => ({k:'cloud', x:CX()+rnd(-30,30), y:CY()-BR()*.4, vx:rnd(-15,15), vy:rnd(-40,-18), t:0, life:rnd(1.5,2.3), sz:rnd(12,18), col:r.gas || '#e8f4ff'})}); }
      if (f === 'fizz') fxs.push({k:'emit', t:0, dur:2.4, rate:26, make:() => bubble()});
      if (f === 'glow') fxs.push({k:'rays', t:0, dur:2.6, col:r.glow || flameCol, n:12});
      if (f === 'color' || f === 'molecule') fxs.push({k:'emit', t:0, dur:1.1, rate:18, make:() => sparkle('#ffffff')});
      if (f === 'alloy'){ fxs.push({k:'emit', t:0, dur:1.5, rate:20, make:() => sparkle('#fff6a8')}); fxs.push({k:'rays', t:0, dur:1.4, col:'#e6edf3', n:10}); }
      if (f === 'rust') fxs.push({k:'text', str:'⏩ dipercepat', t:0, dur:2.6, col:'#ffe0b3', size:15, small:true});
    }
  }
  function bubble(){ return {k:'bubble', x:CX()+rnd(-BR()*.6, BR()*.6), y:CY()+BR()*.75, vx:0, vy:rnd(-80,-40), t:0, life:rnd(.8,1.5), sz:rnd(3,6.5), w:Math.random()*6}; }
  function sparkle(col){ const a = Math.random()*6.283, d = rnd(TR()*1.2, TR()*2.6); return {k:'star', x:CX()+Math.cos(a)*d, y:CY()+Math.sin(a)*d, vx:0, vy:-10, t:0, life:rnd(.5,.9), sz:rnd(5,8), col}; }
  function stepFx(dt){
    for (const f of fxs){
      f.t += dt;
      if (f.delay && f.t < f.delay) continue;
      if (f.k === 'emit'){ f.acc = (f.acc||0) + f.rate*dt; while (f.acc >= 1){ f.acc -= 1; parts.push(f.make()); } }
      if (f.k === 'flashHold' && f.t < f.dur) flash = Math.max(flash, .55 + Math.random()*.15);
      if (f.k === 'later' && f.t >= f.dur && !f.done){ f.done = true; f.run(); }
    }
    fxs = fxs.filter(f => f.t < f.dur + (f.delay||0) || (f.k === 'later' && !f.done));
    for (const p of parts){
      p.t += dt; if (p.t < 0) continue;
      if (p.k === 'debris'){ p.vy += 420*dt; p.rot += p.vr*dt; }
      if (p.k === 'star' && p.grav) p.vy += 300*dt;
      if (p.k === 'cloud'){ p.sz += 10*dt; p.vx *= (1-.8*dt); }
      if (p.k === 'bubble') p.w += dt*6;
      if (p.k === 'ring') p.r += p.vr*dt;
      p.x += (p.vx||0)*dt; p.y += (p.vy||0)*dt;
    }
    parts = parts.filter(p => p.t < p.life);
    flash = Math.max(0, flash - dt*2.6); shake = Math.max(0, shake - dt*2.4);
    if (liquidTo){ liquid = mix(liquid, liquidTo, Math.min(1, dt*2)); }
  }

  // =================== RENDER ===================
  let last = performance.now(), clock = 0;
  function frame(now){
    const dt = Math.min(.05, (now-last)/1000); last = now; clock += dt;
    const cx = CX(), cy = CY(), br = BR();
    tokens = tokens.filter(t => !(t.leaving !== undefined && t.leaving <= 0));
    for (const t of tokens){
      if (t.leaving !== undefined){ t.leaving -= dt; if (t.leaving < .35) t.scale = Math.max(0, t.leaving/.35); }
      else t.scale = Math.min(1, t.scale + dt*3.5);
      t.r += (( t.item.t === 'cmp' && tokens.length === 1 ? TR()*1.18 : TR()) - t.r)*Math.min(1, dt*4);
      if (t.moodT > 0){ t.moodT -= dt; if (t.moodT <= 0 && t.mood !== 'wow') t.mood = 'happy'; }
      t.blink -= dt; if (t.blink < -.12) t.blink = rnd(2,5);
      if (phase === 'merging'){
        t.x += (cx - t.x)*Math.min(1, dt*6); t.y += (cy - t.y)*Math.min(1, dt*6);
      } else {
        // float on the liquid: soft spring toward the surface line
        const surf = cy + br*.05;
        t.vy += (surf - t.y)*3*dt; t.vx *= (1-1.4*dt); t.vy *= (1-1.6*dt);
        t.vx += Math.sin(clock*1.3 + t.r*3)*6*dt;
        t.x += t.vx*dt; t.y += t.vy*dt;
        const dx = t.x-cx, dy = t.y-cy, d = Math.hypot(dx,dy), lim = br - t.r - 3;
        if (d > lim){ const nx = dx/d, ny = dy/d; t.x = cx+nx*lim; t.y = cy+ny*lim; const dot = t.vx*nx+t.vy*ny; t.vx -= 1.7*dot*nx; t.vy -= 1.7*dot*ny; }
      }
      if (t.morph){ t.morph.t += dt; const k = Math.min(1, t.morph.t/t.morph.dur); t.col = mix(t.morph.from, t.morph.to, k); if (k >= 1) t.morph = null; }
    }
    if (tokens.length === 2 && phase !== 'merging'){
      const [a,b] = tokens, dx = b.x-a.x, dy = b.y-a.y, d = Math.hypot(dx,dy)||1, min = a.r+b.r+2;
      if (d < min){ const push = (min-d)/2, nx = dx/d, ny = dy/d; a.x -= nx*push; a.y -= ny*push; b.x += nx*push; b.y += ny*push; }
    }
    if (phase === 'merging'){ phaseT += dt; if (phaseT > .6) react(); }
    stepFx(dt);
    draw();
    if (alive) raf = requestAnimationFrame(frame);
  }

  function ink(lw){ ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
  function drawCloud(x, y, s, col, a){
    ctx.save(); ctx.globalAlpha = a;
    const blobs = [[0,0,1],[-.8,.25,.7],[.8,.25,.72],[-.35,-.45,.68],[.4,-.4,.6]];
    ctx.beginPath(); for (const [ox,oy,r] of blobs){ ctx.moveTo(x+ox*s+r*s, y+oy*s); ctx.arc(x+ox*s, y+oy*s, r*s, 0, 6.283); }
    ink(2.5); ctx.stroke(); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(x-.3*s, y-.35*s, .28*s, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  function drawStar(x, y, s, col, rot=0){
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath(); for (let i = 0; i < 8; i++){ const r = i%2 ? s*.38 : s; const a = i*Math.PI/4; ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); } ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ink(1.8); ctx.stroke(); ctx.restore();
  }
  function burstPath(R, spikes, seed){
    ctx.beginPath();
    for (let i = 0; i <= spikes*2; i++){
      const a = i/(spikes*2)*Math.PI*2 + seed, r = i%2 ? R*.55 : R*(0.86 + 0.14*Math.sin(i*2.3+seed*5));
      const x = Math.cos(a)*r, y = Math.sin(a)*r; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
    }
    ctx.closePath();
  }
  function flameTongue(x, base, w, h, wob, col){
    ctx.beginPath();
    ctx.moveTo(x-w, base);
    ctx.bezierCurveTo(x-w*1.1, base-h*.45, x-w*.2+wob, base-h*.65, x+wob*1.4, base-h);
    ctx.bezierCurveTo(x+w*.35+wob, base-h*.6, x+w*1.15, base-h*.4, x+w, base);
    ctx.arc(x, base, w, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ink(2.5); ctx.stroke();
  }
  function drawFace(t, r){
    const look = tokens.length === 2 ? Math.sign((tokens[0] === t ? tokens[1].x : tokens[0].x) - t.x) : Math.sin(clock*.8)*.6;
    const ey = t.y - r*.3, ex = r*.33, er = r*.2;
    if (t.mood === 'dizzy'){
      ink(2.2); for (const s of [-1,1]){ const x0 = t.x + s*ex; ctx.beginPath(); ctx.moveTo(x0-er*.8, ey-er*.8); ctx.lineTo(x0+er*.8, ey+er*.8); ctx.moveTo(x0+er*.8, ey-er*.8); ctx.lineTo(x0-er*.8, ey+er*.8); ctx.stroke(); }
      for (let i = 0; i < 3; i++){ const a = clock*4 + i*2.09; drawStar(t.x + Math.cos(a)*r*.9, t.y - r*1.15 + Math.sin(a)*r*.25, 4, '#ffd23f', a); }
      return;
    }
    if (t.blink < 0 || t.mood === 'yay'){
      ink(2.2); for (const s of [-1,1]){ ctx.beginPath(); ctx.arc(t.x + s*ex, ey+er*.3, er*.75, Math.PI*1.1, Math.PI*1.9); ctx.stroke(); }
      return;
    }
    for (const s of [-1,1]){
      const x0 = t.x + s*ex;
      ctx.beginPath(); ctx.arc(x0, ey, er, 0, 6.283); ctx.fillStyle = '#fff'; ctx.fill(); ink(1.8); ctx.stroke();
      const pr = t.mood === 'wow' ? er*.42 : er*.55;
      ctx.beginPath(); ctx.arc(x0 + look*er*.35, ey + (t.mood === 'meh' ? er*.25 : 0), pr, 0, 6.283); ctx.fillStyle = INK; ctx.fill();
    }
    if (t.mood === 'meh'){ ink(2); ctx.beginPath(); ctx.moveTo(t.x-ex-er, ey-er*1.4); ctx.lineTo(t.x-ex+er, ey-er*1.1); ctx.moveTo(t.x+ex+er, ey-er*1.4); ctx.lineTo(t.x+ex-er, ey-er*1.1); ctx.stroke(); }
  }
  function draw(){
    ctx.save();
    ctx.clearRect(0,0,W,H);
    if (shake > 0) ctx.translate(rnd(-1,1)*shake*8, rnd(-1,1)*shake*8);
    const cx = CX(), cy = CY(), br = BR();
    // backdrop: lab wall + bench
    ctx.fillStyle = '#eaf7ff'; ctx.fillRect(-10,-10,W+20,H+20);
    ctx.fillStyle = 'rgba(63,169,255,.08)'; for (let x = -10; x < W+10; x += 24) ctx.fillRect(x, -10, 12, H+20);
    ctx.fillStyle = '#ffd9a8'; ctx.fillRect(-10, cy+br-2, W+20, H); ink(3); ctx.beginPath(); ctx.moveTo(-10, cy+br-2); ctx.lineTo(W+10, cy+br-2); ctx.stroke();
    // rays (behind flask)
    for (const f of fxs) if (f.k === 'rays'){ const k = f.t/f.dur, a = Math.sin(Math.PI*Math.min(1,k)); ctx.save(); ctx.translate(cx, cy); ctx.rotate(clock*.6); ctx.globalAlpha = .85*a;
      for (let i = 0; i < f.n; i++){ ctx.rotate(Math.PI*2/f.n); ctx.beginPath(); ctx.moveTo(0, -br*.3); ctx.lineTo(-10, -br*1.9); ctx.lineTo(10, -br*1.9); ctx.closePath(); ctx.fillStyle = i%2 ? f.col : '#ffffff'; ctx.fill(); } ctx.restore(); }
    // flask body + liquid
    const neckW = br*.5, neckTop = cy - br*1.38, ang = Math.asin((neckW/2)/br);
    const flaskPath = () => { ctx.beginPath(); ctx.moveTo(cx-neckW/2, neckTop); ctx.lineTo(cx-neckW/2, cy - Math.cos(ang)*br); ctx.arc(cx, cy, br, -Math.PI/2 - ang, -Math.PI/2 + ang, true); ctx.lineTo(cx+neckW/2, neckTop); };
    ctx.save(); flaskPath(); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill(); ctx.clip();
    const surf = cy + br*.12;
    ctx.beginPath(); ctx.moveTo(cx-br-5, surf);
    for (let x = -br-5; x <= br+5; x += 6) ctx.lineTo(cx+x, surf + Math.sin(x*.08 + clock*3)*2.2);
    ctx.lineTo(cx+br+5, cy+br+5); ctx.lineTo(cx-br-5, cy+br+5); ctx.closePath();
    ctx.fillStyle = liquid; ctx.fill(); ink(2.5); ctx.stroke();
    ctx.restore();
    // bubbles & clouds behind tokens
    for (const p of parts){ if (p.t < 0) continue; const k = p.t/p.life;
      if (p.k === 'bubble'){ ctx.beginPath(); ctx.arc(p.x + Math.sin(p.w)*2, p.y, p.sz, 0, 6.283); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill(); ink(1.8); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x + Math.sin(p.w)*2 - p.sz*.35, p.y - p.sz*.35, p.sz*.25, 0, 6.283); ctx.fill(); }
      if (p.k === 'splash'){ ink(2.5); for (const s of [-1,1]){ ctx.beginPath(); ctx.arc(p.x + s*(10+k*18), p.y - 8 - Math.sin(k*Math.PI)*14, 3.5*(1-k)+1, 0, 6.283); ctx.fillStyle = '#bfe9ff'; ctx.fill(); ctx.stroke(); } }
    }
    // flame (behind token so the token sits "in" the fire)
    for (const f of fxs) if (f.k === 'flame'){
      const k = f.t/f.dur, grow = Math.min(1, f.t*5), fade = k > .8 ? 1-(k-.8)/.2 : 1, s = grow*fade;
      if (s <= 0) continue;
      const base = cy + TR()*.6;
      const tongues = [[-1, .62], [1, .66], [0, 1]];
      for (const [o, hh] of tongues){
        const wob = Math.sin(clock*14 + o*2)*4;
        const hgt = br*1.35*hh*s*(1 + Math.sin(clock*11+o)*.08);
        flameTongue(cx + o*br*.38, base, br*.2*s + 4, hgt, wob, f.col);
        flameTongue(cx + o*br*.38, base, (br*.2*s + 4)*.55, hgt*.6, wob*.7, '#ffe680');
      }
    }
    // tokens
    for (const t of tokens){
      const r = t.r * (t.leaving !== undefined ? t.scale : t.scale < 1 ? easeOutBack(t.scale) : 1);
      if (r <= .5) continue;
      const squish = 1 + Math.sin(clock*5 + t.r)*.03;
      ctx.save(); ctx.translate(t.x, t.y); ctx.scale(1/squish, squish); ctx.translate(-t.x, -t.y);
      ctx.beginPath(); ctx.ellipse(t.x, t.y + r*.95, r*.75, r*.18, 0, 0, 6.283); ctx.fillStyle = 'rgba(43,33,64,.15)'; ctx.fill();
      ctx.beginPath(); ctx.arc(t.x, t.y, r, 0, 6.283); ctx.fillStyle = t.col; ctx.fill(); ink(3); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(t.x - r*.45, t.y - r*.5, r*.22, r*.13, -.6, 0, 6.283); ctx.fill();
      drawFace(t, r);
      ctx.fillStyle = INK; const L = t.label.length;
      ctx.font = `700 ${Math.round(r*(L <= 2 ? .62 : L <= 4 ? .5 : L <= 6 ? .4 : .33))}px ${FONT_UI}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t.label, t.x, t.y + r*.38);
      ctx.restore();
    }
    if (tokens.length === 2 && phase === 'merging' && pending?.fx?.includes('molecule')){
      ink(5); ctx.beginPath(); ctx.moveTo(tokens[0].x, tokens[0].y); ctx.lineTo(tokens[1].x, tokens[1].y); ctx.stroke();
    }
    // flask outline on top
    flaskPath(); ink(3.5); ctx.stroke();
    ink(3.5); ctx.beginPath(); ctx.ellipse(cx, neckTop, neckW/2+3, 4, 0, 0, 6.283); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, br-8, Math.PI*1.12, Math.PI*1.4); ctx.stroke();
    if (!tokens.length && !parts.length && !fxs.length){
      ctx.fillStyle = 'rgba(43,33,64,.55)'; ctx.font = `600 13px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Seret unsur ke sini 👇', cx, cy - br*.35);
    }
    // burst
    for (const f of fxs) if (f.k === 'burst'){
      const k = f.t/f.dur, s = k < .14 ? easeOutBack(k/.14) : Math.max(0, 1 - Math.max(0, k-.45)/.55);
      if (s <= 0) continue;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(f.t*.6); ctx.scale(s, s);
      burstPath(f.R, f.spikes, 0); ctx.fillStyle = '#ff4f4f'; ctx.fill(); ink(3.5/Math.max(.3,s)); ctx.stroke();
      burstPath(f.R*.72, f.spikes, .3); ctx.fillStyle = '#ff9a3c'; ctx.fill(); ink(3/Math.max(.3,s)); ctx.stroke();
      burstPath(f.R*.45, f.spikes-3, .7); ctx.fillStyle = '#ffe14d'; ctx.fill(); ink(2.5/Math.max(.3,s)); ctx.stroke();
      ctx.restore();
    }
    // particles over everything
    for (const p of parts){ if (p.t < 0) continue; const k = p.t/p.life;
      if (p.k === 'cloud') drawCloud(p.x, p.y, p.sz, p.col, Math.min(1, (1-k)*1.6));
      else if (p.k === 'debris') drawStar(p.x, p.y, p.sz*(1-k*.4), p.col, p.rot);
      else if (p.k === 'star'){ const s = p.sz*Math.sin(Math.PI*Math.min(1,k)); if (s > .5) drawStar(p.x, p.y, s, p.col, k*2); }
      else if (p.k === 'ember'){ ctx.beginPath(); ctx.arc(p.x, p.y, p.sz*(1-k), 0, 6.283); ctx.fillStyle = p.col; ctx.fill(); ink(1.5); ctx.stroke(); }
      else if (p.k === 'ring'){ ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ink(5*(1-k)+1); ctx.stroke(); }
    }
    // comic words
    for (const f of fxs) if (f.k === 'text'){
      const k = f.t/f.dur, a = k > .75 ? 1-(k-.75)/.25 : 1;
      ctx.save(); ctx.globalAlpha = Math.max(0,a); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (f.small){ ctx.font = `600 ${f.size}px ${FONT_UI}`; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText(f.str, cx, cy - br*1.15); ctx.fillStyle = f.col; ctx.fillText(f.str, cx, cy - br*1.15); }
      else {
        const pop = f.t < .18 ? easeOutBack(f.t/.18) : 1 + Math.sin(f.t*9)*.03;
        ctx.translate(cx, Math.max(f.size*.6, cy - br*.95)); ctx.rotate(-.1); ctx.scale(pop, pop);
        ctx.font = `${f.size}px ${FONT_COMIC}`;
        ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.strokeText(f.str, 3, 4);
        ctx.fillStyle = INK; ctx.fillText(f.str, 3, 4);
        ctx.lineWidth = 7; ctx.strokeText(f.str, 0, 0); ctx.fillStyle = f.col; ctx.fillText(f.str, 0, 0);
      }
      ctx.restore();
    }
    ctx.restore();
    if (flash > 0){ ctx.fillStyle = `rgba(255,255,240,${Math.min(.9, flash)})`; ctx.fillRect(0,0,W,H); }
  }
  const easeOutBack = x => { const c1 = 1.70158, c3 = c1+1; return 1 + c3*Math.pow(x-1,3) + c1*Math.pow(x-1,2); };

  raf = requestAnimationFrame(frame);
  return {
    add: addToChamber,
    clear: () => clearChamber(false),
    resize,
    destroy(){ alive = false; cancelAnimationFrame(raf); },
  };
}
