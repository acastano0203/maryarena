import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { PageHead } from '../components/ui';
import { ROLE } from '../lib/constants';
import { inRange, money, nid, norm } from '../lib/utils';

const RP = { admin: 'bg-navy text-white', mesero: 'bg-skyl', domi: 'bg-ground border border-line' };

export default function Usuarios() {
  const { S, user: u, ui, setUi, update, toast } = useApp();
  const [nonce, setNonce] = useState(0);
  const e = ui.eu === undefined ? null : ui.eu;
  const cur = e ? S.users.find(x => x.id === e) : null;

  const sales = S.sales.filter(s => s.waiter && inRange(s.at, 'dia', Date.now()));
  const by = {};
  sales.forEach(s => { by[s.waiter] = by[s.waiter] || { t: 0, c: 0 }; by[s.waiter].t += s.total; by[s.waiter].c++; });
  const max = Math.max(1, ...Object.values(by).map(x => x.t));

  const utog = id => update(D => { const x = D.users.find(y => y.id === id); x.active = !x.active; });

  const save = ev => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const id = ui.eu, name = String(fd.get('name')).trim(), un = norm(fd.get('u')).replace(/\s/g, ''), pass = String(fd.get('pass')), phone = String(fd.get('phone')).trim(), role = fd.get('role');
    if (!name || !un) return toast('Falta nombre o usuario');
    if (S.users.some(x => norm(x.u) === un && x.id !== id)) return toast('Ese usuario ya existe');
    if (!id && pass.length < 4) return toast('La contraseña debe tener mínimo 4 caracteres');
    if (id && pass && pass.length < 4) return toast('La contraseña debe tener mínimo 4 caracteres');
    if (id) {
      update(D => { const x = D.users.find(y => y.id === id); Object.assign(x, { name, u: un, phone, role }); if (pass) x.pass = pass; });
      toast('Usuario actualizado');
    } else {
      update(D => { D.users.push({ id: nid(D), name, u: un, pass, role, phone, active: true }); });
      toast(`Usuario ${un} creado. Ya puede iniciar sesión`);
    }
    setUi({ eu: undefined });
    setNonce(nonce + 1);
  };

  return (
    <Shell active="usuarios">
      <PageHead title="Usuarios" sub="El administrador crea cada usuario y le asigna su rol.">
        <button className="btn pri" onClick={() => { setUi({ eu: null }); setNonce(nonce + 1); }}>+ Nuevo usuario</button>
      </PageHead>

      <div className="split">
        <section className="wide">
          <div className="card p-0">
            <div className="scroll">
              <table>
                <thead><tr><th>Nombre</th><th>Rol</th><th>Usuario</th><th>Teléfono</th><th>Activo</th><th><span className="sr-only-th">Acciones</span></th></tr></thead>
                <tbody>
                  {S.users.map(x => (
                    <tr key={x.id} className={`${e === x.id ? 'bg-ground' : ''} ${x.active ? '' : 'opacity-55'}`}>
                      <td><div className="row gap-2.5"><span className="av">{x.name[0]}</span><b>{x.name}</b></div></td>
                      <td><span className={`pill ${RP[x.role]}`}>{ROLE[x.role]}</span></td>
                      <td className="font-mono font-bold">{x.u}</td>
                      <td className="muted">{x.phone}</td>
                      <td><button className={`sw ${x.active ? 'on' : ''}`} onClick={() => utog(x.id)} aria-label={`${x.active ? 'Desactivar' : 'Activar'} a ${x.name}`} disabled={x.id === u.id} /></td>
                      <td className="r"><button className="btn" onClick={() => setUi({ eu: x.id })}>Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="text-[21px]">Ventas por mesero hoy</h2>
            {Object.keys(by).length ? Object.entries(by).sort((x, y) => y[1].t - x[1].t).map(([n, v]) => (
              <div key={n} className="row gap-3">
                <b className="w-20">{n}</b>
                <div className="bar"><i style={{ width: Math.round(v.t / max * 100) + '%' }} /></div>
                <b className="w-[110px] text-right">{money(v.t)}</b>
                <span className="muted w-[90px] text-[14px]">{v.c} {v.c === 1 ? 'cobro' : 'cobros'}</span>
              </div>
            )) : <p className="muted">Aún no hay cuentas cobradas hoy.</p>}
          </div>
        </section>

        <form key={`${e}-${nonce}`} className="card hl side2" onSubmit={save}>
          <h2>{cur ? 'Editar a ' + cur.name : 'Nuevo usuario'}</h2>
          <label className="field">Nombre<input name="name" required defaultValue={cur ? cur.name : ''} placeholder="Ej: Kelly" /></label>
          <label className="field">Usuario para entrar<input name="u" required defaultValue={cur ? cur.u : ''} placeholder="Ej: kelly" autoComplete="off" /></label>
          <label className="field">{cur ? 'Nueva contraseña (vacía = no cambiar)' : 'Contraseña'}<input name="pass" type="password" placeholder="Mínimo 4 caracteres" autoComplete="new-password" /></label>
          <label className="field">Teléfono<input name="phone" defaultValue={cur ? cur.phone : ''} placeholder="300 000 0000" /></label>
          <label className="field">Rol
            <select name="role" defaultValue={cur ? cur.role : 'mesero'}>
              {Object.keys(ROLE).map(r => <option key={r} value={r}>{ROLE[r]}</option>)}
            </select>
          </label>
          <button className="btn pri big" type="submit">Guardar</button>
          <p className="muted text-[14px]">Desactivar no borra las ventas del usuario. Solo le quita la entrada.</p>
        </form>
      </div>
    </Shell>
  );
}
