import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { Seg } from '../components/ui';
import { Cam, Check } from '../components/Icons';
import { ECATS } from '../lib/constants';
import { dayRef, dk, dLabel, hm, inRange, money, nid, num } from '../lib/utils';

const PER = [['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes']];

export default function Gastos() {
  const { S, user: u, ui, setUi, update, toast } = useApp();
  const [photoName, setPhotoName] = useState('');
  const ref = dayRef(ui.gday);
  const list = S.expenses.filter(x => inRange(x.at, ui.gper, ref)).sort((x, y) => y.at - x.at);
  const total = list.reduce((s, x) => s + x.value, 0);
  const byCat = ECATS.map(c => [c, list.filter(x => x.cat === c).reduce((s, x) => s + x.value, 0)]).filter(x => x[1]);
  const fromCash = S.expenses.filter(x => x.src === 'caja' && S.cash.open && x.at >= S.cash.openedAt).reduce((s, x) => s + x.value, 0);

  const openCash = ev => {
    ev.preventDefault();
    const b = num(new FormData(ev.currentTarget).get('base'));
    update(D => { D.cash = { open: true, base: b, openedAt: Date.now(), by: u.name, last: D.cash.last }; });
    toast('Caja abierta con ' + money(b));
  };

  const saveExpense = ev => {
    ev.preventDefault();
    const f = ev.currentTarget, fd = new FormData(f);
    const v = num(fd.get('value')), concept = String(fd.get('concept')).trim();
    if (!v || !concept) return toast('Falta valor o concepto');
    const [y, m, d] = String(fd.get('date') || dk(Date.now())).split('-').map(Number), now = new Date();
    const at = new Date(y, m - 1, d, now.getHours(), now.getMinutes()).getTime();
    const ph = fd.get('photo');
    update(D => { D.expenses.push({ id: nid(D), at, concept, cat: fd.get('cat'), src: fd.get('src'), value: v, photo: !!(ph && ph.size) }); });
    toast('Gasto guardado: ' + money(v));
    f.reset();
    setPhotoName('');
  };

  const delExpense = id => { update(D => { D.expenses = D.expenses.filter(x => x.id !== id); }); toast('Gasto borrado'); };

  return (
    <Shell active="gastos">
      <div><h1>Caja y gastos</h1><p className="muted text-[17px]">{dLabel(dk(Date.now()))}</p></div>

      {S.cash.open ? (
        <div className="card row flex-row">
          <span className="av bg-greenl text-greend w-[52px] h-[52px]"><Check /></span>
          <div className="fx1 basis-[220px]">
            <b className="text-[20px]">Caja abierta</b>
            <div className="muted">{S.cash.by} la abrió el {dLabel(dk(S.cash.openedAt))} a las {hm(S.cash.openedAt)}</div>
          </div>
          <span className="num text-[34px]">{money(S.cash.base)}</span>
          <a className="btn dark" href="#cierre">Ir al cierre</a>
        </div>
      ) : (
        <form className="card hl" onSubmit={openCash}>
          <h2>Apertura de caja</h2>
          <p className="muted">La caja está cerrada. Cuenta el efectivo con el que arrancas el día.</p>
          <div className="row">
            <label className="field fx1">Base inicial en efectivo<input name="base" inputMode="numeric" defaultValue="200.000" className="text-[22px]! font-extrabold!" /></label>
            <button className="btn pri min-h-[52px] self-end" type="submit">Abrir caja</button>
          </div>
        </form>
      )}

      <div className="split">
        <form className="card hl flex-[1_1_340px]" onSubmit={saveExpense}>
          <h2>Registrar gasto</h2>
          <div className="g2">
            <label className="field">Fecha<input type="date" name="date" defaultValue={dk(Date.now())} /></label>
            <label className="field">Valor<input name="value" inputMode="numeric" placeholder="$0" required className="font-extrabold!" /></label>
          </div>
          <label className="field">Concepto<input name="concept" required placeholder="Ej: 4 bolsas de hielo" /></label>
          <label className="field">Categoría<select name="cat">{ECATS.map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="field">¿De dónde salió la plata?
            <select name="src"><option value="caja">Efectivo de caja</option><option value="otro">Otro (banco, transferencia)</option></select>
          </label>
          <label className="drop min-h-20">
            <Cam /><span>Foto de la factura (opcional)</span>
            <input type="file" name="photo" accept="image/*" onChange={e => { const f = e.target.files && e.target.files[0]; setPhotoName(f ? f.name : ''); }} />
          </label>
          <span className="muted text-[14px]">{photoName ? 'Factura adjunta: ' + photoName : ''}</span>
          <button className="btn pri big" type="submit">Guardar gasto</button>
        </form>

        <section className="wide flex-[1.6_1_440px]">
          <div className="row gap-2">
            <Seg label="Periodo" options={PER} value={ui.gper} onChange={k => setUi({ gper: k })} />
            <span className="fx1" />
            <label className="field flex-row items-center gap-2">Fecha
              <input type="date" value={ui.gday} onChange={e => { if (e.target.value) setUi({ gday: e.target.value }); }} className="h-[46px]!" />
            </label>
          </div>
          <div className="kpis">
            <div className="kpi dk"><b>Total gastos</b><span className="num">{money(total)}</span></div>
            {byCat.map(([c, v]) => <div key={c} className="kpi"><b>{c}</b><span className="num text-[24px]!">{money(v)}</span></div>)}
          </div>
          <div className="card p-0">
            {list.length ? (
              <div className="scroll">
                <table>
                  <thead><tr><th>Fecha y hora</th><th>Concepto</th><th>Categoría</th><th>Pagado con</th><th className="r">Valor</th><th /></tr></thead>
                  <tbody>
                    {list.map(x => (
                      <tr key={x.id}>
                        <td className="muted whitespace-nowrap">{new Date(x.at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {hm(x.at)}</td>
                        <td><b>{x.concept}</b>{x.photo && <> <span className="pill bg-skyl">factura</span></>}</td>
                        <td><span className="pill bg-skyl">{x.cat}</span></td>
                        <td className="muted">{x.src === 'caja' ? 'Efectivo de caja' : 'Otro'}</td>
                        <td className="r"><b>{money(x.value)}</b></td>
                        <td className="r"><button className="btn ghost text-redd min-h-10" onClick={() => delExpense(x.id)}>Borrar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="empty border-0">No hay gastos en este periodo.</div>}
          </div>
          <p className="muted">Desde que se abrió la caja salieron <b>{money(fromCash)}</b> en efectivo de la caja. Se descuentan solos en el cierre.</p>
        </section>
      </div>
    </Shell>
  );
}
