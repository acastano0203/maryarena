import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { CloseBtn, Kpi, Modal, PageHead } from '../components/ui';
import { Print } from '../components/Icons';
import { ST } from '../lib/constants';
import { dk, dLabel, hm, inRange, money, oTotal, tTotal } from '../lib/utils';

const ORDER = { cobrar: 0, cocina: 1, ocupada: 2 };
const COL = { cobrar: ['var(--red)', 'bg-red text-white'], cocina: ['var(--ocean)', 'bg-ocean text-white'], ocupada: ['var(--sky)', 'bg-[#CDE9F8]'] };
export const PST = { pendiente: ['Pendiente', 'bg-yel text-yeld'], recoger: ['Para recoger', 'bg-skyl'], camino: ['En camino', 'bg-ocean text-white'] };

export default function Tablero() {
  const { S, update, toast } = useApp();
  const [ticket, setTicket] = useState(null);
  const open = Object.keys(S.tables).map(Number).filter(n => S.tables[n].status !== 'libre')
    .sort((x, y) => ORDER[S.tables[x].status] - ORDER[S.tables[y].status] || S.tables[x].openedAt - S.tables[y].openedAt);
  const today = Date.now();
  const cobrado = S.sales.filter(s => inRange(s.at, 'dia', today)).reduce((a, s) => a + s.total, 0);
  const owed = open.reduce((s, n) => s + tTotal(S.tables[n]) - S.tables[n].paid, 0);
  const listas = open.filter(n => S.tables[n].status === 'cobrar').length;
  const act = S.orders.filter(o => o.status !== 'entregado').sort((x, y) => y.at - x.at);

  const served = n => update(D => { D.tables[n].status = 'ocupada'; });
  const askbill = n => { update(D => { D.tables[n].status = 'cobrar'; }); toast(`Mesa ${n} lista para cobrar`); };

  return (
    <Shell active="tablero">
      <PageHead title="Tablero en vivo" sub={`${dLabel(dk(today))} · se actualiza solo cuando un mesero envía un pedido`}>
        <span className="pill bg-white border border-line py-2 px-3.5 text-[15px]">{S.cash.open ? `Caja abierta · base ${money(S.cash.base)}` : 'Caja cerrada'}</span>
      </PageHead>

      <div className="kpis">
        <Kpi label="Mesas abiertas" value={`${open.length} de ${Object.keys(S.tables).length}`} />
        <Kpi label="Por cobrar en mesas" value={money(owed)} />
        <Kpi label="Cobrado hoy" value={money(cobrado)} />
        <Kpi label="Listas para cobrar" value={`${listas} ${listas === 1 ? 'mesa' : 'mesas'}`} className={listas ? 'alert' : ''} />
      </div>

      <div className="split">
        <section className="wide">
          <h2>Mesas</h2>
          {open.length ? (
            <div className="tgrid">
              {open.map(n => {
                const t = S.tables[n], [bd, hd] = COL[t.status];
                return (
                  <article key={n} className="tcard" style={{ borderColor: bd }}>
                    <div className={`thd ${hd}`}><span className="num text-[28px]">Mesa {n}</span><span className="fx1" /><b className="text-[14px]">{ST[t.status][0]}</b></div>
                    <div className="tbd">
                      <div className="muted text-[14px] font-bold">{t.waiter} · desde {hm(t.openedAt)}</div>
                      {t.items.map((l, i) => {
                        const ex = l.extras.concat(l.notes);
                        return <div key={i} className="ln"><span>{l.qty} × {l.name}{ex.length ? <> <small className="muted">({ex.join(', ')})</small></> : null}</span><span>{money(l.price * l.qty)}</span></div>;
                      })}
                      {t.paid > 0 && <div className="ln muted"><span>Ya abonado</span><span>− {money(t.paid)}</span></div>}
                      <div className="ln border-t-2 border-sep mt-1 pt-2"><b>Total</b><span className="num text-[26px]">{money(tTotal(t) - t.paid)}</span></div>
                      <div className="row gap-2">
                        {t.status === 'cocina' && <button className="btn" onClick={() => served(n)}>Platos entregados</button>}
                        {t.status === 'ocupada' && <button className="btn" onClick={() => askbill(n)}>Lista para cobrar</button>}
                        <button className="qb" onClick={() => setTicket(n)} aria-label={`Ver comanda de la Mesa ${n}`}><Print /></button>
                        <a className={`btn ${t.status === 'cobrar' ? 'red' : 'pri'} fx1`} href={`#cobrar-${n}`}>Cobrar</a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <div className="empty">No hay mesas abiertas.<br />Cuando un mesero envíe un pedido, aparece aquí al instante.</div>}
        </section>

        <aside className="side2 flex flex-col gap-3.5">
          <div className="card">
            <div className="row"><h2 className="fx1 text-[22px]">WhatsApp y domicilios</h2><a className="btn pri" href="#whatsapp">+ Nuevo</a></div>
            {act.length ? act.map(o => (
              <a key={o.id} className="ocard no-underline text-navy" href="#domicilios">
                <div className="row gap-2"><span className={`pill ${PST[o.status][1]}`}>{PST[o.status][0]}{o.rider ? ' · ' + o.rider : ''}</span><span className="fx1" /><b>{money(oTotal(o))}</b></div>
                <b>{o.client}</b>
                <span className="muted text-[14px]">{o.items.map(l => l.qty + ' × ' + l.name).join(' · ')}</span>
              </a>
            )) : <p className="muted">Sin pedidos de WhatsApp ni domicilios pendientes.</p>}
          </div>
        </aside>
      </div>

      {ticket != null && S.tables[ticket] && <TicketModal n={ticket} t={S.tables[ticket]} onClose={() => setTicket(null)} />}
    </Shell>
  );
}

function TicketModal({ n, t, onClose }) {
  const batch = t.items.filter(l => l.at === t.lastSend);
  const body = `COMANDA COCINA\nMesa ${n} · ${t.waiter} · ${hm(t.lastSend)}\n--------------------------------\n`
    + batch.map(l => `${l.qty} ${l.name.toUpperCase()}` + l.extras.concat(l.notes).map(x => `\n   > ${x.toUpperCase()}`).join('')).join('\n')
    + '\n--------------------------------';
  return (
    <Modal label="Comanda" onClose={onClose}>
      <div className="row"><h2 className="fx1">Comanda de la Mesa {n}</h2><CloseBtn onClick={onClose} /></div>
      <div className="ticket">{body}</div>
      <p className="muted text-[14px]">En el restaurante esta comanda sale sola por la impresora térmica al enviar el pedido.</p>
    </Modal>
  );
}
