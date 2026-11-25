import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { PageHead } from '../components/ui';
import { Pin } from '../components/Icons';
import { deliverOrder, hm, inRange, money, oTotal } from '../lib/utils';

const COLS = [['pendiente', 'Pendientes', '#E8B700'], ['recoger', 'Para recoger', '#4AB0E4'], ['camino', 'En camino', '#1769AA'], ['entregado', 'Entregados hoy', '#1E9E5A']];

export default function Domicilios() {
  const { S, ui, setUi, update, toast } = useApp();
  const riders = S.users.filter(x => x.role === 'domi' && x.active);
  const today = Date.now();
  const delivered = S.orders.filter(o => o.status === 'entregado' && inRange(o.doneAt, 'dia', today));

  const assign = (id, r) => setUi(p => ({ assign: { ...p.assign, [id]: r } }));
  const dispatch = id => {
    const r = ui.assign[id];
    if (!r) return;
    update(D => { const o = D.orders.find(x => x.id === id); if (o) { o.rider = r; o.status = 'camino'; o.sentAt = Date.now(); } });
    toast(`Despachado con ${r}`);
  };
  const deliver = id => deliverOrder(update, toast, id);
  const fee = d => update(D => { D.fee = Math.max(0, D.fee + d); });

  const card = o => {
    const chosen = ui.assign[o.id];
    let actions = null;
    if (o.status === 'pendiente') actions = (
      <>
        <div className="lab">Asignar a:</div>
        <div className="row gap-2">
          {riders.length ? riders.map(r => <button key={r.id} className={`chip rounded-xl flex-1 ${chosen === r.name ? 'on' : ''}`} onClick={() => assign(o.id, r.name)}>{r.name}</button>)
            : <span className="muted">No hay domiciliarios activos</span>}
        </div>
        <button className="btn pri" onClick={() => dispatch(o.id)} disabled={!chosen}>{chosen ? 'Despachar con ' + chosen : 'Elige domiciliario'}</button>
      </>
    );
    if (o.status === 'recoger') actions = <button className="btn green" onClick={() => deliver(o.id)}>Entregado y cobrado</button>;
    if (o.status === 'camino') actions = (
      <>
        <div className="row gap-2"><span className="av w-8 h-8 text-[14px]">{o.rider[0]}</span><b className="fx1">{o.rider} · salió {hm(o.sentAt)}</b></div>
        <button className="btn" onClick={() => deliver(o.id)}>Marcar entregado</button>
      </>
    );
    if (o.status === 'entregado') actions = <div className="muted font-bold">{o.rider ? o.rider + ' · ' : ''}entregado {hm(o.doneAt)}</div>;
    return (
      <article key={o.id} className="ocard">
        <div className="ln"><b className="text-[18px]">{o.client}</b><span className="num text-[24px]">{money(oTotal(o))}</span></div>
        <div className="row gap-2 items-start text-soft text-[15px]"><Pin /><span className="fx1">{o.type === 'domicilio' ? o.address : 'Recoge en el local'}</span></div>
        <div className="muted text-[14px]">{o.items.map(l => l.qty + ' × ' + l.name).join(' · ')}{o.fee ? ' · domicilio ' + money(o.fee) : ''}</div>
        <div className="row gap-1.5"><span className="pill">{o.pay}</span><span className="pill">{o.phone}</span><span className="pill">Llegó {hm(o.at)}</span></div>
        {actions}
      </article>
    );
  };

  return (
    <Shell active="domicilios">
      <PageHead title="Domicilios" sub={`${delivered.length} entregados hoy · ${money(delivered.reduce((s, o) => s + oTotal(o), 0))}`}>
        <a className="btn pri" href="#whatsapp">+ Pedido de WhatsApp</a>
      </PageHead>

      <div className="row items-stretch">
        <div className="kpi row flex-[1_1_300px] gap-3">
          <div className="fx1"><b>Valor del domicilio</b><span className="muted text-[14px]">Aplica a los pedidos nuevos</span></div>
          <button className="qb" onClick={() => fee(-500)} aria-label="Bajar $500">−</button>
          <span className="num text-[28px]! min-w-[100px] text-center">{money(S.fee)}</span>
          <button className="qb" onClick={() => fee(500)} aria-label="Subir $500">+</button>
        </div>
        <div className="kpi row flex-[2_1_360px] gap-3">
          <b>Domiciliarios</b>
          {riders.map(r => {
            const busy = S.orders.some(o => o.status === 'camino' && o.rider === r.name);
            return (
              <div key={r.id} className="row gap-2 bg-ground rounded-xl py-1.5 px-3">
                <span className="av w-9 h-9">{r.name[0]}</span>
                <div className="leading-[1.2]"><b>{r.name}</b><div className={`text-[13px] font-extrabold ${busy ? 'text-ocean' : 'text-greend'}`}>{busy ? 'En ruta' : 'Disponible'}</div></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cols">
        {COLS.map(([st, title, col]) => {
          const list = S.orders.filter(o => o.status === st && (st !== 'entregado' || inRange(o.doneAt, 'dia', today))).sort((x, y) => y.at - x.at);
          return (
            <section key={st} className="col">
              <div className="row gap-2 py-1 px-1.5"><span className="w-3.5 h-3.5 rounded-full" style={{ background: col }} /><h2 className="fx1">{title}</h2><span className="pill bg-white">{list.length}</span></div>
              {list.length ? list.map(card) : <p className="muted p-1.5">Nada por ahora.</p>}
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
