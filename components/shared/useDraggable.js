'use client';
import { useEffect, useRef } from 'react';
import { attachDraggable, registerDropTarget } from '@/lib/shared/drag';

/** Attach drag behaviour to the returned ref. Handlers can change between renders. */
export function useDraggable({ getItem, getGhost, onTap }){
  const ref = useRef(null);
  const latest = useRef({ getItem, getGhost, onTap });
  latest.current = { getItem, getGhost, onTap };
  useEffect(() => {
    if (!ref.current) return;
    return attachDraggable(ref.current, {
      getItem: () => latest.current.getItem(),
      getGhost: it => latest.current.getGhost(it),
      onTap: it => latest.current.onTap?.(it),
    });
  }, []);
  return ref;
}

/** Make the returned ref a drop target. */
export function useDropTarget(onDrop){
  const ref = useRef(null);
  const latest = useRef(onDrop);
  latest.current = onDrop;
  useEffect(() => {
    if (!ref.current) return;
    return registerDropTarget(ref.current, item => latest.current(item));
  }, []);
  return ref;
}
