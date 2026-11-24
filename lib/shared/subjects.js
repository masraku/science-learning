// One entry per lab. Flip `ready` to true when a lab ships; the header and home page update automatically.
export const SUBJECTS = [
  {
    href:'/kimia', name:'Kimia', icon:'🧪', ready:true,
    blurb:'Seret unsur dari tabel periodik ke labu, campur, dan lihat reaksinya: meledak, terbakar, berasap, atau berkarat.',
  },
  {
    href:'/fisika', name:'Fisika', icon:'🚀', ready:true,
    blurb:'Tembakkan meriam kartun: atur sudut, kecepatan, gravitasi (Bumi sampai Jupiter), dan hambatan udara. Lihat lintasan, panah kecepatan, dan grafiknya langsung.',
    plan:['Gerak parabola: atur sudut & kecepatan', 'Hukum Newton: dorong benda dengan gaya berbeda', 'Gesekan: bandingkan permukaan licin dan kasar', 'Grafik posisi & kecepatan secara langsung'],
  },
  {
    href:'/biologi', name:'Biologi', icon:'🫀', ready:false,
    blurb:'Bongkar tubuh manusia lapis demi lapis: kulit, otot, tulang, organ. Plus sel dan simulasi ekosistem.',
    plan:['Tubuh manusia 3D: bongkar organ satu per satu', 'Lapisan kulit → otot → tulang → organ', 'Sel hewan & tumbuhan interaktif', 'Simulasi rantai makanan & populasi'],
  },
];
