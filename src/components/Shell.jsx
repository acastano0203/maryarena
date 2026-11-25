import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/AppContext';
import { ROLE } from '../lib/constants';
import { Menu, X } from './Icons';
import { Logo, Modal } from './ui';

/** Estructura de página: barra lateral para admin, barra superior para mesero y domiciliario. */
export default function Shell({ active, children }) {
  const { S, user: u, logout, ui, setUi, resetDemo } = useApp();
  const [resetOpen, setResetOpen] = useState(false);
  const menuBtn = useRef(null), xBtn = useRef(null), sideRef = useRef(null);

  const setNav = v => {
    setUi({ nav: v });
    if (v) setTimeout(() => xBtn.current?.focus());
    else if (sideRef.current?.contains(document.activeElement)) menuBtn.current?.focus();
  };

  useEffect(() => {
    if (!ui.nav) return;
    const k = e => { if (e.key === 'Escape') setUi({ nav: false }); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [ui.nav, setUi]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width:1025px)');
    const h = m => { if (m.matches) setUi({ nav: false }); };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [setUi]);

  if (u.role !== 'admin') {
    return (
      <>
        <header className="top">
          <div className="in">
            <Logo />
            <span className="fx1" />
            <span className="av bg-ocean text-white">{u.name[0]}</span>
            <div className="leading-[1.2]"><b>{u.name}</b><div className="muted text-[14px]">{ROLE[u.role]}</div></div>
            <button className="btn" onClick={logout}>Salir</button>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </>
    );
  }

  const cobrar = Object.values(S.tables).filter(t => t.status === 'cobrar').length;
  const pend = S.orders.filter(o => o.status === 'pendiente' || o.status === 'recoger').length;
  const nav = [['tablero', 'Tablero en vivo', cobrar], ['mesas', 'Tomar pedido'], ['whatsapp', 'Pedido WhatsApp'], ['domicilios', 'Domicilios', pend], ['gastos', 'Caja y gastos'], ['cierre', 'Cierre y utilidad'], ['usuarios', 'Usuarios'], ['menu', 'Menú']];
  const secName = (nav.find(x => x[0] === active) || ['', ''])[1];
  const alerts = cobrar + pend;

  return (
    <div className="admin">
      <header className="mbar">
        <button ref={menuBtn} className="qb relative" onClick={() => setNav(!ui.nav)} aria-label="Abrir menú" aria-expanded={ui.nav} aria-controls="sidenav">
          <Menu />
          {alerts > 0 && <span className="badge absolute -top-2 -right-2 min-w-[22px] h-[22px] text-[12px]">{alerts}</span>}
        </button>
        <span className="lg"><Logo /></span>
        <span className="sec fx1">{secName}</span>
        <span className="av bg-sky text-navy">{u.name[0]}</span>
      </header>
      <div className={`scrim ${ui.nav ? 'on' : ''}`} onClick={() => setNav(false)} />
      <nav ref={sideRef} className={`side ${ui.nav ? 'open' : ''}`} id="sidenav" aria-label="Menú principal">
        <button ref={xBtn} className="qb xbtn" onClick={() => setNav(false)} aria-label="Cerrar menú"><X /></button>
        <div className="logo"><Logo /></div>
        {nav.map(([h, l, b]) => (
          <a key={h} href={`#${h}`} onClick={() => setNav(false)} className={active === h ? 'on' : ''} aria-current={active === h ? 'page' : undefined}>
            {l}{b ? <span className="badge">{b}</span> : null}
          </a>
        ))}
        <div className="me">
          <div className="row gap-2.5">
            <span className="av">{u.name[0]}</span>
            <div className="leading-[1.2]"><b>{u.name}</b><div className="text-[14px] text-hint">{ROLE.admin}</div></div>
          </div>
          <button className="btn" onClick={logout}>Salir</button>
          <button className="btn text-[14px]" onClick={() => setResetOpen(true)}>Reiniciar demo</button>
        </div>
      </nav>
      <main className="main">{children}</main>
      {resetOpen && (
        <Modal label="Reiniciar demo" onClose={() => setResetOpen(false)}>
          <h2>¿Reiniciar la demo?</h2>
          <p>Se borran mesas, ventas, gastos, domicilios y cambios al menú y a usuarios. Todo vuelve a como empezó.</p>
          <div className="row">
            <button className="btn fx1" onClick={() => setResetOpen(false)}>Cancelar</button>
            <button className="btn red fx1" onClick={() => { setResetOpen(false); resetDemo(); }}>Sí, reiniciar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
