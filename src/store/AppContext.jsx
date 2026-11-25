import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { KEY, SKEY, HOME } from '../lib/constants';
import { dk, norm, seed } from '../lib/utils';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY)); } catch { /* sin storage */ }
  if (!s || s.v !== 1) s = seed();
  persist(s);
  return s;
}
function persist(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* sin storage */ }
}
function parseHash() {
  const m = window.location.hash.slice(1).match(/^([a-z]+)(?:-(\d+))?$/);
  return m ? { name: m[1], arg: m[2] } : { name: '', arg: null };
}

const initUi = () => ({
  cat: 'alm', q: '', cart: {}, noteOpen: null, pay: null, wa: null, eu: undefined, mcat: 'cev',
  gday: dk(Date.now()), gper: 'dia', cday: dk(Date.now()), mk: 'todo', period: 'dia', cnt: 0, assign: {}, nav: false,
});

export function AppProvider({ children }) {
  // Estado compartido del negocio (persistido en localStorage)
  const [S, setS] = useState(load);
  const ref = useRef(S);

  /** Clona el estado, aplica la mutación, guarda y re-renderiza. Devuelve lo que devuelva fn. */
  const update = useCallback(fn => {
    const next = structuredClone(ref.current);
    const r = fn(next);
    ref.current = next;
    persist(next);
    setS(next);
    return r;
  }, []);
  const replace = useCallback(next => { ref.current = next; persist(next); setS(next); }, []);

  // Sesión (por pestaña)
  const [me, setMe] = useState(() => { try { return sessionStorage.getItem(SKEY); } catch { return null; } });
  const user = S.users.find(u => u.id === me && u.active) || null;

  // Estado de interfaz (no se persiste)
  const [ui, setUiState] = useState(initUi);
  const setUi = useCallback(p => setUiState(prev => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) })), []);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const toast = useCallback(m => {
    const id = Math.random();
    setToasts(t => [...t, { id, m }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);

  // Rutas por hash (#mesas, #pedido-3, ...)
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const h = () => { setRoute(parseHash()); setUi({ noteOpen: null, nav: false }); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, [setUi]);
  const go = useCallback(h => {
    if (window.location.hash === '#' + h) setRoute(parseHash());
    else window.location.hash = h;
  }, []);

  // En vivo: otra pestaña guardó cambios
  useEffect(() => {
    const h = e => {
      if (e.key !== KEY || !e.newValue) return;
      try { const next = JSON.parse(e.newValue); ref.current = next; setS(next); } catch { /* ignorar */ }
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  /** Devuelve un mensaje de error, o '' si entró. */
  const doLogin = useCallback((un, p) => {
    if (!un || !p) return 'Escribe tu usuario y tu contraseña.';
    const x = ref.current.users.find(u => norm(u.u) === norm(un));
    if (!x || x.pass !== p) return 'Usuario o contraseña incorrectos.';
    if (!x.active) return 'Este usuario está desactivado. Habla con el administrador.';
    setMe(x.id);
    try { sessionStorage.setItem(SKEY, x.id); } catch { /* sin storage */ }
    go(HOME[x.role]);
    return '';
  }, [go]);

  const logout = useCallback(() => {
    setMe(null);
    try { sessionStorage.removeItem(SKEY); } catch { /* sin storage */ }
    setUi({ cart: {}, pay: null, wa: null, nav: false });
    go('login');
  }, [go, setUi]);

  const resetDemo = useCallback(() => {
    replace(seed());
    setUi({ cart: {}, pay: null, wa: null });
    toast('Demo reiniciada');
  }, [replace, setUi, toast]);

  const value = { S, update, user, doLogin, logout, resetDemo, ui, setUi, toast, route, go };
  return (
    <Ctx.Provider value={value}>
      {children}
      {toasts.map(t => <div key={t.id} className="toast" role="status">{t.m}</div>)}
    </Ctx.Provider>
  );
}
