'use client';
import { useEffect, useRef } from 'react';
import { sampleAt, fmt } from '@/lib/fisika/projectile';
import { INK } from '@/lib/shared/color';

/**
 * Small live chart of one launch.
 * kind 'y': height vs time.  kind 'v': vx and vy vs time.
 */
export default function MiniChart({ sim, t, kind, font }){
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = cv.clientWidth || 300, H = 150, dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = W*dpr; cv.height = H*dpr; const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const L = 38, R = 10, T = 12, B = 26, pw = W - L - R, ph = H - T - B;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.font = `600 10px ${font}`; ctx.fillStyle = '#7a6f8c';
    if (!sim){ ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Tembak dulu untuk melihat grafik', W/2, H/2); return; }
    const pts = sim.pts, Tm = sim.tFlight || 1;
    let lo, hi;
    if (kind === 'y'){ lo = 0; hi = Math.max(1, sim.maxH); }
    else { const vs = pts.flatMap(p => [p.vx, p.vy]); lo = Math.min(0, ...vs); hi = Math.max(1, ...vs); }
    const X = tt => L + tt/Tm*pw, Y = v => T + (1 - (v - lo)/(hi - lo || 1))*ph;
    // grid + axes
    ctx.strokeStyle = '#eee6d6'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++){ const y = T + ph*i/4; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + pw, y); ctx.stroke(); }
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();
    if (lo < 0){ ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(L, Y(0)); ctx.lineTo(L + pw, Y(0)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(hi, 0), L - 5, T); ctx.fillText(fmt(lo, 0), L - 5, T + ph);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('0', L, T + ph + 5); ctx.fillText(`${fmt(Tm, 1)} s`, L + pw, T + ph + 5); ctx.fillText('waktu (s)', L + pw/2, T + ph + 9);
    const series = kind === 'y' ? [['y', '#ff4fa8']] : [['vx', '#ff5a5a'], ['vy', '#3fa9ff']];
    for (const [key, col] of series){
      for (const [alpha, upto] of [[.25, Tm], [1, t]]){
        ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath();
        let started = false;
        for (const p of pts){ if (p.t > upto) break; const x = X(p.t), y = Y(p[key]); started ? ctx.lineTo(x, y) : (ctx.moveTo(x, y), started = true); }
        if (upto < Tm){ const q = sampleAt(sim, upto); ctx.lineTo(X(upto), Y(q[key])); }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      const q = sampleAt(sim, Math.min(t, Tm));
      ctx.beginPath(); ctx.arc(X(Math.min(t, Tm)), Y(q[key]), 4.5, 0, 6.283); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    }
    // legend
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = `700 11px ${font}`;
    let lx = L + 8;
    for (const [key, col] of series){ ctx.fillStyle = col; ctx.fillRect(lx, T + 2, 10, 10); ctx.fillStyle = INK; ctx.fillText(key === 'y' ? 'tinggi (m)' : `${key} (m/s)`, lx + 14, T + 1); lx += 74; }
  }, [sim, t, kind, font]);
  return <canvas ref={ref} style={{ width:'100%', height:150, display:'block', borderRadius:12, border:'2.5px solid var(--ink)' }} />;
}
