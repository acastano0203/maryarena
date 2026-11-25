import { CATS, RAW } from './constants';

export const money = n => (n < 0 ? '−' : '') + '$' + String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const hm = t => new Date(t).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
export const dk = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export const dLabel = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }); };
export const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
export const num = v => parseInt(String(v).replace(/\D/g, ''), 10) || 0;

export const catOf = id => CATS.find(c => c.id === id);
export const itemOf = (S, id) => S.menu.find(i => i.id === id);
export const tTotal = t => t.items.reduce((a, l) => a + l.price * l.qty, 0);
export const oTotal = o => o.items.reduce((a, l) => a + l.price * l.qty, 0) + o.fee;
export const nid = S => 'x' + (S.seq++) + Math.random().toString(36).slice(2, 6);
export const rid = () => 'k' + Math.random().toString(36).slice(2, 10);
export const emptyTable = () => ({ items: [], waiter: null, openedAt: null, status: 'libre', paid: 0, lastSend: null });
export const resetTable = t => Object.assign(t, emptyTable());

export const inRange = (t, per, ref) => {
  const d = new Date(t), r = new Date(ref);
  if (per === 'dia') return dk(t) === dk(ref);
  if (per === 'semana') {
    const start = new Date(r.getFullYear(), r.getMonth(), r.getDate() - 6).getTime();
    const end = new Date(r.getFullYear(), r.getMonth(), r.getDate() + 1).getTime();
    return t >= start && t < end;
  }
  return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth();
};
export const dayRef = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12).getTime(); };

export function seed() {
  const menu = [];
  CATS.forEach(c => RAW[c.id].forEach((r, i) => menu.push({
    id: c.id + i, cat: c.id, n: r[0], a: r[1] ? r[1] * 1000 : null, b: r[2] * 1000, d: r[3] || '',
    out: false, hidden: false, lunch: r[0] === 'Almuerzo de pescado',
  })));
  const tables = {};
  for (let i = 1; i <= 12; i++) tables[i] = emptyTable();
  const U = (id, name, u, role, phone, active = true) => ({ id, name, u, pass: '1234', role, phone, active });
  return {
    v: 1, seq: 1, menu, tables, fee: 4000, sales: [], expenses: [], orders: [],
    users: [
      U('u1', 'Marta', 'marta', 'admin', '310 555 2201'),
      U('u2', 'Luis', 'luis', 'mesero', '311 482 9910'),
      U('u3', 'Kelly', 'kelly', 'mesero', '320 774 1032'),
      U('u4', 'Andrés', 'andres', 'mesero', '300 219 6684'),
      U('u5', 'Yesica', 'yesica', 'mesero', '315 903 4471', false),
      U('u6', 'Jhon', 'jhon', 'domi', '316 845 2290'),
      U('u7', 'Wilmer', 'wilmer', 'domi', '318 201 7735'),
    ],
    cash: { open: true, base: 200000, openedAt: Date.now(), by: 'Marta', last: null },
  };
}

/** Marca un pedido como entregado y registra la venta. Se usa en Domicilios y en Entregas. */
export function deliverOrder(update, toast, id) {
  const o = update(D => {
    const o = D.orders.find(x => x.id === id);
    if (!o || o.status === 'entregado') return null;
    o.status = 'entregado'; o.doneAt = Date.now();
    D.sales.push({
      id: nid(D), at: o.doneAt, label: (o.type === 'domicilio' ? 'Domicilio · ' : 'Para recoger · ') + o.client, waiter: null, method: o.pay, total: oTotal(o),
      items: o.items.concat(o.fee ? [{ name: 'Domicilio', itemName: 'Domicilio', qty: 1, price: o.fee }] : []),
    });
    return o;
  });
  if (o) toast(`Entregado a ${o.client}`);
}
