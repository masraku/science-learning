'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { EL, CATS, GASES, LIQUIDS, valence } from '@/data/kimia/elements';
import { C } from '@/data/kimia/compounds';
import { itemKey, itemLabel, itemName } from '@/lib/kimia/reactionEngine';
import { searchElements, searchRecipes, RECIPES, partLabel } from '@/lib/kimia/search';
import { useToast } from '@/components/shared/Toast';
import PeriodicTable from './PeriodicTable';
import SearchBar from './SearchBar';
import ReactionDock from './ReactionDock';
import ReactionCard from './ReactionCard';
import Draggable from './Draggable';

function InfoLine({ item }){
  if (!item) return <div className="info" />;
  if (item.t === 'el'){
    const e = EL[item.s], v = valence(item.s);
    const state = GASES.has(item.s) ? 'gas' : LIQUIDS.has(item.s) ? 'cair' : 'padat';
    return <div className="info">👉 <b>{e.s} · {e.name}</b> ({e.en}) · No. {e.z} · {CATS[e.cat].n} · {state}{v ? ` · ${v} e⁻ valensi` : ''}. Ketuk labu untuk memasukkan.</div>;
  }
  return <div className="info">👉 <b>{itemLabel(item)} · {itemName(item)}</b>. Ketuk labu untuk memasukkan.</div>;
}

export default function ChemistryLab(){
  const toast = useToast();
  const flask = useRef(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [inventory, setInventory] = useState([]);       // discovered products, in order
  const found = useRef(new Set());                       // reaction keys discovered
  const [foundCount, setFoundCount] = useState(0);
  const [card, setCard] = useState(null);
  const [res, setRes] = useState({ nm:'Seret 2 unsur ke labu ini' });

  const hits = useMemo(() => (query.trim() ? searchElements(query) : null), [query]);
  const recipes = useMemo(() => searchRecipes(query), [query]);

  const tap = useCallback(item => {
    setSelected(cur => (cur && itemKey(cur) === itemKey(item) ? null : item));
  }, []);

  const addToFlask = useCallback(item => { flask.current?.add(item); setSelected(null); }, []);

  const onEvent = useCallback(e => {
    if (e.type === 'added') setRes({ eqs:`${itemLabel(e.item)} + ?`, nm:`${itemName(e.item)} masuk labu. Tambah satu lagi!` });
    if (e.type === 'cleared') setRes({ nm:'Labu kosong. Seret 2 unsur ke sini' });
    if (e.type === 'none'){
      setRes({ eqs:`${e.a.label} + ${e.b.label} → 🤷`, nm: e.kept ? `Tidak bereaksi. ${e.a.label} masih di labu, coba yang lain` : 'Tidak bereaksi', jump:true });
      setCard(e);
    }
    if (e.type === 'result'){
      const { r } = e, p = r.product;
      const isNew = !found.current.has(r.key);
      found.current.add(r.key);
      setFoundCount(found.current.size);
      setRes({ eqs:`${e.a.label} + ${e.b.label} → ${p.f}`, name:p.name, nm:`${isNew ? ' · baru! ✨' : ''} · tambah zat lain untuk lanjut`, jump:true });
      setInventory(prev => (prev.some(x => x.id === p.id) ? prev : [...prev, { id:p.id, f:p.f, name:p.name, col:p.col }]));
      setCard(e);
    }
  }, []);

  // Turn a recipe ingredient key into an item (elements are always available; compounds must be discovered first).
  const tryRecipe = useCallback(parts => {
    const items = parts.map(k => {
      if (EL[k]) return { t:'el', s:k };
      const p = inventory.find(x => x.id === k);
      return p ? { t:'cmp', ...p } : null;
    });
    const missing = parts.find((k, i) => !items[i]);
    if (missing){
      const how = RECIPES.find(r => r.id === missing);
      toast(`Buat ${C[missing]?.f || missing} dulu${how ? ` dari ${how.parts.map(partLabel).join(' + ')}` : ''}, lalu coba lagi`);
      return;
    }
    flask.current?.clear();
    flask.current?.add(items[0]);
    setTimeout(() => flask.current?.add(items[1]), 380);
  }, [inventory, toast]);

  return (
    <>
    <div className="layout">
      <section className="panel a-pt">
        <SearchBar query={query} setQuery={setQuery} hits={hits || []} recipes={recipes} onTapElement={tap} onRecipe={tryRecipe} />
        <div className="ph"><h2>Tabel periodik</h2><span className="hint"><b>Tahan & seret</b> ke labu</span></div>
        <InfoLine item={selected} />
        <PeriodicTable hits={hits} selected={selected?.t === 'el' ? selected.s : null} onTap={tap} />
      </section>

      <ReactionDock
        apiRef={flask}
        onEvent={onEvent}
        res={res}
        foundCount={foundCount}
        onWrapClick={() => (selected ? addToFlask(selected) : toast('Seret unsur ke sini, atau ketuk unsur dulu 👆'))}
      />

      <ReactionCard ev={card} onRecipe={tryRecipe} />

      <section className="panel a-inv">
        <div className="ph"><h2>🎒 Koleksi senyawa</h2><span className="hint">bisa diseret lagi</span></div>
        <div className="inv">
          {inventory.length === 0 && <span className="hint">Senyawa yang kamu buat akan muncul di sini.</span>}
          {inventory.map(p => {
            const item = { t:'cmp', ...p };
            return (
              <Draggable key={p.id} item={item} onTap={tap} title={p.name}
                className={`cmp ${selected?.t === 'cmp' && selected.id === p.id ? 'sel' : ''}`}>
                <i style={{ background:p.col }} />{p.f}
              </Draggable>
            );
          })}
        </div>
      </section>

    </div>
      <footer>
        Simulasi edukatif: reaksi ditampilkan dalam bentuk paling umum. Banyak di antaranya butuh pemicu (percikan api, panas, katalis) yang dijelaskan di kartu penjelasan.
        <br />Jangan coba di rumah tanpa pengawasan guru dan alat pelindung.
      </footer>
    </>
  );
}
