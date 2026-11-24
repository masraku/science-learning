'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WORLDS, OBJECTS } from '@/data/fisika/presets';
import { simulate, formulas, fmt } from '@/lib/fisika/projectile';
import { createProjectileScene } from '@/lib/fisika/projectileScene';
import { insightsFor } from '@/lib/fisika/insights';
import { useToast } from '@/components/shared/Toast';
import MiniChart from './MiniChart';

function Slider({ label, unit, value, min, max, step = 1, onChange, hint }){
  return (
    <label className="slider">
      <span className="sl-top"><b>{label}</b><span className="sl-val">{fmt(value, step < 1 ? 1 : 0)} {unit}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} />
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

function Toggle({ on, onClick, children }){
  return <button type="button" className={`tgl ${on ? 'on' : ''}`} onClick={onClick}>{children}</button>;
}

export default function ProjectileLab(){
  const toast = useToast();
  const cvRef = useRef(null), boxRef = useRef(null), scene = useRef(null);
  const [angle, setAngle] = useState(45);
  const [v0, setV0] = useState(20);
  const [h0, setH0] = useState(0);
  const [worldId, setWorldId] = useState('bumi');
  const [objId, setObjId] = useState('sepak');
  const [air, setAir] = useState(false);
  const [opts, setOpts] = useState({ vectors:true, preview:false, slowmo:false });
  const [live, setLive] = useState(null);       // {t, p, sim, rate, landed}
  const [shots, setShots] = useState([]);
  const [challenge, setChallenge] = useState(null); // {x, hits, tries}
  const [font, setFont] = useState('Fredoka, sans-serif');

  const world = WORLDS.find(w => w.id === worldId), obj = OBJECTS.find(o => o.id === objId);
  const params = useMemo(() => ({ angle, v0, h0, g:world.g, world:worldId, air, obj }), [angle, v0, h0, world, worldId, air, obj]);
  const paramsRef = useRef(params); paramsRef.current = params;
  const ctxRef = useRef({}); ctxRef.current = { world, obj, challenge };

  // mount the canvas engine once
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const fonts = { ui:`${css.getPropertyValue('--font-fredoka').trim() || 'Fredoka'}, sans-serif`, comic:`${css.getPropertyValue('--font-bangers').trim() || 'Bangers'}, sans-serif` };
    setFont(fonts.ui);
    const sc = createProjectileScene(cvRef.current, {
      fonts,
      onTick: setLive,
      onAim: ({ angle, v0 }) => { setAngle(angle); setV0(v0); },
      onLand: ({ sim, hit, params:p, col }) => {
        const { world:w, obj:o, challenge:ch } = ctxRef.current;
        setShots(prev => [...prev, {
          no:prev.length + 1, angle:p.angle, v0:p.v0, h0:p.h0, g:p.g, air:p.air, objId:p.obj.id, objName:p.obj.name,
          worldName:WORLDS.find(x => x.id === p.world)?.name || w.name, range:sim.range, maxH:sim.maxH, tFlight:sim.tFlight, col, hit,
        }].slice(-12));
        if (ch) setChallenge(c => c && ({ ...c, tries:c.tries + 1, hits:c.hits + (hit ? 1 : 0), last:hit ? 'hit' : (sim.range < c.x ? 'short' : 'long') }));
        void o;
      },
    });
    scene.current = sc;
    const fit = () => sc.resize(boxRef.current.clientWidth);
    fit();
    const ro = new ResizeObserver(fit); ro.observe(boxRef.current);
    return () => { ro.disconnect(); sc.destroy(); };
  }, []);

  useEffect(() => { scene.current?.setParams(params); }, [params]);
  useEffect(() => { scene.current?.setOptions(opts); }, [opts]);

  const fire = () => {
    const sim = scene.current?.fire();
    if (!sim) toast('Tunggu bolanya mendarat dulu ⏳');
  };
  const newTarget = () => {
    const maxR = Math.min(150, .7*50*50/world.g);
    const x = Math.round((8 + Math.random()*(maxR - 8))*2)/2;
    scene.current?.setTarget(x);
    setChallenge(c => ({ x, hits:c?.hits || 0, tries:c?.tries || 0, last:null }));
  };
  const stopChallenge = () => { scene.current?.setTarget(null); setChallenge(null); };

  const f = formulas(params);
  const lastShot = shots[shots.length - 1];
  const insights = useMemo(() => insightsFor(shots), [shots]);
  const airSim = useMemo(() => (air ? simulate(params) : null), [air, params]);
  const p = live?.p;

  return (
    <div className="phys">
      <section className="panel stage">
        <div ref={boxRef} className="stage-box"><canvas ref={cvRef} className="stage-cv" /></div>
        <div className="stage-bar">
          <div className="stats">
            <span className="stat"><i>t</i>{p ? fmt(live.t, 2) : '0,00'} s</span>
            <span className="stat"><i>x</i>{p ? fmt(p.x, 1) : '0,0'} m</span>
            <span className="stat"><i>y</i>{p ? fmt(p.y, 1) : fmt(h0, 1)} m</span>
            <span className="stat red"><i>vx</i>{p ? fmt(p.vx, 1) : fmt(f.vx, 1)}</span>
            <span className="stat blue"><i>vy</i>{p ? fmt(p.vy, 1) : fmt(f.vy0, 1)}</span>
          </div>
          <div className="stage-btns">
            <button className="btn" onClick={() => { scene.current?.clearTrails(); setLive(null); }}>Hapus jejak</button>
            <button className="btn fire-btn" onClick={fire}>🚀 Tembak!</button>
          </div>
        </div>
        <p className="hint stage-hint">💡 Tarik dari meriam untuk membidik, atau pakai slider di bawah.</p>
      </section>

      <div className="phys-grid">
        <section className="panel">
          <div className="ph"><h2>🎛️ Atur peluncuran</h2></div>
          <Slider label="Sudut (θ)" unit="°" value={angle} min={0} max={90} onChange={setAngle} />
          <Slider label="Kecepatan awal (v₀)" unit="m/s" value={v0} min={5} max={50} onChange={setV0} />
          <Slider label="Tinggi awal (h₀)" unit="m" value={h0} min={0} max={30} onChange={setH0} hint={h0 > 0 ? 'Meriam di atas menara' : 'Ditembak dari tanah'} />

          <div className="sub">🌍 Gravitasi</div>
          <div className="chiprow">
            {WORLDS.map(w => <Toggle key={w.id} on={w.id === worldId} onClick={() => setWorldId(w.id)}>{w.icon} {w.name} <small>{fmt(w.g, 2)}</small></Toggle>)}
          </div>

          <div className="sub">💨 Hambatan udara</div>
          <div className="chiprow">
            <Toggle on={!air} onClick={() => setAir(false)}>Tanpa udara (ideal)</Toggle>
            <Toggle on={air} onClick={() => setAir(true)}>Dengan udara</Toggle>
          </div>
          <div className="sub">⚽ Benda {!air && <span className="hint">(massa baru berpengaruh kalau ada udara)</span>}</div>
          <div className="chiprow">
            {OBJECTS.map(o => <Toggle key={o.id} on={o.id === objId} onClick={() => setObjId(o.id)}><i className="dot" style={{ background:o.col }} />{o.name} <small>{o.mass < 1 ? `${fmt(o.mass*1000, 0)} g` : `${fmt(o.mass, 0)} kg`}</small></Toggle>)}
          </div>

          <div className="sub">👀 Tampilan</div>
          <div className="chiprow">
            <Toggle on={opts.vectors} onClick={() => setOpts(o => ({ ...o, vectors:!o.vectors }))}>➡️ Panah kecepatan</Toggle>
            <Toggle on={opts.preview} onClick={() => setOpts(o => ({ ...o, preview:!o.preview }))}>🔮 Ramalan lintasan</Toggle>
            <Toggle on={opts.slowmo} onClick={() => setOpts(o => ({ ...o, slowmo:!o.slowmo }))}>🐢 Gerak lambat</Toggle>
          </div>

          <div className="sub">🎯 Tantangan</div>
          {!challenge ? (
            <button className="btn" onClick={newTarget}>Mulai: kenai target!</button>
          ) : (
            <div className="challenge">
              <div><b>Target: {fmt(challenge.x, 1)} m</b> · Kena {challenge.hits} dari {challenge.tries} tembakan</div>
              {challenge.last && <div className="hint">{challenge.last === 'hit' ? '🎉 Tepat sasaran!' : challenge.last === 'short' ? '⬅️ Kurang jauh. Coba tambah kecepatan atau ubah sudut.' : '➡️ Kejauhan. Kurangi kecepatan atau ubah sudut.'}</div>}
              <div className="chiprow" style={{ marginTop:6 }}>
                <button className="btn" onClick={newTarget}>Target baru</button>
                <button className="btn" onClick={stopChallenge}>Selesai</button>
              </div>
              <div className="hint">Matikan 🔮 ramalan supaya lebih menantang!</div>
            </div>
          )}
        </section>

        <section className="panel card">
          <div className="ph"><h2>📈 Grafik</h2>{live && <span className="hint">tembakan terakhir</span>}</div>
          <MiniChart sim={live?.sim} t={live?.t || 0} kind="y" font={font} />
          <div style={{ height:8 }} />
          <MiniChart sim={live?.sim} t={live?.t || 0} kind="v" font={font} />
          <p className="hint" style={{ marginTop:6 }}>Garis merah (vx) datar: kecepatan mendatar tidak berubah. Garis biru (vy) turun lurus: gravitasi mengurangi vy sebesar g tiap detik{air ? ' (dengan udara, keduanya ikut melambat)' : ''}.</p>

          <div className="sub">🤔 Kenapa lintasannya melengkung?</div>
          <p className="txt">Gerak bola bisa dipecah jadi dua gerak yang terpisah. <b style={{ color:'#c12f2f' }}>Mendatar</b>: tidak ada gaya yang mendorong atau menahan (tanpa udara), jadi kecepatannya tetap (gerak lurus beraturan). <b style={{ color:'#1b6fb8' }}>Tegak</b>: gravitasi terus menarik ke bawah, jadi bola melambat saat naik, berhenti sesaat di puncak (vy = 0), lalu makin cepat saat turun (gerak lurus berubah beraturan). Gabungan keduanya membentuk parabola.</p>

          <div className="sub">🧮 Rumus dengan angkamu</div>
          <div className="formula">
            <div>vx = v₀·cos θ = {v0}·cos {angle}° = <b>{fmt(f.vx, 2)} m/s</b></div>
            <div>vy₀ = v₀·sin θ = {v0}·sin {angle}° = <b>{fmt(f.vy0, 2)} m/s</b></div>
            <div>t puncak = vy₀ / g = {fmt(f.vy0, 2)} / {fmt(world.g, 2)} = <b>{fmt(f.tPeak, 2)} s</b></div>
            <div>H maks = h₀ + vy₀² / 2g = <b>{fmt(f.H, 2)} m</b></div>
            {h0 === 0
              ? <div>T terbang = 2·vy₀ / g = <b>{fmt(f.T, 2)} s</b></div>
              : <div>T terbang = (vy₀ + √(vy₀² + 2g·h₀)) / g = <b>{fmt(f.T, 2)} s</b></div>}
            {h0 === 0
              ? <div>Jarak R = v₀²·sin 2θ / g = <b>{fmt(f.R, 2)} m</b></div>
              : <div>Jarak R = vx · T = <b>{fmt(f.R, 2)} m</b></div>}
          </div>
          {air && airSim && (
            <div className="warn" style={{ background:'#e3f3ff' }}>
              💨 Rumus di atas mengabaikan udara. Simulasi dengan hambatan udara untuk {obj.name.toLowerCase()}: jarak <b>{fmt(airSim.range, 1)} m</b>, tinggi maks <b>{fmt(airSim.maxH, 1)} m</b>, waktu <b>{fmt(airSim.tFlight, 2)} s</b>. Lebih pendek {fmt((1 - airSim.range/f.R)*100, 0)}% dari rumus.
            </div>
          )}

          {insights.length > 0 && (
            <>
              <div className="sub">💡 Temuanmu</div>
              {insights.map(i => <div key={i.text} className="insight"><span>{i.icon}</span><span>{i.text}</span></div>)}
            </>
          )}

          <div className="sub">📋 Catatan tembakan</div>
          {shots.length === 0 ? <p className="hint">Belum ada tembakan. Coba 30°, lalu 60° dengan kecepatan yang sama. Apa yang terjadi?</p> : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>#</th><th>θ</th><th>v₀</th><th>g</th><th>udara</th><th>jarak</th><th>tinggi</th><th>waktu</th></tr></thead>
                <tbody>
                  {[...shots].reverse().map(s => (
                    <tr key={s.no}>
                      <td><i className="dot" style={{ background:s.col }} />{s.no}{s.hit ? ' 🎯' : ''}</td>
                      <td>{s.angle}°</td><td>{s.v0}</td><td>{fmt(s.g, 1)}</td><td>{s.air ? s.objName.split(' ')[1] || '✓' : '–'}</td>
                      <td><b>{fmt(s.range, 1)} m</b></td><td>{fmt(s.maxH, 1)} m</td><td>{fmt(s.tFlight, 2)} s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {lastShot && <p className="hint" style={{ marginTop:6 }}>Tembakan terakhir: {lastShot.angle}°, {lastShot.v0} m/s di {lastShot.worldName}.</p>}
        </section>
      </div>
    </div>
  );
}
