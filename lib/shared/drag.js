// Tiny drag-and-drop controller shared by every lab.
// Mouse: drag starts after a 5px move. Touch: long-press (170 ms) lifts the item,
// so a normal swipe still scrolls the page or a horizontally scrolling table.

const targets = new Set();
let drag = null;

function targetAt(x, y){
  for (const t of targets){
    const r = t.el.getBoundingClientRect();
    if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) return t;
  }
  return null;
}

function start(src, item, ghost, x, y){
  const g = document.createElement('div');
  g.className = 'drag-ghost';
  g.style.background = ghost.bg;
  g.innerHTML = `${ghost.label}<small>${ghost.sub || ''}</small>`;
  if (ghost.label.length > 4) g.style.fontSize = '13px';
  document.body.appendChild(g);
  drag = {src, item, g, over:null};
  src.classList.add('dragging');
  try { navigator.vibrate && navigator.vibrate(12); } catch (_) {}
  move(x, y);
}

function move(x, y){
  if (!drag) return;
  drag.g.style.translate = `${x - 29}px ${y - 78}px`;
  const t = targetAt(x, y);
  if (t !== drag.over){
    drag.over?.el.classList.remove('drop-over');
    t?.el.classList.add('drop-over');
    drag.g.classList.toggle('over', !!t);
    drag.over = t;
  }
}

function end(x, y){
  if (!drag) return;
  const t = targetAt(x, y), item = drag.item;
  drag.g.remove();
  drag.src.classList.remove('dragging');
  drag.over?.el.classList.remove('drop-over');
  drag = null;
  if (t) t.onDrop(item);
}

/** Register an element that accepts drops. Returns a cleanup function. */
export function registerDropTarget(el, onDrop){
  const t = {el, onDrop};
  targets.add(t);
  return () => targets.delete(t);
}

/**
 * Make an element draggable.
 * getItem(): the payload dropped on a target
 * getGhost(item): {label, sub, bg} for the floating tile
 * onTap(item): called on a tap/click without dragging
 */
export function attachDraggable(el, {getItem, getGhost, onTap}){
  let pend = null;

  const onMouseDown = e => {
    if (e.button) return;
    e.preventDefault();
    pend = {x:e.clientX, y:e.clientY};
    const mm = ev => {
      if (drag) move(ev.clientX, ev.clientY);
      else if (pend && Math.hypot(ev.clientX - pend.x, ev.clientY - pend.y) > 5){ const it = getItem(); start(el, it, getGhost(it), ev.clientX, ev.clientY); }
    };
    const mu = ev => {
      document.removeEventListener('mousemove', mm);
      document.removeEventListener('mouseup', mu);
      if (drag) end(ev.clientX, ev.clientY); else if (pend) onTap?.(getItem());
      pend = null;
    };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
  };

  const onTouchStart = e => {
    const t = e.touches[0];
    pend = {x:t.clientX, y:t.clientY, lx:t.clientX, ly:t.clientY, moved:false};
    pend.timer = setTimeout(() => {
      if (pend && !pend.moved){ const it = getItem(); start(el, it, getGhost(it), pend.lx, pend.ly); }
    }, 170);
  };
  const onTouchMove = e => {
    const t = e.touches[0];
    if (!pend) return;
    pend.lx = t.clientX; pend.ly = t.clientY;
    if (drag){ e.preventDefault(); move(t.clientX, t.clientY); }
    else if (Math.hypot(t.clientX - pend.x, t.clientY - pend.y) > 8){ pend.moved = true; clearTimeout(pend.timer); }
  };
  const onTouchEnd = e => {
    if (!pend) return;
    clearTimeout(pend.timer);
    if (drag){ e.preventDefault(); end(pend.lx, pend.ly); }
    else if (!pend.moved && e.type === 'touchend'){ e.preventDefault(); onTap?.(getItem()); }
    pend = null;
  };
  const noMenu = e => e.preventDefault();

  el.addEventListener('mousedown', onMouseDown);
  el.addEventListener('touchstart', onTouchStart, {passive:true});
  el.addEventListener('touchmove', onTouchMove, {passive:false});
  el.addEventListener('touchend', onTouchEnd, {passive:false});
  el.addEventListener('touchcancel', onTouchEnd, {passive:false});
  el.addEventListener('contextmenu', noMenu);
  return () => {
    el.removeEventListener('mousedown', onMouseDown);
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
    el.removeEventListener('touchcancel', onTouchEnd);
    el.removeEventListener('contextmenu', noMenu);
  };
}
