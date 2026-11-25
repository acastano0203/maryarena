import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { BackLink } from '../components/ui';
import { Check } from '../components/Icons';
import { METHODS } from '../lib/constants';
import { hm, money, nid, num, resetTable, tTotal } from '../lib/utils';

function payCalc(t, p) {
  const total = tTotal(t), rem = total - t.paid;
  let due = rem, lab = 'A cobrar';
  if (p.mode === 'iguales') {
    const part = Math.ceil(total / p.parts / 100) * 100;
    const k = Math.min(p.parts, Math.floor(t.paid / part + 1e-6) + 1);
    due = Math.min(part, rem); lab = `Parte ${k} de ${p.parts}`;
  }
  if (p.mode === 'items') {
    due = p.sel.reduce((s, i) => s + (t.items[i] ? t.items[i].price * t.items[i].qty : 0), 0);
    lab = 'Esta persona paga';
  }
  return { total, rem, due, lab };
}

function Change({ rec, due }) {
  if (!rec) return <div className="kpi fx1"><b>Cambio</b><span className="num">—</span></div>;
  const d = rec - due;
  return d < 0
    ? <div className="kpi alert fx1"><b>Falta</b><span className="num">{money(-d)}</span></div>
    : <div className="kpi fx1 bg-greenl border-[#A9DCBE]"><b className="text-greend!">Cambio a devolver</b><span className="num text-greend">{money(d)}</span></div>;
}

export default function Cobrar({ arg }) {
  const { S, ui, setUi, update, toast, go } = useApp();
  const n = +arg, t = S.tables[n];

  if (!t || t.status === 'libre') {
    return (
      <Shell active="tablero">
        <div className="empty">La Mesa {n} no tiene cuenta abierta.</div>
        <a className="btn" href="#tablero">Volver al tablero</a>
      </Shell>
    );
  }

  const p = ui.pay && ui.pay.n === n ? ui.pay : { n, mode: 'una', parts: 2, method: 'Efectivo', rec: 0, sel: [] };
  const setP = patch => setUi({ pay: { ...p, ...patch } });
  const c = payCalc(t, p);
  const bills = [...new Set([c.due, Math.ceil(c.due / 10000) * 10000, Math.ceil(c.due / 50000) * 50000, Math.ceil(c.due / 100000) * 100000])].filter(v => v > 0).slice(0, 4);
  const modes = [['una', 'Una cuenta'], ['iguales', 'Partes iguales']].concat(t.paid ? [] : [['items', 'Por productos']]);

  const pay = () => {
    if (c.due <= 0) return toast('Selecciona qué va a pagar');
    if (p.method === 'Efectivo' && p.rec && p.rec < c.due) return toast('Falta plata: ' + money(c.due - p.rec));
    const freed = update(D => {
      const tt = D.tables[n];
      const mapI = l => ({ name: l.name, itemName: l.itemName || l.name, qty: l.qty, price: l.price });
      let items = [], freed = false;
      if (p.mode === 'una') { items = tt.items.map(mapI); freed = true; }
      if (p.mode === 'items') { items = p.sel.map(i => mapI(tt.items[i])); tt.items = tt.items.filter((l, i) => !p.sel.includes(i)); freed = !tt.items.length; }
      if (p.mode === 'iguales') { tt.paid += c.due; if (tt.paid >= c.total) { items = tt.items.map(mapI); freed = true; } }
      D.sales.push({ id: nid(D), at: Date.now(), label: 'Mesa ' + n, waiter: tt.waiter, method: p.method, total: c.due, items });
      if (freed) resetTable(tt);
      return freed;
    });
    const chg = p.method === 'Efectivo' && p.rec ? p.rec - c.due : 0;
    setUi({ pay: freed ? null : { ...p, sel: [], rec: 0 } });
    toast(`Cobrado ${money(c.due)}` + (chg > 0 ? ` · devolver ${money(chg)}` : '') + (freed ? ` · Mesa ${n} libre` : ''));
    if (freed) go('tablero');
  };

  return (
    <Shell active="tablero">
      <div className="row">
        <BackLink href="#tablero" label="Volver al tablero" />
        <div className="fx1"><h1>Cobrar Mesa {n}</h1><p className="muted font-bold">{t.waiter} · desde {hm(t.openedAt)}</p></div>
      </div>

      <div className="split">
        <section className="card flex-[1_1_340px]">
          <h2>Cuenta</h2>
          {p.mode === 'items' && <p className="pill bg-skyl py-2.5 px-3 whitespace-normal">Toca lo que paga esta persona.</p>}
          {t.items.map((l, i) => {
            const on = p.sel.includes(i);
            return p.mode === 'items'
              ? <button key={i} className={`tog min-h-[52px] ${on ? 'on' : ''}`} onClick={() => setP({ sel: on ? p.sel.filter(x => x !== i) : p.sel.concat(i) })}>
                  <span className="box"><Check /></span><span className="fx1 text-left">{l.qty} × {l.name}</span><b>{money(l.price * l.qty)}</b>
                </button>
              : <div key={i} className="ln text-[17px]"><span>{l.qty} × {l.name}</span><b>{money(l.price * l.qty)}</b></div>;
          })}
          <div className="tots">
            {t.paid > 0 && <div className="ln muted"><span>Ya pagado</span><span>− {money(t.paid)}</span></div>}
            <div className="ln"><b className="text-[18px]">Saldo de la mesa</b><span className="num text-[32px]">{money(c.rem)}</span></div>
          </div>
        </section>

        <section className="card hl flex-[1.3_1_400px]">
          <div className="lab">¿Cómo se divide?</div>
          <div className="row gap-2">
            {modes.map(([k, l]) => <button key={k} className={`chip rounded-[14px] ${p.mode === k ? 'on' : ''}`} onClick={() => setP({ mode: k, sel: [], rec: 0 })}>{l}</button>)}
          </div>
          {p.mode === 'iguales' && (
            <div className="row gap-2"><b>Entre</b>
              {[2, 3, 4, 5].map(k => <button key={k} className={`chip ${p.parts === k ? 'on' : ''}`} onClick={() => setP({ parts: k, rec: 0 })}>{k}</button>)}
              <b>personas</b>
            </div>
          )}
          <div className="lab">Método de pago</div>
          <div className="row gap-2">
            {METHODS.map(m => <button key={m} className={`chip rounded-[14px] flex-[1_1_110px] min-h-14 ${p.method === m ? 'on' : ''}`} onClick={() => setP({ method: m })}>{m}</button>)}
          </div>
          <div className="ln bg-ground rounded-2xl py-3.5 px-4"><b className="text-[18px]">{c.lab}</b><span className="num text-[40px]">{money(c.due)}</span></div>
          {p.method === 'Efectivo' ? (
            <>
              <div className="lab">¿Con cuánto paga?</div>
              <div className="row gap-2">
                {bills.map(v => <button key={v} className="chip rounded-[14px] flex-[1_1_100px]" onClick={() => setP({ rec: v })}>{v === c.due ? 'Exacto' : money(v)}</button>)}
              </div>
              <div className="row items-stretch">
                <label className="field fx1 basis-[180px]">Recibido
                  <input inputMode="numeric" value={p.rec ? money(p.rec).slice(1) : ''} onChange={e => setP({ rec: num(e.target.value) })} placeholder="0" className="text-[24px]! font-extrabold!" />
                </label>
                <div className="fx1 flex basis-[180px]"><Change rec={p.rec} due={c.due} /></div>
              </div>
            </>
          ) : <p className="pill bg-ground py-3 px-3.5 whitespace-normal text-[15px]">Confirma en el celular del negocio que llegó la plata antes de cobrar.</p>}
          <button className="btn pri big" onClick={pay}>
            {p.mode === 'una' || c.due >= c.rem ? `Cobrar ${money(c.due)} y liberar mesa` : `Cobrar ${money(c.due)} y seguir`}
          </button>
        </section>
      </div>
    </Shell>
  );
}
