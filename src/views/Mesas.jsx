import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { Kpi } from '../components/ui';
import { ST } from '../lib/constants';
import { emptyTable, hm, money, tTotal } from '../lib/utils';

export default function Mesas() {
  const { S, user: u, update, toast, setUi } = useApp();
  const ns = Object.keys(S.tables).map(Number).sort((x, y) => x - y);
  const mine = ns.filter(n => S.tables[n].waiter === u.name && S.tables[n].status !== 'libre');
  const owed = mine.reduce((s, n) => s + tTotal(S.tables[n]) - S.tables[n].paid, 0);
  const hasFree = ns.some(n => S.tables[n].status === 'libre');

  const tadd = () => {
    const n = update(D => {
      const ks = Object.keys(D.tables).map(Number);
      const n = (ks.length ? Math.max(...ks) : 0) + 1;
      D.tables[n] = emptyTable();
      return n;
    });
    toast(`Mesa ${n} agregada`);
  };
  const tdel = () => {
    const n = update(D => {
      const free = Object.keys(D.tables).map(Number).filter(k => D.tables[k].status === 'libre');
      if (!free.length) return null;
      const n = Math.max(...free);
      delete D.tables[n];
      return n;
    });
    if (n == null) return toast('No hay mesas libres para quitar');
    setUi(p => { const cart = { ...p.cart }; delete cart[n]; return { cart }; });
    toast(`Mesa ${n} quitada`);
  };

  return (
    <Shell active="mesas">
      <div className="row items-end">
        <div className="fx1 basis-[280px]"><h1>Mesas</h1><p className="muted text-[17px]">Toca una mesa para tomar o agregar pedido.</p></div>
        <Kpi label="Mis mesas abiertas" value={mine.length} />
        <Kpi label="Por cobrar en mis mesas" value={money(owed)} />
      </div>

      {u.role === 'admin' && (
        <div className="card row flex-row py-3.5 px-4">
          <div className="fx1 basis-[240px]">
            <b className="text-[18px]">{ns.length} mesas en el salón</b>
            <div className="muted text-[14px]">Solo se puede quitar una mesa que esté libre.</div>
          </div>
          <button className="btn" onClick={tdel} disabled={!hasFree}>− Quitar mesa</button>
          <button className="btn pri" onClick={tadd}>+ Agregar mesa</button>
        </div>
      )}

      <div className="legend">
        <span><i className="bg-white border-[#9FB6CA]!" />Libre</span>
        <span><i className="bg-[#CDE9F8] border-sky!" />Ocupada</span>
        <span><i className="bg-ocean" />En cocina</span>
        <span><i className="bg-red" />Lista para cobrar</span>
      </div>

      <div className="mgrid">
        {ns.map(n => {
          const t = S.tables[n], [lab, cls] = ST[t.status];
          const lock = t.status !== 'libre' && t.waiter !== u.name && u.role !== 'admin';
          const inner = (
            <>
              <div className="row justify-between items-start"><span className="n">{n}</span><span className="mp">{lab}</span></div>
              <div className="text-[15px] font-bold">{t.status === 'libre' ? 'Toca para abrir' : `${t.waiter} · desde ${hm(t.openedAt)}`}</div>
              <div className="num text-[24px]">{t.status === 'libre' ? '' : money(tTotal(t) - t.paid)}</div>
            </>
          );
          return lock
            ? <div key={n} className={`mesa ${cls} lock`} aria-disabled="true">{inner}</div>
            : <a key={n} className={`mesa ${cls}`} href={`#pedido-${n}`} aria-label={`Mesa ${n}, ${lab}`}>{inner}</a>;
        })}
      </div>
    </Shell>
  );
}
