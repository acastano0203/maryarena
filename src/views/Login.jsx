import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Warn, Waves } from '../components/Icons';
import { Logo } from '../components/ui';

const DEMO = [['Mesero', 'luis'], ['Admin', 'marta'], ['Domiciliario', 'jhon']];

export default function Login() {
  const { doLogin } = useApp();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  const submit = (un, pw) => {
    const e = doLogin(un, pw);
    if (e) { setErr(e); setP(''); }
  };

  return (
    <div className="login">
      <section className="lhero">
        <div className="lcirc"><Logo variant="circle" alt="Logo Restaurante y Cevichería Mar y Arena" /></div>
        <p className="num text-[32px]">Sistema de pedidos</p>
        <p className="text-[18px] text-soft">Cada quien entra con su usuario y ve solo lo suyo.</p>
        <Waves />
      </section>
      <section className="lform">
        <form className="lbox" autoComplete="on" onSubmit={e => { e.preventDefault(); submit(u, p); }}>
          <div>
            <h1 className="text-[42px]">Iniciar sesión</h1>
            <p className="muted text-[17px] mt-1.5">Escribe el usuario y la contraseña que te dio el administrador.</p>
          </div>
          <label className="field">Usuario
            <input name="u" autoComplete="username" placeholder="Ej: luis" value={u} onChange={e => setU(e.target.value)} />
          </label>
          <label className="field">Contraseña
            <span className="pw">
              <input name="p" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••" value={p} onChange={e => setP(e.target.value)} />
              <button type="button" className="btn" onClick={() => setShow(!show)}>{show ? 'Ocultar' : 'Ver'}</button>
            </span>
          </label>
          {err && <div className="err" role="alert"><Warn /><span>{err}</span></div>}
          <button className="btn pri big" type="submit">Ingresar</button>
          <p className="muted text-center text-[15px]">¿Olvidaste la contraseña? Pídele al administrador que te asigne una nueva.</p>
          <div className="demo">
            <span className="lab">Accesos de prueba · solo para esta demo (clave 1234)</span>
            <div className="g3">
              {DEMO.map(([r, x]) => <button key={x} type="button" className="btn" onClick={() => submit(x, '1234')}>{r}<small>{x}</small></button>)}
            </div>
            <p className="muted text-[14px]">Tip: abre la app en dos pestañas, una como mesero y otra como admin, y verás los pedidos llegar en vivo.</p>
          </div>
        </form>
      </section>
    </div>
  );
}
