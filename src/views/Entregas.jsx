import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { Check, Pin } from '../components/Icons';
import { deliverOrder, hm, inRange, money, oTotal } from '../lib/utils';

export default function Entregas() {
  const { S, user: u, update, toast } = useApp();
  const mine = S.orders.filter(o => o.rider === u.name && o.status === 'camino');
  const done = S.orders.filter(o => o.rider === u.name && o.status === 'entregado' && inRange(o.doneAt, 'dia', Date.now()));
  const cash = done.filter(o => o.pay === 'Efectivo').reduce((s, o) => s + oTotal(o), 0);

  return (
    <Shell active="entregas">
      <h1>{mine.length ? 'Tus entregas ahora' : 'Sin entregas pendientes'}</h1>
      <div className="split">
        <section className="wide">
          {mine.length ? mine.map(o => (
            <article key={o.id} className="card border-2 border-ocean p-0 overflow-hidden gap-0">
              <div className="row bg-ocean text-white py-3 px-[18px]"><b className="fx1">EN CAMINO · salió {hm(o.sentAt)}</b><b>{o.client}</b></div>
              <div className="p-[18px] flex flex-col gap-3.5">
                <div>
                  <div className="lab">Llevar a</div>
                  <div className="text-[24px] font-extrabold leading-[1.2]">{o.address}</div>
                  <div className="muted font-bold">Tel. {o.phone}</div>
                </div>
                <div className="g2">
                  <a className="btn dark min-h-[58px]" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`} target="_blank" rel="noopener noreferrer"><Pin /> Abrir en mapa</a>
                  <a className="btn min-h-[58px]" href={`tel:${o.phone.replace(/\s/g, '')}`}>Llamar · {o.phone}</a>
                </div>
                <div className={`kpi ${o.pay === 'Efectivo' ? 'alert' : ''}`}>
                  <b>{o.pay === 'Efectivo' ? 'Cobrar en efectivo' : 'Paga con ' + o.pay + ' al recibir'}</b>
                  <span className="num text-[42px]!">{money(oTotal(o))}</span>
                </div>
                <div className="muted">{o.items.map(l => l.qty + ' × ' + l.name).join(' · ')} · domicilio {money(o.fee)}</div>
                <button className="btn green big" onClick={() => deliverOrder(update, toast, o.id)}><Check /> Marcar entregado</button>
              </div>
            </article>
          )) : <div className="empty">No tienes entregas asignadas.<br />Cuando caja te despache un pedido, aparece aquí.</div>}
        </section>

        <aside className="side2 flex flex-col gap-3.5">
          <div className="kpi dk">
            <b>Efectivo que llevas</b>
            <span className="num text-[36px]!">{money(cash)}</span>
            <div className="text-[14px] text-[#DCEAF5]">Entrégalo en caja al volver.</div>
          </div>
          <div className="card">
            <h2 className="text-[21px]">Entregados hoy</h2>
            {done.length ? done.map(o => (
              <div key={o.id} className="ln border-t border-sep pt-2">
                <span><b>{o.client}</b><br /><small className="muted">{hm(o.doneAt)} · {o.pay}</small></span>
                <b>{money(oTotal(o))}</b>
              </div>
            )) : <p className="muted">Todavía ninguno.</p>}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
