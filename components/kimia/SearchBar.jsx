'use client';
import { EL, CATS } from '@/data/kimia/elements';
import { partLabel } from '@/lib/kimia/search';
import Draggable from './Draggable';

export default function SearchBar({ query, setQuery, hits, recipes, onTapElement, onRecipe }){
  const has = query.trim().length > 0;
  return (
    <>
      <div className="search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="#2b2140" strokeWidth="2.6"/>
          <path d="M15.5 15.5 20 20" stroke="#2b2140" strokeWidth="2.6" strokeLinecap="round"/>
        </svg>
        <input
          type="text" enterKeyHint="search" autoComplete="off"
          placeholder="Cari: Na, natrium, sodium, 26, garam, H2O…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && hits[0]){ onTapElement({ t:'el', s:hits[0] }); e.currentTarget.blur(); } }}
        />
        {has && <button className="xbtn" style={{ display:'block' }} aria-label="Hapus pencarian" onClick={() => setQuery('')}>×</button>}
      </div>
      {has && (
        <div className="results">
          {hits.length > 0 && <span className="rlabel">Unsur:</span>}
          {hits.slice(0, 8).map(s => (
            <Draggable key={s} as="span" className="rchip" item={{ t:'el', s }} onTap={onTapElement}>
              <i style={{ background:CATS[EL[s].cat].c }} />{s} <small>{EL[s].name} · {EL[s].z}</small>
            </Draggable>
          ))}
          {recipes.length > 0 && <span className="rlabel">Resep:</span>}
          {recipes.map(r => (
            <button key={r.key} className="rchip recipe" title={r.name} onClick={() => onRecipe(r.parts)}>
              {r.f} <small>= {r.parts.map(partLabel).join(' + ')}</small>
            </button>
          ))}
          {!hits.length && !recipes.length && (
            <span className="rlabel">Tidak ketemu “{query}”. Coba simbol (Fe), nama (besi), nama Inggris (iron), atau nomor atom (26).</span>
          )}
        </div>
      )}
    </>
  );
}
