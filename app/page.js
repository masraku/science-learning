import Link from 'next/link';
import { SUBJECTS } from '@/lib/shared/subjects';

export default function Home(){
  return (
    <main>
      <section className="hero">
        <h2>Lihat, sentuh, coba, pahami. 🔬</h2>
        <p>Belajar sains SMA lewat eksperimen virtual. Bukan menghafal rumus, tapi mencoba sendiri dan melihat apa yang terjadi.</p>
      </section>
      <div className="subjects">
        {SUBJECTS.map(s => (
          <Link key={s.href} href={s.href} className={`subject ${s.ready ? '' : 'soon'}`}>
            <div className="ic">{s.icon}</div>
            <h3>Lab {s.name}</h3>
            <p>{s.blurb}</p>
            <span className="tag">{s.ready ? 'Mulai eksperimen →' : 'Segera hadir'}</span>
          </Link>
        ))}
      </div>
      <footer>Jangan coba eksperimen berbahaya di rumah tanpa pengawasan guru dan alat pelindung.</footer>
    </main>
  );
}
