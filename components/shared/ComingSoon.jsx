import Link from 'next/link';

export default function ComingSoon({ subject }){
  return (
    <section className="panel soon-box">
      <div className="ic">{subject.icon}</div>
      <h2>Lab {subject.name} sedang dibangun</h2>
      <p className="hint">{subject.blurb}</p>
      {subject.plan && (
        <ul>{subject.plan.map(p => <li key={p}>{p}</li>)}</ul>
      )}
      <p><Link href="/kimia" className="btn">Coba Lab Kimia dulu 🧪</Link></p>
    </section>
  );
}
