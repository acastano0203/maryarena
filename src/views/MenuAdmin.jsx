import { useApp } from '../store/AppContext';
import Shell from '../components/Shell';
import { CATS } from '../lib/constants';
import { catOf, money, nid, num } from '../lib/utils';

/** Input de precio: guarda al salir del campo o al presionar Enter. */
function PriceInput({ value, label, onSave }) {
  return (
    <input
      className="sel w-[100px]! h-11!"
      inputMode="numeric"
      defaultValue={money(value).slice(1)}
      aria-label={label}
      onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      onBlur={e => {
        const p = num(e.target.value);
        if (!p) { e.target.value = money(value).slice(1); return; }
        if (p !== value) onSave(p); else e.target.value = money(value).slice(1);
      }}
    />
  );
}

export default function MenuAdmin() {
  const { S, ui, setUi, update, toast } = useApp();
  const c = catOf(ui.mcat), items = S.menu.filter(i => i.cat === c.id);
  const outN = S.menu.filter(i => i.out).length, hidN = S.menu.filter(i => i.hidden).length;

  const setPrice = (id, k, p) => { const it = update(D => { const it = D.menu.find(i => i.id === id); it[k] = p; return it; }); toast(`${it.n}: ${money(p)}`); };
  const mout = id => { const it = update(D => { const it = D.menu.find(i => i.id === id); it.out = !it.out; return it; }); toast(it.out ? `${it.n}: agotado hoy` : `${it.n}: disponible`); };
  const mvis = id => update(D => { const it = D.menu.find(i => i.id === id); it.hidden = !it.hidden; });

  const madd = ev => {
    ev.preventDefault();
    const f = ev.currentTarget, fd = new FormData(f);
    const n = String(fd.get('n')).trim(), b = num(fd.get('b')), a = num(fd.get('a') || 0);
    if (!n || !b) return toast('Falta nombre o precio');
    update(D => { D.menu.push({ id: ui.mcat + 'n' + nid(D), cat: ui.mcat, n, a: a || null, b, d: String(fd.get('d') || '').trim(), out: false, hidden: false, lunch: false }); });
    toast(n + ' agregado al menú');
    f.reset();
  };

  return (
    <Shell active="menu">
      <div>
        <h1>Menú</h1>
        <p className="muted text-[17px]">{S.menu.length} platos en {CATS.length} categorías · {outN} agotado hoy · {hidN} oculto. Los cambios le llegan al mesero al instante.</p>
      </div>

      <div className="split">
        <nav className="card flex-[1_1_200px] p-2.5 gap-1" aria-label="Categorías">
          {CATS.map(k => (
            <button key={k.id} className={`tab flex justify-between border-0 h-[46px] ${ui.mcat === k.id ? 'on' : ''}`} onClick={() => setUi({ mcat: k.id })}>
              <span>{k.name}</span><span className="opacity-75">{S.menu.filter(i => i.cat === k.id).length}</span>
            </button>
          ))}
        </nav>

        <section className="card flex-[3_1_460px] p-0">
          <div className="row pt-4 px-4"><h2 className="fx1">{c.name}</h2><span className="lab">{c.sz ? 'Tamaños: ' + c.sz.join(' / ') : 'Precio único'}</span></div>
          <div className="scroll">
            <table>
              <thead><tr><th>Plato</th><th>Precio{c.sz ? 's' : ''}</th><th>Agotado hoy</th><th>Visible</th></tr></thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id} className={i.hidden ? 'opacity-55' : ''}>
                    <td><b>{i.n}</b><div className="muted text-[13px]">{i.d}</div></td>
                    <td className="whitespace-nowrap">
                      {i.a ? (
                        <label className="lab inline-flex items-center gap-1 mr-1">{c.sz[0].slice(0, 3)}.
                          <PriceInput key={'a' + i.a} value={i.a} label={`Precio ${c.sz[0]} de ${i.n}`} onSave={p => setPrice(i.id, 'a', p)} />
                        </label>
                      ) : null}
                      <label className="lab inline-flex items-center gap-1">{i.a ? c.sz[1].slice(0, 3) + '.' : '$'}
                        <PriceInput key={'b' + i.b} value={i.b} label={`Precio de ${i.n}`} onSave={p => setPrice(i.id, 'b', p)} />
                      </label>
                    </td>
                    <td><button className={`sw redsw ${i.out ? 'on' : ''}`} onClick={() => mout(i.id)} aria-label={`${i.out ? 'Quitar agotado' : 'Marcar agotado'}: ${i.n}`} /></td>
                    <td><button className={`sw ${i.hidden ? '' : 'on'}`} onClick={() => mvis(i.id)} aria-label={`${i.hidden ? 'Mostrar' : 'Ocultar'}: ${i.n}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <form key={c.id} className="card hl flex-[1.4_1_300px]" onSubmit={madd}>
          <h2>Nuevo plato en {c.name}</h2>
          <label className="field">Nombre<input name="n" required placeholder="Ej: Ceviche de Pulpo" /></label>
          <label className="field">Incluye / acompañamientos<input name="d" placeholder="Ej: Caldo, arroz, patacón y ensalada" /></label>
          {c.sz ? (
            <div className="g2">
              <label className="field">Precio {c.sz[0]} (opcional)<input name="a" inputMode="numeric" placeholder="$0" /></label>
              <label className="field">Precio {c.sz[1]}<input name="b" inputMode="numeric" required placeholder="$0" /></label>
            </div>
          ) : <label className="field">Precio<input name="b" inputMode="numeric" required placeholder="$0" /></label>}
          <button className="btn pri big" type="submit">Agregar al menú</button>
          <p className="muted text-[14px]">Un precio nuevo aplica a los pedidos desde ahora. Las cuentas ya cobradas no cambian.</p>
        </form>
      </div>
    </Shell>
  );
}
