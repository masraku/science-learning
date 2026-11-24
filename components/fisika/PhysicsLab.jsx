'use client';
import { useState } from 'react';
import { useToast } from '@/components/shared/Toast';
import ProjectileLab from './ProjectileLab';

// Each physics topic is its own module. Add the component here when it's ready.
const MODULES = [
  { id:'parabola', name:'Gerak Parabola', icon:'🎯', ready:true },
  { id:'newton', name:'Hukum Newton', icon:'🛒', ready:false },
  { id:'gesekan', name:'Gesekan', icon:'🧊', ready:false },
];

export default function PhysicsLab(){
  const toast = useToast();
  const [mod, setMod] = useState('parabola');
  return (
    <>
      <div className="modules">
        {MODULES.map(m => (
          <button key={m.id} className={`tab ${mod === m.id ? 'on' : ''}`}
            onClick={() => (m.ready ? setMod(m.id) : toast(`Modul ${m.name} sedang dibangun 🛠️`))}>
            {m.icon} {m.name}{!m.ready && <small>segera</small>}
          </button>
        ))}
      </div>
      {mod === 'parabola' && <ProjectileLab />}
      <footer>Simulasi edukatif. Tanpa hambatan udara hasilnya persis sama dengan rumus buku. Dengan hambatan udara, dipakai model gaya hambat kuadrat untuk bola (koefisien hambat 0,47).</footer>
    </>
  );
}
