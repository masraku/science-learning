// Bond structures for the "Struktur & ikatan" section.
// STRUCT: covalent molecules. at = [element, x, y, charge?], b = [atomIndex, atomIndex, bondOrder]
// ION: ionic compounds as [ion, charge, count]
const ring = (n, r=1, start=-Math.PI/2) => Array.from({length:n}, (_,i) => [Math.cos(start+i*2*Math.PI/n)*r, Math.sin(start+i*2*Math.PI/n)*r]);
const STRUCT = {
  H2O:{at:[['O',0,0],['H',-.85,.6],['H',.85,.6]], b:[[0,1,1],[0,2,1]], txt:'H–O–H', note:'Bentuknya bengkok (seperti huruf V) karena O masih punya 2 pasang elektron bebas.'},
  CO2:{at:[['O',-1.15,0],['C',0,0],['O',1.15,0]], b:[[0,1,2],[1,2,2]], txt:'O=C=O', note:'Bentuknya lurus. C memakai 4 elektronnya: 2 pasang ke tiap O.'},
  HCl:{at:[['H',-.55,0],['Cl',.6,0]], b:[[0,1,1]], txt:'H–Cl'}, HF:{at:[['H',-.55,0],['F',.6,0]], b:[[0,1,1]], txt:'H–F'},
  HBr:{at:[['H',-.55,0],['Br',.6,0]], b:[[0,1,1]], txt:'H–Br'}, HI:{at:[['H',-.55,0],['I',.6,0]], b:[[0,1,1]], txt:'H–I'},
  NH3:{at:[['N',0,0],['H',-.95,.6],['H',.95,.6],['H',0,-1.05]], b:[[0,1,1],[0,2,1],[0,3,1]], txt:'NH₃ (3 × N–H)', note:'N masih punya 1 pasang elektron bebas, jadi bentuknya piramida.'},
  CH4:{at:[['C',0,0],['H',-1.05,0],['H',1.05,0],['H',0,-1.05],['H',0,1.05]], b:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]], txt:'CH₄ (4 × C–H)', note:'Aslinya 3D berbentuk tetrahedron (seperti piramida segitiga).'},
  SO2:{at:[['O',-1.05,.55],['S',0,0],['O',1.05,.55]], b:[[0,1,2],[1,2,2]], txt:'O=S=O', note:'Bentuknya bengkok karena S masih punya sepasang elektron bebas.'},
  NO2:{at:[['O',-1.05,.55],['N',0,0],['O',1.05,.55]], b:[[0,1,2],[1,2,1]], txt:'O=N–O', note:'NO₂ punya 1 elektron tak berpasangan (radikal). Sebenarnya kedua ikatannya setara karena resonansi: rangkap dua “berpindah-pindah”.'},
  H2S:{at:[['S',0,0],['H',-.85,.6],['H',.85,.6]], b:[[0,1,1],[0,2,1]], txt:'H–S–H'},
  SF6:{at:[['S',0,0],...ring(6,1.1).map(([x,y])=>['F',x,y])], b:[1,2,3,4,5,6].map(i=>[0,i,1]), txt:'SF₆ (6 × S–F)', note:'Aslinya 3D berbentuk oktahedron. S bisa punya lebih dari 8 elektron di kulit terluarnya.'},
  PCl3:{at:[['P',0,0],['Cl',-1.05,.6],['Cl',1.05,.6],['Cl',0,-1.15]], b:[[0,1,1],[0,2,1],[0,3,1]], txt:'PCl₃ (3 × P–Cl)'},
  H2CO3:{at:[['C',0,0],['O',0,-1.1],['O',-1.05,.6],['O',1.05,.6],['H',-2,.1],['H',2,.1]], b:[[0,1,2],[0,2,1],[0,3,1],[2,4,1],[3,5,1]], txt:'HO–C(=O)–OH'},
  H2SO3:{at:[['S',0,0],['O',0,-1.1],['O',-1.05,.6],['O',1.05,.6],['H',-2,.1],['H',2,.1]], b:[[0,1,2],[0,2,1],[0,3,1],[2,4,1],[3,5,1]], txt:'HO–S(=O)–OH'},
  HNO3:{at:[['N',0,0,'+'],['O',0,-1.1],['O',-1.05,.6],['O',1.05,.6,'−'],['H',-2,.1]], b:[[0,1,2],[0,2,1],[0,3,1],[2,4,1]], txt:'HO–N(=O)–O', note:'Ikatan N=O dan N–O⁻ sebenarnya beresonansi (bergantian), jadi panjangnya hampir sama.'},
  XeF2:{at:[['F',-1.15,0],['Xe',0,0],['F',1.15,0]], b:[[0,1,1],[1,2,1]], txt:'F–Xe–F', note:'Xe masih punya 3 pasang elektron bebas di sekelilingnya.'},
  SiO2:{at:[['Si',0,0],['O',-1.1,0],['O',1.1,0],['O',0,-1.1],['O',0,1.1]], b:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]], txt:'…–O–Si–O–…', note:'Ini cuma potongan kecil. SiO₂ adalah jaringan raksasa: tiap Si terikat 4 O dan tiap O menyambung 2 Si. Tidak ada molekul SiO₂ yang terpisah.'},
  P4O10:{txt:'P₄O₁₀', note:'Strukturnya seperti sangkar 3D: 4 atom P dihubungkan jembatan P–O–P (ikatan tunggal), dan tiap P juga punya 1 ikatan rangkap P=O.', counts:{1:12, 2:4}},
};
const DI_ORDER = {H:1,N:3,O:2,F:1,Cl:1,Br:1,I:1};
for (const [e,o] of Object.entries(DI_ORDER)) STRUCT[e+'2'] = {at:[[e,-.62,0],[e,.62,0]], b:[[0,1,o]], txt:`${e}${['','–','=','≡'][o]}${e}`,
  note: o === 3 ? 'Ikatan rangkap tiga ini sangat kuat, makanya gas nitrogen di udara sangat sulit bereaksi.' : o === 2 ? 'Tiap atom O butuh 2 elektron lagi, jadi mereka berbagi 2 pasang.' : 'Tiap atom butuh 1 elektron lagi, jadi cukup berbagi 1 pasang.'};
const ION = {
  NaCl:[['Na',1,1],['Cl',-1,1]], NaOH:[['Na',1,1],['OH',-1,1]], KOH:[['K',1,1],['OH',-1,1]], LiOH:[['Li',1,1],['OH',-1,1]],
  RbOH:[['Rb',1,1],['OH',-1,1]], CsOH:[['Cs',1,1],['OH',-1,1]], CaOH2:[['Ca',2,1],['OH',-1,2]], MgO:[['Mg',2,1],['O',-2,1]],
  Fe2O3:[['Fe',3,2],['O',-2,3]], FeS:[['Fe',2,1],['S',-2,1]], Al2O3:[['Al',3,2],['O',-2,3]], CuO:[['Cu',2,1],['O',-2,1]],
  ZnS:[['Zn',2,1],['S',-2,1]], CaO:[['Ca',2,1],['O',-2,1]], Ag2S:[['Ag',1,2],['S',-2,1]], Li3N:[['Li',1,3],['N',-3,1]],
  FeCl3:[['Fe',3,1],['Cl',-1,3]], AlBr3:[['Al',3,1],['Br',-1,3]], AlI3:[['Al',3,1],['I',-1,3]], HgS:[['Hg',2,1],['S',-2,1]],
  NH4Cl:[['NH4',1,1],['Cl',-1,1]],
};

export { STRUCT, ION, DI_ORDER };
