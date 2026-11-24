import { EL, CATS, isMetal } from '@/data/kimia/elements';
import { C, DIATOMIC, DI_NAME } from '@/data/kimia/compounds';
import { R } from '@/data/kimia/reactions';

// Rules for pairs that are not in data/kimia/reactions.js
const ANION = {F:[-1,'fluorida',true],Cl:[-1,'klorida',true],Br:[-1,'bromida',true],I:[-1,'iodida',true],At:[-1,'astatida',true],
  O:[-2,'oksida',true],S:[-2,'sulfida',false],Se:[-2,'selenida',false],Te:[-2,'telurida',false],N:[-3,'nitrida',true],P:[-3,'fosfida',false],H:[-1,'hidrida',true]};
const CATION = {Li:1,Na:1,K:1,Rb:1,Cs:1,Fr:1,Be:2,Mg:2,Ca:2,Sr:2,Ba:2,Ra:2,Al:3,Ga:3,In:3,Tl:1,Sn:4,Pb:2,Bi:3,
  Sc:3,Ti:4,V:5,Cr:3,Mn:2,Fe:3,Co:2,Ni:2,Cu:2,Zn:2,Y:3,Zr:4,Nb:5,Mo:6,Tc:7,Ag:1,Cd:2,Hf:4,Ta:5,W:6,Re:7,Hg:2,
  B:3,Si:4,Ge:4,As:3,Sb:3,Te:4,Po:2,Th:4,U:4,Ac:3,Pa:5,Np:4,Pu:4};
const OXIDE_Q = {Mn:4};
const MULTI = new Set(['Fe','Cu','Mn','Cr','Co','Sn','Pb','Hg','Ti','V','Tl','Mo','W','U','Pu','Np']);
const NOBLE_METAL = new Set(['Au','Pt','Ir','Os','Rh','Ru','Pd']);
const FLAME = {Li:'#ff2d4a',Na:'#ffcc33',K:'#c58cff',Rb:'#d0306f',Cs:'#7a7aff',Fr:'#ff4d6d',Ca:'#ff5a36',Sr:'#ff1a3a',Ba:'#a6ff4d',Cu:'#3dffb0',Mg:'#ffffff',Al:'#ffffff'};
const ROMAN = ['','I','II','III','IV','V','VI','VII'];
const SUB = n => n === 1 ? '' : String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
const gcd = (a,b) => b ? gcd(b, a%b) : a;
const coef = n => n === 1 ? '' : String(n);

function genericReaction(a, b){
  const A = EL[a], B = EL[b];
  if (a === b){
    if (DIATOMIC[a]) return {gen:true, product:{id:a+'2', f:a+'₂', name:DI_NAME[a], col:DIATOMIC[a]}, eq:`${a} + ${a} → ${a}₂`, fx:['molecule'], kind:['Molekul diatomik','Ikatan kovalen'],
      what:`Dua atom ${A.name.toLowerCase()} berbagi pasangan elektron (ikatan kovalen) membentuk molekul ${a}₂. Di alam, ${A.name.toLowerCase()} memang selalu berpasangan seperti ini karena lebih stabil.`,
      real:`Yang kita sebut “${DI_NAME[a].toLowerCase()}” sehari-hari sebenarnya kumpulan molekul ${a}₂.`};
    return {none:true, msg:`Atom-atom ${A.name.toLowerCase()} hanya berkumpul jadi zat ${A.name.toLowerCase()} itu sendiri. Tidak ada zat baru yang terbentuk.`};
  }
  if (A.cat === 'noble' || B.cat === 'noble'){
    const g = A.cat === 'noble' ? A : B;
    return {none:true, msg:`${g.name} adalah gas mulia: kulit elektron terluarnya sudah penuh, jadi hampir tidak mau bereaksi dengan apa pun. (Pengecualian langka: xenon dengan fluorin.)`};
  }
  if (A.z >= 99 || B.z >= 99){
    const x = A.z >= 93 ? A : B;
    return {none:true, msg:`${x.name} adalah unsur buatan yang radioaktif. Biasanya hanya ada beberapa atom saja yang dibuat di reaktor atau akselerator, jadi hampir tidak pernah direaksikan seperti ini.`};
  }
  const mA = isMetal(a), mB = isMetal(b);
  if ((NOBLE_METAL.has(a) && !mB) || (NOBLE_METAL.has(b) && !mA)){
    const nm = NOBLE_METAL.has(a) ? A : B;
    return {none:true, msg:`${nm.name} termasuk logam mulia yang sangat tidak reaktif. Itu sebabnya perhiasan ${nm.name.toLowerCase()} tetap berkilau ratusan tahun. Untuk melarutkan emas pun butuh air raja (campuran HNO₃ dan HCl pekat).`};
  }
  if (mA && mB){
    return {gen:true, product:{id:'alloy_'+[a,b].sort().join(''), f:`${a}+${b}`, name:`Paduan ${A.name.toLowerCase()}–${B.name.toLowerCase()}`, col:'#b9c0c8'},
      eq:`${a} + ${b} → paduan logam`, fx:['alloy'], kind:['Paduan logam','Bukan reaksi kimia'],
      what:'Logam dengan logam tidak membentuk senyawa ion, karena keduanya sama-sama ingin melepas elektron. Tapi kalau dilebur bersama, atom-atomnya bercampur jadi paduan logam (alloy) yang sifatnya bisa lebih unggul.',
      real:'Hampir semua logam di sekitar kita sebenarnya paduan: baja, kuningan, perunggu, emas 18 karat.'};
  }
  // metal / metalloid "cation" + nonmetal "anion"
  let M = null, X = null;
  if (mA && ANION[b]) { M = a; X = b; }
  else if (mB && ANION[a]) { M = b; X = a; }
  else if (EL[a].cat === 'metalloid' && (b === 'O' || ANION[b]?.[0] === -1) && b !== 'H') { M = a; X = b; }
  else if (EL[b].cat === 'metalloid' && (a === 'O' || ANION[a]?.[0] === -1) && a !== 'H') { M = b; X = a; }
  if (M && X){
    if (X === 'H' && !['alkali','alkaline'].includes(EL[M].cat))
      return {none:true, msg:`${EL[M].name} hampir tidak bereaksi langsung dengan hidrogen dalam kondisi biasa.`};
    let q = (X === 'O' && OXIDE_Q[M]) || CATION[M] || (EL[M].cat === 'lanthanide' ? 3 : 2);
    const [an, aname, diat] = ANION[X];
    const qa = -an, g = gcd(q, qa), nM = qa/g, nX = q/g;
    const formula = `${M}${SUB(nM)}${X}${SUB(nX)}`;
    const rn = MULTI.has(M) ? `(${ROMAN[q]})` : '';
    const name = `${EL[M].name}${rn} ${aname}`;
    // balanced equation
    let k = 1; if (diat && nX % 2) k = 2;
    let cM = nM*k, cX = diat ? nX*k/2 : nX*k, cP = k;
    const gg = gcd(gcd(cM, cX), cP); cM /= gg; cX /= gg; cP /= gg;
    const eq = `${coef(cM)}${M} + ${coef(cX)}${X}${diat ? '₂' : ''} → ${coef(cP)}${formula}`;
    // how violent?
    const cat = EL[M].cat; let fx, kind = ['Sintesis','Ikatan ion'], cond = '';
    const flame = FLAME[M] || '#ff9a3c';
    if (X === 'F') fx = cat === 'alkali' ? ['bigboom','fire'] : ['fire','smoke'];
    else if (ANION[X][0] === -1 && X !== 'H'){
      if (cat === 'alkali') fx = ['K','Rb','Cs','Fr'].includes(M) ? ['explode','fire','smoke'] : ['fire','smoke'];
      else if (cat === 'alkaline' || M === 'Al') fx = ['fire','smoke'];
      else if (cat === 'transition'){ fx = ['fire','smoke']; cond = 'Biasanya logamnya perlu dipanaskan dulu supaya reaksi mulai.'; }
      else fx = ['color'];
    } else if (X === 'O'){
      kind = ['Oksidasi','Pembakaran'];
      if (cat === 'alkali') fx = ['fire','smoke'];
      else if (M === 'Mg' || M === 'Al') fx = ['flash','smoke'];
      else if (cat === 'alkaline') fx = ['fire','smoke'];
      else { fx = ['rust']; kind = ['Oksidasi','Korosi']; cond = 'Pada logam ini oksidasi biasanya berlangsung pelan (korosi), kecuali logamnya berupa serbuk halus atau dipanaskan.'; }
    } else if (X === 'H'){ fx = ['color']; kind = ['Sintesis','Hidrida']; cond = 'Butuh logam yang dipanaskan dalam aliran gas hidrogen.'; }
    else if (['S','Se','Te'].includes(X)){ fx = ['glow','smoke']; cond = 'Campurannya perlu dipicu panas sedikit, lalu reaksi berjalan sendiri sambil membara.'; }
    else { fx = ['color']; cond = 'Reaksinya perlu suhu tinggi.'; }
    const ve = q;
    const col = X === 'O' ? (cat==='transition' || cat==='post' ? '#9aa3ad' : '#f2f2f2') : (['S','Se','Te'].includes(X) ? '#3a3a3a' : '#eeeeee');
    return {gen:true, product:{id:formula, f:formula, name, col}, ions:[[M,q,nM],[X,an,nX]], eq, fx, kind, flame, smoke: X==='O' ? '#f2f2f2' : '#dddddd',
      what:`${EL[M].name} melepas ${ve} elektron per atom, dan ${EL[X].name.toLowerCase()} menangkapnya. Ion positif dan negatif yang terbentuk saling tarik membentuk senyawa ion ${formula}. Perbandingannya ${nM}:${nX} supaya muatannya seimbang (${nM}×(+${q}) + ${nX}×(${an}) = 0). ${cond}`.trim(),
      real:`Rumus ini dihitung dari muatan ion yang paling umum. Beberapa logam bisa punya muatan lain dan membentuk senyawa yang berbeda.`,
      warn: (EL[M].z >= 84 || ['Tc','Pm'].includes(M)) ? `${EL[M].name} adalah unsur radioaktif. Hanya ditangani di laboratorium khusus.` : (X === 'F' ? 'Gas fluorin sangat beracun dan korosif.' : null)};
  }
  if (a === 'H' || b === 'H'){
    const o = a === 'H' ? b : a;
    if (['Br','I'].includes(o)) return {gen:true, product:{id:'H'+o, f:'H'+o, name:`Hidrogen ${o==='Br'?'bromida':'iodida'}`, col:'#f0f0e0'}, eq:`H₂ + ${o}₂ → 2H${o}`, fx:['gas'], gas: o==='Br' ? '#c86a3a' : '#9b6bd1', kind:['Sintesis'],
      what:`Hidrogen bereaksi dengan ${EL[o].name.toLowerCase()} saat dipanaskan membentuk gas H${o}, yang di dalam air menjadi asam kuat.`, real:'Halogen makin ke bawah golongan 17 makin kurang reaktif terhadap hidrogen.'};
  }
  return {none:true, msg:`Kombinasi ${A.name.toLowerCase()} dan ${B.name.toLowerCase()} tidak bereaksi dalam kondisi biasa, atau butuh kondisi khusus yang belum ada di database kami.`};
}


// Items are either {t:'el', s:'Na'} or {t:'cmp', id:'H2O', f, name, col}
const itemKey = it => it.t === 'el' ? it.s : it.id;
function itemLabel(it){ return it.t === 'el' ? it.s : (C[it.id]?.f || it.f); }
function itemColor(it){ return it.t === 'el' ? CATS[EL[it.s].cat].c : (C[it.id]?.col || it.col || '#ccc'); }
function itemName(it){ return it.t === 'el' ? EL[it.s].name : (C[it.id]?.name || it.name); }
function resolve(a, b){
  const key = [itemKey(a), itemKey(b)].sort().join('+');
  if (R[key]) return {key, ...R[key], product:{id:R[key].p, ...C[R[key].p]}};
  if (a.t === 'el' && b.t === 'el') return {key, ...genericReaction(a.s, b.s)};
  return {key, none:true, msg:`${itemName(a)} dan ${itemName(b)} tidak bereaksi, atau kombinasinya belum ada di database kami. Coba campur dengan unsur lain!`};
}


export { genericReaction, itemKey, itemLabel, itemColor, itemName, resolve };

// Generic products (e.g. KBr) are added to the registry the first time they are made,
// so they can be dragged back in from the collection.
export function registerCompound(p){ if (!C[p.id]) C[p.id] = {f:p.f, name:p.name, col:p.col}; }
