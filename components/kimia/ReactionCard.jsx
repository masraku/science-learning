import { itemName } from '@/lib/kimia/reactionEngine';
import { partLabel } from '@/lib/kimia/search';
import BondDiagram from './BondDiagram';

export const SUGGEST = [['Na','Cl'],['H','O'],['Mg','O'],['Fe','S'],['Na','H2O'],['Cs','H2O'],['Al','Fe2O3'],['Cu','Sn'],['Xe','F'],['He','O']];

function Suggest({ onRecipe }){
  return (
    <div className="suggest">
      {SUGGEST.map(([a, b]) => (
        <button key={a + b} className="sg" onClick={() => onRecipe([a, b])}>{partLabel(a)} + {partLabel(b)}</button>
      ))}
    </div>
  );
}

export default function ReactionCard({ ev, onRecipe }){
  if (!ev){
    return (
      <section className="panel card a-card" id="card">
        <div className="ph"><h2>📖 Penjelasan reaksi</h2></div>
        <div className="empty">
          Belum ada reaksi. Tahan unsur di tabel sampai “terangkat”, lalu seret ke labu. Atau ketuk unsur, lalu ketuk labu.
          <div className="sub">Coba kombinasi ini</div>
          <Suggest onRecipe={onRecipe} />
        </div>
      </section>
    );
  }
  if (ev.type === 'none'){
    return (
      <section className="panel card a-card" id="card">
        <div className="ph"><h2>📖 Penjelasan reaksi</h2></div>
        <h3 className="rx-title">{ev.a.label} + {ev.b.label}: tidak bereaksi 🤷</h3>
        <div className="rx-sub">{itemName(ev.a.item)} + {itemName(ev.b.item)}</div>
        <div className="sub">Kenapa?</div>
        <p className="txt">{ev.msg}</p>
        <div className="sub">Coba kombinasi lain</div>
        <Suggest onRecipe={onRecipe} />
      </section>
    );
  }
  const { r, a, b } = ev, p = r.product;
  return (
    <section className="panel card a-card" id="card">
      <div className="ph"><h2>📖 Penjelasan reaksi</h2><span className="hint">{r.gen ? 'berdasarkan aturan umum' : ''}</span></div>
      <h3 className="rx-title">{p.name}</h3>
      <div className="rx-sub">{a.label} + {b.label} → <b>{p.f}</b></div>
      <div className="chips">{(r.kind || []).map(k => <span key={k} className="chip">{k}</span>)}</div>
      <div className="eq">{r.eq}</div>
      <div className="sub">🤔 Apa yang terjadi?</div>
      <p className="txt">{r.what}</p>
      <BondDiagram r={r} p={p} />
      {r.real && <><div className="sub">🌏 Di dunia nyata</div><p className="txt">{r.real}</p></>}
      {r.warn && <div className="warn">⚠️ {r.warn}</div>}
      <div className="sub">➡️ Lanjutkan</div>
      <p className="txt" style={{ color:'var(--muted)' }}>
        {p.f} masih ada di labu. Seret unsur atau senyawa lain ke labu untuk lanjut bereaksi dengan {p.f}, atau tekan <b>Kosongkan</b> untuk mulai baru. {p.f} juga tersimpan di 🎒 Koleksi.
      </p>
    </section>
  );
}
