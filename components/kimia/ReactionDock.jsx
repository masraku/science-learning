'use client';
import { useEffect, useRef } from 'react';
import { createFlask } from '@/lib/kimia/flaskEngine';
import { useDropTarget } from '@/components/shared/useDraggable';

// Canvas height: taller on desktop, compact on phones where the dock is pinned to the bottom.
const canvasH = () => window.innerWidth >= 900 ? 220 : (window.innerHeight < 700 ? 130 : 150);

export default function ReactionDock({ apiRef, onEvent, onWrapClick, res, foundCount }){
  const dockRef = useRef(null);
  const cvRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const wrapRef = useDropTarget(item => apiRef.current?.add(item));

  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const fonts = {
      ui: `${css.getPropertyValue('--font-fredoka').trim() || 'Fredoka'}, sans-serif`,
      comic: `${css.getPropertyValue('--font-bangers').trim() || 'Bangers'}, sans-serif`,
    };
    const api = createFlask(cvRef.current, { onEvent: e => onEventRef.current(e), initialH: canvasH(), fonts });
    apiRef.current = api;
    const fit = () => {
      api.resize(canvasH());
      const desk = window.innerWidth >= 900;
      document.documentElement.style.setProperty('--dockH', desk ? '0px' : `${dockRef.current.offsetHeight + 8}px`);
    };
    fit();
    const t = setTimeout(fit, 300);
    window.addEventListener('resize', fit);
    return () => { clearTimeout(t); window.removeEventListener('resize', fit); api.destroy(); apiRef.current = null; document.documentElement.style.setProperty('--dockH', '0px'); };
  }, [apiRef]);

  return (
    <section className="panel dock" ref={dockRef}>
      <div className="dock-head"><b>🧪 Labu reaksi</b><span className="counter">{foundCount} reaksi</span></div>
      <div id="chamberWrap" ref={wrapRef} onClick={onWrapClick}><canvas id="chamber" ref={cvRef} /></div>
      <div className="cbar">
        <div className="res">
          {res.eqs && <span className="eqs">{res.eqs}</span>}
          <span className="nm">{res.name && <b>{res.name}</b>}{res.nm}</span>
        </div>
        {res.jump && (
          <button className="btn alt" id="toCard" onClick={() => {
            const c = document.getElementById('card');
            window.scrollTo({ top:c.getBoundingClientRect().top + window.scrollY - 12, behavior:'smooth' });
          }}>Penjelasan ↓</button>
        )}
        <button className="btn" onClick={() => apiRef.current?.clear()}>Kosongkan</button>
      </div>
    </section>
  );
}
