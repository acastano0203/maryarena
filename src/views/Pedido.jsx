import { useState } from 'react';
import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { BackLink, CloseBtn, Modal } from '../components/ui';
import { Check, Search, Send } from '../components/Icons';
import { CATS, FISH, ST, TAGS } from '../lib/constants';
import { catOf, hm, itemOf, money, norm, rid, tTotal } from '../lib/utils';
import Mesas from './Mesas';

const extra = l => l.extras.concat(l.notes);
const toggle = (arr, v) => (arr.includes(v) ? arr.filter(x => x !== v) : arr.concat(v));

export default function Pedido({ arg }) {
  const { S, user: u, ui, setUi, update, toast, go } = useApp();
  const [lunch, setLunch] = useState(null);
  const n = +arg, t = S.tables[n];

  if (!t) return <Mesas />;
  if (t.status !== 'libre' && t.waiter !== u.name && u.role !== 'admin') {
    return (
      <Shell active="mesas">
        <div className="empty">La Mesa {n} es de {t.waiter}.</div>
        <a className="btn" href="#mesas">Volver a mesas</a>
      </Shell>
    );
  }

  const cart = ui.cart[n] || [];
  const setCart = fn => setUi(p => ({ cart: { ...p.cart, [n]: fn((p.cart[n] || []).map(l => ({ ...l, notes: [...l.notes], extras: [...l.extras] }))) } }));

  const addCart = l => setCart(c => {
    const same = c.find(x => x.name === l.name && x.price === l.price && !x.notes.length && !l.notes.length && x.extras.join() === l.extras.join());
    if (same) same.qty += l.qty; else c.push({ key: rid(), ...l });
    return c;
  });

  const add = (it, k) => {
    if (it.lunch) return setLunch({ id: it.id, fish: 'Mojarra', prep: 'Frito', coco: false, notes: [], qty: 1 });
    addCart({ itemId: it.id, name: it.n + (it.a ? ' · ' + catOf(it.cat).sz[k === 'a' ? 0 : 1] : ''), price: k === 'a' ? it.a : it.b, extras: [], notes: [], qty: 1 });
    toast(it.n + ' agregado');
  };

  const ladd = () => {
    const m = lunch, it = itemOf(S, m.id);
    setLunch(null);
    addCart({ itemId: m.id, name: `Almuerzo ${m.prep.toLowerCase()} · ${m.fish}`, price: it.b + (m.coco ? 1000 : 0), extras: m.coco ? ['Arroz coco'] : [], notes: m.notes.slice(), qty: m.qty });
  };

  const cq = (key, d) => setCart(c => { const l = c.find(x => x.key === key); if (l) l.qty += d; return c.filter(x => x.qty > 0); });
  const ctag = (key, g) => setCart(c => { const l = c.find(x => x.key === key); if (l) l.notes = toggle(l.notes, g); return c; });

  const send = () => {
    if (!cart.length) return;
    const at = Date.now();
    update(D => {
      const tt = D.tables[n];
      tt.items.push(...cart.map(l => ({ name: l.name, price: l.price, qty: l.qty, notes: l.notes, extras: l.extras, at, itemName: (itemOf(D, l.itemId) || {}).n || l.name })));
      if (tt.status === 'libre') { tt.waiter = u.name; tt.openedAt = at; }
      tt.status = 'cocina'; tt.lastSend = at;
    });
    setUi(p => ({ cart: { ...p.cart, [n]: [] }, noteOpen: null }));
    toast(`Mesa ${n} enviada a cocina`);
    go(u.role === 'admin' ? 'tablero' : 'mesas');
  };

  const askbill = () => { update(D => { D.tables[n].status = 'cobrar'; }); toast(`Mesa ${n} lista para cobrar`); };

  // --- grilla del menú
  let list, title;
  if (ui.q.trim()) {
    const q = norm(ui.q);
    list = S.menu.filter(i => !i.hidden && norm(i.n).includes(q));
    title = `${list.length} resultados para “${ui.q}”`;
  } else {
    list = S.menu.filter(i => i.cat === ui.cat && !i.hidden);
    title = `${catOf(ui.cat).name} · ${list.length} platos`;
  }

  const prev = tTotal(t) - t.paid, nw = cart.reduce((a, l) => a + l.price * l.qty, 0);

  return (
    <Shell active="mesas">
      <div className="row">
        <BackLink href="#mesas" label="Volver a mesas" />
        <div className="fx1">
          <h1>Mesa {n}</h1>
          <p className="muted font-bold">{t.status === 'libre' ? 'Mesa nueva · ' + u.name : `${ST[t.status][0]} · ${t.waiter} · desde ${hm(t.openedAt)}`}</p>
        </div>
      </div>

      <div className="split">
        <section className="wide">
          <label className="search">
            <Search />
            <input type="search" value={ui.q} onChange={e => setUi({ q: e.target.value })} placeholder="Buscar: ceviche, mojarra, limonada…" aria-label="Buscar plato" />
          </label>
          <nav className="tabs" aria-label="Categorías">
            {CATS.map(c => <button key={c.id} className={`tab ${ui.cat === c.id && !ui.q ? 'on' : ''}`} onClick={() => setUi({ cat: c.id, q: '' })}>{c.name}</button>)}
          </nav>
          <div>
            <div className="lab mb-2.5">{title}</div>
            <div className="pgrid">
              {list.length ? list.map(it => <ProductCard key={it.id} it={it} onAdd={add} />) : <div className="empty">No hay platos con ese nombre.</div>}
            </div>
          </div>
        </section>

        <aside className="card side2">
          <h2>Pedido de la mesa</h2>
          {t.items.length > 0 && (
            <div className="sent">
              <div className="sth"><Check /> Ya enviado a cocina</div>
              {t.items.map((l, i) => (
                <div key={i} className="ln">
                  <span>{l.qty} × {l.name}{extra(l).length ? <> <small>({extra(l).join(', ')})</small></> : null}</span>
                  <span>{money(l.price * l.qty)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="lab">NUEVO · {cart.reduce((a, l) => a + l.qty, 0)} productos</div>
          {cart.length ? cart.map(l => (
            <div key={l.key} className="cl">
              <div className="row items-start gap-2.5">
                <div className="fx1">
                  <b className="text-[17px]">{l.name}</b>
                  <div className="muted text-[14px] font-bold">{extra(l).join(' · ') || money(l.price) + ' c/u'}</div>
                </div>
                <b>{money(l.price * l.qty)}</b>
              </div>
              <div className="row gap-2">
                <button className="qb" onClick={() => cq(l.key, -1)} aria-label="Quitar uno">−</button>
                <b className="min-w-7 text-center text-[19px]">{l.qty}</b>
                <button className="qb" onClick={() => cq(l.key, 1)} aria-label="Agregar uno">+</button>
                <span className="fx1" />
                <button className="btn bg-skyl border-skyl" onClick={() => setUi({ noteOpen: ui.noteOpen === l.key ? null : l.key })}>
                  {ui.noteOpen === l.key ? 'Listo' : (l.notes.length ? 'Editar nota' : '+ Nota')}
                </button>
              </div>
              {ui.noteOpen === l.key && (
                <div className="row gap-2">
                  {TAGS.map(g => <button key={g} className={`chip ${l.notes.includes(g) ? 'on' : ''}`} onClick={() => ctag(l.key, g)}>{g}</button>)}
                </div>
              )}
            </div>
          )) : <div className="empty p-[18px]">Toca un plato del menú para agregarlo.</div>}

          <div className="tots">
            <div className="ln muted"><span>Ya pedido</span><span>{money(prev)}</span></div>
            <div className="ln muted"><span>Nuevo</span><span>{money(nw)}</span></div>
            <div className="ln"><b className="text-[18px]">Total mesa</b><span className="num text-[32px]">{money(prev + nw)}</span></div>
          </div>
          <button className="btn pri big" onClick={send} disabled={!cart.length}><Send /> Enviar a cocina · {money(nw)}</button>
          {t.items.length > 0 && t.status !== 'cobrar' && <button className="btn big" onClick={askbill}>Pedir la cuenta</button>}
          {t.status === 'cobrar' && <div className="pill bg-redl text-redd justify-center p-3 whitespace-normal">La caja ya tiene esta cuenta lista para cobrar</div>}
        </aside>
      </div>

      {lunch && <LunchModal m={lunch} setM={setLunch} it={itemOf(S, lunch.id)} onAdd={ladd} />}
    </Shell>
  );
}

function ProductCard({ it, onAdd }) {
  const c = catOf(it.cat);
  let btns;
  if (it.out) btns = <button className="btn" disabled>No disponible</button>;
  else if (it.a) btns = (
    <div className="g2">
      {[['a', c.sz[0], it.a], ['b', c.sz[1], it.b]].map(([k, l, v]) => (
        <button key={k} className="szb" onClick={() => onAdd(it, k)}><small>{l}</small><b>{money(v)}</b></button>
      ))}
    </div>
  );
  else btns = (
    <button className="addb" onClick={() => onAdd(it, 'b')}>
      <b>{money(it.b)}</b><span className="text-[15px] font-extrabold">{it.lunch ? 'Elegir pescado' : 'Agregar'}</span>
    </button>
  );
  return (
    <div className={`pcard ${it.out ? 'dim' : ''}`}>
      <div className="row justify-between items-start gap-2">
        <b className="text-[18px] leading-[1.2]">{it.n}</b>
        {it.out && <span className="pill bg-redl text-redd">Agotado hoy</span>}
      </div>
      <div className="muted text-[14px] flex-1">{it.d}</div>
      {btns}
    </div>
  );
}

function LunchModal({ m, setM, it, onAdd }) {
  const set = patch => setM({ ...m, ...patch });
  const unit = it.b + (m.coco ? 1000 : 0);
  return (
    <Modal label="Configurar almuerzo" onClose={() => setM(null)}>
      <div className="row items-start">
        <div className="fx1"><h2 className="text-[28px]">Almuerzo de pescado</h2><p className="muted">{it.d} · {money(it.b)}</p></div>
        <CloseBtn onClick={() => setM(null)} />
      </div>
      <div className="lab">1. Tipo de pescado</div>
      <div className="row gap-2">{FISH.map(f => <button key={f} className={`chip ${m.fish === f ? 'on' : ''}`} onClick={() => set({ fish: f })}>{f}</button>)}</div>
      <div className="lab">2. Preparación</div>
      <div className="g2">{['Frito', 'Sudado'].map(f => <button key={f} className={`chip rounded-[14px] ${m.prep === f ? 'on' : ''}`} onClick={() => set({ prep: f })}>{f}</button>)}</div>
      <button className={`tog ${m.coco ? 'on' : ''}`} onClick={() => set({ coco: !m.coco })}>
        <span className="box"><Check /></span><span className="fx1 text-left">Cambiar a arroz de coco</span><b>+$1.000</b>
      </button>
      <div className="lab">3. Notas para cocina</div>
      <div className="row gap-2">{TAGS.map(g => <button key={g} className={`chip ${m.notes.includes(g) ? 'on' : ''}`} onClick={() => set({ notes: toggle(m.notes, g) })}>{g}</button>)}</div>
      <div className="row">
        <button className="qb" onClick={() => set({ qty: Math.max(1, m.qty - 1) })} aria-label="Menos">−</button>
        <b className="text-[24px] min-w-8 text-center">{m.qty}</b>
        <button className="qb" onClick={() => set({ qty: m.qty + 1 })} aria-label="Más">+</button>
        <button className="btn pri big flex-[1_1_220px] w-auto" onClick={onAdd}>Agregar · {money(unit * m.qty)}</button>
      </div>
    </Modal>
  );
}
