// "Wah, ternyata…" moments: compare the newest shot with earlier ones and explain what changed.
import { fmt } from '@/lib/fisika/projectile';

const same = (a, b, keys) => keys.every(k => (typeof a[k] === 'number' ? Math.abs(a[k] - b[k]) < 1e-6 : a[k] === b[k]));

export function insightsFor(shots){
  if (!shots.length) return [];
  const last = shots[shots.length - 1], prev = shots.slice(0, -1).reverse();
  const out = [];

  // complementary angles (e.g. 30° & 60°) land in the same spot when launched from the ground without air
  if (!last.air && last.h0 === 0){
    const twin = prev.find(s => !s.air && s.h0 === 0 && same(s, last, ['v0', 'g']) && Math.abs(s.angle + last.angle - 90) < 0.5 && s.angle !== last.angle);
    if (twin) out.push({ icon:'🤯', text:`${twin.angle}° dan ${last.angle}° mendarat di titik yang sama (±${fmt(last.range, 1)} m)! Sudut yang jumlahnya 90° selalu menghasilkan jarak sama, karena rumusnya memakai sin 2θ dan sin(2×${twin.angle}°) = sin(2×${last.angle}°).` });
    const group = shots.filter(s => !s.air && s.h0 === 0 && same(s, last, ['v0', 'g']));
    const angles = new Set(group.map(s => s.angle));
    if (angles.size >= 3 && angles.has(45)){
      const best = group.reduce((a, b) => (b.range > a.range ? b : a));
      if (best.angle === 45) out.push({ icon:'🏆', text:'Dari semua sudut yang kamu coba, 45° paling jauh. Tanpa hambatan udara dan dari tanah datar, 45° memang selalu juara karena sin 2θ maksimal (=1) saat θ = 45°.' });
    }
  }
  // gravity comparison
  const otherG = prev.find(s => s.g !== last.g && same(s, last, ['v0', 'angle', 'h0', 'air']) && !s.air);
  if (otherG && !last.air && last.h0 === 0){
    const ratio = last.range/otherG.range;
    const cmp = ratio >= 1 ? `${fmt(ratio, 1)}× lebih jauh` : `${fmt(1/ratio, 1)}× lebih pendek`;
    out.push({ icon:'🪐', text:`Di ${last.worldName} (g = ${fmt(last.g, 2)}) bolanya terbang ${cmp} daripada di ${otherG.worldName} (g = ${fmt(otherG.g, 2)}). Jarak berbanding terbalik dengan g: gravitasi makin kuat, bola makin cepat jatuh.` });
  }
  // air resistance on/off
  const twinAir = prev.find(s => s.air !== last.air && same(s, last, ['v0', 'angle', 'h0', 'g', 'objId']));
  if (twinAir){
    const [withAir, noAir] = last.air ? [last, twinAir] : [twinAir, last];
    const pct = (1 - withAir.range/noAir.range)*100;
    out.push({ icon:'💨', text:`Hambatan udara memotong jarak ${withAir.objName.toLowerCase()} sebanyak ${fmt(pct, 0)}% (${fmt(noAir.range, 1)} m → ${fmt(withAir.range, 1)} m). Lintasannya juga jadi tidak simetris: turunnya lebih curam dari naiknya.` });
  }
  // mass only matters with air
  const otherObj = prev.find(s => s.objId !== last.objId && same(s, last, ['v0', 'angle', 'h0', 'g', 'air']));
  if (otherObj){
    if (!last.air) out.push({ icon:'⚖️', text:`${otherObj.objName} dan ${last.objName.toLowerCase()} mendarat di jarak yang sama persis. Tanpa udara, massa tidak berpengaruh: semua benda jatuh dengan percepatan g yang sama (seperti percobaan Galileo).` });
    else out.push({ icon:'🎳', text:`Dengan udara, ${last.range > otherObj.range ? last.objName.toLowerCase() : otherObj.objName.toLowerCase()} terbang lebih jauh. Benda yang berat dan kecil lebih sedikit terganggu hambatan udara dibanding benda ringan yang besar.` });
  }
  return out;
}
