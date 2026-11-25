import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { Seg } from '../components/ui';
import { METHODS } from '../lib/constants';
import { dayRef, dk, dLabel, hm, inRange, money, num } from '../lib/utils';

const P = [['dia', 'Hoy'], ['semana', 'Últimos 7 días'], ['mes', 'Este mes']];
const MK = [['todo', 'Todo'], ['venta', 'Ventas'], ['gasto', 'Gastos']];

function Diff({ c, e }) {
  if (!c) return <div className="kpi fx1"><b>Diferencia</b><span className="num">—</span></div>;
  const d = c - e;
  if (d === 0) return <div className="kpi fx1 bg-greenl border-[#A9DCBE]"><b className="text-greend!">Cuadra exacto</b><span className="num text-greend">$0</span></div>;
  return d < 0
    ? <div className="kpi alert fx1"><b>Faltante</b><span className="num">{money(-d)}</span></div>
    : <div className="kpi fx1 bg-skyl"><b>Sobrante</b><span className="num">{money(d)}</span></div>;
}

export default function Cierre() {
  const { S, ui, setUi, update, toast } = useApp();
  const [hlab, setHlab] = useState('Pasa el mouse por una barra');
  const now = Date.now();

  const ps = S.sales.filter(s => inRange(s.at, ui.period, now)).reduce((x, s) => x + s.total, 0);
  const pg = S.expenses.filter(e => inRange(e.at, ui.period, now)).reduce((x, e) => x + e.value, 0);
  const since = S.cash.open ? S.cash.openedAt : now;
  const shiftSales = S.cash.open ? S.sales.filter(s => s.at >= since) : [];
  const byM = METHODS.map(m => [m, shiftSales.filter(s => s.method === m).reduce((x, s) => x + s.total, 0)]);
  const cashSales = byM[0][1];
  const cashOut = S.cash.open ? S.expenses.filter(e => e.src === 'caja' && e.at >= since).reduce((x, e) => x + e.value, 0) : 0;
  const expected = (S.cash.open ? S.cash.base : 0) + cashSales - cashOut;

  const todaySales = S.sales.filter(s => inRange(s.at, 'dia', now));
  const hours = [];
  for (let h = 10; h <= 22; h++) hours.push([h, todaySales.filter(s => new Date(s.at).getHours() === h).reduce((x, s) => x + s.total, 0)]);
  const hmax = Math.max(1, ...hours.map(h => h[1]));
  const top = {};
  todaySales.forEach(s => s.items.forEach(l => { if (l.itemName === 'Domicilio') return; top[l.itemName] = (top[l.itemName] || 0) + l.qty; }));
  const topL = Object.entries(top).sort((x, y) => y[1] - x[1]).slice(0, 6);
  const tmax = Math.max(1, ...topL.map(t => t[1]));

  const ref = dayRef(ui.cday);
  const moves = S.sales.filter(s => inRange(s.at, 'dia', ref)).map(s => ({ id: s.id, at: s.at, k: 'Venta', d: s.label, m: s.method, v: s.total }))
    .concat(S.expenses.filter(e => inRange(e.at, 'dia', ref)).map(e => ({ id: e.id, at: e.at, k: 'Gasto', d: e.concept, m: e.src === 'caja' ? 'Efectivo de caja' : 'Otro', v: -e.value })))
    .filter(x => ui.mk === 'todo' || (ui.mk === 'venta' ? x.k === 'Venta' : x.k === 'Gasto'))
    .sort((x, y) => y.at - x.at);
  const last = S.cash.last;

  const closeCash = () => {
    const c = ui.cnt;
    if (!c) return toast('Escribe el efectivo contado');
    update(D => { D.cash = { open: false, base: 0, openedAt: D.cash.openedAt, by: D.cash.by, last: { at: Date.now(), expected, counted: c, diff: c - expected } }; });
    setUi({ cnt: 0 });
    toast('Caja cerrada');
  };

  const cuadre = S.cash.open ? (
    <section className="card hl flex-[1_1_380px]">
      <h2>Cuadre de caja</h2>
      <p className="muted text-[14px]">Turno abierto desde las {hm(since)}</p>
      <div className="lab">VENTAS POR MÉTODO DE PAGO</div>
      {byM.map(([m, v]) => <div key={m} className="ln text-[17px]"><span>{m}</span><b>{money(v)}</b></div>)}
      <div className="ln border-t-2 border-sep pt-2 text-[18px]"><b>Total vendido</b><b>{money(byM.reduce((x, m) => x + m[1], 0))}</b></div>
      <div className="bg-ground rounded-2xl p-3.5 flex flex-col gap-1.5">
        <div className="lab">EFECTIVO QUE DEBE HABER</div>
        <div className="ln"><span>Base de apertura</span><span>{money(S.cash.base)}</span></div>
        <div className="ln"><span>+ Ventas en efectivo</span><span>{money(cashSales)}</span></div>
        <div className="ln"><span>− Gastos pagados de caja</span><span>{money(cashOut)}</span></div>
        <div className="ln border-t border-line pt-1.5 text-[18px]"><b>Esperado</b><b>{money(expected)}</b></div>
      </div>
      <div className="row items-stretch">
        <label className="field flex-[1_1_170px]">Efectivo contado
          <input inputMode="numeric" value={ui.cnt ? money(ui.cnt).slice(1) : ''} onChange={e => setUi({ cnt: num(e.target.value) })} placeholder="0" className="text-[24px]! font-extrabold!" />
        </label>
        <div className="flex-[1_1_170px] flex"><Diff c={ui.cnt} e={expected} /></div>
      </div>
      <button className="btn pri big" onClick={closeCash}>Cerrar caja del día</button>
    </section>
  ) : (
    <section className="card flex-[1_1_380px]">
      <h2>Caja cerrada</h2>
      {last && (
        <>
          <p className="muted">Cerrada el {dLabel(dk(last.at))} a las {hm(last.at)}</p>
          <div className="ln"><span>Esperado</span><b>{money(last.expected)}</b></div>
          <div className="ln"><span>Contado</span><b>{money(last.counted)}</b></div>
          <div className="ln"><span>{last.diff === 0 ? 'Cuadró exacto' : (last.diff < 0 ? 'Faltante' : 'Sobrante')}</span><b className={last.diff < 0 ? 'text-redd' : 'text-greend'}>{money(Math.abs(last.diff))}</b></div>
        </>
      )}
      <a className="btn pri big" href="#gastos">Abrir caja nueva</a>
    </section>
  );

  return (
    <Shell active="cierre">
      <div><h1>Cierre y utilidad</h1><p className="muted text-[17px]">{dLabel(dk(now))}</p></div>

      <section className="card">
        <div className="row"><h2 className="fx1">¿Cuánto ganamos?</h2><Seg label="Periodo" options={P} value={ui.period} onChange={k => setUi({ period: k })} /></div>
        <div className="row items-stretch">
          <div className="kpi flex-[1_1_170px]"><b>Vendimos</b><span className="num">{money(ps)}</span></div>
          <span className="num self-center text-muted text-[32px]" aria-hidden="true">−</span>
          <div className="kpi flex-[1_1_170px]"><b>Gastamos</b><span className="num">{money(pg)}</span></div>
          <span className="num self-center text-muted text-[32px]" aria-hidden="true">=</span>
          <div className="kpi dk flex-[1.2_1_190px]"><b>Utilidad{ps ? ' · ' + Math.round((ps - pg) / ps * 100) + '% de lo vendido' : ''}</b><span className="num text-[36px]!">{money(ps - pg)}</span></div>
        </div>
      </section>

      <div className="split">
        {cuadre}
        <div className="wide flex-[1.3_1_440px]">
          <section className="card">
            <div className="row"><h2 className="fx1 text-[21px]">Ventas de hoy por hora</h2><span className="lab">{hlab}</span></div>
            <div className="hbars">
              {hours.map(([h, v]) => (
                <div key={h} title={`${h}:00 · ${money(v)}`} aria-label={`${h}:00, ${money(v)}`} onMouseEnter={() => setHlab(`${h}:00 · ${money(v)}`)}>
                  <i style={{ height: (v / hmax * 100).toFixed(1) + '%' }} />
                </div>
              ))}
            </div>
            <div className="hlabs">{hours.map(([h]) => <span key={h}>{h > 12 ? h - 12 : h}{h >= 12 ? 'p' : 'a'}</span>)}</div>
          </section>

          <section className="card">
            <h2 className="text-[21px]">Lo más vendido hoy</h2>
            {topL.length ? topL.map(([n, q]) => (
              <div key={n} className="row gap-3">
                <span className="flex-[0_1_220px] font-bold">{n}</span>
                <div className="bar"><i style={{ width: Math.round(q / tmax * 100) + '%' }} /></div>
                <b className="w-16 text-right">{q} und.</b>
              </div>
            )) : <p className="muted">Aún no hay ventas hoy.</p>}
          </section>

          <section className="card">
            <div className="row gap-2">
              <h2 className="fx1 text-[21px]">Movimientos</h2>
              <input type="date" value={ui.cday} onChange={e => { if (e.target.value) setUi({ cday: e.target.value }); }} aria-label="Fecha" className="sel h-[46px]! w-auto!" />
              <Seg label="Tipo" options={MK} value={ui.mk} onChange={k => setUi({ mk: k })} />
            </div>
            {moves.length ? (
              <div className="scroll">
                <table>
                  <tbody>
                    {moves.map(m => (
                      <tr key={m.k + m.id}>
                        <td className="muted whitespace-nowrap">{hm(m.at)}</td>
                        <td><span className={`pill ${m.k === 'Venta' ? 'bg-skyl' : 'bg-redl text-redd'}`}>{m.k}</span></td>
                        <td><b>{m.d}</b></td>
                        <td className="muted">{m.m}</td>
                        <td className="r"><b>{money(m.v)}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="muted">Sin movimientos ese día.</p>}
          </section>
        </div>
      </div>
    </Shell>
  );
}
