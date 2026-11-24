// Auto-split from the single-file prototype. Edit the data here; UI lives in components/kimia.
const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(' ');
const NAME = "Hidrogen,Helium,Litium,Berilium,Boron,Karbon,Nitrogen,Oksigen,Fluorin,Neon,Natrium,Magnesium,Aluminium,Silikon,Fosfor,Belerang,Klorin,Argon,Kalium,Kalsium,Skandium,Titanium,Vanadium,Kromium,Mangan,Besi,Kobalt,Nikel,Tembaga,Seng,Galium,Germanium,Arsen,Selenium,Bromin,Kripton,Rubidium,Stronsium,Itrium,Zirkonium,Niobium,Molibdenum,Teknesium,Rutenium,Rodium,Paladium,Perak,Kadmium,Indium,Timah,Antimon,Telurium,Iodin,Xenon,Sesium,Barium,Lantanum,Serium,Praseodimium,Neodimium,Prometium,Samarium,Europium,Gadolinium,Terbium,Disprosium,Holmium,Erbium,Tulium,Iterbium,Lutesium,Hafnium,Tantalum,Tungsten,Renium,Osmium,Iridium,Platina,Emas,Raksa,Talium,Timbal,Bismut,Polonium,Astatin,Radon,Fransium,Radium,Aktinium,Torium,Protaktinium,Uranium,Neptunium,Plutonium,Amerisium,Kurium,Berkelium,Kalifornium,Einsteinium,Fermium,Mendelevium,Nobelium,Lawrensium,Rutherfordium,Dubnium,Seaborgium,Bohrium,Hasium,Meitnerium,Darmstadtium,Roentgenium,Kopernisium,Nihonium,Flerovium,Moskovium,Livermorium,Tenesin,Oganeson".split(',');
const CATS = {
  alkali:{n:'Logam alkali', c:'#ff8a80'}, alkaline:{n:'Logam alkali tanah', c:'#ffbf69'},
  transition:{n:'Logam transisi', c:'#ffe066'}, post:{n:'Logam pasca-transisi', c:'#9be89b'},
  metalloid:{n:'Metaloid', c:'#7fe0d4'}, nonmetal:{n:'Nonlogam', c:'#8ecbff'},
  halogen:{n:'Halogen', c:'#c9a7ff'}, noble:{n:'Gas mulia', c:'#ffa8e6'},
  lanthanide:{n:'Lantanida', c:'#e6c9a8'}, actinide:{n:'Aktinida', c:'#f0a8a8'},
};
const setOf = s => new Set(s.split(' ').map(Number));
const CAT_Z = {
  alkali:setOf('3 11 19 37 55 87'), alkaline:setOf('4 12 20 38 56 88'),
  noble:setOf('2 10 18 36 54 86 118'), halogen:setOf('9 17 35 53 85 117'),
  nonmetal:setOf('1 6 7 8 15 16 34'), metalloid:setOf('5 14 32 33 51 52'),
  post:setOf('13 31 49 50 81 82 83 84 113 114 115 116'),
};
const GASES = new Set(['H','He','N','O','F','Ne','Cl','Ar','Kr','Xe','Rn']);
const LIQUIDS = new Set(['Br','Hg']);
function catOf(z){
  if (z>=57 && z<=71) return 'lanthanide';
  if (z>=89 && z<=103) return 'actinide';
  for (const k in CAT_Z) if (CAT_Z[k].has(z)) return k;
  return 'transition';
}
function posOf(z){
  if (z===1) return [1,1]; if (z===2) return [1,18];
  if (z<=10) return [2, z<=4 ? z-2 : z+8];
  if (z<=18) return [3, z<=12 ? z-10 : z];
  if (z<=36) return [4, z-18];
  if (z<=54) return [5, z-36];
  if (z<=86){ if (z<=56) return [6, z-54]; if (z<=71) return [9, z-54]; return [6, z-68]; }
  if (z<=88) return [7, z-86]; if (z<=103) return [10, z-86]; return [7, z-100];
}
const EL = {};
SYM.forEach((s,i) => { const z = i+1; EL[s] = {s, z, name:NAME[i], cat:catOf(z), pos:posOf(z)}; });
const isMetal = s => ['alkali','alkaline','transition','post','lanthanide','actinide'].includes(EL[s].cat);
function valence(s){
  const e = EL[s], g = e.pos[1];
  if (s==='He') return 2;
  if (e.pos[0] > 7 || e.cat==='transition') return null;
  return g<=2 ? g : g-10;
}


const EN = "Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Caesium Barium Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury Thallium Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium Americium Curium Berkelium Californium Einsteinium Fermium Mendelevium Nobelium Lawrencium Rutherfordium Dubnium Seaborgium Bohrium Hassium Meitnerium Darmstadtium Roentgenium Copernicium Nihonium Flerovium Moscovium Livermorium Tennessine Oganesson".split(' ');
const ALIAS = {Cs:'cesium',Al:'aluminum',S:'sulfur sulphur',W:'wolfram',Hg:'air raksa merkuri',Sn:'timah putih',Pb:'timah hitam',Na:'sodium',K:'potasium',Fe:'ferrum',Cu:'cuprum',Ag:'argentum',Au:'aurum'};
SYM.forEach((s,i) => { EL[s].en = EN[i]; });

export { SYM, NAME, EN, ALIAS, CATS, EL, GASES, LIQUIDS, isMetal, valence };
