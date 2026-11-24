'use client';
import { useDraggable } from '@/components/shared/useDraggable';
import { EL } from '@/data/kimia/elements';
import { itemLabel, itemColor } from '@/lib/kimia/reactionEngine';

export const ghostFor = item => ({
  label: itemLabel(item),
  sub: item.t === 'el' ? EL[item.s].z : 'senyawa',
  bg: itemColor(item),
});

/** Any element/compound tile that can be dragged into the flask or tapped to select. */
export default function Draggable({ item, onTap, as: Tag = 'div', children, ...rest }){
  const ref = useDraggable({ getItem: () => item, getGhost: ghostFor, onTap });
  return <Tag ref={ref} {...rest}>{children}</Tag>;
}
