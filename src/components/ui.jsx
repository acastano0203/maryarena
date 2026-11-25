import { useEffect, useState } from 'react';
import { X } from './Icons';

/** Logo: usa /logo-{variant}.png si existe; si no, el SVG provisional. */
export function Logo({ variant = 'wide', alt = 'Mar y Arena', className }) {
  const [src, setSrc] = useState(`/logo-${variant}.png`);
  return <img src={src} alt={alt} className={className} onError={() => { if (src.endsWith('.png')) setSrc(`/logo-${variant}.svg`); }} />;
}

export function Modal({ label, onClose, children }) {
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="ov" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dlg" role="dialog" aria-modal="true" aria-label={label}>{children}</div>
    </div>
  );
}

export const CloseBtn = ({ onClick }) => <button className="qb" onClick={onClick} aria-label="Cerrar"><X /></button>;

/** Selector segmentado (Día / Semana / Mes ...) */
export function Seg({ label, options, value, onChange }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([k, l]) => <button key={k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>)}
    </div>
  );
}

export const Kpi = ({ label, value, className = '', numClass = '', children }) => (
  <div className={`kpi ${className}`}><b>{label}</b><span className={`num ${numClass}`}>{value}</span>{children}</div>
);

/** Encabezado de página: título + subtítulo + acciones a la derecha */
export const PageHead = ({ title, sub, children }) => (
  <div className="row">
    <div className="fx1 basis-[280px]"><h1>{title}</h1>{sub && <p className="muted text-[17px]">{sub}</p>}</div>
    {children}
  </div>
);

export const BackLink = ({ href, label }) => (
  <a className="qb text-navy" href={href} aria-label={label}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg></a>
);
