import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { Cam, Warn } from '../components/Icons';
import { CATS, FISH, METHODS, SAMPLE } from '../lib/constants';
import { catOf, hm, inRange, itemOf, money, nid, oTotal } from '../lib/utils';
import { lName, lPrice, parseOrder } from '../lib/parser';

const newWa = () => ({ step: 'in', text: '', photo: null, sim: false, lines: [], c: { name: '', phone: '', address: '', barrio: '', type: 'domicilio', pay: 'Nequi' } });
const STEPS = ['Foto o mensaje', 'Revisar productos', 'Confirmar'];
const OST = { pendiente: 'Pendiente', recoger: 'Para recoger', camino: 'En camino', entregado: 'Entregado' };

export default function WhatsApp() {
  const { S, ui, setUi, update, toast, go } = useApp();
  const w = ui.wa || newWa();
  /** Edita una copia del borrador y lo guarda en la interfaz */
  const setW = fn => setUi(p => { const nx = structuredClone(p.wa || newWa()); fn(nx); return { wa: nx }; });

  const si = w.step === 'in' ? 0 : (w.lines.some(l => !l.ok || !l.itemId) ? 1 : 2);
  const head = (
    <div className="row">
      <div className="fx1 basis-[280px]"><h1>Pedido por WhatsApp</h1><p className="muted text-[17px]">El sistema lee la foto o el mensaje y arma el borrador del pedido.</p></div>
      <ol className="steps">{STEPS.map((l, i) => <li key={l} className={i === si ? 'on' : (i < si ? 'done' : '')}><i>{i + 1}</i>{l}</li>)}</ol>
    </div>
  );
  const photo = w.photo ? <img className="photo" src={w.photo} alt="Foto recibida por WhatsApp" /> : null;

  if (w.step === 'in') {
    const onPhoto = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (w.photo) URL.revokeObjectURL(w.photo);
      const url = URL.createObjectURL(f);
      setW(x => { x.photo = url; if (!x.text.trim()) x.text = SAMPLE; x.sim = true; });
    };
    const useSample = () => setW(x => {
      x.text = SAMPLE;
      Object.assign(x.c, { name: 'Carolina Ríos', phone: '300 456 7812', address: 'Cra 45 # 12-30, apto 302', barrio: 'La Floresta', type: 'domicilio', pay: 'Nequi' });
    });
    const read = () => {
      if (!w.text.trim()) return toast('Escribe o sube el pedido primero');
      setW(x => { x.lines = parseOrder(x.text, S.menu); x.step = 'rev'; });
    };
    return (
      <Shell active="whatsapp">
        {head}
        <div className="split">
          <section className="card flex-[1_1_340px]">
            <h2>1. ¿Qué mandó el cliente?</h2>
            <label className="drop">
              <Cam />
              <span>{w.photo ? 'Cambiar foto' : 'Subir foto del pedido o de la comanda'}</span>
              <span className="muted text-[14px] font-semibold">JPG o PNG desde el celular o el computador</span>
              <input type="file" accept="image/*" onChange={onPhoto} />
            </label>
            {photo}
            {w.sim && <p className="pill bg-yel text-yeld whitespace-normal py-2.5 px-3">En esta demo la lectura de la foto es simulada: abajo queda el texto que leería la IA. Puedes corregirlo.</p>}
          </section>
          <section className="card flex-[1_1_340px]">
            <label className="field">Texto del pedido (pegado de WhatsApp o leído de la foto)
              <textarea value={w.text} onChange={e => { const v = e.target.value; setW(x => { x.text = v; }); }} placeholder={'Ej: 2 ceviche bomba grande\n1 almuerzo mojarra frita\n1 limonada jarra'} />
            </label>
            <div className="row">
              <button className="btn" onClick={useSample}>Usar ejemplo</button>
              <button className="btn pri fx1" onClick={read}>Leer pedido</button>
            </div>
          </section>
        </div>
        <TodayList />
      </Shell>
    );
  }

  const sub = w.lines.reduce((s, l) => s + (l.itemId ? lPrice(l, S.menu) * l.qty : 0), 0);
  const fee = w.c.type === 'domicilio' ? S.fee : 0;
  const pend = w.lines.some(l => !l.ok || !l.itemId);
  const setLine = (i, fn) => setW(x => fn(x.lines[i]));

  const confirm = () => {
    const c = w.c;
    if (!w.lines.length) return toast('El pedido no tiene productos');
    if (pend) return toast('Revisa los productos en amarillo');
    if (!c.name.trim() || !c.phone.trim()) return toast('Falta el nombre o el teléfono del cliente');
    if (c.type === 'domicilio' && !c.address.trim()) return toast('Falta la dirección');
    const o = update(D => {
      const o = {
        id: nid(D), at: Date.now(), src: 'WhatsApp', client: c.name.trim(), phone: c.phone.trim(),
        address: c.address.trim() + (c.barrio.trim() ? ' · ' + c.barrio.trim() : ''), type: c.type, pay: c.pay,
        items: w.lines.map(l => ({ name: lName(l, D.menu), itemName: itemOf(D, l.itemId).n, qty: l.qty, price: lPrice(l, D.menu) })),
        fee: c.type === 'domicilio' ? D.fee : 0, status: c.type === 'domicilio' ? 'pendiente' : 'recoger', rider: null,
      };
      D.orders.push(o);
      return o;
    });
    setUi({ wa: null });
    toast(`Pedido de ${o.client} creado · ${money(oTotal(o))}`);
    go('domicilios');
  };

  const field = (k, label, ph) => (
    <label className="field">{label}
      <input value={w.c[k]} placeholder={ph} onChange={e => { const v = e.target.value; setW(x => { x.c[k] = v; }); }} />
    </label>
  );

  return (
    <Shell active="whatsapp">
      {head}
      <div className="split">
        <section className="card flex-[1_1_260px]">
          <div className="row"><h2 className="fx1 text-[20px]">Lo que mandó</h2><button className="btn" onClick={() => setW(x => { x.step = 'in'; })}>Editar</button></div>
          {photo}
          <div className="font-hand text-[24px] leading-[1.25] whitespace-pre-wrap bg-cream rounded-xl py-3 px-3.5">{w.text}</div>
        </section>

        <section className="card flex-[1.5_1_420px]">
          <div className="row"><h2 className="fx1">2. Lo que entendió el sistema</h2><span className="lab">{w.lines.filter(l => l.ok && l.itemId).length} de {w.lines.length} listos</span></div>
          {w.lines.length ? w.lines.map((l, i) => {
            const it = itemOf(S, l.itemId), bad = !l.ok || !it;
            return (
              <div key={i} className={`wl ${bad ? 'yel' : ''}`}>
                <div className="raw">{bad && <><Warn className="inline align-[-4px]" /> </>}Leído: “{l.raw}”{bad ? (it ? ' · ¿es este plato?' : ' · no coincide con el menú') : ''}</div>
                <div className="row gap-2">
                  <select aria-label="Plato" className="flex-[1_1_220px]" value={l.itemId} onChange={e => {
                    const v = e.target.value, ni = itemOf(S, v);
                    setLine(i, x => { x.itemId = v; x.ok = !!v; if (ni && ni.lunch) { x.fish = x.fish || 'Mojarra'; x.prep = x.prep || 'Frito'; } x.size = ni && ni.a ? (x.size || 'b') : null; });
                  }}>
                    <option value="">Elegir plato…</option>
                    {CATS.map(cc => (
                      <optgroup key={cc.id} label={cc.name}>
                        {S.menu.filter(m => m.cat === cc.id && !m.hidden).map(m => <option key={m.id} value={m.id}>{m.n}{m.out ? ' (agotado)' : ''}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  {it && it.a && (
                    <select aria-label="Tamaño" className="flex-[0_1_140px]" value={l.size || 'b'} onChange={e => { const v = e.target.value; setLine(i, x => { x.size = v; }); }}>
                      {['a', 'b'].map((k, j) => <option key={k} value={k}>{catOf(it.cat).sz[j]}</option>)}
                    </select>
                  )}
                  {it && it.lunch && (
                    <>
                      <select aria-label="Pescado" className="flex-[0_1_150px]" value={l.fish} onChange={e => { const v = e.target.value; setLine(i, x => { x.fish = v; }); }}>
                        {FISH.map(f => <option key={f}>{f}</option>)}
                      </select>
                      <button className={`chip ${l.coco ? 'on' : ''}`} onClick={() => setLine(i, x => { x.coco = !x.coco; })}>Arroz coco +$1.000</button>
                    </>
                  )}
                </div>
                <div className="row gap-2">
                  <button className="qb" onClick={() => setLine(i, x => { x.qty = Math.max(1, x.qty - 1); })} aria-label="Menos">−</button>
                  <b className="min-w-[26px] text-center text-[18px]">{l.qty}</b>
                  <button className="qb" onClick={() => setLine(i, x => { x.qty += 1; })} aria-label="Más">+</button>
                  <span className="fx1 font-extrabold">{it ? lName(l, S.menu) : ''}</span>
                  <b>{it ? money(lPrice(l, S.menu) * l.qty) : ''}</b>
                  {bad && it && <button className="btn dark" onClick={() => setLine(i, x => { x.ok = true; })}>Sí, es ese</button>}
                  <button className="btn ghost text-redd" onClick={() => setW(x => { x.lines.splice(i, 1); })}>Quitar</button>
                </div>
              </div>
            );
          }) : <div className="empty">No quedó ningún producto.</div>}
          <button className="btn border-dashed" onClick={() => setW(x => { x.lines.push({ raw: 'agregado a mano', qty: 1, itemId: '', ok: false, size: null }); })}>+ Agregar producto a mano</button>
          <div className="tots">
            <div className="ln muted"><span>Productos</span><span>{money(sub)}</span></div>
            <div className="ln muted"><span>Domicilio</span><span>{money(fee)}</span></div>
            <div className="ln"><b className="text-[18px]">Total a cobrar</b><span className="num text-[34px]">{money(sub + fee)}</span></div>
          </div>
        </section>

        <section className="card flex-[1_1_300px]">
          <h2>3. Cliente</h2>
          <div className="g2">
            {[['domicilio', 'Domicilio'], ['recoger', 'Para recoger']].map(([k, l]) => (
              <button key={k} className={`chip rounded-xl ${w.c.type === k ? 'on' : ''}`} onClick={() => setW(x => { x.c.type = k; })}>{l}</button>
            ))}
          </div>
          {field('name', 'Nombre', 'Ej: Carolina Ríos')}
          {field('phone', 'Teléfono', '300 000 0000')}
          {w.c.type === 'domicilio' && <>{field('address', 'Dirección', 'Cra 45 # 12-30, apto 302')}{field('barrio', 'Barrio', 'Ej: La Floresta')}</>}
          <label className="field">Paga con
            <select value={w.c.pay} onChange={e => { const v = e.target.value; setW(x => { x.c.pay = v; }); }}>
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </label>
          <button className={`btn big ${pend ? '' : 'pri'}`} onClick={confirm}>{pend ? 'Revisa lo que está en amarillo' : 'Confirmar · ' + money(sub + fee)}</button>
          <p className="muted text-[14px]">Al confirmar se crea el pedido y pasa a Domicilios.</p>
        </section>
      </div>
    </Shell>
  );
}

function TodayList() {
  const { S } = useApp();
  const td = S.orders.filter(o => o.src === 'WhatsApp' && inRange(o.at, 'dia', Date.now()));
  return (
    <section className="card">
      <h2 className="text-[21px]">Pedidos de WhatsApp de hoy</h2>
      {td.length ? (
        <div className="scroll">
          <table>
            <thead><tr><th>Hora</th><th>Cliente</th><th>Tipo</th><th>Estado</th><th className="r">Total</th></tr></thead>
            <tbody>
              {td.map(o => (
                <tr key={o.id}><td>{hm(o.at)}</td><td><b>{o.client}</b></td><td>{o.type === 'domicilio' ? 'Domicilio' : 'Para recoger'}</td><td>{OST[o.status]}</td><td className="r"><b>{money(oTotal(o))}</b></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="muted">Todavía no hay pedidos de WhatsApp hoy.</p>}
    </section>
  );
}
