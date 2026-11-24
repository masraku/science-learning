import { SYM, EL, ALIAS } from '@/data/kimia/elements';
import { C } from '@/data/kimia/compounds';
import { R } from '@/data/kimia/reactions';

export const norm = s => s.toLowerCase()
  .replace(/[₀-₉]/g, d => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(d)])
  .replace(/\s+/g, ' ').trim();

/** Every hand-written reaction as a "recipe": product + the two ingredients. */
export const RECIPES = Object.entries(R)
  .filter(([, r]) => C[r.p])
  .map(([key, r]) => ({key, id:r.p, f:C[r.p].f, name:C[r.p].name, parts:key.split('+')}));

/** Elements matching a symbol, Indonesian/English name, alias, or atomic number. Best matches first. */
export function searchElements(raw){
  const s = norm(raw);
  if (!s) return [];
  const hits = [];
  for (const sym of SYM){
    const e = EL[sym];
    const ls = sym.toLowerCase(), nm = e.name.toLowerCase(), en = e.en.toLowerCase(), al = (ALIAS[sym] || '').toLowerCase();
    let score = 0;
    if (ls === s || String(e.z) === s) score = 100;
    else if (nm === s || en === s) score = 90;
    else if (nm.startsWith(s) || en.startsWith(s) || (al && al.split(' ').some(w => w.startsWith(s)))) score = 70;
    else if (s.length >= 2 && ls.startsWith(s)) score = 60;
    else if (s.length >= 3 && (nm.includes(s) || en.includes(s) || al.includes(s))) score = 40;
    if (score) hits.push([score, sym]);
  }
  hits.sort((a, b) => b[0] - a[0] || EL[a[1]].z - EL[b[1]].z);
  return hits.map(h => h[1]);
}

/** Recipes whose product name or formula matches (e.g. "garam", "karat", "h2o"). */
export function searchRecipes(raw){
  const s = norm(raw);
  if (!s) return [];
  return RECIPES.filter(r => norm(r.name).includes(s) || norm(r.f).includes(s) || (s.length <= 2 && r.parts.includes(raw.trim()))).slice(0, 6);
}

export const partLabel = k => (EL[k] ? k : (C[k]?.f || k));
