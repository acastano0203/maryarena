// Lector del texto de WhatsApp: convierte cada línea en un producto del menú.
import { FISH } from './constants';
import { norm, catOf } from './utils';

const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'con', 'y', 'en', 'por', 'porfa', 'favor', 'una', 'uno', 'un', 'x', 'grande', 'pequeno', 'pequena', 'peq', 'medio', 'media', 'entero', 'entera', 'al', 'a']);
const ALIAS = [[/\bcoca ?cola\b|\bcocacola\b|\bcoca\b|\bpostobon\b/g, 'gaseosa'], [/\bpola\b|\bpolas\b/g, 'cerveza'], [/\bagua\b/g, 'botella agua']];
const stem = w => w.replace(/(es|s)$/, '');

export function parseOrder(text, menu) {
  return text.split(/\n|;/).map(s => s.trim()).filter(Boolean).map(raw => {
    let qty = 1, rest = raw;
    const m = raw.match(/^(\d+)\s*(x|×)?\s*(.*)$/i);
    if (m) { qty = +m[1] || 1; rest = m[3]; }
    let N = norm(rest);
    ALIAS.forEach(([r, v]) => { N = N.replace(r, v); });
    let size = null;
    if (/\b(grande|entero|entera)\b/.test(N)) size = 'b';
    else if (/\b(pequeno|pequena|peq|medio|media)\b/.test(N)) size = 'a';
    if (/almuerzo/.test(N)) {
      const L = menu.find(i => i.lunch);
      return { raw, qty, itemId: L.id, ok: true, fish: FISH.find(f => N.includes(norm(f))) || 'Mojarra', prep: /sudad/.test(N) ? 'Sudado' : 'Frito', coco: /coco/.test(N), size: null };
    }
    const words = N.split(' ').filter(w => w.length > 2 && !STOP.has(w));
    let best = null, score = 0, exactAll = false;
    for (const it of menu) {
      if (it.hidden) continue;
      const iw = norm(it.n).split(' ').filter(w => w.length > 2 && !STOP.has(w));
      let sc = 0, ex = 0;
      for (const w of words) {
        if (iw.some(x => stem(x) === stem(w))) { sc += 2; ex++; }
        else if (iw.some(x => w.length >= 4 && x.startsWith(w.slice(0, 5)))) sc += 1;
      }
      const tot = sc + sc / (iw.length * 2 || 1);
      if (tot > score) { score = tot; best = it; exactAll = words.length > 0 && ex === words.length; }
    }
    if (!best || score < 1) return { raw, qty, itemId: '', ok: false, size };
    return { raw, qty, itemId: best.id, ok: exactAll, size: best.a ? (size || 'b') : null };
  });
}

export const lPrice = (l, menu) => {
  const it = menu.find(i => i.id === l.itemId);
  if (!it) return 0;
  if (it.lunch) return it.b + (l.coco ? 1000 : 0);
  return l.size === 'a' && it.a ? it.a : it.b;
};

export const lName = (l, menu) => {
  const it = menu.find(i => i.id === l.itemId);
  if (!it) return l.raw;
  if (it.lunch) return `Almuerzo ${l.prep.toLowerCase()} · ${l.fish}`;
  return it.n + (it.a ? ' · ' + catOf(it.cat).sz[l.size === 'a' ? 0 : 1] : '');
};
