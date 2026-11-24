// Auto-split from the single-file prototype. Edit the data here; UI lives in components/kimia.
// Compound registry: id -> display formula, Indonesian name, token color.
const C = {
  H2O:{f:'H₂O',name:'Air',col:'#4aa3ff'}, NaCl:{f:'NaCl',name:'Natrium klorida (garam dapur)',col:'#f5f5f5'},
  NaOH:{f:'NaOH',name:'Natrium hidroksida',col:'#e8eaf2'}, KOH:{f:'KOH',name:'Kalium hidroksida',col:'#e8eaf2'},
  LiOH:{f:'LiOH',name:'Litium hidroksida',col:'#e8eaf2'}, RbOH:{f:'RbOH',name:'Rubidium hidroksida',col:'#e8eaf2'},
  CsOH:{f:'CsOH',name:'Sesium hidroksida',col:'#e8eaf2'}, CaOH2:{f:'Ca(OH)₂',name:'Kalsium hidroksida (kapur mati)',col:'#f0f0f0'},
  MgO:{f:'MgO',name:'Magnesium oksida',col:'#f7f7f7'}, Fe2O3:{f:'Fe₂O₃',name:'Besi(III) oksida (karat)',col:'#a0402a'},
  FeS:{f:'FeS',name:'Besi(II) sulfida',col:'#2b2b2b'}, CO2:{f:'CO₂',name:'Karbon dioksida',col:'#d8d8d8'},
  HCl:{f:'HCl',name:'Hidrogen klorida',col:'#c8ffd8'}, HF:{f:'HF',name:'Hidrogen fluorida',col:'#e5ffd5'},
  NH3:{f:'NH₃',name:'Amonia',col:'#e8f4ff'}, Al2O3:{f:'Al₂O₃',name:'Aluminium oksida',col:'#f0f0f0'},
  Fe_l:{f:'Fe(l)',name:'Besi cair',col:'#ff7a1a'}, SO2:{f:'SO₂',name:'Belerang dioksida',col:'#f0f0d0'},
  P4O10:{f:'P₄O₁₀',name:'Tetrafosfor dekaoksida',col:'#ffffff'}, CuO:{f:'CuO',name:'Tembaga(II) oksida',col:'#1e1e1e'},
  ZnS:{f:'ZnS',name:'Seng sulfida',col:'#f6f2d0'}, CaO:{f:'CaO',name:'Kalsium oksida (kapur tohor)',col:'#f4f4f4'},
  Ag2S:{f:'Ag₂S',name:'Perak sulfida',col:'#222222'}, NO2:{f:'NO₂',name:'Nitrogen dioksida',col:'#b5651d'},
  XeF2:{f:'XeF₂',name:'Xenon difluorida',col:'#ffffff'}, NaK:{f:'NaK',name:'Paduan natrium–kalium',col:'#c9cdd3'},
  Bronze:{f:'Cu+Sn',name:'Perunggu',col:'#b07a3c'}, Brass:{f:'Cu+Zn',name:'Kuningan',col:'#d4b04a'},
  Steel:{f:'Fe+C',name:'Baja',col:'#8d949e'}, Solder:{f:'Sn+Pb',name:'Timah solder',col:'#a9a9a9'},
  Electrum:{f:'Au+Ag',name:'Elektrum',col:'#e6cf7a'}, SiO2:{f:'SiO₂',name:'Silikon dioksida (pasir/kuarsa)',col:'#efe6d0'},
  CH4:{f:'CH₄',name:'Metana',col:'#eef6ff'}, H2CO3:{f:'H₂CO₃',name:'Asam karbonat',col:'#cfe9ff'},
  NH4Cl:{f:'NH₄Cl',name:'Amonium klorida',col:'#fafafa'}, H2SO3:{f:'H₂SO₃',name:'Asam sulfit',col:'#e9f2ff'},
  HNO3:{f:'HNO₃',name:'Asam nitrat',col:'#fff6d6'}, AlBr3:{f:'AlBr₃',name:'Aluminium bromida',col:'#e8e0d0'},
  AlI3:{f:'AlI₃',name:'Aluminium iodida',col:'#d9c8b0'}, Li3N:{f:'Li₃N',name:'Litium nitrida',col:'#6b2a4a'},
  H2S:{f:'H₂S',name:'Hidrogen sulfida',col:'#f2f0a0'}, FeCl3:{f:'FeCl₃',name:'Besi(III) klorida',col:'#6b3a1a'},
  PCl3:{f:'PCl₃',name:'Fosfor triklorida',col:'#f4f4e0'}, SF6:{f:'SF₆',name:'Belerang heksafluorida',col:'#f0f0ff'}, HgS:{f:'HgS',name:'Raksa(II) sulfida',col:'#252525'},
};
const DIATOMIC = {H:'#eaf4ff',N:'#cfe0ff',O:'#bfe4ff',F:'#f5f5a0',Cl:'#cde86b',Br:'#8b2a12',I:'#4b1f6b'};
const DI_NAME = {H:'Gas hidrogen',N:'Gas nitrogen',O:'Gas oksigen',F:'Gas fluorin',Cl:'Gas klorin',Br:'Bromin',I:'Iodin'};


export { C, DIATOMIC, DI_NAME };
