// Projectile motion: numeric simulation (with optional quadratic air drag) and textbook formulas.
import { AIR_DENSITY, SPHERE_CD } from '@/data/fisika/presets';

const rad = d => d*Math.PI/180;

/** Drag constant k in F = k·v² for a sphere. */
export const dragK = obj => 0.5*AIR_DENSITY*SPHERE_CD*Math.PI*obj.r*obj.r;

/**
 * Simulate a launch. Returns sampled points plus summary numbers.
 * @param {{v0:number, angle:number, g:number, h0:number, air:boolean, obj:{mass:number,r:number}}} p
 */
export function simulate(p){
  if (!p.air) return exact(p);
  const k = p.air ? dragK(p.obj)/p.obj.mass : 0;   // drag acceleration per v²
  const dt = 1/600;
  let t = 0, x = 0, y = p.h0, vx = p.v0*Math.cos(rad(p.angle)), vy = p.v0*Math.sin(rad(p.angle));
  const pts = [{t, x, y, vx, vy}];
  let peak = {t, x, y};
  let step = 0;
  while (t < 120){
    // semi-implicit Euler is plenty accurate at this step size for a classroom sim
    const v = Math.hypot(vx, vy);
    vx += (-k*v*vx)*dt;
    vy += (-p.g - k*v*vy)*dt;
    const nx = x + vx*dt, ny = y + vy*dt;
    t += dt; step++;
    if (ny > peak.y) peak = {t, x:nx, y:ny};
    if (ny <= 0 && t > 0){
      // interpolate to the exact ground crossing
      const f = y/(y - ny);
      const land = {t:t - dt + f*dt, x:x + (nx - x)*f, y:0, vx, vy};
      pts.push(land);
      return {pts, range:land.x, maxH:peak.y, tFlight:land.t, peak, impact:Math.hypot(vx, vy)};
    }
    x = nx; y = ny;
    if (step % 10 === 0) pts.push({t, x, y, vx, vy});
  }
  const last = pts[pts.length - 1];
  return {pts, range:last.x, maxH:peak.y, tFlight:last.t, peak, impact:Math.hypot(last.vx, last.vy)};
}

// Without air the motion has a closed form, so sample it exactly (numbers match the formulas to the last digit).
function exact(p){
  const f = formulas(p), pts = [];
  const n = Math.max(40, Math.ceil(f.T*60));
  for (let i = 0; i <= n; i++){
    const t = f.T*i/n;
    pts.push({t, x:f.vx*t, y:i === n ? 0 : p.h0 + f.vy0*t - 0.5*p.g*t*t, vx:f.vx, vy:f.vy0 - p.g*t});
  }
  const tp = Math.max(0, f.tPeak);
  const peak = {t:tp, x:f.vx*tp, y:f.H};
  const last = pts[n];
  return {pts, range:f.R, maxH:f.H, tFlight:f.T, peak, impact:Math.hypot(last.vx, last.vy)};
}

/** Textbook (no air resistance) results, valid for any launch height. */
export function formulas({v0, angle, g, h0}){
  const s = Math.sin(rad(angle)), c = Math.cos(rad(angle));
  const vy = v0*s;
  const T = (vy + Math.sqrt(vy*vy + 2*g*h0))/g;
  return {
    T, R:v0*c*T, H:h0 + vy*vy/(2*g),
    tPeak:vy/g, vx:v0*c, vy0:vy,
  };
}

/** Linear interpolation of the sampled path at time t. */
export function sampleAt(sim, t){
  const pts = sim.pts;
  if (t <= 0) return pts[0];
  if (t >= sim.tFlight) return pts[pts.length - 1];
  let lo = 0, hi = pts.length - 1;
  while (hi - lo > 1){ const m = (lo + hi) >> 1; if (pts[m].t <= t) lo = m; else hi = m; }
  const a = pts[lo], b = pts[hi], f = (t - a.t)/((b.t - a.t) || 1);
  return {t, x:a.x + (b.x - a.x)*f, y:a.y + (b.y - a.y)*f, vx:a.vx + (b.vx - a.vx)*f, vy:a.vy + (b.vy - a.vy)*f};
}

export const fmt = (n, d = 1) => (Math.round(n*10**d)/10**d).toFixed(d).replace('.', ',');
