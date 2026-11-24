import { EL, CATS } from '@/data/kimia/elements';
import { STRUCT, ION } from '@/data/kimia/structures';
import { INK } from '@/lib/shared/color';

const BOND = {
  1:['–', 'ikatan tunggal', '1 pasang elektron dipakai bersama'],
  2:['=', 'ikatan rangkap dua', '2 pasang elektron dipakai bersama'],
  3:['≡', 'ikatan rangkap tiga', '3 pasang elektron dipakai bersama'],
};
const SUP = q => (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−');
const subDigits = s => s.replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
const colorOf = e => (EL[e] ? CATS[EL[e].cat].c : '#fff');

function Legend({ used, ionic }){
  return (
    <div className="legend-b">
      {[1, 2, 3].map(o => (
        <span key={o} style={{ display:'contents' }}>
          <span className={`ln ${used.has(o) ? 'on' : ''}`}>{BOND[o][0]}</span>
          <span><b>{BOND[o][1]}</b>: {BOND[o][2]}</span>
        </span>
      ))}
      <span className={`ln ${ionic ? 'on' : ''}`}>⁺⁻</span>
      <span><b>ikatan ion</b>: elektron <i>dipindahkan</i>, bukan dibagi, jadi <b>tidak pakai garis</b></span>
    </div>
  );
}

function StructSVG({ st }){
  const U = 46, R = 16, pad = 26;
  const xs = st.at.map(a => a[1]*U), ys = st.at.map(a => a[2]*U);
  const minX = Math.min(...xs) - R - pad, maxX = Math.max(...xs) + R + pad;
  const minY = Math.min(...ys) - R - pad, maxY = Math.max(...ys) + R + pad;
  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} width={Math.min(320, maxX - minX)}>
      {st.b.map(([i, j, o], k) => {
        const x1 = xs[i], y1 = ys[i], x2 = xs[j], y2 = ys[j], L = Math.hypot(x2 - x1, y2 - y1);
        const nx = -(y2 - y1)/L, ny = (x2 - x1)/L;
        const offs = o === 1 ? [0] : o === 2 ? [-3.5, 3.5] : [-6, 0, 6];
        return offs.map(d => <line key={`${k}${d}`} x1={x1 + nx*d} y1={y1 + ny*d} x2={x2 + nx*d} y2={y2 + ny*d} stroke={INK} strokeWidth="3" strokeLinecap="round" />);
      })}
      {st.at.map(([e, , , ch], i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r={R} fill={colorOf(e)} stroke={INK} strokeWidth="3" />
          <text x={xs[i]} y={ys[i] + 1} textAnchor="middle" dominantBaseline="middle" fontWeight="700" fontSize={e.length > 1 ? 13 : 15} fill={INK}>{e}</text>
          {ch && <>
            <circle cx={xs[i] + R*.85} cy={ys[i] - R*.85} r="8" fill="#fff" stroke={INK} strokeWidth="2" />
            <text x={xs[i] + R*.85} y={ys[i] - R*.85 + 1} textAnchor="middle" dominantBaseline="middle" fontWeight="700" fontSize="12" fill={INK}>{ch}</text>
          </>}
        </g>
      ))}
    </svg>
  );
}

/** "Struktur & ikatan" section: covalent structure with bond lines, ionic charges, or metallic bonding. */
export default function BondDiagram({ r, p }){
  const st = STRUCT[p.id];
  if (st){
    const counts = st.counts || st.b.reduce((m, [, , o]) => (m[o] = (m[o] || 0) + 1, m), {});
    const used = new Set(Object.keys(counts).map(Number));
    const parts = Object.entries(counts).map(([o, n]) => `${n} ${BOND[o][1]} (${BOND[o][0]})`).join(' dan ');
    return (
      <>
        <div className="sub">🔗 Struktur & ikatan</div>
        <div className="struct">{st.at && <StructSVG st={st} />}<div className="sform">{st.txt}</div></div>
        <p className="txt" style={{ marginTop:8 }}>
          Ini <b>ikatan kovalen</b>: atom-atomnya <b>berbagi</b> pasangan elektron, dan tiap pasang digambar sebagai satu garis. {p.f} punya {parts}.{st.note ? ' ' + st.note : ''}
        </p>
        <Legend used={used} ionic={false} />
      </>
    );
  }
  const ions = ION[p.id] || r.ions;
  if (ions){
    const check = ions.map(([, q, n]) => `${n}×(${q > 0 ? '+' : '−'}${Math.abs(q)})`).join(' + ') + ' = 0';
    const inner = ions.some(([e]) => e === 'OH') ? ' Di dalam ion OH⁻ sendiri ada satu ikatan kovalen tunggal O–H.'
      : ions.some(([e]) => e === 'NH4') ? ' Di dalam ion NH₄⁺ sendiri ada 4 ikatan kovalen tunggal N–H.' : '';
    return (
      <>
        <div className="sub">🔗 Struktur & ikatan</div>
        <div className="struct">
          <div className="ions">
            {ions.map(([e, q, n], i) => (
              <span key={e} style={{ display:'contents' }}>
                {i > 0 && <span className="times">+</span>}
                {n > 1 && <span className="times">{n} ×</span>}
                <span className={`ion ${q > 0 ? 'pos' : 'neg'}`} style={{ background:EL[e] ? colorOf(e) : (q > 0 ? '#ffbfbf' : '#bfe0ff') }}>
                  {subDigits(e)}<sup>{SUP(q)}</sup>
                </span>
              </span>
            ))}
          </div>
          <div className="sform" style={{ fontSize:14, fontWeight:600 }}>{check}</div>
        </div>
        <p className="txt" style={{ marginTop:8 }}>
          Ini <b>ikatan ion</b>, jadi <b>tidak digambar pakai garis</b> (–, =, ≡). Atom logam <b>melepas</b> elektron jadi ion positif, atom nonlogam <b>menangkap</b> elektron jadi ion negatif, lalu keduanya saling tarik seperti magnet. Jumlah muatannya harus nol.{inner}
        </p>
        <Legend used={new Set()} ionic />
      </>
    );
  }
  if ((r.fx || []).includes('alloy') || p.id === 'Fe_l'){
    return (
      <>
        <div className="sub">🔗 Struktur & ikatan</div>
        <p className="txt"><b>Ikatan logam</b>: tidak ada garis dan tidak ada ion pasangan. Atom-atom logam tersusun rapat dan elektron terluarnya bergerak bebas seperti “lautan elektron”. Inilah yang bikin logam bisa menghantar listrik dan bisa ditempa.</p>
      </>
    );
  }
  return null;
}
