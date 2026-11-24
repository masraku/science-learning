'use client';
import { memo, useEffect, useRef } from 'react';
import { SYM, EL, CATS } from '@/data/kimia/elements';
import Draggable from './Draggable';

const Cell = memo(function Cell({ s, state, selected, onTap }){
  const e = EL[s], [r, c] = e.pos;
  return (
    <Draggable
      item={{ t:'el', s }}
      onTap={onTap}
      data-s={s}
      className={`cell ${state} ${selected ? 'sel' : ''}`}
      style={{ gridRow:r, gridColumn:c, background:CATS[e.cat].c }}
      title={`${e.name} (${e.en})`}
    >
      <span className="z">{e.z}</span>
      <span className="s">{s}</span>
      <span className="n">{e.name}</span>
    </Draggable>
  );
});

/**
 * hits: array of matching symbols from search (null when not searching)
 */
export default function PeriodicTable({ hits, selected, onTap }){
  const scroller = useRef(null);
  const hitSet = hits ? new Set(hits) : null;

  // Scroll the first search hit into view (the table scrolls sideways on phones).
  useEffect(() => {
    if (!hits?.length || !scroller.current) return;
    const el = scroller.current.querySelector(`[data-s="${hits[0]}"]`);
    if (el) scroller.current.scrollTo({ left:Math.max(0, el.offsetLeft - scroller.current.clientWidth/2 + 20), behavior:'smooth' });
  }, [hits]);

  return (
    <>
      <div className="pt-scroll" ref={scroller}>
        <div className="pt" style={{ gridTemplateRows:'repeat(7,var(--cell)) 6px repeat(2,var(--cell))' }}>
          {SYM.map(s => (
            <Cell key={s} s={s} onTap={onTap} selected={selected === s}
              state={!hitSet ? '' : hitSet.has(s) ? 'hit' : 'dim'} />
          ))}
          <div className="cell ph2" style={{ gridRow:6, gridColumn:3 }}>57–71</div>
          <div className="cell ph2" style={{ gridRow:7, gridColumn:3 }}>89–103</div>
        </div>
      </div>
      <div className="legend">
        {Object.values(CATS).map(c => <span key={c.n} className="lg"><i style={{ background:c.c }} />{c.n}</span>)}
      </div>
    </>
  );
}
