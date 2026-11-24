// Cartoon drawing helpers shared by every lab canvas (thick ink outlines, comic words, clouds, stars).
import { INK } from '@/lib/shared/color';

export function ink(ctx, lw){ ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }

// Fading is done by shrinking, not transparency, so the inner outlines never show through.
export function cloud(ctx, x, y, s, col = '#ffffff', a = 1){
  if (a <= 0) return;
  s *= a < .35 ? a/.35 : 1;
  ctx.save();
  const blobs = [[0,0,1],[-.8,.25,.7],[.8,.25,.72],[-.35,-.45,.68],[.4,-.4,.6]];
  ctx.beginPath();
  for (const [ox, oy, r] of blobs){ ctx.moveTo(x + ox*s + r*s, y + oy*s); ctx.arc(x + ox*s, y + oy*s, r*s, 0, 6.283); }
  ink(ctx, 2.5); ctx.stroke(); ctx.fillStyle = col; ctx.fill();
  ctx.restore();
}

export function star(ctx, x, y, s, col, rot = 0){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++){ const r = i % 2 ? s*.38 : s, a = i*Math.PI/4; ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ink(ctx, 1.8); ctx.stroke();
  ctx.restore();
}

/** Comic onomatopoeia ("BUK!", "TEPAT!") with a hard drop shadow. */
export function comicWord(ctx, text, x, y, size, col, font, rot = -.1, scale = 1){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
  ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(4, size*.22); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.strokeText(text, 3, 4); ctx.fillStyle = INK; ctx.fillText(text, 3, 4);
  ctx.strokeText(text, 0, 0); ctx.fillStyle = col; ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** Arrow with a cartoon outline, used for velocity / force vectors. */
export function arrow(ctx, x1, y1, x2, y2, col, w = 4){
  const L = Math.hypot(x2 - x1, y2 - y1); if (L < 4) return;
  const a = Math.atan2(y2 - y1, x2 - x1), hl = Math.min(12, L*.45);
  ctx.save(); ctx.lineCap = 'round';
  for (const [lw, c] of [[w + 3, INK], [w, col]]){
    ctx.strokeStyle = c; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a)*hl*.6, y2 - Math.sin(a)*hl*.6); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - .45)*hl, y2 - Math.sin(a - .45)*hl);
  ctx.lineTo(x2 - Math.cos(a + .45)*hl, y2 - Math.sin(a + .45)*hl); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ink(ctx, 2); ctx.stroke();
  ctx.restore();
}

export const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3*Math.pow(x - 1, 3) + c1*Math.pow(x - 1, 2); };
