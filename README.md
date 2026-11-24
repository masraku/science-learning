# Learn Science 🔬

Platform belajar sains SMA dengan konsep **"learn by experimenting"**: siswa mencoba sendiri, melihat hasilnya, lalu membaca penjelasan kenapa itu terjadi.

| Lab | Status | Isi |
|---|---|---|
| 🧪 Kimia | ✅ jalan | Tabel periodik kartun, drag & drop ke labu, animasi reaksi, struktur ikatan, pencarian |
| 🚀 Fisika | ✅ Gerak Parabola · 🔜 Hukum Newton, Gesekan | Meriam kartun, gravitasi 4 planet, hambatan udara, grafik live, rumus, tantangan target |
| 🫀 Biologi | 🔜 | Bongkar tubuh manusia 3D, sel, ekosistem |

## Menjalankan

```bash
bun install      # atau npm install
bun dev          # http://localhost:3000
```

Next.js 16 (App Router), React 19, JavaScript. Font di-host sendiri lewat `@fontsource`, jadi tidak butuh koneksi ke Google Fonts.

## Struktur folder

```
app/
  layout.js            header + navigasi antar lab
  page.js              beranda: pilih lab
  kimia/page.js        Lab Kimia
  fisika/page.js       Lab Fisika (modul: Gerak Parabola)
  biologi/page.js      placeholder (ComingSoon)
components/
  shared/              dipakai semua lab: SiteHeader, Toast, ComingSoon, useDraggable
  kimia/               ChemistryLab, PeriodicTable, SearchBar, ReactionDock, ReactionCard, BondDiagram
  fisika/              PhysicsLab (pilih modul), ProjectileLab, MiniChart
data/kimia/
  elements.js          118 unsur: nama Indonesia/Inggris, kategori, posisi di tabel
  compounds.js         daftar senyawa: rumus, nama, warna
  reactions.js         reaksi yang ditulis manual (±45): persamaan, animasi, penjelasan
  structures.js        struktur ikatan (– = ≡) dan muatan ion
data/fisika/
  presets.js           gravitasi Bumi/Bulan/Mars/Jupiter dan benda (massa, ukuran)
lib/
  shared/drag.js       drag & drop (mouse + long-press di HP)
  shared/subjects.js   daftar lab; ubah `ready: true` saat lab baru rilis
  shared/cartoon.js    helper gambar kartun untuk canvas (awan, bintang, panah, kata komik)
  kimia/reactionEngine.js  aturan umum untuk kombinasi yang tidak ada di reactions.js
  kimia/flaskEngine.js     canvas labu: token berwajah, animasi kartun (DUAR!, WUSSH!, dll)
  kimia/search.js          pencarian unsur & resep senyawa
  fisika/projectile.js     simulasi gerak parabola (eksak tanpa udara, numerik dengan hambatan udara) + rumus
  fisika/projectileScene.js  canvas meriam: lintasan, panah kecepatan, target, efek "DOR!/BUK!/TEPAT!"
  fisika/insights.js       "temuan" otomatis: sudut 30°/60°, efek gravitasi, udara, massa
prototype/
  lab-kimia.html       versi awal satu file (referensi)
```

## Menambah reaksi baru

Tambahkan entri di `data/kimia/reactions.js`. Kuncinya adalah dua reaktan, diurutkan lalu digabung dengan `+`:

```js
'Al+NaOH': { p:'H2', eq:'2Al + 2NaOH + 6H₂O → 2Na[Al(OH)₄] + 3H₂', fx:['fizz'], kind:['Redoks'], what:'…', real:'…' },
```

- `p` harus ada di `data/kimia/compounds.js`.
- Kalau mau menampilkan struktur ikatannya, tambahkan juga ke `data/kimia/structures.js`.
- Pilihan `fx`: `explode`, `bigboom`, `pop`, `fire`, `flash`, `spark`, `smoke`, `gas`, `fizz`, `glow`, `color`, `molecule`, `alloy`, `rust`.

## Menambah lab baru

1. Buat `app/<lab>/page.js` dan komponennya di `components/<lab>/`.
2. Pakai komponen di `components/shared/` (gaya kartun, drag & drop, toast).
3. Set `ready: true` untuk lab itu di `lib/shared/subjects.js`.

Rencana teknologi:
- Fisika: Matter.js (2D) atau Rapier (3D).
- Biologi: React Three Fiber dengan model Z-Anatomy. Lisensinya CC BY-SA 4.0, jadi wajib mencantumkan atribusi, dan karya turunannya harus memakai lisensi yang sama.
